"use strict";

/*
 * Created with @iobroker/create-adapter v2.6.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const { strict } = require("assert");

// Load your modules here, e.g.:
// const fs = require("fs");

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
        this.implementedMessenger = ["alexa2", "sayit", "telegram", "whatsapp-cmb", "pushover", "signal-cmb", "discord", "email", "matrix-org"];
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        this.log.warn('test')

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
            }
        });

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
    // /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(JSON.stringify(obj))
        } else {
            // The object was deleted
        }
    }

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

        this.log.warn(`OBJECT INCOMING123: ${JSON.stringify(obj)} <${JSON.stringify(this.config)}>`);

        switch (obj.command) {

            case "getInstance": // hier werden alle installierten Instanzen eines Adapters geholt und per selectSendTo in der Admin UI angezeigt

                name = obj.message.name.replace("show", "").toLowerCase();  // Adapter mit einem "-" im Namen muessen in der Config mit "_" abgespeichert werden. Hier wird wieder aus "_" ein "-", damit der Adapter gefunden wird
                name = name.replace("_", "-").toLowerCase();
                this.respond(obj, await this.getInstance(name), this);

                break;

            case "getInstanceStart":    // hier werden beim Adapterstart alle Adapter geholt und per selectSendTo in der Admin UI angezeigt. Dieser Feld dient dem User dann als Filter
                name = obj.message.attr.replace("show", "").toLowerCase(); // Adapter mit einem "-" im Namen muessen in der Config mit "_" abgespeichert werden. Hier wird wieder aus "_" ein "-", damit der Adapter gefunden wird
                name = name.replace("_", "-").toLowerCase();

                const result = await this.getInstance(name);
                this.log.info(`[getInstanceStart] result <${name}>: ${JSON.stringify(result)}`);
                if (result.length > 0) {
                    this.log.info(`[getInstanceStart] Es wurden Instanzen fuer ${name} gefunden. ${JSON.stringify(result)}`)
                } else {
                    this.log.info(`[getInstanceStart] Es wurde keine Instanz fuer ${name} gefunden. ${JSON.stringify(result)}`)
                }

                this.respond(obj, result.length > 0, this);

                break;

            case "getEchoDevives":

                this.respond(obj, await this.getEchoDevices(await this.getInstance(obj.message.name)), this);

                break;

            case "getTelegramUsers":

                this.respond(obj, await this.getTelegramUsers(await this.getInstance(obj.message.name)), this);

                break;

            case "target":

                obj.message.data.forEach((/**@type{string}*/ element) => {
                    arrResult.push({ label: element, value: element });
                });

                this.respond(obj, arrResult, this);

                break;

            case "customConfig":
                this.log.info('custom config')

                name = obj.message.name;

                for (const i of Object.keys(this.config[name])) {
                    const obj = JSON.parse("{" + this.config[name][i].user + "}");
                    this[name][obj.id] = obj
                };

                break;

            // Custom Config commands

            case "getDataCustom":

                this.log.info('test')
                this.log.info(obj.message.name)

                /**
                 * @typedef {Object} element
                 * @property {boolean} active - Gibt an, ob das Element aktiv ist oder nicht.
                 * @property {string} name - Der Benutzername des Elements.
                 * @property {number} instance - Die Instanznummer des Elements.
                 * @property {number} id - Die eindeutige ID des Elements.
                 */

                // Funktion, um aus den Werten aus der native ein Array zu machen, welches per select an die CustomConfig gesendet wird
                const funcResult = this.config[obj.message.name].map(async (/** @type {element} */ element) => {
                    if (element['instance'] != null) {
                        return { label: `${element.name} [instance: ${element.instance}]`, value: element.id };
                    } else {
                        return { label: element.name, value: element.id };
                    };
                });

                // funcResult ausführen, wenn this.config[obj.message.name] vorhanden ist und mindestens einen Eintrag hat
                if (this.config[obj.message.name] && Object.keys(this.config[obj.message.name]).length > 0) {
                    Promise.all(funcResult).then(result => {
                        this.log.info(`Return to Custom: ${JSON.stringify(result)}`)
                        this.respond(obj, result, this);
                    });
                } else {
                    this.log.info(`Return to Custom fehlgeschlagen: ${JSON.stringify(obj.message.name)}`)
                }

                break;


        };
    };

    async respond(obj, response, that) {
        try {
            if (obj.callback) that.sendTo(obj.from, obj.command, response, obj.callback);
            return true
        } catch (error) {
            this.log.error(`[Error - Respond] ${error}`)
            return false
        };

    };

    // In dieser Funktionen werden alle Installierten Instanzen gesucht und in einem Array zurueck gegeben
    async getInstance(/**@type{string}*/ name) {

        const arrResult = [];
        const instances = await this.getObjectViewAsync('system', 'instance', { startkey: `system.adapter.${name}.`, endkey: `system.adapter.${name}.\u9999` });

        // Jedes ROW in den gefundenen Instanzen durchlaufen und die Instanz ID raussuchen und in ein Array schreiben
        for (const row of Object.keys(instances)) {
            for (const i of Object.keys(instances[row])) {
                const element = instances[row][i]
                if (element.id.includes(name)) {
                    const res = await this.extractNumberFromString(element.id)
                    arrResult.push({ label: res[0], value: res[0] });    // Gefundene Instanzen als Objekt ins Array pushen
                };
            };
        };

        return arrResult;
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

    // In dieser Funktion wird die Instanz ID aus dem String extrahiert und zurueck gegeben
    async extractNumberFromString(/**@type{string}*/ str) {
        const regex = /\d+$/; // Regulärer Ausdruck, um die Zahl am Ende des Strings zu finden
        const match = str.match(regex); // Die Zahl am Ende des Strings extrahieren

        if (match) {
            const number = parseInt(match[0]); // Die extrahierte Zahl in eine Ganzzahl umwandeln
            const result = [number]; // Die Zahl in ein Array pushen
            return result;
        } else {
            return []; // Wenn keine Zahl gefunden wurde, ein leeres Array zurückgeben
        };
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
    }
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