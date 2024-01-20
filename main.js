// @ts-nocheck
`use strict`;

/*
 * Created with @iobroker/create-adapter v1.29.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require(`@iobroker/adapter-core`);
const { create } = require("domain");
const arrDP = require('./lib/states.js'); // hier stehen alle DP Inhalte drin
const { strict } = require("assert");

let presence = {};
let bPresence = false;
let bufferArr = [];

let instAdapter = ``;

let status = -1;

let id = ``;

class deviceReminder extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: `device-reminder`,
        });
        this.on(`ready`, this.onReady.bind(this));
        this.on(`stateChange`, this.onStateChange.bind(this));
        // this.on(`objectChange`, this.onObjectChange.bind(this));
        this.on(`message`, this.onMessage.bind(this));
        this.on(`unload`, this.onUnload.bind(this));

        // arrays
        this.devices = {}; // Array of all devices
        this.devicesCompleted = {}; // Array of all completed devices by constructor 
        this.trigger = {}; // Array of all trigger (subscribed states)
        this.values = {}; // Array of all state values
        this.usedMessenger = ['alexa', 'telegram', 'sayit', 'pushover', 'discord', 'whatsapp', 'signal', 'email', 'matrix', 'discord']
        this.states = {}; // Array states
        this.messenger = {};
        this.adapterDPs = {};
        this.poll = null; // polling intervall
        instAdapter = `${this.name}.${this.instance}`;
    };

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        if (await this.createObjMessenger()) {
            this.devicesCompleted = await this.createDevices();
            this.log.debug(JSON.stringify(this.devicesCompleted))
            this.createDPS();
            this.pollingData(true);
        } else {
            this.log.error(`Error while check data from Admin-GUI`);
        };
    };

    async createDPS() { // auf "DP Leichen" pruefen
        const objectsAdapter = await this.getAdapterObjectsAsync();
        let arrNames = [];

        for (const i in objectsAdapter) {
            let arrTemp = [];

            arrTemp = objectsAdapter[i]._id.split('.')

            if (this.adapterDPs[arrTemp[2]] === undefined) {
                if (!arrNames.includes(arrTemp[2]) && arrTemp[2] !== 'info') {
                    arrNames.push(arrTemp[2]);
                };
            };
        };

        for (let cntr = 0; cntr < arrNames.length; cntr++) {
            const name = arrNames[cntr];
            for (const i in arrDP) {
                for (const j in arrDP[i]) {
                    const namePath = arrDP[i][j];
                    let path = ``;
                    if (i === 'show') {
                        path = `${name}.${namePath.path}`;
                    } else {
                        path = `${name}.config.${namePath.path}`;
                    };
                    await this.delObjectAsync(path); // geloeschte device DPs entfernen
                };
            };
        };

        await this.delObjectAsync(`${this.name}.${this.instance}.info.connection`); // geloeschte device DPs entfernen
    };

    // Messenger-Daten aus dem Admin in Object umschreiben
    async createObjMessenger(msg, obj) {
        try {
            // Wird in der Admin GUI eine Testnachricht angefordert, Daten in "this.messenger[Messengername]" schreiben, damit in der message() die Nachricht abgesendet werden kann
            if (msg == 'test') {
                const objTestMessage = {
                    messenger: {
                        [obj.name]: {
                            ids: await getDataFromAdmin(obj)
                        },
                    },
                };
                this.messageHandler(objTestMessage, 'Test Message from device-reminder GUI', true);

            } else {
                for (const i of Object.keys(this.usedMessenger)) {
                    const name = this.usedMessenger[i];
                    this.log.debug(JSON.stringify(this.config[name]))
                    this.messenger[name] = await getDataFromAdmin(this.config[name])
                };
                this.log.debug(JSON.stringify(this.messenger))
            };

            // Daten fuer jeden Messenger auf Inhalt pruefen und aus array ein object bauen
            async function getDataFromAdmin(data) {
                if (data !== undefined && Object.keys(data).length > 0) {
                    let objTemp = {};
                    for (const i of Object.keys(data)) {
                        for (const j of Object.keys(data[i])) {
                            if (data[i][j].id != undefined) objTemp[data[i][j].id] = data[i][j]
                        };
                    };
                    return objTemp;
                }
                return {};
            };
            return true;
        } catch (error) {
            this.log.error(`[createObjMessenger] ${error}`)
            return false;
        };
    };

    async createDevices() {

        this.log.debug(`CONFIG INPUT${JSON.stringify(this.config)}`)

        try {
            this.devices = this.config.linkedDevice != undefined ? this.config.linkedDevice.finalIds || {} : {};
            this.states.start = await this.config.status.ids[0].stateAction;
            this.states.standby = await this.config.status.ids[0].stateStandby;
            this.states.end = await this.config.status.ids[0].stateOff;

            // Input auf Plausibilität prüfen
            if (Object.keys(this.devices).length > 0) {

                let objTemp = {};
                instAdapter = `${this.name}.${this.instance}`;

                for (const id in this.devices) {
                    objTemp[id] = await this.funcCreateObject(id); // create device
                    const device = objTemp[id];

                    this.trigger[`${instAdapter}.${device.dnd}`] = {
                        id: id,
                        path: device.dnd,
                        target: 'dnd',
                        type: 'value'
                    };
                    this.trigger[`${instAdapter}.${device.runtimeMaxDP}`] = {
                        id: id,
                        path: device.runtimeMaxDP,
                        target: 'runtimeMax',
                        type: 'value'
                    };
                    this.trigger[device.currentConsumption] = {
                        id: id,
                        path: device.currentConsumption,
                        target: 'consumption',
                        type: 'value'
                    };
                    if (device.switchPower !== undefined && device.switchPower !== ``) this.trigger[device.switchPower] = {
                        id: id,
                        path: device.switchPower,
                        target: 'switch',
                        type: 'value'
                    };

                    // values
                    this.values[id] = {
                        id: id,
                        consumption: {
                            path: device.currentConsumption,
                            val: 0,
                            type: 'number'
                        },
                        switch: {
                            path: device.switchPower,
                            val: false,
                            type: 'boolean'
                        },
                        dnd: {
                            path: device.dnd,
                            val: false,
                            type: 'boolean'
                        },
                        runtimeMax: {
                            path: device.runtimeMaxDP,
                            val: 0,
                            type: 'number'
                        },
                        dateJSON: {
                            path: device.lastOperations,
                            val: ''
                        }
                    };

                    //subscribe states
                    this.log.debug(`[SUBSCRIBE]: ${device.dnd}: ${device.runtimeMaxDP}: ${device.currentConsumption}: ${device.switchPower}`)
                    this.subscribeStates(device.dnd);
                    this.subscribeStates(device.runtimeMaxDP);
                    this.subscribeForeignStates(device.currentConsumption);
                    if (device.switchPower !== '' && device.switchPower !== undefined) {
                        this.subscribeForeignStates(device.switchPower);
                    };

                    await this.stateIni(id, objTemp); // first initialisation off all states

                };
                return objTemp;
            } else {
                this.log.debug(`No devices were created. Please create a device!`);
            };
        } catch (error) {
            this.pollingData(false);
            this.log.error(`[ERROR] {onReady}: "${error}"`);
        };
    };

    async pollingData(cmd) {
        // start cyclical status request
        if (this.poll != null) {
            clearInterval(this.poll);
            this.poll = null;
        };
        if (cmd) {
            this.poll = setInterval(() => {
                for (const id in this.devicesCompleted) {
                    const enabled = this.devicesCompleted[id].enabled
                    if (enabled) {
                        this.getValues(id);
                    };
                };
            }, 10000);
        };
    };

    /**
     * @param {string} id
     */
    async stateIni(id, obj) {
        const device = obj[id];
        const value = this.values[id];

        // Event-based states
        value.consumption.val = await this.getCheckedState('foreign', value.consumption.path, 0);
        value.switch.val = await this.getCheckedState('foreign', value.switch.path, false);
        value.dnd.val = await this.getCheckedState(null, value.dnd.path, false);
        value.runtimeMax.val = await this.getCheckedState(null, value.runtimeMax.path, 0);
        value.dateJSON.val = await this.getCheckedState(null, value.dateJSON.path, '');

        try {
            if (value.dateJSON.val != '') {
                device.arrays.dateJSON = JSON.parse(value.dateJSON.val);
            };
        } catch (error) {
            device.arrays.dateJSON = null;
        };

        // setState
        this.setStateAsync(device.runtimeMaxDP, await value.runtimeMax.val, true);
        this.setStateAsync(device.pathLiveConsumption, await value.consumption.val, true);
        this.setStateAsync(device.dnd, value.dnd.val, true);
        this.setStateAsync(device.lastOperations, `${value.dateJSON.val}`, true);

        this.setStateAsync(device.pathStatus, await this.getCheckedState(null, device.pathStatus, 'initialize'), true);
        this.setStateAsync(device.timeTotalMs, await this.getCheckedState(null, device.timeTotalMs, 0), true);
        this.setStateAsync(device.messageDP, await this.getCheckedState(null, device.messageDP, 'initialize'), true);
        this.setStateAsync(device.averageConsumption, await this.getCheckedState(null, device.averageConsumption, 0), true);
        this.setStateAsync(device.alertRuntime, await this.getCheckedState(null, device.alertRuntime, false), true);
        this.setStateAsync(device.lastRuntime, await this.getCheckedState(null, device.timeTotal, `00:00:00`), true);
        this.setStateAsync(device.timeTotal, `00:00:00`, true);
        this.setStateAsync(device.timeTotalMs, 0, true);

        return true;

    };

    /**
     * @param {string} id
     */
    async funcCreateObject(id) {
        try {
            const devicesInput = this.devices[id];
            const name = this.devices[id].name;

            class classDevice {
                /**
                 * @param {number} startValue
                 * @param {number} endValue
                 * @param {number} startCount
                 * @param {number} endCount
                 * @param {number} runtimeMax
                 * @param {string | string} statusDevice
                 * @param {string | number} consumpLive
                 * @param {string | number} averageConsumption
                 * @param {string | number} runtime
                 * @param {string | number} lastRuntime
                 * @param {string | string} messageDP
                 */
                constructor(obj, statusDevice, consumpLivePath, runtimePath, runtimeMSPath, lastRuntimePath, runtimeMaxDP, alertRuntimeDP, lastOperations, messageDP, autoOffDP, averageConsumption, doNotDisturb, objVal) {
                    // DPs
                    /** @type {boolean} */
                    this.enabled = obj.enabled;
                    /** @type {string} */
                    this.name = obj.name;
                    /** @type {string} */
                    this.type = obj.type;
                    /** @type {number} */
                    this.currentConsumption = obj.pathConsumption;
                    /** @type {string} */
                    this.switchPower = obj.pathSwitch;
                    // script intern
                    /** @type {string} */
                    this.pathStatus = statusDevice;
                    /** @type {string} */
                    this.pathLiveConsumption = consumpLivePath;
                    /** @type {string} */
                    this.timeTotal = runtimePath;
                    /** @type {string} */
                    this.timeTotalMs = runtimeMSPath;
                    /** @type {string} */
                    this.lastRuntime = lastRuntimePath;
                    /** @type {string} */
                    this.runtimeMaxDP = runtimeMaxDP;
                    /** @type {string} */
                    this.alertRuntime = alertRuntimeDP;
                    /** @type {string} */
                    this.messageDP = messageDP;
                    /** @type {string} */
                    this.averageConsumption = averageConsumption;
                    /** @type {string} */
                    this.dnd = doNotDisturb;
                    /** @type {string} */
                    this.lastOperations = lastOperations;
                    /** @type {string} */
                    this.autoOffDP = autoOffDP;
                    // string
                    /** @type {string} */
                    this.startTimeJSON = `00:00:00`;
                    /** @type {string} */
                    this.endtimeJSON = `00:00:00`;
                    /** @type {string} */
                    this.runtimeJSON = '00:00:00';
                    // boolean
                    /** @type {boolean} */
                    this.started = false;
                    /** @type {boolean} */
                    this.abort = obj.abort;
                    // boolean Benutzervorgaben
                    /** @type {boolean} */
                    this.autoOff = obj.autoOff;
                    // Verbrauchswerte
                    /** @type {number} */
                    this.startValue = objVal.startVal;
                    /** @type {number} */
                    this.endValue = objVal.endVal;
                    /** @type {number} */
                    this.standbyValue = objVal.standby != '' ? objVal.standby || 1 : 1;
                    // Zaehler Abbruchbedingungen
                    /** @type {number} */
                    this.startCount = objVal.startCount;
                    /** @type {number} */
                    this.endCount = objVal.endCount;
                    /** @type {number} */
                    this.standbyCount = objVal.endVal <= 10 ? objVal.endVal || 10 : 10;
                    // timeouts
                    this.timeouts = {
                        autoOff: null,
                    };

                    this.startTime = 0;
                    this.endTime = 0;

                    /** @type {number} */
                    this.valCancel = objVal.endCount / 2;

                    // Hier werden alle angelegten Messenger drin erstellt
                    this.messenger = {};

                    // array
                    this.arrays = {
                        start: [],
                        end: [],
                        standby: [],
                        dateJSON: [],
                    };

                    this.calculation = {
                        /** @type {number} */
                        consumption: 0,
                        /** @type {number} */
                        start: 0,
                        /** @type {number} */
                        end: 0,
                        /** @type {number} */
                        standby: 0,
                        /** @type {number} */
                        alertCounter: 0,
                    };

                    this.message = {
                        /** @type {boolean} */
                        startMessage: obj.startText.length > 0 ? true || false : false,
                        /** @type {string} */
                        startText: obj.startText,
                        /** @type {boolean} */
                        startMessageSent: false,
                        /** @type {boolean} */
                        endMessage: obj.endText.length ? true || false : false,
                        /** @type {strin} */
                        endText: obj.endText,
                        /** @type {boolean} */
                        endMessageSent: false
                    };

                    /*obj timer erstellen*/
                    if (obj.autoOff) {
                        if (obj.timer != `` && obj.timer != undefined && obj.timer != 0) {
                            this.timeoutInMS = (Math.floor(obj.timer) * 60 * 1000); // Umrechnung auf ms
                        } else {
                            this.timeoutInMS = 0;
                        };
                    };

                };
            };

            this.adapterDPs[name] = await this.createDP(name); // DP erstellen und pfad in array speichern

            // device type ermitteln und Objekt bauen
            const devCusType = await this.config.default.ids;
            const devDefType = await this.config.custom.ids;

            let objVal = {
                /** @type {boolean} */
                used: false,
                /** @type {number} */
                startVal: 0,
                /** @type {number} */
                endVal: 0,
                /** @type {number} */
                standby: 0,
                /** @type {number} */
                startCount: 0,
                /** @type {number} */
                endCount: 0
            };

            for (const i in devCusType) { // default types
                if (devCusType[i].name == devicesInput.type) {
                    /** @type {boolean} */
                    objVal.used = true;
                    /** @type {number} */
                    objVal.startVal = devCusType[i].startVal; // startwert
                    /** @type {number} */
                    objVal.endVal = devCusType[i].endVal; // endwert
                    /** @type {number} */
                    objVal.standby = devCusType[i].standby; //standbywert
                    /** @type {number} */
                    objVal.startCount = devCusType[i].startCount; // anzahl Messungen "START"
                    /** @type {number} */
                    objVal.endCount = devCusType[i].endCount; // anzahl Messungen "ENDE"
                };
            };

            if (objVal.used == false) { //custom types
                for (const i in devDefType) {
                    if (devDefType[i].name == devicesInput.type) {
                        /** @type {number} */
                        objVal.startVal = devDefType[i].startVal // startwert
                            /** @type {number} */
                        objVal.endVal = devDefType[i].endVal // endwert
                            /** @type {number} */
                        objVal.standby = devDefType[i].standby // stanbbywert
                            /** @type {number} */
                        objVal.startCount = devDefType[i].startCount // anzahl Messungen "START"
                            /** @type {number} */
                        objVal.endCount = devDefType[i].endCount // anzahl Messungen "ENDE"
                    };
                };
            };
            this.log.debug(`RETURN ${JSON.stringify(objVal)}`);
            this.log.debug(`OBJ IN CONSTRUCTOR: ${JSON.stringify(devicesInput)}`);

            const device = new classDevice(devicesInput,
                this.adapterDPs[name].statusDevice,
                this.adapterDPs[name].consumpLive,
                this.adapterDPs[name].runtime,
                this.adapterDPs[name].runtimeMS,
                this.adapterDPs[name].lastRuntime,
                this.adapterDPs[name].runtimeMax,
                this.adapterDPs[name].alertRuntime,
                this.adapterDPs[name].lastOperations,
                this.adapterDPs[name].messageDP,
                this.adapterDPs[name].autoOffDP,
                this.adapterDPs[name].averageConsumption,
                this.adapterDPs[name].doNotDisturb,
                objVal);

            // Vorhandene Messenger ans Objekt schreiben
            for (const i of Object.keys(this.usedMessenger)) { // Jeden Messengernamen einzeln als key holen
                const name = this.usedMessenger[i];
                let objTemp = {};
                if (devicesInput[name].length > 0) { // Pruefen, ob Messenger in der Admin GUI angelegt wurde
                    for (const j of Object.keys(devicesInput[this.usedMessenger[i]])) { // Key in Messenger einsetzen
                        const id = devicesInput[this.usedMessenger[i]][j];
                        objTemp[j] = this.messenger[name][id];
                        objTemp[j]['timeoutVolume'] = null;
                        objTemp[j]['timeoutMessage'] = null;
                        objTemp[j]['volOld'] = 0;
                    };
                    device.messenger[name] = {
                        ids: objTemp, // Objekt bauen, in dem alle Daten stehen, um eine Start/End Nachricht versenden zu koennen
                    };
                };
            };

            this.log.debug(`RETURN ${JSON.stringify(device)}`);
            this.log.debug(`Device ${JSON.stringify(device.name)} was successfully created`);
            return device;
        } catch (error) {
            this.log.error(`[ERROR] {funcCreateObject}: "${error}"`);
            this.log.error(`[ERROR] {funcCreateObject}: Please open instance and click Save and close again. If the error persists, please report it to the developer`);
        };
    };

    async createDP(name) {

        let objTemp = {};

        for (const i in arrDP.show) {
            const obj = arrDP.show[i];
            let path = ``;
            let parse = ``;

            parse = obj.parse;
            parse.name = `${obj.path} ${name}`;
            path = `${name}.${obj.path}`;
            objTemp[i] = path;
            await this.setObjectNotExistsAsync(path, {
                type: `state`,
                common: parse,
                native: {},
            });
        };

        for (const i in arrDP.config) {
            const obj = arrDP.config[i];
            let path = ``;
            let parse = ``;

            parse = obj.parse;
            parse.name = `${obj.path} ${name}`;
            path = `${name}.config.${obj.path}`;
            objTemp[i] = path;
            await this.setObjectNotExistsAsync(path, {
                type: `state`,
                common: parse,
                native: {},
            });
        };
        return objTemp;
    };

    /**
     * @param {string} id
     */
    async onStateChange(id, state) {

        this.log.debug(`[ID] ${id}`);
        this.log.debug(`[PATH] ${JSON.stringify(state)}`)
        this.log.debug(`[THIS.TRIGGER 482] ${JSON.stringify(this.trigger)}`)

        this.log.debug(`TRIGGER ${JSON.stringify(this.trigger[id])}`);
        this.log.debug(`THIS.VALUES ${JSON.stringify(this.values)}`);

        // try {
        const trigger = this.trigger[id];
        const valueType = `"${this.values[trigger.id][trigger.target].type}"`;
        let dpType = `"${typeof state.val}"`;
        const idPath = id.split('.');

        switch (trigger.type) {
            case 'value':
                if (dpType = valueType) {
                    this.values[trigger.id][trigger.target].val = state.val;
                    if (!state.ack && (`${this.name}` === `${idPath[0]}`)) {
                        this.setStateAsync(this.values[trigger.id][trigger.target].path, state.val, true);
                    };
                };

                this.log.debug(JSON.stringify(this.values))
                break;
            case 'presence':
                this.values[trigger.id].val = state.val;
                break;
        };
        // } catch (error) {
        //     this.log.error(`[onStateChange] <${JSON.stringify(this.trigger[id])}>`);
        //     this.log.error(`[onStateChange] <${error}>`);
        // };
    };

    /**
     * @param {string} id
     */
    async getValues(id) {
        this.log.debug(JSON.stringify(id));
        await this.evaluatingInputValue(id);
        await this.evaluateStatus(id);
    };

    /**
     * @param {string} id
     */
    async evaluatingInputValue(id) {
        const device = this.devicesCompleted[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: Berechnung gestartet`);
        switch (device.started) {
            case true:
                {
                    // standby Berechnung starten
                    await this.calcStart(id, "standby"); // standby Berechnung
                    // endwert Berechnung durchfuehren
                    await this.calcStart(id, "end"); // Endwert Berechnung
                    device.arrays.start = [];
                    this.log.debug(`[${JSON.stringify(device.name)}]: arrStart gelöscht`);
                    break;
                };
            case false:
                {
                    if (this.values[id].consumption.val < device.startValue) {
                        // Startabbruch -> array leeren
                        device.arrays.start = [];
                        this.log.debug(`[${JSON.stringify(device.name)}]: arrStart gelöscht`);
                        // standby Berechnung durchfuehren
                        await this.calcStart(id, "standby"); // standby Berechnung
                    } else {
                        // Startphase -> Startwertberechnung
                        await this.calcStart(id, "start"); // Startwert Berechnung
                        // standby Berechnung löschen
                        device.arrays.standby = [];
                        this.log.debug(`[${JSON.stringify(device.name)}]: arrStandby gelöscht`);
                    };
                    break;
                };
            default:
                break;
        };
        this.log.debug(`[${JSON.stringify(device.name)}]: Berechnung beendet`);

        return true;
    };

    /**
     * @param {string} id
     */
    async evaluateStatus(id) {
        const device = this.devicesCompleted[id];
        // const value = this.values[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: Auswertung gestartet`);

        if (device.abort) { // Abbrucherkennung aktiviert?
            if (device.started) {
                if (device.calculation.standby < device.standbyValue && device.arrays.standby.length >= device.valCancel) { // consumption kleiner Vorgabe, Gerät wurde von Hand ausgeschaltet und war in Betrieb
                    this.log.debug(`1: ${device.calculation.standby} < ${device.standbyValue} && ${device.arrays.standby.length} >= ${device.valCancel}`);
                    await this.setStatus(id, 'end');
                    await this.setStateAsync(device.averageConsumption, device.calculation.standby, true);
                    if (device.autoOff) { // auto Off aktiviert?
                        await this.autoOff(id);
                    };

                    device.started = false;
                    device.message.endMessageSent = false;
                    device.message.startMessageSent = false;

                    // clear all arrays
                    device.arrays.start = [];
                    device.arrays.end = [];
                    device.arrays.standby = [];
                };
            };
        };

        // device nich in Betrieb
        // Ermittlung, ob device gestartet wurde
        this.log.debug(`[${JSON.stringify(device.name)}]: WERTE für START: ${this.values[id].consumption.val}W; Schwelle Start: ${device.startValue}W; gestartet: ${device.started}`);
        if (device.calculation.start > device.startValue && device.calculation.start != null && device.arrays.start.length >= device.startCount && !device.started) {
            // device wurde gestartet
            device.started = true; // Vorgang started
            device.startTime = Date.now(); // startTime loggen
            device.startTimeJSON = this.formatDate(new Date(), "DD.MM.YYYY hh:mm:ss");
            await this.runtime(id);
            await this.setStatus(id, 'start');
        };

        // device in Betrieb
        // Ermittlung, ob device nocht laeuft
        if (device.calculation.end > device.endValue && device.calculation.end != null && device.started) { // Wert > endValue und consumption lag 1x ueber startValue
            this.log.debug(`[${JSON.stringify(device.name)}]: in Betrieb?  Ergebnis ENDE: ${JSON.stringify(device.calculation.end)} Wert ENDE: ${JSON.stringify(device.endValue)} started: ${JSON.stringify(device.started)} Arraylength: ${JSON.stringify(device.arrays.end.length)} Zaehler Arr Ende: ${JSON.stringify(device.endCount)} `);
            if (device.timeouts.autoOff != null) {
                clearTimeout(device.timeouts.autoOff);
                device.timeouts.autoOff = null;
                this.log.debug(`[${JSON.stringify(device.name)}]: timeout autoOff gelöscht`);
            };
            await this.setStatus(id, 'start');
            await this.runtime(id);
        } else if (device.calculation.end < device.endValue && device.calculation.end != null && device.started && device.arrays.end.length >= (device.endCount * (2 / 3))) { // geraet muss mind. 1x ueber startValue gewesen sein, arrEnd muss voll sein und ergebis aus arrEnd unter endValue
            // Vorgang vom device beendet
            this.log.debug(`[${JSON.stringify(device.name)}]: Vorgang beendet, Gerät fertig`);
            device.started = false; // device started = false ;
            device.endtimeJSON = this.formatDate(new Date(), "DD.MM.YYYY hh:mm:ss");

            const strJSON = `{"start":"${device.startTimeJSON}", "end":"${device.endtimeJSON}", "runtime":"${device.runtimeJSON}"}`;

            if (device.arrays.dateJSON === null) {
                device.arrays.dateJSON = [];
            };

            device.arrays.dateJSON.push(JSON.parse(strJSON));

            if (device.arrays.dateJSON.length >= 15) {
                device.arrays.dateJSON.shift();
            };

            this.setStateAsync(device.lastOperations, `${JSON.stringify(device.arrays.dateJSON)}`, true);
            this.setStateAsync(device.lastRuntime, device.runtimeJSON, true);
            this.setStateAsync(device.alertRuntime, false, true);

            // standby oder off?
            this.log.debug(`Wert end [${device.calculation.end}] SOLL < standby [${device.standbyValue}], dann END, sonst STANDBY`);
            if (device.calculation.end < device.standbyValue) {
                this.log.debug(`2: ${device.calculation.end} < ${device.standbyValue}; ${device.started}`);
                device.calculation.standby = device.calculation.end;
                device.arrays.standby = [];
                await this.setStatus(id, 'end');
            } else {
                this.log.debug(`STANDBY 1: ${device.calculation.end} > ${device.standbyValue}; ${device.started}`);
                await this.setStatus(id, 'standby');
            };

            // autoOff active?
            await this.autoOff(id);

            device.endTime = Date.now(); // ende Zeit loggen
            device.arrays.start = []; // array wieder leeren
            device.arrays.end = []; // array wieder leeren
        };

        // device nicht in Betrieb
        // device nicht in Startphase
        if (!device.started) {
            // standby groesser Schwelle Standby && result standby kleiner endValue => standby, sonst aus
            if (device.calculation.standby >= device.standbyValue && device.calculation.standby < device.endValue) {
                await this.setStatus(id, 'standby');
            } else if (device.calculation.standby <= device.standbyValue) {
                await this.setStatus(id, 'end');
            };
        };

        this.setStateAsync(device.pathLiveConsumption, this.values[id].consumption.val, true);

        this.log.debug(`[${JSON.stringify(device.name)}]: Auswertung beendet`);
    };

    // Schalter nach Zeit X (Uservorgabe aus der GUI) abschalten
    async autoOff( /**@type{string}*/ id) {
        const device = this.devicesCompleted[id];
        /* auto off*/
        if (device.autoOff) { // auto Off aktiv, timeout aktiv 
            if (device.timeouts.autoOff == null) {
                device.timeouts.autoOff = setTimeout(async() => { //timeout starten
                    await this.setStatus(id, 'autoOff');
                    if (device.timeouts.autoOff != null) {
                        clearTimeout(device.timeouts.autoOff);
                        device.timeouts.autoOff = null;
                        this.log.debug(`[${JSON.stringify(device.name)}]: autoOff fertig, timeout clear`);
                    };
                }, device.timeoutInMS);
            };
        };
    };

    // Status anhand der Berechnungen setzen
    async setStatus( /**@type{string}*/ id, /**@type{string}*/ status) {
        const device = this.devicesCompleted[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: value status: ${status}`);
        switch (status) {
            case 'start': // Vorgang gestartet
                this.setStateAsync(device.pathStatus, this.states.start, true); // setState "action" in DP
                this.log.debug('Device start')
                break;
            case 'standby': // Vorgang beendet, standby
                this.setStateAsync(device.pathStatus, this.states.standby, true); // setState "standby" in DP
                this.log.debug('Device standby')
                break;
            case 'autoOff':
                if (device.autoOff && device.switchPower != null) {
                    if (this.values[id].switch.val) {
                        await this.setForeignStateAsync(device.switchPower, false);
                    };
                };
                break;
            case 'end': // Vorgang beendet
                this.setStateAsync(device.pathStatus, this.states.end, true); // setState "off" in DP
                this.log.debug('Device Ende')
                break;
            case 'initialize': // Vorgang wird initialisiert
                this.setStateAsync(device.pathStatus, `initialize`, true); // setState in DP
                break;
            default:
                this.log.debug(`[${JSON.stringify(device.name)}]: unknown status`);
                this.setStateAsync(device.pathStatus, `unknown status`, true); // setState in DP
                break;
        };

        // Start oder Endnachricht versenden?
        if ((device.message.startMessage &&
                !device.message.startMessageSent &&
                status == 'start') ||
            (device.message.endMessage &&
                !device.message.endMessageSent &&
                device.message.startMessageSent &&
                (status == 'end' || status == 'standby'))) {

            // Startnachricht wurde versendet
            if (status == 'start') {
                this.log.debug('Start');
                device.message.startMessageSent = true;
                device.message.endMessageSent = false;
                this.messageHandler(id, await this.createObjMsg(device.message.startText));
            };

            // Endnachricht wurde versendet
            if (status == 'end' || status == 'standby') {
                this.log.debug('Ende');
                device.message.startMessageSent = false;
                device.message.endMessageSent = true;
                this.messageHandler(id, await this.createObjMsg(device.message.endText));
            };

        };

        return true;
    };

    // Berechnungen der aktuellen Durchschnittswerte fuer "start", "standby", "end" durchfuehren
    async calcStart( /**@type{string}*/ id, /**@type{string}*/ type) {
        const device = this.devicesCompleted[id];
        const value = this.values[id].consumption.val;
        this.log.debug(`[${JSON.stringify(device.name)}]: berechnung "${type}" wird ausgefuehrt`);

        /**@type{string}*/
        const count = `${type}Count`;
        /**@type{string}*/
        const calcType = type;

        device.arrays[calcType].push(value);
        device.calculation[calcType] = await this.calculation(device.arrays[calcType]);
        this.setStateAsync(device.averageConsumption, device.calculation[calcType], true);

        if (device.arrays[calcType].length > device[count]) {
            device.arrays[calcType].shift();
        };

        this.log.debug(`[${JSON.stringify(device.name)}]: resultTemp ${calcType}: ${device.calculation[calcType]}`);
        this.log.debug(`[${JSON.stringify(device.name)}]: Länge array ${calcType}: ${device.arrays[calcType].length}, Inhalt: [${device.arrays[calcType]}]`);

    };

    // Berechnung des Array Durchschnittswertes fuer "start", "standby", "end"
    async calculation(arr) {
        /**@type{number}*/
        let numb = 0;
        /**@type{number}*/
        let resultTemp = 0;
        for (const i in arr) {
            numb = parseFloat(arr[i]);
            resultTemp = resultTemp + numb;
        };
        return Math.round(resultTemp / arr.length * 100) / 100;
    };

    // Laufzeitermittlung
    async runtime( /**@type{string}*/ id) {
        const device = this.devicesCompleted[id];
        const value = this.values[id];

        //Laufzeit berechnen
        /**@type{number}*/
        const vergleichsZeit = Date.now();
        /**@type{number}*/
        const diff = vergleichsZeit - device.startTime;
        /**@type{string}*/
        const time = this.formatDate(Math.round(diff), `hh:mm:ss`);
        /**@type{number}*/
        const timeMs = diff;

        // Maximale Laufzeit ueberschritten? [Usereingabe aus DP]
        if (value.runtimeMax.val > 0) {
            const runtime = value.runtimeMax.val * 60 * 1000 + 1000;
            if (timeMs >= runtime) { // Laufzeit zu lange
                this.setStateAsync(device.alertRuntime, true, true);
            } else {
                this.setStateAsync(device.alertRuntime, false, true);
            };
        };
        device.runtimeJSON = time;
        this.setStateAsync(device.timeTotalMs, timeMs, true); // Status in DP schreiben
        this.setStateAsync(device.timeTotal, time, true); // Status in DP schreiben

        return true;
    };

    // Nachrichten an alle angelegten und angewaehlten Messenger senden
    async messageHandler(id, /**@type{string}*/ msg, /**@type{boolean}*/ test) {
        let device = {};
        let values = {};

        if (!test) { // Wenn Testbutton in der Admin GUI geklickt wird, liegen diese Daten nicht vor
            device = this.devicesCompleted[id];
            values = this.values[id];
            await this.setStateAsync(device.messageDP, msg, true);
            this.log.debug(JSON.stringify(values))
        } else {
            device = id;
        };

        try {
            for (const name of Object.keys(device.messenger)) {
                for (const i in device.messenger[name].ids) {
                    const dataMessenger = device.messenger[name].ids[i];
                    let objMessenger = {};
                    switch (name) {
                        case 'whatsapp':
                            this.log.debug(`[messageHandler - whatsapp] Path: <${dataMessenger.path}>, msg: <${msg}>`);
                            await this.setForeignStateAsync(dataMessenger.path, msg)
                            break;
                        case 'alexa':
                            this.log.debug(`[messageHandler - alexa] Path: <${JSON.stringify(dataMessenger)}>, msg: <${msg}>`);
                            if (!values.dnd.val) await this.voiceMessenger(dataMessenger, '.speak-volume', msg);
                            break;
                        case 'sayit':
                            this.log.debug(`[messageHandler - sayit] Path: <${JSON.stringify(dataMessenger)}>, msg: <${msg}>`);
                            if (!values.dnd.val) await this.voiceMessenger(dataMessenger, '.volume', msg);
                            break;
                        case 'telegram':
                            objMessenger = {
                                /**@type {string}*/
                                text: msg,
                                /**@type {string}*/
                                [dataMessenger.key]: dataMessenger.username,
                            };
                            this.log.debug(`[messageHandler - telegram] instance: <${dataMessenger.inst}>, objMessenger: <${JSON.stringify(objMessenger)}>`);
                            this.sendTo(`telegram${dataMessenger.inst}`, 'send', objMessenger);
                            break;
                        case 'pushover':
                            objMessenger = {
                                /**@type {string}*/
                                message: msg,
                                /**@type {string}*/
                                sound: dataMessenger.sound,
                                /**@type {string}*/
                                title: dataMessenger.title,
                                /**@type {string}*/
                                device: dataMessenger.deviceId,
                                /**@type {number}*/
                                priority: dataMessenger.prio,
                                /**@type {number}*/
                                ttl: dataMessenger.ttl, // Automatisches loeschen der Nachricht nach X Sekunden, wird geloescht, wenn Feld leer
                                /**@type {number}*/
                                retry: 60, // fuer Bestaetigung, wird geloescht, wenn andere Prio gewaehlt
                                /**@type {number}*/
                                expire: 3600, // fuer Bestaetigung, wird geloescht, wenn andere Prio gewaehlt
                            };

                            // Wenn andere Prioritaet als 2, loesche Bestaetigungsparameter
                            if (objMessenger.priority != 2) {
                                delete objMessenger.priority
                                delete objMessenger.retry
                                delete objMessenger.expire
                            };

                            if (objMessenger.ttl == null) {
                                delete objMessenger.ttl
                            };
                            this.log.debug(`[messageHandler - pushover] instance: <${dataMessenger.inst}>, objMessenger: <${JSON.stringify(objMessenger)}>`);
                            this.sendTo(`pushover${dataMessenger.inst}`, "send", objMessenger);
                            break;
                        case 'signal':
                            objMessenger = {
                                /**@type {string}*/
                                text: msg,
                            };

                            this.log.debug(`[messageHandler - signal] instance: <${dataMessenger.inst}>, objMessenger: <${JSON.stringify(objMessenger)}>`);
                            this.sendTo(`signal-cmb${dataMessenger.inst}`, "send", objMessenger);
                            break;
                        case 'email':
                            objMessenger = {
                                /**@type {string}*/
                                text: msg,
                                /**@type {string}*/
                                to: dataMessenger.emailTo,
                                /**@type {string}*/
                                subject: msg,
                                /**@type {string}*/
                                from: dataMessenger.emailFrom
                            };
                            this.log.debug(`[messageHandler - email] objMessenger: <${JSON.stringify(objMessenger)}>`);
                            this.sendTo("email", "send", objMessenger);
                            break;
                        case 'matrix':
                            this.log.debug(`[messageHandler - telegram] instance: <${dataMessenger.inst}>, objMessenger: <${msg}>`);
                            this.sendTo(`matrix${dataMessenger.inst}`, "send", msg);
                            break;
                        case 'discord':
                            objMessenger = {
                                /**@type {string}*/
                                content: msg,
                                /**@type {string}*/
                                userId: dataMessenger.userId,
                                /**@type {string}*/
                                userTag: dataMessenger.userTag,
                                /**@type {string}*/
                                userName: dataMessenger.userName,
                                /**@type {string}*/
                                serverId: dataMessenger.serverId,
                                /**@type {string}*/
                                channelId: dataMessenger.channelId,
                            };

                            // Leere keys loeschen
                            for (const j of Object.keys(objMessenger)) {
                                if (objMessenger[j] == null) delete objMessenger[j]
                            };
                            this.log.debug(`[messageHandler - discord] instance: <${dataMessenger.inst}>, objMessenger: <${JSON.stringify(objMessenger)}>`);
                            this.sendTo(`discord${dataMessenger.inst}`, "send", objMessenger);
                            break;
                        default:

                    };
                };
            };

        } catch (error) {
            this.log.error(`[messageHandler - error] <${error}>`)
        };
    };

    // Volume der Sprachmessenger setzen und Nachricht absenden
    async voiceMessenger(obj, /**@type{string}*/ strVol, /**@type{string}*/ msg) {
        const dataMessenger = obj;
        const date = new Date();
        /**@type{string}*/
        const time = await this.str2time(`${date.getHours()}:${date.getMinutes()}`);
        /**@type{string}*/
        const timeMin = await this.str2time(dataMessenger.activeFrom);
        /**@type{string}*/
        const timeMax = await this.str2time(dataMessenger.activeUntil);
        /**@type{string}*/
        const pathNew = String(dataMessenger.path.slice(0, dataMessenger.path.lastIndexOf('.'))) + strVol;

        // Erstellen Pfade auf Plausibilitaet pruefen
        const checkPath = await this.getForeignObjectAsync(pathNew);
        if (!checkPath) {
            this.log.error(`PathNew Error! [${pathNew}] doesn't exists!`);
            return false;
        };

        // Volume auf Benutzerdefinierten Wert stellen und anschließend Nachricht versenden
        if (time >= timeMin && time <= timeMax) {
            /**@type{number}*/
            const val = await this.getCheckedState('foreign', pathNew, 30);
            if (val !== null && val !== undefined) {
                dataMessenger.volOld = val;
            } else {
                dataMessenger.volOld = 0;
            };

            // Neuen Volume Wert setzen
            await this.setForeignStateAsync(pathNew, parseInt(dataMessenger.volume));

            // Verzoegert die Benachrichtung senden
            if (time >= timeMin && time <= timeMax) {
                if (dataMessenger.timeoutMessage != null) {
                    clearTimeout(dataMessenger.timeoutMessage);
                    dataMessenger.timeoutMessage = null;
                };
                dataMessenger.timeoutMessage = setTimeout(async() => { //timeout starten
                    await this.setForeignStateAsync(dataMessenger.path, msg);
                }, 1000);
            };

            // Verzoegert das alte Volume wieder setzen
            if (dataMessenger.timeoutVolume != null) {
                clearTimeout(dataMessenger.timeoutVolume);
                dataMessenger.timeoutVolume = null;
            };
            dataMessenger.timeoutVolume = setTimeout(async() => { //timeout starten
                await this.setForeignStateAsync(pathNew, parseInt(dataMessenger.volOld));
            }, 2000);
        };

        return true;
    };

    // Zeiten von string in number umwandeln
    async str2time( /**@type{string}*/ str) {
        return str.split(":")[0] * 100 + parseInt(str.split(":")[1], 10);
    };

    // Message erstellen (entweder direkte User Eingabe oder aus einem Datenpunkt)
    async createObjMsg( /**@type{string}*/ message) {
        this.log.debug(`MESSAGEPATH: ${message}`);
        let msgTemp = ``;
        if (message != '' && message != undefined && message.length > 0) {
            if (message.lastIndexOf(".") + 1 < message.length) {
                if (await this.getForeignObjectAsync(message) != null) {
                    // Nachricht aus Datenpunkt holen
                    const result = await this.getCheckedState('foreign', message, `[ERROR] Object Message not found`);;
                    msgTemp = result;
                } else {
                    // Nachricht wurde vom User in der GUI direkt erstellt
                    msgTemp = message;
                }
            } else {
                // last digit is a dot FALSE
                msgTemp = message;
            };
        };
        this.log.debug(`MESSAGE: ${msgTemp}`);
        return msgTemp;
    };

    // get state
    async getCheckedState( /**@type{string}*/ type, /**@type{string}*/ path, state) {

        let val = state;
        let result;
        try {
            if (path !== undefined && path !== '' && state !== 'initialize') {
                if (type === 'foreign') {
                    result = await this.getForeignStateAsync(path);
                } else {
                    result = await this.getStateAsync(path);
                };
                // Evaluation result
                if (result != null && result != undefined) {
                    val = result.val;
                } else {
                    if (type === 'foreign') {
                        this.log.warn(`[WARN] State <${JSON.stringify(result)}> Please check if <${path}> still exists!`);
                        val = state;
                    };
                };
            };
            return val;
        } catch (error) {
            this.log.error(`[getCheckedState]: ${error}`)
            return val;
        };
    };

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            for (const i of Object.keys(this.devicesCompleted)) {
                for (const j of Object.keys(this.devicesCompleted[i].timeouts)) {
                    this.delTimeout(this.devicesCompleted[i].timeouts[j]);
                };

                // Timeouts in den einzelnen Messengern loeschen, wenn vorhanden
                for (const j of Object.keys(this.devicesCompleted[i].messenger)) {
                    for (const k of Object.keys(this.devicesCompleted[i].messenger[j].ids)) {
                        this.delTimeout(this.devicesCompleted[i].messenger[j].ids[k].timeoutVolume, j, k);
                        this.delTimeout(this.devicesCompleted[i].messenger[j].ids[k].timeoutMessage, j, k);
                    };
                };
            };
            if (this.poll != null) {
                clearInterval(this.poll);
                this.poll = null;
            };
            callback();
        } catch (e) {
            callback();
        };
    };

    // Timeout loeschen
    async delTimeout(timeout, j, k) {
        this.log.debug(`[Timeout pruefen] ${j} ${k}`);
        if (timeout != null) {
            this.log.debug(`[Timeout geloescht] ${j} ${k}`);
            clearTimeout(timeout);
            timeout = null;
        };
    };

    // eingehende Message (sendTo) aus dem Admin
    async onMessage(obj) {

        this.log.debug(`Data from configuration received : ${JSON.stringify(obj)}`);
        const command = obj.command;

        if (command == 'test') {
            this.createObjMessenger('test', obj.message)
        } else {
            await this.ctrlInput(obj, obj.command, obj.message);
        };
    };

    // Usereingaben auf Plausibilitaet pruefen
    async ctrlInput(obj, cmd, arr) {

        this.log.warn(JSON.stringify(arr))

        let checked = [];
        let failed = [];
        let keys = [];
        let array = {};
        array = arr;

        for (const i in array) {
            array[i].check = 'open';
        };

        if (Object.keys(array).length > 0) {
            if (cmd.includes('devices')) keys = ['name', 'type', 'consumption', 'switch'];
            if (cmd.includes('alexa')) keys = ['name', 'path'];
            if (cmd.includes('sayit')) keys = ['name', 'path'];
            if (cmd.includes('telegram')) keys = ['name', 'inst', 'key', 'username'];
            if (cmd.includes('whatsapp')) keys = ['name', 'path'];
            if (cmd.includes('pushover')) keys = ['name', 'inst', 'prio', 'sound'];
            if (cmd.includes('email')) keys = ['name', 'emailFrom', 'emailTo'];
            if (cmd.includes('signal')) keys = ['name', 'inst'];
            if (cmd.includes('matrix')) keys = ['name', 'inst'];
            if (cmd.includes('discord')) keys = ['name', 'inst', 'userName'];
            if (cmd.includes('default') || cmd.includes('custom')) keys = ['name', 'startVal', 'endVal', 'standby', 'startCount', 'endCount'];
            if (cmd.includes('status')) keys = ['stateAction', 'stateStandby', 'stateOff'];

            // Userinput pruefen
            for (const data of array) {
                let wrongInput = `${data['name']}: `;
                for (const key of keys) {
                    if (key.includes('path') || key.includes('consumption') || key.includes('switch')) {
                        // Pruefung, ob DP plausibel    [Ausnahme bildet switch: Er ist kein Pflichtfeld und darf leer gelassen werden]
                        if (data[key] == undefined || (data[key].length == 0)) data[key] = 'empty'; // sonst knallt's
                        if (!await this.getForeignObjectAsync(data[key])) {
                            if ((!key.includes('switch') && data[key] == 'empty') || (key.includes('switch') && data[key] != 'empty') || key.includes('consumption' || key.includes('path'))) {
                                data.check = 'err';
                                data[key] = 'wrong input1';
                                wrongInput += `${key}, `;
                            };
                        };
                    } else { // Pruefen ob alle Pflichtfelder ausgefuellt sind
                        if (data[key] == undefined || data[key].length == 0 ) {
                            data.check = 'err';
                            data[key] = 'wrong input2';
                            wrongInput += `${key}, `;
                        };
                    };
                };
                this.log.debug(JSON.stringify(data))

                // wenn i.O. dann push in array "checked", sonst in "failed"
                if (data.check != 'err') {

                    let dataFinal = {
                        name: data['name'],
                        id: data.id
                    };

                    this.log.debug(JSON.stringify(data))

                    if (cmd.includes('devices') && data.switch == 'empty')
                        dataFinal.autoOff = true;
                    if (cmd.includes('devices') && data.switch != 'empty')
                        dataFinal.autoOff = false;

                    checked.push(dataFinal);
                } else {
                    failed.push(wrongInput);
                };
            };
        };

        const result = {
            checked: checked,
            failed: failed
        };

        this.log.debug(JSON.stringify(result))

        await this.respond(obj, result, this)
    };

    async validateEmail(email) {
        let res = false;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        res = (re.test(email));
        return (res);
    };

    // Callback sendTo()
    async respond(obj, response, that) {
        this.log.debug('respond wird ausgefuehrt: ' + JSON.stringify(response));
        if (obj.callback)
            that.sendTo(obj.from, obj.command, response, obj.callback);
    };
};

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new deviceReminder(options);
} else {
    // otherwise start the instance directly
    new deviceReminder();
};