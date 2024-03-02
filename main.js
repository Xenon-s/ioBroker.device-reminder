"use strict";

/*
 * Created with @iobroker/create-adapter v2.6.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const { strict } = require("assert");

// eslint-disable-next-line no-unused-vars
const helper = require("./lib/helper");
const device = require("./lib/device");
const dataMessenger = require("./lib/dataMessenger");

class DeviceReminder extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "device-reminder",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("objectChange", this.onObjectChange.bind(this));
        this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));

        this.cntr = 0;
        this.telegram = {};
        this._lastId = '';
        this.foundAdapters = [];
        this.messenger = {};
        this.activeStates = []; // Array of activated states for device-reminder
        this.states = {};
        this.processing = false;
        this.devices = {};
        this.dataInstance = {};
        this.implementedMessenger = ["alexa2", "sayit", "telegram", "whatsapp-cmb", "pushover", "signal-cmb", "discord", "email", "matrix-org"]
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        this.initCustomStates();
        // Lade alle installierten Adapterinstanzen
        this.dataInstance = await this.getInstance();

        // Lade gleichzeitig Echo-Geräte aus dem Alexa2-Adapter, Telegram-Benutzer und die Messenger Config aus der Native
        const [echoDevices, telegramUsers, dataMessenger] = await Promise.all([
            this.getEchoDevices(),
            this.getTelegramUsers(),
            this.getMessenger()
        ]);

        // Füge die geladenen Daten zu this.dataInstance hinzu
        if (this.dataInstance.alexa2) this.dataInstance.alexa2['echoDevices'] = echoDevices;
        if (this.dataInstance.telegram) this.dataInstance.telegram['user'] = telegramUsers;
        this.messenger = dataMessenger;



        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:

        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        await this.setObjectNotExistsAsync("testVariable", {
            type: "state",
            common: {
                name: "testVariable",
                type: "boolean",
                role: "indicator",
                read: true,
                write: true,
            },
            native: {},
        });

        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
        this.subscribeStates("testVariable");
        // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
        // this.subscribeStates("lights.*");
        // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
        // this.subscribeStates("*");

        /*
            setState examples
            you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable testVariable is set to true as command (ack=false)
        await this.setStateAsync("testVariable", true);

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        await this.setStateAsync("testVariable", { val: true, ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

        // examples for the checkPassword/checkGroup functions
        let result = await this.checkPasswordAsync("admin", "iobroker");

        result = await this.checkGroupAsync("admin", "admin");
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    async onObjectChange(id, obj) {

        this.log.warn('onObjectChange')

        try {
            if (!this.processing) {
                this.processing = true;
                const stateID = id;


                // Check if object is activated for device-reminder
                if (obj && obj.common) {
                    // Verify if custom information is available regarding device-reminder
                    if (obj.common.custom && obj.common.custom[this.namespace] && obj.common.custom[this.namespace].enabled) {
                        //Check if its an own device-reminder State
                        if (stateID.includes(this.namespace)) {
                            this.writeLog(
                                `[onObjectChange] This Object-ID: "${stateID}" is not allowed, because it's an device-reminder State! The settings will be deaktivated automatically!`,
                                "warn",
                            );
                            const stateInfo = await this.getForeignObjectAsync(stateID);
                            this.log.warn(JSON.stringify(stateInfo))

                            if (stateInfo?.common?.custom) {
                                stateInfo.common.custom[this.namespace].enabled = false;
                                await this.setForeignObjectAsync(stateID, stateInfo);
                            }
                        } else {
                            this.writeLog(
                                `[onObjectChange] Object array of device-reminder activated state changed : ${JSON.stringify(
                                    obj,
                                )} stored Objects : ${JSON.stringify(this.activeStates)}`,
                            );

                            // Verify if the object was already activated, if not initialize new parameter
                            if (!this.activeStates.includes(stateID)) {
                                this.writeLog(`[onObjectChange] Enable device-reminder for : ${stateID}`, "info");


                                await this.buildDeviceFromStateId(stateID);
                                this.writeLog(
                                    `[onObjectChange] ${stateID}: this.activeStates : ${JSON.stringify(this.activeStates)}`, "info"
                                );

                                if (!this.activeStates.includes(stateID)) {
                                    this.writeLog(
                                        `[onObjectChange] Cannot enable device-reminder for ${stateID}, check settings and error messages`,
                                        "warn",
                                    );
                                }
                            } else {
                                this.writeLog(
                                    `[onObjectChange] Updating device-reminder configuration for : ${stateID}`,
                                );

                                // await this.buildDeviceFromStateId(stateID);

                                if (!this.activeStates.includes(stateID)) {
                                    this.writeLog(
                                        `[onObjectChange] Cannot update device-reminder configuration for ${stateID}, check settings and error messages`,
                                        "warn",
                                    );
                                }
                            }
                        }
                    } else if (this.activeStates.includes(stateID)) {
                        this.activeStates = await helper.removeValue(this.activeStates, stateID);
                        this.writeLog(`[onObjectChange] Disabled device-reminder for : ${stateID}`, "info");

                        this.writeLog(
                            `[onObjectChange] Active state array after deactivation of ${stateID} : ${this.activeStates.length === 0 ? "empty" : JSON.stringify(this.activeStates)
                            }`, "info",
                        );
                        this.unsubscribeForeignStates(stateID);
                    }
                    this.processing = false;
                } else {
                    // Object change not related to this adapter, ignoring
                }
            }
        } catch (error) {
            this.errorHandling(error, "onObjectChange");
        };
    };

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
        } else {
            // The state was deleted
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.messagebox" property to be set to true in io-package.json
     * @param {ioBroker.Message} obj
     */
    async onMessage(obj) {
        let name = ""; // Deklariere eine Variable zur Zwischenspeicherung des Namens

        // Switch-Anweisung, um je nach Befehl unterschiedliche Aktionen auszuführen
        switch (obj.command) {

            case "getDataCustomAlexa":

            const res = [{label: "12", value : 1}, {label: "22", value : 2}, {label: "32", value : 3}, ];
            this.respond(obj, res, this);


            break;


            case "getInstance":

                // Prüfe, ob this.dataInstance und this.dataInstance[obj.message.name] vorhanden sind, andernfalls gib ein leeres Array zurück
                const adapterInstances = this.dataInstance && this.dataInstance[obj.message.name] ? this.dataInstance[obj.message.name] : [];
                // Antworte mit den Instanzen für den angegebenen Adapter oder einem leeren Array, falls nicht vorhanden
                this.respond(obj, adapterInstances, this);

                break;

            case "getInstanceStart":

                // Versuche, den Namen zu ändern, basierend auf den Attributen der Nachricht
                name = await helper.changeName(obj.message.attr, "_", "-");

                // Prüfe, ob Instanzen für den geänderten Namen vorhanden sind
                const instances = this.dataInstance[name];
                const hasInstances = !!(instances && instances.length > 0); // Überprüfen, ob Instanzen vorhanden sind

                // Antworte mit true/false, je nachdem ob Instanzen vorhanden sind
                this.respond(obj, hasInstances, this);

                break;

            case "getEchoDevives":
                // Prüfe, ob this.dataInstance.alexa2.echoDevices vorhanden ist, andernfalls gib ein leeres Array zurück
                const echoDevices = this.dataInstance.alexa2 && this.dataInstance.alexa2.echoDevices ? this.dataInstance.alexa2.echoDevices : [];
                // Antworte mit den Echo-Geräten aus dem Alexa2-Adapter oder einem leeren Array, falls nicht vorhanden
                this.respond(obj, echoDevices, this);

                break;

            case "getTelegramUsers":
                // Prüfe, ob this.dataInstance.telegram und this.dataInstance.telegram.user vorhanden sind, andernfalls gib ein leeres Array zurück
                const telegramUsers = this.dataInstance.telegram && this.dataInstance.telegram.user ? this.dataInstance.telegram.user : [];
                // Antworte mit den Telegram-Benutzern aus den Instanzen oder einem leeren Array, falls nicht vorhanden
                this.respond(obj, telegramUsers, this);

                break;

            case "dataMessenger":
                // Mappe die Elemente aus dataMessenger und antworte mit dem Ergebnis
                const arrResult = dataMessenger[obj.message.name][obj.message.data].map(element => ({
                    label: element,
                    value: element
                }));
                this.respond(obj, arrResult, this);
                break;

            case "customConfig":

                this.log.debug('custom config');
                // Extrahiere den Namen aus der Nachricht
                name = obj.message.name;
                // Iteriere über die Elemente der Konfiguration und speichere sie
                for (const i of Object.keys(this.config[name])) {
                    const obj = JSON.parse(`{${this.config[name][i].user}}`);
                    this[name][obj.id] = obj;
                }
                break;

            case "getDataCustom":

                const result = [];

                if (this.config[obj.message.name] && this.config[obj.message.name].length > 0) {
                    this.config[obj.message.name].forEach(element => {
                        result.push({label: element.name, value: element.id})
                    })
                    this.log.warn(`[${JSON.stringify(obj.message.name)}] Rückgabe an Custom: ${JSON.stringify(result)}`);
                    // Antworte mit dem Ergebnis
                    this.log.warn(typeof result)
                    this.respond(obj, result, this);
                } else {
                    this.respond(obj, [{ label: 'Not available', value: '' }], this);
                    this.log.debug(`[${JSON.stringify(obj.message.name)}] Leeres Array zurückgeben, da keine Daten aus der Config vorliegen`);
                }


                break;

            case "getDataFromConfig":
                // Funktion, um Elemente zu mappen
                function mapElements(elements) {
                    return elements.map(element => ({
                        label: element.name,
                        value: element.name
                    }));
                };
                // Mape die Standard- und benutzerdefinierten IDs und antworte mit dem Ergebnis
                const dataDefault = mapElements(this.config.default.ids);
                const dataCustom = mapElements(this.config.custom.ids);
                this.respond(obj, [...dataDefault, ...dataCustom], this);
                break;

            case "getValuesFromConfig":
                // Antworte mit Standardwerten aus der Konfiguration
                this.respond(obj, { native: { startVal: 5, endVal: 5, standby: 5, startCount: 5, endCount: 5 } }, this);
                break;
        };
    };




    /**
    * Init all Custom states
    * @description Init all Custom states
    */
    async initCustomStates() {

        this.log.warn('initCustomStates')

        try {
            const customStateArray = await this.getObjectViewAsync("system", "custom", {});
            this.writeLog(`[initCustomStates] All states with custom items : ${JSON.stringify(customStateArray)}`);

            // List all states with custom configuration
            if (customStateArray && customStateArray.rows) {
                // Verify first if result is not empty

                // Loop truth all states and check if state is activated for device-reminder
                for (const index in customStateArray.rows) {
                    if (customStateArray.rows[index].value) {
                        // Avoid crash if object is null or empty
                        // Check if custom object contains data for device-reminder
                        // @ts-ignore
                        if (customStateArray.rows[index].value[this.namespace]) {
                            this.writeLog(`[initCustomStates] device-reminder configuration found`);

                            // Simplify stateID
                            const stateID = customStateArray.rows[index].id;

                            // Check if custom object is enabled for device-reminder
                            // @ts-ignore
                            if (customStateArray.rows[index].value[this.namespace].enabled) {
                                if (!this.activeStates.includes(stateID)) this.activeStates.push(stateID);
                                this.writeLog(`[initCustomStates] device-reminder enabled state found ${stateID}`);
                            } else {
                                this.writeLog(
                                    `[initCustomStates] device-reminder configuration found but not Enabled, skipping ${stateID}`,
                                );
                            };
                        };
                    };
                };
            };

            const totalEnabledStates = this.activeStates.length;
            let totalInitiatedStates = 0;
            let totalFailedStates = 0;
            this.writeLog(`[initCustomStates] Found ${totalEnabledStates} device-reminder enabled states`, "info");

            // Initialize all discovered states
            let count = 1;
            for (const stateID of this.activeStates) {
                this.writeLog(`[initCustomStates] Initialising (${count} of ${totalEnabledStates}) "${stateID}"`);
                await this.buildDeviceFromStateId(stateID);

                if (this.activeStates.includes(stateID)) {
                    totalInitiatedStates = totalInitiatedStates + 1;
                    this.writeLog(`Initialization of ${stateID} successfully`, "info");
                } else {
                    this.writeLog(
                        `[initCustomStates] Initialization of ${stateID} failed, check warn messages !`,
                        "warn",
                    );
                    totalFailedStates = totalFailedStates + 1;
                };
                count++;
            };

            // Subscribe on all foreign objects to detect (de)activation of device-reminder enabled states
            await this.subscribeForeignObjectsAsync("*");
            this.writeLog(
                `[initCustomStates] subscribed all foreign objects to detect (de)activation of device-reminder enabled states`,
            );

            if (totalFailedStates > 0) {
                this.writeLog(
                    `[initCustomStates] Cannot handle calculations for ${totalFailedStates} of ${totalEnabledStates} enabled states, check error messages`,
                    "warn",
                );
            };

            this.writeLog(
                `Successfully activated device-reminder for ${totalInitiatedStates} of ${totalEnabledStates} states, will do my Job until you stop me!`,
                "info",
            );

        } catch (error) {
            this.errorHandling(error, "InitCustomStates");
        };
    };

    /**
     * Load state definitions to memory this.activeStates[stateID]
     * @param {string} stateID ID  of state to refresh memory values
     */
    async buildDeviceFromStateId(stateID) {
        this.writeLog(`[buildDeviceFromStateId] started for ${stateID}`, "debug");
        try {
            // Load configuration as provided in object
            /** @type {ioBroker.StateObject} */
            const stateInfo = await this.getForeignObjectAsync(stateID);
            try {
                if (!stateInfo) {
                    this.writeLog(
                        `[buildDeviceFromStateId] Can't get information for ${stateID}, state will be ignored`,
                        "warn",
                    );
                    this.activeStates = await helper.removeValue(this.activeStates, stateID);
                    this.unsubscribeForeignStates(stateID);
                    return;
                };
            } catch (error) {
                this.writeLog(
                    `[buildDeviceFromStateId] ${stateID} is incorrectly correctly formatted, ${JSON.stringify(
                        error,
                    )}`,
                    "error",
                );
                this.activeStates = await helper.removeValue(this.activeStates, stateID);
                this.unsubscribeForeignStates(stateID);
                return;
            };

            // Check if configuration for device-reminder is present, throw error in case of issue in configuration
            if (stateInfo && stateInfo.common && stateInfo.common.custom && stateInfo.common.custom[this.namespace]) {
                const customData = stateInfo.common.custom[this.namespace];
                this.writeLog(
                    `[buildDeviceFromStateId] ${stateID} object data : ${JSON.stringify(stateInfo.common.custom)}`, "debug"
                );


                // Hier pruefen, ob ids noch aktuell sind

                let objMessengerTemp = {};
                for (const messenger of this.implementedMessenger) {
                    if (this.config.hasOwnProperty(messenger) && Array.isArray(this.config[messenger]) && this.config[messenger].length > 0) {
                        objMessengerTemp[messenger] = await helper.getIdFromObject(this.config[messenger]);
                    } else {
                        this.log.debug(`Messenger '${messenger}' ist entweder nicht im 'this.config'-Objekt vorhanden oder das Array ist leer.`);
                    };
                };


                const matchingIds = {};
                const mismatchedIds = {};

                // Überprüfung der Messenger und ihrer IDs
                for (const messenger of this.implementedMessenger) {
                    // Überprüfen, ob der Messenger im 'stateInfo' Objekt vorhanden ist
                    if (stateInfo.common.custom[this.namespace]?.hasOwnProperty(messenger)) {
                        // Überprüfen, ob Daten in den Arrays vorhanden sind, bevor sie zugewiesen werden
                        if (stateInfo.common.custom[this.namespace][messenger]?.length && objMessengerTemp[messenger]?.length) {
                            // Abrufen der IDs aus dem 'stateInfo' Objekt und dem temporären Objekt
                            const stateInfoIds = stateInfo.common.custom[this.namespace][messenger];
                            const tempIds = objMessengerTemp[messenger];

                            // Logging für Debugging-Zwecke
                            this.log.debug(`[${messenger}] stateInfoIds ${JSON.stringify(stateInfoIds)}`);
                            this.log.debug(`[${messenger}] tempIds ${JSON.stringify(tempIds)}`);

                            // Überprüfen, ob die Längen der Arrays gleich sind und ob alle IDs übereinstimmen
                            if (stateInfoIds.length === tempIds.length && stateInfoIds.every(id => tempIds.includes(id))) {
                                // Speichern der übereinstimmenden IDs in matchingIds
                                matchingIds[messenger] = stateInfoIds;
                            } else {
                                // Speichern der nicht übereinstimmenden IDs in mismatchedIds
                                mismatchedIds[messenger] = stateInfoIds.filter(id => !tempIds.includes(id));
                            }
                        } else {
                            // Ausgabe einer Warnung, wenn eines der Arrays nicht vorhanden oder leer ist
                            this.log.warn(`Das Array für den Messenger '${messenger}' ist entweder nicht vorhanden oder leer.`);
                        }
                    } else {
                        // Ausgabe einer Information, wenn der Messenger nicht im 'stateInfo' Objekt vorhanden ist
                        this.log.debug(`Messenger '${messenger}' ist nicht im 'stateInfo' Objekt vorhanden.`);
                    }
                }


                this.log.debug(JSON.stringify(`matching ids ${JSON.stringify(matchingIds)}`))
                this.log.debug(JSON.stringify(`mismatching ids ${JSON.stringify(mismatchedIds)}`))


                // neuen active State ins array this.activeStates hinzufuegen, wenn die Objektparameter plausibel sind
                if (!this.activeStates.includes(stateID)) this.activeStates.push(stateID);
                // Objekt Class mit allen Parametern zusammenbauen
                this.devices[stateID] = await device.create(stateInfo, stateID, this.namespace, this.implementedMessenger);

                this.writeLog(
                    `[buildDeviceFromStateId] ${stateID} object from constructor : ${JSON.stringify(this.devices[stateID])}`, "debug"
                );

            };
        } catch (error) {

        }
    };

    /**
     * Diese Funktion erstellt ein Messenger-Objekt aus den Konfigurationsdaten.
     * @returns {Promise<Object>} Ein Promise, das ein Messenger-Objekt enthält.
     */
    async getMessenger() {
        // Erstelle ein leeres Objekt für den Messenger
        const messengerObject = {};

        // Durchlaufe alle implementierten Messenger
        await Promise.all(this.implementedMessenger.map(async (name) => {
            // Überprüfe, ob Konfigurationsdaten für den aktuellen Messenger vorhanden sind und ob es sich um ein Array handelt
            if (this.config.hasOwnProperty(name) && Array.isArray(this.config[name]) && this.config[name].length > 0) {
                // Erstelle ein temporäres Objekt für die Messenger-Konfiguration
                const tempObj = {};

                // Durchlaufe alle Elemente der Konfiguration des aktuellen Messengers
                this.config[name].forEach((element) => {
                    // Entferne die Attribute "id" und "active" und erstelle ein neues Objekt
                    const { id, active, ...newObj } = element;

                    // Filtere die Werte des neuen Objekts, um null-Werte zu entfernen
                    const filteredRest = Object.fromEntries(Object.entries(newObj).filter(([key, value]) => value !== null));

                    // Füge das gefilterte Objekt zum temporären Objekt hinzu
                    tempObj[element.id] = filteredRest;
                });

                // Füge das temporäre Objekt zum Messenger-Objekt hinzu
                messengerObject[name] = tempObj;
            }
        }));

        // Gib das Messenger-Objekt zurück
        return messengerObject;
    };


    // Antwort an Absender von sendTo senden
    async respond(obj, response, that) {
        this.log.info(`[respond] obj: ${JSON.stringify(obj)}, response: ${JSON.stringify(response)}`)
        try {
            that.sendTo(obj.from, obj.command, response, obj.callback);
            return true;
        } catch (error) {
            this.errorHandling(error, "Respond");
            return false;
        };
    };

    // In dieser Funktionen werden alle Installierten Instanzen gesucht und in einem Array zurueck gegeben
    async getInstance() {
        const objTemp = {}; // Temporäres Objekt zur Zwischenspeicherung

        // Alle Messenger aus this.implementedMessenger sichern
        for (const messenger of this.implementedMessenger) {
            objTemp[await helper.changeName(messenger, "-", "_")] = [];
        }

        // Daten aller vorhandenen Objekte aus "system.adapter" holen
        const instances = await this.getObjectViewAsync('system', 'instance', { startkey: `system.adapter.`, endkey: `system.adapter.\u9999` });

        // Parallelisierte Verarbeitung der Instanzen
        await Promise.all(Object.values(instances).map(async row => {
            for (const element of row) {
                const adapterName = await helper.extractAdapterName(element.id);
                const res = await helper.extractNumberFromString(element.id);

                // Überprüfe, ob res nicht null ist
                if (res !== null) {
                    // Überprüfe, ob obj bereits im Array vorhanden ist
                    const obj = await helper.createObjectFromNumber(res);
                    const formattedAdapterName = await helper.changeName(adapterName, "-", "_");

                    if (!objTemp.hasOwnProperty(formattedAdapterName)) {
                        // Wenn der Adaptername nicht in objTemp vorhanden ist, füge ihn hinzu
                        objTemp[formattedAdapterName] = [];
                    };

                    const existingObj = objTemp[formattedAdapterName].find(item => item.label === obj.label && item.value === obj.value);

                    if (!existingObj) {
                        // Füge das Objekt zu objTemp[adapterName] hinzu, falls es nicht bereits vorhanden ist
                        objTemp[formattedAdapterName].push(obj);
                    };
                };
            };
        }));

        this.log.debug(`Gefundene Adapter-Instanzen: ${JSON.stringify(objTemp)}`);
        return objTemp;
    };



    /**
     * Diese Funktion holt alle Echo-Geräte aus dem Alexa2-Adapter und gibt sie als Array von Objekten zurück.
     * Jedes Objekt enthält den Namen des Geräts und seine ID.
     * @returns {Promise<Array>} - Ein Promise, das ein Array von Objekten mit den Namen und IDs der Echo-Geräte enthält.
     */
    async getEchoDevices() {
        // Verwendung eines Sets, um Duplikate zu vermeiden
        const uniqueDevices = new Set();
        const echoDevices = [];

        // Parallele Verarbeitung der Instanzen
        await Promise.all(this.dataInstance.alexa2.map(async (item) => {
            const instance = item.label;

            // Abfrage aller Geräte für eine bestimmte Instanz des Alexa2-Adapters
            const instances = await this.getObjectViewAsync('system', 'device', {
                startkey: `alexa2.${instance}.Echo-Devices.`,
                endkey: `alexa2.${instance}.Echo-Devices${String.fromCharCode(0xfffd)}`
            });

            // Gerätenamen aus dem Alexa2-Adapter holen und zu uniqueDevices hinzufügen
            for (const row of Object.values(instances)) {
                await Promise.all(row.map(async (device) => {
                    const deviceID = device.id;
                    const deviceIDSplit = deviceID.split(".");
                    if (deviceIDSplit.length === 4 && !uniqueDevices.has(deviceID)) {
                        uniqueDevices.add(deviceID);
                    }
                }));
            }
        }));

        // Gerätenamen aus den gefundenen Geräten abrufen und in das Ergebnisarray einfügen
        await Promise.all(Array.from(uniqueDevices).map(async (deviceID) => {
            const deviceObject = await this.getForeignObjectAsync(deviceID);
            if (deviceObject) {
                echoDevices.push({ label: deviceObject.common.name, value: deviceID });
            }
        }));

        return echoDevices;
    };

    /**
  * Diese Funktion holt alle Telegram-Benutzer aus den Instanzen des Telegram-Adapters.
  * Die Benutzer werden als Array von Objekten zurückgegeben, wobei jedes Objekt den Benutzernamen und die Chat-ID enthält.
  * @returns {Promise<Array>} - Ein Promise, das ein Array von Objekten mit den Benutzernamen und Chat-IDs enthält.
  */
    async getTelegramUsers() {
        const arrTemp = [];

        // Parallele Verarbeitung der Instanzen in this.dataInstance.telegram
        await Promise.all(Object.keys(this.dataInstance.telegram).map(async (instanceKey) => {
            const instance = this.dataInstance.telegram[instanceKey].label;
            const path = `telegram.${instance}.communicate.users`;

            // Prüfen, ob username oder firstname genutzt wird
            const result = await this.getForeignObjectAsync(`system.adapter.telegram.${instance}`);
            const useUsername = result && result.native && result.native.useUsername;

            // Benutzer aus dem Datenpunkt holen
            const resultUsers = await this.getForeignStateAsync(path);
            const users = resultUsers ? JSON.parse(resultUsers.val) : {};

            // Jeden vorhandenen Benutzer in ein Array pushen (Entweder firstName oder userName, je nachdem was in der Telegram Instanz ausgewählt wurde)
            Object.values(users).forEach(user => {
                const objTemp = {
                    label: useUsername ? user.userName || user.firstName : user.firstName,
                    value: useUsername ? user.userName || user.firstName : user.firstName
                };
                arrTemp.push(objTemp);
            });
        }));

        // Array auf doppelte Einträge prüfen und ggf. entfernen
        const uniqueUsers = new Map();
        arrTemp.forEach(user => uniqueUsers.set(user.label, user));
        const arrResult = Array.from(uniqueUsers.values());

        return arrResult;
    };

    /**
 * a function for log output
 * @async
 * @function
 * @param {string} logtext
 * @param {string} logtype ("silly" | "info" | "debug" | "warn" | "error")
 * @param {string} funcName Extended info. Example the name of the function
 * @return {Promise<void>}
 */
    async writeLog(logtext, logtype = "debug", funcName = "") {
        try {
            const logFunctions = {
                silly: this.log.silly,
                info: this.log.info,
                debug: this.log.debug,
                warn: this.log.warn,
                error: this.log.error,
            };
            const logFn = logFunctions[logtype];
            if (logFn) {
                logFn(`${funcName ? "[ " + funcName + " ] " : ""} ${logtext} `);
            }
        } catch (error) {
            this.log.error(`[writeLog] error: ${error} `);
        }
    };

    /**
     * Error Handling
     * @param {object} error error message from catch block
     * @param {string} codePart described the code part or function
     * @param {string} extended extended info about the error
     */
    async errorHandling(error, codePart, extended = "") {
        try {
            this.writeLog(
                `error: ${error.message} // stack: ${error.stack} ${extended ? " // extended info: " + extended : ""}`,
                "error",
                codePart,
            );
            // if (!disableSentry) {
            //     if (this.supportsFeature && this.supportsFeature("PLUGINS")) {
            //         const sentryInstance = this.getPluginInstance("sentry");
            //         if (sentryInstance) {
            //             const Sentry = sentryInstance.getSentryObject();
            //             if (Sentry)
            //                 Sentry.captureException(
            //                     `[ v${this.version} ${codePart} ] ${error} // extended info: ${extended} )}`,
            //                 );
            //         }
            //     }
            // }
        } catch (error) {
            this.writeLog(`[ errorHandling ] error: ${error}`, "error");
        };
    };
};



if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new DeviceReminder(options);
} else {
    // otherwise start the instance directly
    new DeviceReminder();
}