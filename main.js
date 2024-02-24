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

        this.log.warn('test')

        this.getInstance()
        this.getMessenger();
        this.initCustomStates();

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

        const arrResult = [];
        let name = "";

        // this.log.debug(`OBJECT INCOMING123: ${JSON.stringify(obj)} <${JSON.stringify(this.config)}>`);

        switch (obj.command) {

            case "getInstance": // hier werden alle installierten Instanzen eines Adapters geholt und per selectSendTo in der Admin UI angezeigt

            this.log.info('getInstance');

                this.log.info(obj.message.name)
                name = await helper.changeName(JSON.stringify(obj));

                this.log.warn(JSON.stringify(this.dataInstance))
                this.respond(obj, this.dataInstance[name], this);

                break;

            case "getInstanceStart":    // hier werden beim Adapterstart alle Adapter geholt und per selectSendTo in der Admin UI angezeigt. Dieser Feld dient dem User dann als Filter
            this.log.info('getInstanceStart');

                try {
                    this.log.warn(JSON.stringify(obj))
                    this.log.warn(JSON.stringify(this.dataInstance))

                    name = await helper.changeName(obj.message.attr);

                    this.log.warn(`name vorher : ${obj.message.attr}, name neu ${name}, this ${JSON.stringify(this.dataInstance)}`)

                    this.log.debug(`[getInstanceStart] result <${name}>: ${JSON.stringify(this.dataInstance[name])}`);
                    if (this.dataInstance[name].length > 0) {
                        this.log.debug(`[getInstanceStart] Es wurden Instanzen fuer ${name} gefunden. ${JSON.stringify(this.dataInstance[name])}`)
                    } else {
                        this.log.debug(`[getInstanceStart] Es wurde keine Instanz fuer ${name} gefunden. ${JSON.stringify(this.dataInstance[name])}`)
                    }

                    this.respond(obj, this.dataInstance[name].length > 0, this);
                } catch (error) {
                    this.log.error(error)
                }



                break;

            case "getEchoDevives":

                this.respond(obj, await this.getEchoDevices(this.dataInstance[obj.message.name]), this);

                break;

            case "getTelegramUsers":

                this.respond(obj, await this.getTelegramUsers(this.dataInstance[obj.message.name]), this);

                break;

            case "target":

                obj.message.data.forEach((/**@type{string}*/ element) => {
                    arrResult.push({ label: element, value: element });
                });

                this.respond(obj, arrResult, this);

                break;

            case "customConfig":
                this.log.debug('custom config')

                name = obj.message.name;

                for (const i of Object.keys(this.config[name])) {
                    const obj = JSON.parse(`{${this.config[name][i].user}}`);
                    this[name][obj.id] = obj
                };

                break;

            case "getDataCustom":

                /**
                 * @typedef {Object} element
                 * @property {boolean} active - Gibt an, ob das Element aktiv ist oder nicht.
                 * @property {string} name - Der Benutzername des Elements.
                 * @property {number} instance - Die Instanznummer des Elements.
                 * @property {number} id - Die eindeutige ID des Elements.
                 */

                // Funktion, um aus den Werten aus der native ein Array zu machen, welches per select an die CustomConfig gesendet wird
                const funcResult = this.config[obj.message.name].map(async /** @type {element} */ element => {
                    if (element['instance'] != null) {
                        return { label: `${element.name} [instance: ${element.instance}]`, value: element.id };
                    } else {
                        return { label: element.name, value: element.id };
                    };
                });

                // funcResult ausführen, wenn this.config[obj.message.name] vorhanden ist und mindestens einen Eintrag hat
                if (this.config[obj.message.name] && Object.keys(this.config[obj.message.name]).length > 0) {
                    Promise.all(funcResult).then(result => {
                        this.log.debug(`[${JSON.stringify(obj.message.name)}] Return to Custom: ${JSON.stringify(result)}`)
                        this.respond(obj, result, this);
                    });
                } else {
                    this.log.debug(`[${JSON.stringify(obj.message.name)}] Return to Custom fehlgeschlagen, keine Daten`)
                }

                break;

            case "getDataFromConfig":

                const dataDefault = this.config.default.ids.map(element => {
                    return { label: element.name, value: element.name }
                });

                const dataCustom = this.config.custom.ids.map(element => {
                    return { label: element.name, value: element.name }
                });

                this.respond(obj, dataDefault.concat(dataCustom), this);

                break;

            case "getValuesFromConfig":

                this.respond(obj, { native: { startVal: 5, endVal: 5, standby: 5, startCount: 5, endCount: 5 } }, this);

                break;
        };
    };

    /**
    * Init all Custom states
    * @description Init all Custom states
    */
    async initCustomStates() {

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
                }
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
                this.log.error('true')
                const customData = stateInfo.common.custom[this.namespace];
                this.writeLog(
                    `[buildDeviceFromStateId] ${stateID} object data : ${JSON.stringify(stateInfo)}`
                );

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

    getMessenger() {
        // Aus den Daten der Adapter Config ein Messenger Objekt bauen
        this.implementedMessenger.forEach((name) => {
            let objTemp = {};
            if (this.config.hasOwnProperty(name) && Array.isArray(this.config[name]) && this.config[name].length > 0) {
                this.config[name].forEach((element) => {
                    const { id, active, ...newObj } = element;  // Attribute "id" und "active" entfernen
                    const filteredRest = Object.fromEntries(Object.entries(newObj).filter(([key, value]) => value !== null));
                    objTemp[element.id] = filteredRest;
                });
                this.messenger[name] = objTemp;
            };
        });

        return;
    };



    // Antwort an Absender von sendTo senden
    async respond(obj, response, that) {
        try {
            if (obj.callback) that.sendTo(obj.from, obj.command, response, obj.callback);
            return true;
        } catch (error) {
            this.errorHandling(error, "Respond");
            return false;
        };
    };

    // In dieser Funktionen werden alle Installierten Instanzen gesucht und in einem Array zurueck gegeben

    async getInstance() {
        const objTemp = {}; // Temporäres Objekt zur Zwischenspeicherung

        // Daten aller vorhandenen Objekte aus "system.adapter" holen
        const instances = await this.getObjectViewAsync('system', 'instance', { startkey: `system.adapter.`, endkey: `system.adapter.\u9999` });

        // Parallelisierte Verarbeitung der Instanzen
        await Promise.all(Object.values(instances).map(async row => {
            for (const element of row) {
                const adapterName = await helper.extractAdapterName(element.id);
                const res = await helper.extractNumberFromString(element.id);

                // Überprüfe, ob objTemp[adapterName] bereits definiert ist
                if (!objTemp.hasOwnProperty(adapterName)) {
                    // Wenn nicht, initialisiere es als leeres Array
                    objTemp[adapterName] = [];
                };

                // Überprüfe, ob res nicht null ist
                if (res !== null) {
                    // Überprüfe, ob obj bereits im Array vorhanden ist
                    const obj = await helper.createObjectFromNumber(res);
                    const existingObj = objTemp[adapterName].find(item => item.label === obj.label && item.value === obj.value);

                    if (!existingObj) {
                        // Füge das Objekt zu objTemp[adapterName] hinzu, falls es nicht bereits vorhanden ist
                        objTemp[adapterName].push(obj);
                    };
                };
            };
        }));

        this.log.info(`Gefundene Adapter-Instanzen: ${JSON.stringify(objTemp)}`);
        return objTemp;
    }; 

    // In dieser Funktion werden alle Echo Devices aus dem Alexa2 Adapter geholt und in einem Array zurueck gegeben
    async getEchoDevices(/**@type{array}*/ arr) {

        const arrTemp = [];
        const arrNames = [];

        for (const i of Object.keys(arr)) {

            const instance = arr[i].label;
            const instances = await this.getObjectViewAsync('system', 'device', { startkey: `alexa2.${instance}.Echo-Devices.`, endkey: `alexa2.${instance}.Echo-Devices${String.fromCharCode(0xfffd)}` });
            // Device Namen aus dem Alexa2 Adapter holen und in ein Array schreiben
            for (const row of Object.keys(instances)) {
                for (const i of Object.keys(instances[row])) {
                    const deviceTemp = instances[row][i].id;
                    const deviceTempSplit = deviceTemp.split(".");
                    if (deviceTempSplit.length == 4 && !arrNames.includes(deviceTemp)) arrNames.push(deviceTemp);
                };
            };
        };

        // Den Namen aus den zuvor gesuchten Devices holen und als Objekt in ein Array pushen
        for (const device of Object.keys(arrNames)) {
            const res = await this.getForeignObjectAsync(arrNames[device]);
            arrTemp.push({ label: res.common.name, value: arrNames[device] });    // Gefundene Instanzen als Objekt ins Array pushen
        };

        // @ts-ignore
        const arrResult = Array.from(new Set(arrTemp.map(JSON.stringify))).map(JSON.parse); // Array auf doppelte Eintraege pruefen und ggf entfernen
        return arrResult;
    };

    async getTelegramUsers(/**@type{array}*/arr) {

        const arrTemp = [];

        for (const i of Object.keys(arr)) { // Fuer jede gefundene instanz die User ermitteln

            const instance = arr[i].label
            const path = `telegram.${instance}.communicate.users`

            // Pruefen ob username oder firstname genutzt wird
            const result = await this.getForeignObjectAsync(`system.adapter.telegram.${instance}`);
            const useUsername = result != null ? result.native.useUsername || false : false;

            const resultUsers = await this.getForeignStateAsync(path) || {};    // User aus dem Datenpunkt holen
            const user = JSON.parse(resultUsers.val);

            /* Jeden vorhandenen User in ein Array pushen (Entweder firstName oder userName, je nachdem was in der Telegram Instanz ausgewählt wurde)
                Der Name dient nur als Anzeige im selectDropdown Menu, es wird immer an die ChatID gesendet
            */

            for (const id of Object.keys(user)) {

                const objTemp = {
                    label: useUsername ? user[id].userName || user[id].firstName : user[id].firstName,
                    value: useUsername ? user[id].userName || user[id].firstName : user[id].firstName
                };

                arrTemp.push(objTemp)
            };
        };

        // @ts-ignore
        const arrResult = Array.from(new Set(arrTemp.map(JSON.stringify))).map(JSON.parse); // Array auf doppelte Eintraege pruefen und ggf entfernen
        return arrResult;
    }



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