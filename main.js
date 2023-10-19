// @ts-nocheck
`use strict`;

/*
 * Created with @iobroker/create-adapter v1.29.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require(`@iobroker/adapter-core`);
const { create } = require("domain");
const arrDP = require('./lib/states.js');
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
        this.alexaInput = {}; // Array of all Alexas
        this.sayitInput = {}; // Array of all sayit devices
        this.whatsappInput = {} // Array of all whatsapp users
        this.telegramInput = {}; // Array of all telegram users
        this.pushoverInput = {}; // Array of all pushover users
        this.emailInput = {}; // Array of all email addresses
        this.signalInput = {}; // Array of all signal users
        this.matrixInput = {}; // Array of all matrix server
        this.states = {}; // Array states

        this.adapterDPs = {};

        this.poll = null; // polling intervall

        instAdapter = `${this.name}.${this.instance}`;

    };

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        // this.setState('info.connection', false, true);

        // Initialize your adapter here
        this.devicesCompleted = await this.createDevices();
        this.log.debug(JSON.stringify(this.devicesCompleted));
        this.createDPS();
        this.pollingData(true);
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
    };

    async createDevices() {

        this.log.debug(`CONFIG INPUT${JSON.stringify(this.config)}`)

        // try {
        this.devices = await getDataFromAdmin(this.config.linkedDevice != undefined ? this.config.linkedDevice.finalIds || {} : {});
        this.alexaInput = await getDataFromAdmin(this.config.alexa != undefined ? this.config.alexa.finalIds || {} : {});
        this.sayitInput = await getDataFromAdmin(this.config.sayit != undefined ? this.config.sayit.finalIds || {} : {});
        this.whatsappInput = await getDataFromAdmin(this.config.whatsapp != undefined ? this.config.whatsapp.finalIds || {} : {});
        this.telegramInput = await getDataFromAdmin(this.config.telegram != undefined ? this.config.telegram.finalIds || {} : {});
        this.pushoverInput = await getDataFromAdmin(this.config.pushover != undefined ? this.config.pushover.finalIds || {} : {});
        this.emailInput = await getDataFromAdmin(this.config.email != undefined ? this.config.email.finalIds || {} : {});
        this.signalInput = await getDataFromAdmin(this.config.signal != undefined ? this.config.signal.finalIds || {} : {});
        this.matrixInput = await getDataFromAdmin(this.config.matrix != undefined ? this.config.matrix.finalIds || {} : {});

        this.states.action = await this.config.status.ids[0].stateAction;
        this.states.standby = await this.config.status.ids[0].stateStandby;
        this.states.off = await this.config.status.ids[0].stateOff;

        async function getDataFromAdmin(data) {
            if (data !== undefined && Object.keys(data).length > 0) {
                return data;
            } else {
                const result = {};
                return result;
            };
        };

        this.log.debug(`ARR INPUT devices ${JSON.stringify(this.devices)}`);
        this.log.debug(`ARR INPUT alexa ${JSON.stringify(this.alexaInput)}`);
        this.log.debug(`ARR INPUT sayit ${JSON.stringify(this.sayitInput)}`);
        this.log.debug(`ARR INPUT whatsapp ${JSON.stringify(this.whatsappInput)}`);
        this.log.debug(`ARR INPUT telegram ${JSON.stringify(this.telegramInput)}`);
        this.log.debug(`ARR INPUT pushover ${JSON.stringify(this.pushoverInput)}`);
        this.log.debug(`ARR INPUT email ${JSON.stringify(this.emailInput)}`);
        this.log.debug(`ARR INPUT signal ${JSON.stringify(this.signalInput)}`);
        this.log.debug(`ARR INPUT matrix ${JSON.stringify(this.matrixInput)}`);

        // not implemented yet
        // presence = await this.config.presence[0];

        // const pathPresence = presence.dp_presence;
        // const presenceObj = await this.getForeignObjectAsync(pathPresence);
        // if (presenceObj) {
        //     if (presenceObj.common.type != undefined && presenceObj.common.type != ``) {
        //         if (presenceObj.common.type != "boolean") {
        //             this.log.warn(`[WARN] Type of <${pathPresence}> must be a BOOLEAN! Detected Type: <${presenceObj.common.type}> Presence detection disabled`);
        //             presence = null;
        //         } else {
        //             const val = await this.getCheckedState('foreign', pathPresence, false);
        //             this.trigger[pathPresence] = { id: 'presence', path: pathPresence, target: '', type: "presence" };
        //             this.values['presence'] = { path: pathPresence, val: false };
        //             bPresence = val.val;
        //             this.subscribeForeignStates(this.trigger[pathPresence].path);
        //         };
        //     };
        // } else {
        //     this.log.warn(`[WARN] <${pathPresence}> does not exist! Presence detection disabled`);
        // };

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
            this.setState('info.connection', true, true);
            return objTemp;
        } else {
            this.log.info(`No devices were created. Please create a device!`);
        };
        // } catch (error) {
        //     this.pollingData(false);
        //     this.setState('info.connection', false, true);
        //     this.log.error(`[ERROR] {onReady}: "${error}"`);
        // };
    };

    async pollingData(cmd) {
        // start cyclical status request
        if (this.poll != null) {
            clearInterval(this.poll);
            this.poll = null;
        };
        if (cmd) {
            this.poll = setInterval(() => {
                for (const i in this.devicesCompleted) {
                    const enabled = this.devicesCompleted[i].enabled
                    if (enabled) {
                        this.getValues(i);
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
                device.dateJSON = JSON.parse(value.dateJSON.val);
            };
        } catch (error) {
            device.dateJSON = null;
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
                    this.enabled = obj.enabled;
                    this.name = obj.name;
                    this.type = obj.type;
                    this.currentConsumption = obj.pathConsumption;
                    this.switchPower = obj.pathSwitch;
                    // script intern
                    this.pathStatus = statusDevice;
                    this.pathLiveConsumption = consumpLivePath;
                    this.timeTotal = runtimePath;
                    this.timeTotalMs = runtimeMSPath;
                    this.lastRuntime = lastRuntimePath;
                    this.runtimeMaxDP = runtimeMaxDP;
                    this.alertRuntime = alertRuntimeDP;
                    this.messageDP = messageDP;
                    this.averageConsumption = averageConsumption;
                    this.dnd = doNotDisturb;
                    this.lastOperations = lastOperations;
                    this.autoOffDP = autoOffDP;
                    // string
                    this.startTimeJSON = `00:00:00`;
                    this.endtimeJSON = `00:00:00`;
                    this.runtimeJSON = '00:00:00';
                    // boolean
                    this.startMessageSent = false;
                    this.endMessageSent = false;
                    this.started = false;
                    this.abort = obj.abort;
                    // boolean Benutzervorgaben
                    this.autoOff = obj.autoOff;
                    // number
                    this.consumption = 0;
                    this.resultStart = 0;
                    this.resultEnd = 0;
                    this.resultStandby = 0;
                    this.alertCounter = 0;
                    // Verbrauchswerte
                    this.startValue = objVal.startVal;
                    this.endValue = objVal.endVal;
                    this.standby = objVal.standby != '' ? objVal.standby || 1 : 1;
                    // Zaehler Abbruchbedingungen
                    this.startCount = objVal.startCount;
                    this.endCount = objVal.endCount;
                    // timeout
                    this.timeout = null;
                    this.timeoutMsg = null;
                    this.startTime = 0;
                    this.endTime = 0;
                    // array
                    this.arrStart = [];
                    this.arrEnd = [];
                    this.arrStandby = [];
                    this.dateJSON = [];

                    // Methoden
                    // Abbruchvalue erstellen
                    if (objVal.endCount >= 5 && objVal.endCount <= 10) {
                        this.valCancel = objVal.endCount - 5;
                    } else if (objVal.endCount > 10) {
                        this.valCancel = 10;
                    } else {
                        this.valCancel = 5;
                    };

                    this.message = {
                        startMessage: obj.startText.length > 0 ? true || false : false,
                        startText: obj.startText,
                        endMessage: obj.endText.length ? true || false : false,
                        endText: obj.endText
                    };

                    /*obj timer erstellen*/
                    if (obj.autoOff) {
                        if (obj.timer != `` && obj.timer != undefined && obj.timer != 0) {
                            this.timeoutInMS = (Math.floor(obj.timer) * 60 * 1000); // Umrechnung auf ms
                        } else {
                            this.timeoutInMS = 0;
                        };
                    };

                    this.alexa = {
                        active: obj.alexa.length > 0 ? true || false : false,
                        ids: obj.alexa != undefined ? obj.alexa || [] : [],
                        volOld: 0
                    };

                    this.sayit = {
                        active: obj.sayit.length > 0 ? true || false : false,
                        ids: obj.sayit != undefined ? obj.sayit || [] : [],
                        volOld: 0
                    };

                    this.telegram = {
                        active: obj.telegram.length > 0 ? true || false : false,
                        ids: obj.telegram != undefined ? obj.telegram || [] : []
                    };

                    this.whatsapp = {
                        active: obj.whatsapp.length > 0 ? true || false : false,
                        ids: obj.whatsapp != undefined ? obj.whatsapp || [] : []
                    };

                    this.pushover = {
                        active: obj.pushover.length > 0 ? true || false : false,
                        ids: obj.pushover != undefined ? obj.pushover || [] : []
                    };

                    this.signal = {
                        active: obj.signal.length > 0 ? true || false : false,
                        ids: obj.signal != undefined ? obj.signal || [] : []
                    };

                    this.email = {
                        active: obj.email.length > 0 ? true || false : false,
                        ids: obj.email != undefined ? obj.email || [] : []
                    };

                    this.matrix = {
                        active: obj.matrix.length > 0 ? true || false : false,
                        ids: obj.matrix != undefined ? obj.matrix || [] : []
                    };
                };
            };

            this.adapterDPs[name] = await this.createDP(name); // DP erstellen und pfad in array speichern

            // device type ermitteln und Objekt bauen
            const devCusType = await this.config.default.ids;
            const devDefType = await this.config.custom.ids;

            let objVal = {
                used: false,
                startVal: 0,
                endVal: 0,
                standby: 0,
                startCount: 0,
                endCount: 0
            };

            for (const i in devCusType) { // default types
                if (devCusType[i].name == devicesInput.type) {
                    objVal.used = true;
                    objVal.startVal = devCusType[i].startVal; // startwert
                    objVal.endVal = devCusType[i].endVal; // endwert
                    objVal.standby = devCusType[i].standby; //standbywert
                    objVal.startCount = devCusType[i].startCount; // anzahl Messungen "START"
                    objVal.endCount = devCusType[i].endCount; // anzahl Messungen "ENDE"
                };
            };

            if (objVal.used == false) { //custom types
                for (const i in devDefType) {
                    if (devDefType[i].name == devicesInput.type) {
                        objVal.startVal = devDefType[i].startVal // startwert
                        objVal.endVal = devDefType[i].endVal // endwert
                        objVal.standby = devDefType[i].standby // stanbbywert
                        objVal.startCount = devDefType[i].startCount // anzahl Messungen "START"
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

            this.log.debug(`RETURN ${JSON.stringify(device)}`);
            this.log.debug(`Device ${JSON.stringify(device.name)} was successfully created`);
            return device;
        } catch (error) {
            this.log.error(`[ERROR] {funcCreateObject}: "${error}"`);
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

        this.log.debug(`[ID] ${JSON.stringify(id)}`);
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
                    device.arrStart = [];
                    this.log.debug(`[${JSON.stringify(device.name)}]: arrStart gelöscht`);
                    break;
                };
            case false:
                {
                    if (this.values[id].consumption.val < device.startValue) {
                        // Startabbruch -> array leeren
                        device.arrStart = [];
                        this.log.debug(`[${JSON.stringify(device.name)}]: arrStart gelöscht`);
                        // standby Berechnung durchfuehren
                        await this.calcStart(id, "standby"); // standby Berechnung
                    } else {
                        // Startphase -> Startwertberechnung
                        await this.calcStart(id, "start"); // Startwert Berechnung
                        // standby Berechnung löschen
                        // this.setStatus(id, 4);
                        device.arrStandby = [];
                        this.log.debug(`[${JSON.stringify(device.name)}]: arrStandby gelöscht`);
                    };
                    break;
                };
            default:
                break;
        };
        this.log.debug(`[${JSON.stringify(device.name)}]: Berechnung beendet`);
    };

    /**
     * @param {string} id
     */
    async evaluateStatus(id) {
        const device = this.devicesCompleted[id];
        const value = this.values[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: Auswertung gestartet`);

        // const val = 0.2;

        if (device.abort) { // Abbrucherkennung aktiviert?
            if (device.started) {
                if (device.resultStandby < device.standby && device.arrStandby.length >= device.valCancel) { // consumption kleiner Vorgabe, Gerät wurde von Hand ausgeschaltet und war in Betrieb
                    this.log.debug(`1: ${device.resultStandby} < ${device.standby} && ${device.arrStandby.length} >= ${device.valCancel}`);
                    this.setStatus(id, 0);
                    await this.setStateAsync(device.averageConsumption, device.resultStandby, true);
                    if (device.autoOff) { // auto Off aktiviert?
                        await this.autoOff(id);
                    };
                    device.started = false;
                    device.endMessageSent = false;
                    device.startMessageSent = false;

                    // clear all arrays
                    device.arrStart = [];
                    device.arrEnd = [];
                    device.arrStandby = [];
                };
            };
        };

        // device nich in Betrieb
        // Ermittlung, ob device gestartet wurde
        this.log.debug(`[${JSON.stringify(device.name)}]: WERTE für START${this.values[id].consumption.val}; ${device.startValue}; ${device.started}`);
        if (device.resultStart > device.startValue && device.resultStart != null && device.arrStart.length >= device.startCount && !device.started) {
            // device wurde gestartet
            device.started = true; // Vorgang started
            device.startTime = Date.now(); // startTime loggen
            device.startTimeJSON = this.formatDate(new Date(), "DD.MM.YYYY hh:mm:ss");
            this.time(id);
            this.setStatus(id, 1);
            this.log.debug(`[${JSON.stringify(device.name)}]: Gerät gestartet, device läuft`);

            if (device.message.startMessage && !device.startMessageSent) { // Start Benachrichtigung aktiv?
                this.log.debug(`[${JSON.stringify(device.name)}]: GESTARTET`);
                if (device.timeoutMsg != null) {
                    clearTimeout(device.timeoutMsg);
                    device.timeoutMsg = null;
                };
                if (!value.dnd.val) {
                    await this.setVolume(id, true, "alexa");
                    await this.setVolume(id, true, "sayit");
                };
                device.timeoutMsg = setTimeout(async() => { //timeout starten
                    this.message(id, "start");
                    if (!value.dnd.val) {
                        await this.setVolume(id, false, "alexa");
                        await this.setVolume(id, false, "sayit");
                    };
                }, 1000);
            };

            device.startMessageSent = true; // startMessage wurde versendet
            device.endMessageSent = false; // Ende Benachrichtigung freigeben
        };

        // device in Betrieb
        // Ermittlung, ob device nocht laeuft
        if (device.resultEnd > device.endValue && device.resultEnd != null && device.started) { // Wert > endValue und consumption lag 1x ueber startValue
            this.log.debug(`[${JSON.stringify(device.name)}]: in Betrieb?  Ergebnis ENDE: ${JSON.stringify(device.resultEnd)} Wert ENDE: ${JSON.stringify(device.endValue)} started: ${JSON.stringify(device.started)} Arraylength: ${JSON.stringify(device.arrEnd.length)} Zaehler Arr Ende: ${JSON.stringify(device.endCount)} `);
            if (device.timeout != null) {
                clearTimeout(device.timeout);
                device.timeout = null;
                this.log.debug(`[${JSON.stringify(device.name)}]: timeout autoOff gelöscht`);
            };
            this.setStatus(id, 1);
            this.time(id);
        } else if (device.resultEnd < device.endValue && device.resultEnd != null && device.started && device.arrEnd.length >= (device.endCount * (2 / 3))) { // geraet muss mind. 1x ueber startValue gewesen sein, arrEnd muss voll sein und ergebis aus arrEnd unter endValue
            // Vorgang vom device beendet
            this.log.debug(`[${JSON.stringify(device.name)}]: Vorgang beendet, Gerät fertig`);
            device.started = false; // device started = false ;
            device.endtimeJSON = this.formatDate(new Date(), "DD.MM.YYYY hh:mm:ss");

            const strJSON = `{"start":"${device.startTimeJSON}", "end":"${device.endtimeJSON}", "runtime":"${device.runtimeJSON}"}`;

            if (device.dateJSON === null) {
                device.dateJSON = [];
            };

            device.dateJSON.push(JSON.parse(strJSON));

            if (device.dateJSON.length >= 15) {
                device.dateJSON.shift();
            };

            this.setStateAsync(device.lastOperations, `${JSON.stringify(device.dateJSON)}`, true);
            this.setStateAsync(device.lastRuntime, device.runtimeJSON, true);
            this.setStateAsync(device.alertRuntime, false, true);

            // standby oder off?
            if (device.resultEnd < device.standby) {
                this.log.debug(`2: ${device.resultEnd} < ${device.standby}; ${device.started}`);
                device.resultStandby = device.resultEnd;
                device.arrStandby = [];
                this.setStatus(id, 0);
            } else {
                this.log.debug(`STANDBY 1: ${device.resultEnd} > ${device.standby}; ${device.started}`);
                this.setStatus(id, 2);
            };

            // autoOff active?
            await this.autoOff(id);

            device.endTime = Date.now(); // ende Zeit loggen
            device.arrStart = []; // array wieder leeren
            device.arrEnd = []; // array wieder leeren

            if (device.message.endMessage && !device.endMessageSent && device.startMessageSent) { // Ende Benachrichtigung aktiv?
                if (device.timeoutMsg != null) {
                    clearTimeout(device.timeoutMsg);
                    device.timeoutMsg = null;
                };
                if (!value.dnd.val) {
                    await this.setVolume(id, true, "alexa");
                    await this.setVolume(id, true, "sayit");
                };
                device.timeoutMsg = setTimeout(async() => { //timeout starten
                    this.message(id, "end"); // send message
                    if (!value.dnd.val) {
                        await this.setVolume(id, false, "alexa");
                        await this.setVolume(id, false, "sayit");
                    };
                    this.log.debug(`[${JSON.stringify(device.name)}]: Endmessage: ${device.message.endText}`);
                }, 1000);
            };

            device.endMessageSent = true;
            device.startMessageSent = false;
        };

        // device nicht in Betrieb
        // device nicht in Startphase
        if (!device.started) {
            if (device.resultStandby < device.standby && device.arrStandby.length >= device.valCancel) {
                this.setStatus(id, 0);
                this.log.debug(`3: ${device.resultStandby} < ${device.standby} && ${device.arrStandby.length} >= ${device.valCancel}`);
            } else if (device.resultStandby >= device.standby && device.arrStandby.length >= device.valCancel) {
                this.log.debug(`STANDBY2: ${device.resultStandby} >= ${device.standby} && ${device.arrStandby.length} >= ${device.valCancel}; valEND: ${device.resultEnd}`);
                this.setStatus(id, 2);
            };
        };

        this.setStateAsync(device.pathLiveConsumption, this.values[id].consumption.val, true);

        this.log.debug(`[${JSON.stringify(device.name)}]: Auswertung beendet`);
    };

    /**
     * @param {string} id
     */
    async autoOff(id) {
        const device = this.devicesCompleted[id];
        /* auto off*/
        if (device.autoOff) { // auto Off aktiv, timeout aktiv 
            if (device.timeout == null) {
                device.timeout = setTimeout(async() => { //timeout starten
                    this.setStatus(id, 3);
                    if (device.timeout != null) {
                        clearTimeout(device.timeout);
                        device.timeout = null;
                        this.log.debug(`[${JSON.stringify(device.name)}]: autoOff fertig, timeout clear`);
                    };
                }, device.timeoutInMS);
            };
        };
    };

    /**
     * @param {string} id
     * @param {string} status
     */
    async setStatus(id, status) {
        const device = this.devicesCompleted[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: value status: ${status}`);
        switch (status) {
            case 0:
                {
                    this.setStateAsync(device.pathStatus, this.states.off, true); // setState "off" in DP
                    this.log.debug(`[${JSON.stringify(device.name)}]: ${this.states.off} (finished/off)`);
                    break;
                };
            case 1:
                {
                    this.setStateAsync(device.pathStatus, this.states.action, true); // setState "action" in DP
                    this.log.debug(`[${JSON.stringify(device.name)}]: ${this.states.action} (in action)`);
                    break;
                };
            case 2:
                {
                    this.setStateAsync(device.pathStatus, this.states.standby, true); // setState "standby" in DP
                    this.log.debug(`[${JSON.stringify(device.name)}]: ${this.states.standby} (in standby)`);
                    break;
                };
            case 3:
                {
                    if (device.autoOff && device.switchPower != null) {
                        if (this.values[id].switch.val) {
                            await this.setForeignStateAsync(device.switchPower, false);
                        };
                    };
                    this.log.debug(`4`);
                    this.setStatus(id, 0);
                    break;
                };
            case 4:
                {
                    this.setStateAsync(device.pathStatus, `initialize`, true); // setState in DP
                    this.log.debug(`[${JSON.stringify(device.name)}]: initialize`);
                    break;
                };
            default:
                {
                    this.log.debug(`[${JSON.stringify(device.name)}]: unknown status`);
                    this.setStateAsync(device.pathStatus, `unknown status`, true); // setState in DP
                    break;
                };
        };
    };

    /**
     * @param {string} id
     * @param {string} type
     */
    async calcStart(id, type) {
        const device = this.devicesCompleted[id];
        const value = this.values[id].consumption.val;
        this.log.debug(`[${JSON.stringify(device.name)}]: berechnung "${type}" wird ausgefuehrt`);
        switch (type) {
            case "start":
                {
                    device.arrStart.push(value);
                    device.resultStart = await this.calculation(device.resultStart, device.arrStart);
                    this.log.debug(`[${JSON.stringify(device.name)}]: resultTemp start: ${device.resultStart}`);
                    this.log.debug(`[${JSON.stringify(device.name)}]: Länge array start: ${device.arrStart.length}, Inhalt: [${device.arrStart}]`);
                    this.setStateAsync(device.averageConsumption, device.resultStart, true);
                    break;
                };
            case "end":
                {
                    device.arrEnd.push(value);
                    device.resultEnd = await this.calculation(device.resultEnd, device.arrEnd);
                    this.log.debug(`[${JSON.stringify(device.name)}]: Länge array ende: ${device.arrEnd.length}, Inhalt: [${device.arrEnd}]`);
                    this.log.debug(`[${JSON.stringify(device.name)}]: resultTemp end: ${device.resultEnd}`);
                    if (device.arrEnd.length > device.endCount) {
                        device.arrEnd.shift();
                    };
                    this.setStateAsync(device.averageConsumption, device.resultEnd, true);
                    break;
                };
            case "standby":
                {
                    device.arrStandby.push(value);
                    device.resultStandby = await this.calculation(device.resultStandby, device.arrStandby);
                    this.log.debug(`[${JSON.stringify(device.name)}]: Länge array standby: ${device.arrStandby.length}, Inhalt: [${device.arrStandby}]`);
                    this.log.debug(`[${JSON.stringify(device.name)}]: resultTemp standby: ${device.resultStandby}`);
                    if (device.arrStandby.length > device.valCancel) {
                        device.arrStandby.shift();
                    };
                    this.setStateAsync(device.averageConsumption, device.resultStandby, true);
                    break;
                };
            default:
                {
                    this.log.warn(`Calculation could not be completed. Input is wrong. Report this to the developer`);
                    break;
                };
        };
    };

    /**
     * @param {number} res
     */
    async calculation(res, arr) {
        let numb = 0;
        let resultTemp = 0;
        for (const i in arr) {
            numb = parseFloat(arr[i]);
            resultTemp = resultTemp + numb;
        };
        res = ((resultTemp / arr.length) * 100);
        res = Math.round(res) / 100;
        return res;
    };

    /**
     * @param {string} id
     */
    async time(id) {
        const device = this.devicesCompleted[id];
        const value = this.values[id];
        //Laufzeit berechnen
        let diff = 0;
        let time = `00:00:00`;
        let timeMs = 0;
        const vergleichsZeit = Date.now();
        const startTime = device.startTime;
        diff = (vergleichsZeit - startTime);
        time = this.formatDate(Math.round(diff), `hh:mm:ss`);
        if (time === ``) {
            time = `00:00:00`
        };
        timeMs = diff;
        // Runtime alert
        if (value.runtimeMax.val > 0) {
            const runtime = value.runtimeMax.val * 60 * 1000 + 1000;
            if (timeMs >= runtime) {
                this.setStateAsync(device.alertRuntime, true, true);
            } else {
                this.setStateAsync(device.alertRuntime, false, true);
            };
        };
        device.runtimeJSON = time;
        this.setStateAsync(device.timeTotalMs, timeMs, true); // Status in DP schreiben
        this.setStateAsync(device.timeTotal, time, true); // Status in DP schreiben
    };

    /**
     * @param {string} id
     * @param {string} type
     */
    async message(id, type) {
        const device = this.devicesCompleted[id];
        const value = this.values[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: message wird ausgefuehrt`);
        let msg = ``;
        const a = new Date();
        const aHours = a.getHours();
        const aMin = a.getMinutes();
        let time = `${aHours}:${aMin}`;
        time = await this.str2time(time);

        const sendMsg = async(id, /**@type {string}*/ msg) => {
            // trigger dp
            this.setStateAsync(device.messageDP, msg, true);
            // send telegram
            try {
                if (device.telegram.active) {
                    for (const i in device.telegram.ids) {
                        const dataTelegram = this.telegramInput[device.telegram.ids[i]];
                        let objTemp = {
                            /**@type {string}*/
                            text: msg,
                            /**@type {string}*/
                            user: dataTelegram.username,
                            /**@type {string}*/
                            chatId: dataTelegram.chatId,
                        };
                        if (!dataTelegram.group) { // Wenn keine Gruppe, dann chatId loeschen
                            delete objTemp.chatId;
                        };

                        this.sendTo(`telegram${dataTelegram.inst}`, `send`, objTemp);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: TELEGRAM}: "${error}"`);
            };

            // send whatsapp
            try {
                if (device.whatsapp.active) {
                    for (const i in device.whatsapp.ids) {
                        this.log.warn(`[${JSON.stringify(device.name)}]: whatsapp message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        await this.setForeignStateAsync(this.whatsappInput[device.whatsapp.ids[i]].path, `${msg}`);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: WHATSAPP}: "${error}"`);
            };

            // send alexa
            try {
                if (device.alexa.active && !value.dnd.val) {
                    for (const i in device.alexa.ids) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: Alexa message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        await this.sendMsgSpeaker(id, this.alexaInput[device.alexa.ids[i]], time, `${msg}`);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: ALEXA}: "${error}"`);
            };

            // send sayit
            try {
                if (device.sayit && !value.dnd.val) { //sayit 
                    for (const i in device.sayit.ids) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: sayIt message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        await this.sendMsgSpeaker(id, this.sayitInput[device.sayit.ids[i]], time, msg);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: SAYIT}: "${error}"`);
            };

            // send pushover
            try {
                if (device.pushover.active) { // pushover nachricht versenden
                    for (const i in device.pushover.ids) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: pushover message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        let objTemp = {
                            /**@type {string}*/
                            message: msg,
                            /**@type {string}*/
                            sound: this.pushoverInput[device.pushover.ids[i]].sound,
                            /**@type {string}*/
                            title: this.pushoverInput[device.pushover.ids[i]].title,
                            /**@type {string}*/
                            device: this.pushoverInput[device.pushover.ids[i]].deviceId,
                            /**@type {number}*/
                            priority: this.pushoverInput[device.pushover.ids[i]].prio,
                            /**@type {number}*/
                            retry: 60, // fuer Bestaetigung, wird geloescht, wenn andere Prio gewaehlt
                            /**@type {number}*/
                            expire: 3600, // fuer Bestaetigung, wird geloescht, wenn andere Prio gewaehlt
                        };

                        // Wenn andere Prioritaet als 2, loesche Bestaetigungsparameter
                        if (objTemp.priority != 2) {
                            delete objTemp.priority
                            delete objTemp.retry
                            delete objTemp.expire
                        };

                        this.log.debug(`[${JSON.stringify(device.name)}]: PUSHOVER OBJECT SENDTO: ${JSON.stringify(objTemp)}`);
                        this.sendTo(`pushover${this.pushoverInput[device.pushover.ids[i]].inst}`, "send", objTemp);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: PUSHOVER}: "${error}"`);
            };

            // send signal
            try {
                if (device.signal.active) { // pushover nachricht versenden
                    for (const i in device.signal.ids) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: signal-cmb message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        let objTemp = {
                            /**@type {string}*/
                            text: msg,
                            /**@type {string}*/
                            phone: this.signalInput[device.signal.ids[i]].phone,
                        };
                        this.log.debug(`[${JSON.stringify(device.name)}]: signal-cmb OBJECT SENDTO: ${JSON.stringify(objTemp)}`);
                        this.sendTo(`signal-cmb${this.signalInput[device.signal.ids[i]].inst}`, "send", objTemp);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: signal-cmb}: "${error}"`);
            };

            // send matrix
            try {
                if (device.matrix.active) { // pushover nachricht versenden
                    for (const i in device.matrix.ids) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: matrix message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        this.sendTo(`matrix${this.pushoverInput[device.pushover.ids[i]].inst}`, msg);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: matrix}: "${error}"`);
            };

            // send email
            try {
                if (device.email && this.emailInput != undefined) { // email nachricht versenden
                    for (const i in device.emailID) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: email message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        let objTemp = {
                            /**@type {string}*/
                            text: msg,
                            /**@type {string}*/
                            to: this.emailInput[device.emailID[i]].emailTo,
                            /**@type {string}*/
                            subject: msg,
                            /**@type {string}*/
                            from: this.emailInput[device.emailID[i]].emailFrom
                        };
                        this.sendTo("email", "send", objTemp);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: EMAIL}: "${error}"`);
            };
            this.log.debug(`bufferArr: ${JSON.stringify(bufferArr)}`)
        };

        switch (type) {
            case "start":
                msg = await this.createObjMsg(device.message.startText);
                this.log.debug(`[${JSON.stringify(device.name)}]: startmessage: ${JSON.stringify(device.message.startText)}`);
                sendMsg(id, msg);
                break;
            case "end":
                msg = await this.createObjMsg(device.message.endText);
                this.log.debug(`[${JSON.stringify(device.name)}]: endmessage: ${JSON.stringify(device.message.endText)}`);
                sendMsg(id, msg);
                if (!bPresence) {
                    const objTemp = {
                        obj: device,
                        msg: msg
                    }
                    bufferArr.push(objTemp);
                    this.log.debug(`[${device.name}] added in bufferArr`);
                };
                break;
        };
    };

    /**
     * @param {string} id
     */
    async sendMsgSpeaker(id, input, time, msg) {
        const device = this.devicesCompleted[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: sendMsgSpeaker: MSG:${JSON.stringify(msg)}`)
        let timeMin = ``;
        let timeMax = ``;
        timeMin = await this.str2time(input.timeMin);
        timeMax = await this.str2time(input.timeMax);
        if (time >= timeMin && time < timeMax) {
            await this.setForeignStateAsync(input.path, `${msg}`);
        };
    };

    /**
     * @param {string} id
     * @param {string} type
     * @param {boolean} action
     */
    async setVolume(id, action, type) {
        const device = this.devicesCompleted[id];
        this.log.debug(`[${JSON.stringify(device.name)}]: setVolume `)
        switch (type) {
            case "alexa":
                {
                    if (device.alexa) {
                        for (const i in device.alexaID) {
                            const strVol = '.speak-volume';
                            await this.volume(this.alexaInput[device.alexaID[i]], action, strVol)
                        };
                    };
                    break;
                };
            case "sayit":
                {
                    if (device.sayIt) {
                        for (const i in device.sayItID) {
                            const strVol = '.volume';
                            await this.volume(this.sayitInput[device.sayItID[i]], action, strVol)
                        };
                    };
                    break;
                };
            default:
                {
                    this.log.warn(`Volume could not be set. Input is wrong. Report this to the developer`);
                    break;
                };
        };
    };

    /**
     * @param {boolean} action
     * @param {string} strVol
     */
    async volume(obj, action, strVol) {
        /**@type {string}*/
        let pathOld;
        /**@type {string}*/
        let pathNew;
        /**@type {number}*/
        let length;
        /**@type {number}*/
        let volume;
        /**@type {number}*/
        let volOld;
        volume = parseInt(obj.volume);
        volOld = parseInt(obj.volOld);
        pathOld = obj.path;
        length = pathOld.lastIndexOf('.');
        pathNew = pathOld.slice(0, length);
        pathNew = String(pathNew) + strVol;
        // check pathNew
        const checkPath = await this.getForeignObjectAsync(pathNew);
        if (!checkPath) {
            this.log.debug(`DP was not found: ${pathNew}`);
            pathNew = null;
        };
        if (pathNew !== null) {
            if (action) {
                let val = 0;
                val = await this.getCheckedState('foreign', pathNew, 30);
                if (val !== null && val !== undefined) {
                    obj.volOld = val;
                } else {
                    obj.volOld = null
                };
                this.log.debug(`[1214]: type volume : ${typeof (volume)}, val: ${volume}`);
                await this.setForeignStateAsync(pathNew, volume);

            } else {
                if (obj.timeout != null) {
                    clearTimeout(obj.timeout);
                    obj.timeout = null;
                };
                if (obj.volOld !== null) {
                    obj.timeout = setTimeout(async() => { //timeout starten
                        this.log.debug(`[1224]: type volOld : ${typeof (volOld)}, val: ${volOld}`);
                        await this.setForeignStateAsync(pathNew, volOld);
                    }, 2000);
                };
            };
        };
    };

    /**
     * @param {string} objMsg
     */
    async createObjMsg(objMsg) {
        this.log.debug(`MESSAGEPATH: ${objMsg}`);
        let msgTemp = ``;
        let length = 0;
        let lengthTotal = 0;
        length = (objMsg.lastIndexOf(".") + 1);
        lengthTotal = objMsg.length;
        if (objMsg != `` && objMsg != undefined && objMsg.length > 0) {
            // message != undefined
            if (length < lengthTotal) {
                // last digit is a dot TRUE
                if (await this.getForeignObjectAsync(objMsg) != null) {
                    // msg from DP TRUE
                    const result = await this.getCheckedState('foreign', objMsg, `[ERROR] Object Message not found`);;
                    msgTemp = result;
                } else {
                    // msg from DP false
                    msgTemp = objMsg;
                }
            } else {
                // last digit is a dot FALSE
                msgTemp = objMsg;
            };
        };
        this.log.debug(`MESSAGE: ${msgTemp}`);
        return msgTemp;
    };

    async str2time(str) {
        return str.split(":")[0] * 100 + parseInt(str.split(":")[1], 10);
    };

    /**
     * @param {string} type
     * @param {string} path
     * @param {any} state
     */
    // get state
    async getCheckedState(type, path, state) {

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
            for (const i in this.devicesCompleted) {
                this.delTimeout(this.devicesCompleted[i].timeout, i);
                this.delTimeout(this.devicesCompleted[i].timeoutMsg, i);
                for (const i in this.alexaInput) {
                    this.delTimeout(this.alexaInput[obj.alexaID[i]].timeout, i);
                };
                for (const i in this.sayitInput) {
                    this.delTimeout(this.sayitInput[obj.sayItID[i]].timeout, i);
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

    async delTimeout(obj, i) {
        if (obj) {
            clearTimeout(obj);
            this.log.debug(`timeout ${JSON.stringify(i)}: was deleted`);
        };
    };

    async onMessage(obj) {

        // try {

        this.log.debug(`Data from configuration received : ${JSON.stringify(obj)}`);

        const counter = await obj.message;
        this.log.debug(`COUNTER ON MESSAGE: ${JSON.stringify(counter)}`);

        await this.ctrlInput(obj, obj.command, obj.message);
        // };
        // } catch (error) {
        // this.log.error(`[ERROR] {onMessage}: "${error}"`);
        // };
    };

    async ctrlInput(obj, cmd, arr) {

        let checked = [];
        let failed = [];
        let keys = [];
        let array = {};
        array = arr;

        this.log.debug(JSON.stringify(array))

        for (const i in array) {
            array[i].check = 'open';
        };

        if (Object.keys(array).length > 0) {
            if (cmd.includes('devices')) keys = ['name', 'type', 'consumption', 'switch'];
            if (cmd.includes('alexa')) keys = ['name', 'path'];
            if (cmd.includes('sayit')) keys = ['name', 'path'];
            if (cmd.includes('telegram')) keys = ['name', 'inst', 'username'];
            if (cmd.includes('whatsapp')) keys = ['name', 'path'];
            if (cmd.includes('pushover')) keys = ['name', 'inst', 'prio', 'sound'];
            if (cmd.includes('email')) keys = ['name', 'emailFrom', 'emailTo'];
            if (cmd.includes('signal')) keys = ['name', 'inst', 'phone'];
            if (cmd.includes('matrix')) keys = ['name', 'inst'];
            if (cmd.includes('default') || cmd.includes('custom')) keys = ['name', 'startVal', 'endVal', 'standby', 'startCount', 'endCount'];

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
                        if (data[key].length == 0 || data[key] == undefined) {
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

    async getInstance(obj, val1, val2, counter) {
        this.log.debug('this.getInstance wird ausgefuehrt')
        let arrInstance = [];
        const a = await this.getObjectViewAsync('system', 'instance', {
            startkey: 'system.adapter.',
            endkey: 'system.adapter.\u9999'
        }, async(err, state) => {
            try {
                if (err) {
                    this.log.error(err);
                };
                let result = [];
                let inst = ``;
                state.rows.forEach(async(element) => {
                    result.push(element.id);
                });
                result.forEach(async(element) => {
                    for (let i = 0; i < 10; i++) {
                        if (element === `system.adapter.${val1}.${i}`) {
                            inst = `${i}`;
                            let arr = {
                                name: `${val1}.${i}.${val2}`,
                                inst: inst
                            };
                            arrInstance.push(arr);
                        };
                    };
                });
                if (val1 === `telegram`) {
                    await this.getTelegramUser(obj, arrInstance, counter);
                };
                if (val1 === `whatsapp-cmb`) {
                    await this.getWhatsappUser(obj, arrInstance, counter);
                };
            } catch (error) {
                this.log.error(`[ERROR] {getInstance}: "${error}"`);
            };
        });
    };

    async getTelegramUser(obj, arr, counter) {
        this.log.debug('GET TELEGRAM USER WIRD AUSGEFUEHRT');
        let arrTemp = [];
        for (const i in arr) {
            const state = await this.getForeignStateAsync(arr[i].name);
            if (state != undefined && state != `` && state.val != undefined && state.val != ``) {
                const objTemp = await JSON.parse(state.val);
                for (const j in objTemp) {
                    let strTemp = ``;
                    if (objTemp[j].firstName != undefined && objTemp[j].firstName !== "") {
                        strTemp = `[${arr[i].inst}]${objTemp[j].firstName}`;
                        arrTemp.push({
                            name: strTemp,
                            id: counter,
                            nameFinal: objTemp[j].firstName,
                            inst: `.${arr[i].inst}`
                        });
                        counter++;
                    };
                    if (objTemp[j].userName != undefined && objTemp[j].userName !== "") {
                        strTemp = `[${arr[i].inst}]${objTemp[j].userName}`;
                        arrTemp.push({
                            name: strTemp,
                            id: counter,
                            nameFinal: objTemp[j].userName,
                            inst: `.${arr[i].inst}`
                        });
                        counter++;
                    };
                };
            };
        };
        const result = {
            checked: arrTemp,
            failed: []
        };
        this.log.debug(`result: ${JSON.stringify(result)}`)
        await this.respond(obj, result, this)

    };

    async getWhatsappUser(obj, arr, counter) {
        this.log.debug('GET WHATSAPP USER WIRD AUSGEFUEHRT');
        let arrTemp = [];
        for (const i in arr) {
            const state = await this.getForeignObjectAsync(arr[i].name);
            if (state != undefined) {
                arrTemp.push({
                    name: `[${arr[i].inst}]cmb`,
                    nameFinal: `[${arr[i].inst}]cmb`,
                    id: counter,
                    inst: `.${arr[i].inst}`
                });
                counter++;
            };
        };
        const result = {
            checked: arrTemp,
            failed: []
        };
        this.log.debug(`result: ${JSON.stringify(result)}`)
        await this.respond(obj, result, this)

    };

    async validateEmail(email) {
        let res = false;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        res = (re.test(email));
        return (res);
    };

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