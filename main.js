// @ts-nocheck
`use strict`;

/*
 * Created with @iobroker/create-adapter v1.29.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require(`@iobroker/adapter-core`);
const { create } = require("domain");

let stateAction = ``;
let stateStandby = ``;
let stateOff = ``;
let alert = {};
let presence = {};
let bPresence = false;
let bufferArr = [];

let instAdapter = ``;

let status = -1;

let id = ``;

/*
offene Punkte:
Anwesenheit: Es muss noch eine Asuwertung eingebracht werden, ob nachrichten gesendet werden sollen (trotz abwesenheit)
runtime alert: implementieren
*/

// Load your modules here, e.g.:
// const fs = require(`fs`);

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
        this.poll = null; // polling intervall

    };

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        instAdapter = `${this.name}.${this.instance}`;

        this.setState('info.connection', false, true);

        try {

            this.devices = await this.config.devices.final;
            this.alexaInput = await this.config.alexa.final;
            this.sayitInput = await this.config.sayit.final;
            this.whatsappInput = await this.config.whatsapp.final;
            this.telegramInput = await this.config.telegram.final;
            this.pushoverInput = await this.config.pushover.final;
            this.emailInput = await this.config.email.final;

            alert = await this.config.alert.id[0];

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

            if (this.telegramInput == undefined) {
                this.telegramInput = null;
            };

            stateAction = await this.config.status.id[0].stateAction;
            if (stateAction === `` || stateAction == undefined) {
                stateAction = `in action`;
            };
            stateStandby = await this.config.status.id[0].stateStandby;
            if (stateStandby === `` || stateStandby == undefined) {
                stateStandby = `standby`;
            };
            stateOff = await this.config.status.id[0].stateOff;
            if (stateOff === `` || stateOff == undefined) {
                stateOff = `switched off`;
            };

            this.log.debug(`ARR INPUT devices ${JSON.stringify(this.devices)}`);
            this.log.debug(`ARR INPUT alexa ${JSON.stringify(this.alexaInput)}`);
            this.log.debug(`ARR INPUT sayit ${JSON.stringify(this.sayitInput)}`);
            this.log.debug(`ARR INPUT whatsapp ${JSON.stringify(this.whatsappInput)}`);
            this.log.debug(`ARR INPUT telegram ${JSON.stringify(this.telegramInput)}`);
            this.log.debug(`ARR INPUT pushover ${JSON.stringify(this.pushoverInput)}`);
            this.log.debug(`ARR INPUT email ${JSON.stringify(this.emailInput)}`);

            // Input auf Plausibilität prüfen
            if (this.devices !== "" && this.devices != undefined) {

                for (const id in this.devices) {
                    this.devicesCompleted[id] = await this.funcCreateObject(id); // create device
                    const device = this.devicesCompleted[id];

                    this.trigger[`${instAdapter}.${device.dnd}`] = { id: id, path: device.dnd, target: 'dnd', type: 'value' };
                    this.trigger[`${instAdapter}.${device.runtimeMaxDP}`] = { id: id, path: device.runtimeMaxDP, target: 'runtimeMax', type: 'value' };
                    this.trigger[device.currentConsumption] = { id: id, path: device.currentConsumption, target: 'consumption', type: 'value' };
                    if (device.switchPower !== undefined && device.switchPower !== ``) this.trigger[device.switchPower] = { id: id, path: device.switchPower, target: 'switch', type: 'value' };

                    // values
                    this.values[id] = {
                        id: id,
                        consumption: { path: device.currentConsumption, val: 0, type: 'number' },
                        switch: { path: device.switchPower, val: false, type: 'boolean' },
                        dnd: { path: device.dnd, val: false, type: 'boolean' },
                        runtimeMax: { path: device.runtimeMaxDP, val: 0, type: 'number' },
                        dateJSON: { path: device.lastOperations, val: '' }
                    };

                    this.log.debug(`[SUBSCRIBE]: ${device.dnd}: ${device.runtimeMaxDP}: ${device.currentConsumption}: ${device.switchPower}`)

                    //subscribe states
                    this.subscribeStates(device.dnd);
                    this.subscribeStates(device.runtimeMaxDP);
                    this.subscribeForeignStates(device.currentConsumption);
                    this.subscribeForeignStates(device.switchPower);

                    await this.stateIni(id); // first initialisation off all states

                    this.log.debug(`[DEVICES-COMPLETED] ${JSON.stringify(this.devicesCompleted)}`);
                    this.log.debug(`[THIS.TRIGGER] ${JSON.stringify(this.trigger)}`);
                };

                this.setState('info.connection', true, true);

                // start cyclical status request
                if (this.poll != null) {
                    clearInterval(this.poll);
                    this.poll = null;
                };
                this.poll = setInterval(() => {
                    for (const i in this.devicesCompleted) {
                        this.getValues(i);
                    };
                }, 10000);

            } else {
                this.log.error(`No devices were created. Please create a device!`);
            };
        } catch (error) {
            if (this.poll != null) {
                clearInterval(this.poll);
                this.poll = null;
            };
            this.setState('info.connection', false, true);
            this.log.error(`[ERROR] {onReady}: "${error}"`);
        };
    };

    /**
    * @param {string} id
    */
    async stateIni(id) {
        const device = this.devicesCompleted[id];
        const value = this.values[id];

        // Event-based states
        value.consumption.val = await this.getCheckedState('foreign', value.consumption.path, 0);
        value.switch.val = await this.getCheckedState('foreign', value.switch.path, false);
        value.dnd.val = await this.getCheckedState(null, value.dnd.path, false);
        value.runtimeMax.val = await this.getCheckedState(null, value.runtimeMax.path, 0);
        value.dateJSON.val = await this.getCheckedState(null, value.dateJSON.path, '[]');

        // setState
        this.setStateAsync(device.runtimeMaxDP, await value.runtimeMax.val, true);
        this.setStateAsync(device.pathLiveConsumption, await value.consumption.val, true);
        this.setStateAsync(device.dnd, value.dnd.val, true);
        this.setStateAsync(device.lastOperations, value.dateJSON.val, true);

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
                    this.runtimeMax = parseInt(obj.runtimeMax);
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
                    this.alert = false;
                    // boolean Benutzervorgaben
                    this.autoOff = obj.autoOff;
                    // number
                    this.consumption = 0;
                    this.resultStart = 0;
                    this.resultEnd = 0;
                    this.resultStandby = 0;
                    // Verbrauchswerte
                    this.startValue = objVal.startVal;
                    this.endValue = objVal.endVal;
                    // Zaehler Abbruchbedingungen
                    this.startCount = objVal.startCount;
                    this.endCount = objVal.endCount;
                    // timeout
                    this.timeoutMsg = null;
                    this.timeoutAlert = null;
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

                    /*obj Startext erstellen*/
                    this.startMessageText = obj.startText;
                    if (obj.startText != `` && obj.startText != undefined) {
                        this.startMessage = true;
                    } else {
                        this.startMessage = false;
                    };

                    /*obj Endtext erstellen*/
                    this.endMessageText = obj.endText;
                    if (obj.endText != `` && obj.endText != undefined) {
                        this.endMessage = true;
                    } else {
                        this.endMessage = false;
                    };

                    /*obj timer erstellen*/
                    if (obj.autoOff) {
                        if (obj.timer != `` && obj.timer != undefined && obj.timer != 0) {
                            this.timeoutInMS = (Math.floor(obj.timer) * 60 * 1000); // Umrechnung auf ms
                        } else {
                            this.timeoutInMS = 0;
                        };
                    };
                    this.timeout = null

                    /*obj telegram erstellen*/
                    if (obj.telegram != `` && obj.telegram != undefined) {
                        this.telegramUser = obj.telegram
                        this.telegram = true;
                    } else {
                        this.telegram = false;
                    };

                    /*obj alexa erstellen*/
                    if (obj.alexa != undefined) {
                        this.alexaID = obj.alexa;
                        this.alexaVolOld = 0;
                        this.alexa = true;
                    } else {
                        this.alexa = false;
                    };

                    /*obj sayIt erstellen*/
                    if (obj.sayit != undefined) {
                        this.sayItID = obj.sayit;
                        this.sayItVolOld = 0;
                        this.sayIt = true;
                    } else {
                        this.sayIt = false;
                    };

                    /*obj whatsapp erstellen*/
                    if (obj.whatsapp != `` && obj.whatsapp != undefined) {
                        this.whatsappID = obj.whatsapp;
                        this.whatsapp = true;
                    } else {
                        this.whatsapp = false;
                    };

                    /*obj pushover erstellen*/
                    if (obj.pushover != undefined) {
                        this.pushoverID = obj.pushover
                        this.pushover = true;
                    } else {
                        this.pushover = false;
                    };

                    /*obj email erstellen*/
                    if (obj.email != undefined) {
                        this.emailID = obj.email
                        this.email = true;
                    } else {
                        this.email = false;
                    };
                };
            };

            const autoOffDP = (`${name}.config.auto Off`);

            const arrDP = {
                statusDevice: { name: `statusDevice`, path: `${name}.Status`, parse: { "name": `Status ${name}`, "type": "string", "role": "indicator", "read": true, "write": false } },
                consumpLive: { name: `consumpLive`, path: `${name}.live consumption`, parse: { "name": `live consumption ${name}`, "type": "number", "role": "indicator", "unit": "W", "read": true, "write": false } },
                runtime: { name: `runtime`, path: `${name}.runtime`, parse: { "name": `runtime ${name}`, "type": "string", "role": "indicator", "read": true, "write": false } },
                runtimeMS: { name: `runtimeMS`, path: `${name}.runtime in ms`, parse: { "name": `runtime in ms ${name}`, "type": "number", "role": "indicator", "read": true, "write": false } },
                lastRuntime: { name: `lastRuntime`, path: `${name}.lastRuntime`, parse: { "name": `last runtime ${name}`, "type": "string", "role": "indicator", "read": true, "write": false } },
                messageDP: { name: `messageDP`, path: `${name}.messageDP`, parse: { "name": `messageDP ${name}`, "type": "string", "role": "indicator", "read": true, "write": false } },
                averageConsumption: { name: `averageConsumption`, path: `${name}.average consumption`, parse: { "name": `average consumption ${name}`, "type": "number", "role": "indicator", "unit": "W", "read": true, "write": false } },
                alertRuntime: { name: `alertRuntime`, path: `${name}.alert runtime`, parse: { "name": `alert runtime ${name}`, "type": "boolean", "role": "indicator", "read": true, "write": false } },
                lastOperations: { name: `lastOperations`, path: `${name}.last operations`, parse: { "name": `last operations ${name}`, "type": "string", "role": "indicator", "read": true, "write": false } },
                // config
                doNotDisturb: { name: `doNotDisturb`, path: `${name}.config.do not disturb`, parse: { "name": `do not disturb ${name}`, "type": "boolean", "role": "indicator", "read": true, "write": true } },
                runtimeMax: { name: `runtimeMax`, path: `${name}.config.runtime max`, parse: { "name": `runtime max ${name}`, "type": "number", "min": 0, "role": "indicator", "unit": "min", "read": true, "write": true } }
            };

            for (const i in arrDP) {
                await this.setObjectNotExistsAsync(arrDP[i].path, {
                    type: `state`,
                    common: arrDP[i].parse,
                    native: {},
                });
            };

            // device type ermitteln und Objekt bauen
            const devCusType = await this.config.default.id;
            const devDefType = await this.config.custom.id;

            let objVal = {
                used: false,
                startVal: 0,
                endVal: 0,
                startCount: 0,
                endCount: 0
            };

            for (const i in devCusType) {
                if (devCusType[i].name == devicesInput.type) {
                    objVal.used = true;
                    objVal.startVal = devCusType[i].startVal;
                    objVal.endVal = devCusType[i].endVal;
                    objVal.startCount = devCusType[i].startCount;
                    objVal.endCount = devCusType[i].endCount;
                };
            };

            if (objVal.used == false) {
                for (const i in devDefType) {
                    if (devDefType[i].name == devicesInput.type) {
                        objVal.startVal = devDefType[i].startVal
                        objVal.endVal = devDefType[i].endVal
                        objVal.startCount = devDefType[i].startCount
                        objVal.endCount = devDefType[i].endCount
                    };
                };
            };
            this.log.debug(`RETURN ${JSON.stringify(objVal)}`);
            this.log.debug(`OBJ IN CONSTRUCTOR: ${JSON.stringify(devicesInput)}`);

            const device = new classDevice(devicesInput,
                arrDP.statusDevice.path,
                arrDP.consumpLive.path,
                arrDP.runtime.path,
                arrDP.runtimeMS.path,
                arrDP.lastRuntime.path,
                arrDP.runtimeMax.path,
                arrDP.alertRuntime.path,
                arrDP.lastOperations.path,
                arrDP.messageDP.path,
                autoOffDP,
                arrDP.averageConsumption.path,
                arrDP.doNotDisturb.path,
                objVal);

            this.log.debug(`RETURN ${JSON.stringify(device)}`);
            this.log.info(`Device ${JSON.stringify(device.name)} was successfully created`)
            return device;
        } catch (error) {
            this.log.error(`[ERROR] {funcCreateObject}: "${error}"`);
        };
    };

    /**
    * @param {string} id
    */
    async onStateChange(id, state) {

        this.log.debug(`[ID] ${JSON.stringify(id)}`);
        this.log.debug(`[PATH] ${JSON.stringify(state)}`)
        this.log.debug(`[THIS.TRIGGER 482] ${JSON.stringify(this.trigger)}`)

        try {
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
        } catch (error) {
            this.log.error(`[onStateChange] <${JSON.stringify(this.trigger[id])}>`);
            this.log.error(`[onStateChange] <${error}>`);
        };
    };

    /**
    * @param {string} id
    */
    async getValues(id) {
        this.log.debug(JSON.stringify(id))
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
            case true: {
                // standby Berechnung starten
                await this.calcStart(id, "standby");  // standby Berechnung
                // endwert Berechnung durchfuehren
                await this.calcStart(id, "end"); // Endwert Berechnung
                device.arrStart = [];
                this.log.debug(`[${JSON.stringify(device.name)}]: arrStart gelöscht`);
                break;
            };
            case false: {
                if (this.values[id].consumption.val < device.startValue) {
                    // Startabbruch -> array leeren
                    device.arrStart = [];
                    this.log.debug(`[${JSON.stringify(device.name)}]: arrStart gelöscht`);
                    // standby Berechnung durchfuehren
                    await this.calcStart(id, "standby");  // standby Berechnung
                } else {
                    // Startphase -> Startwertberechnung
                    await this.calcStart(id, "start");  // Startwert Berechnung
                    // standby Berechnung löschen
                    this.setStatus(id, 4);
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

        const val = 0.2;

        if (device.abort) {  // Abbrucherkennung aktiviert?
            if (device.started) {
                if (device.resultStandby <= val && device.arrStandby.length >= device.valCancel) { // consumption kleiner Vorgabe, Gerät wurde von Hand ausgeschaltet und war in Betrieb
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

            if (device.startMessage && !device.startMessageSent) { // Start Benachrichtigung aktiv?
                this.log.debug(`[${JSON.stringify(device.name)}]: GESTARTET`);
                if (device.timeoutMsg != null) {
                    clearTimeout(device.timeoutMsg);
                    device.timeoutMsg = null;
                };
                if (!value.dnd.val) {
                    await this.setVolume(id, true, "alexa");
                    await this.setVolume(id, true, "sayit");
                };
                device.timeoutMsg = setTimeout(async () => {  //timeout starten
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

            const objJSON = {
                startVal: `${device.startTimeJSON}`,
                end: `${device.endtimeJSON}`,
                runtime: `${device.runtimeJSON}`,
            };

            device.dateJSON.push(JSON.stringify(objJSON));

            if (device.dateJSON.length >= 10) {
                device.arrStandby.shift();
            };

            this.setStateAsync(device.lastOperations, device.dateJSON, true);

            this.setStateAsync(device.lastRuntime, device.runtimeJSON, true);
            this.setStateAsync(device.alertRuntime, false, true);

            // standby oder off?
            if (device.resultEnd <= 1) {
                this.setStatus(id, 0);
            } else {
                this.setStatus(id, 2);
            };

            // autoOff active?
            await this.autoOff(id);

            device.endTime = Date.now(); // ende Zeit loggen
            device.arrStart = []; // array wieder leeren
            device.arrEnd = []; // array wieder leeren

            if (device.endMessage && !device.endMessageSent && device.startMessageSent) {  // Ende Benachrichtigung aktiv?
                if (device.timeoutMsg != null) {
                    clearTimeout(device.timeoutMsg);
                    device.timeoutMsg = null;
                };
                if (!value.dnd.val) {
                    await this.setVolume(id, true, "alexa");
                    await this.setVolume(id, true, "sayit");
                };
                device.timeoutMsg = setTimeout(async () => {  //timeout starten
                    this.message(id, "end"); // send message
                    if (!value.dnd.val) {
                        await this.setVolume(id, false, "alexa");
                        await this.setVolume(id, false, "sayit");
                    };
                    this.log.debug(`[${JSON.stringify(device.name)}]: Endmessage: ${device.endMessageText}`);
                }, 1000);
            };

            device.endMessageSent = true;
            device.startMessageSent = false;
        };

        // device nicht in Betrieb
        // device nicht in Startphase
        if (!device.started) {
            if (device.resultStandby < 1 && device.arrStandby.length >= device.valCancel) {
                this.setStatus(id, 0);
            } else if (device.resultStandby >= 1 && device.arrStandby.length >= device.valCancel) {
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
                device.timeout = setTimeout(async () => {  //timeout starten
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
            case 0: {
                this.setStateAsync(device.pathStatus, stateOff, true); // setState "off" in DP
                this.log.debug(`[${JSON.stringify(device.name)}]: ${stateOff} (finished/off)`);
                break;
            };
            case 1: {
                this.setStateAsync(device.pathStatus, stateAction, true); // setState "action" in DP
                this.log.debug(`[${JSON.stringify(device.name)}]: ${stateAction} (in action)`);
                break;
            };
            case 2: {
                this.setStateAsync(device.pathStatus, stateStandby, true); // setState "standby" in DP
                this.log.debug(`[${JSON.stringify(device.name)}]: ${stateStandby} (in standby)`);
                break;
            };
            case 3: {
                if (device.autoOff && device.switchPower != null) {
                    if (this.values[id].switch.val) {
                        await this.setCheckedState(device.switchPower, false);
                    };
                };
                this.setStatus(id, 0);
                break;
            };
            case 4: {
                this.setStateAsync(device.pathStatus, `initialize`, true); // setState in DP
                this.log.debug(`[${JSON.stringify(device.name)}]: initialize`);
                break;
            };
            default: {
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
            case "start": {
                device.arrStart.push(value);
                device.resultStart = await this.calculation(device.resultStart, device.arrStart);
                this.log.debug(`[${JSON.stringify(device.name)}]: resultTemp start: ${device.resultStart}`);
                this.log.debug(`[${JSON.stringify(device.name)}]: Länge array start: ${device.arrStart.length}, Inhalt: [${device.arrStart}]`);
                this.setStateAsync(device.averageConsumption, device.resultStart, true);
                break;
            };
            case "end": {
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
            case "standby": {
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
            default: {
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
            const runtime = value.runtimeMax.val * 60 * 1000;
            if (timeMs >= runtime) {
                if (!device.alert) {
                    this.message(id, "alert");
                    this.setStateAsync(device.alertRuntime, true, true);
                    device.alert = true;
                    if (device.timeoutAlert != null) {
                        clearTimeout(device.timeout);
                        device.timeoutAlert = null;
                    };
                    device.timeoutAlert = setTimeout(() => {  //alert reset
                        device.alert = false;
                    }, parseInt(alert.freq_Alert_in_min * 60 * 1000));
                };
            } else {
                if (device.timeoutAlert != null) {
                    clearTimeout(device.timeout);
                    device.timeoutAlert = null;
                };
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

        const sendMsg = async (id, msg) => {
            // trigger dp
            this.setStateAsync(device.messageDP, msg, true);
            // send telegram
            try {
                if (device.telegram && this.telegramInput != undefined) {
                    for (const i in device.telegramUser) {
                        let user = ``;
                        let strTele = ``;
                        user = this.telegramInput[device.telegramUser[i]].name;
                        strTele = `telegram${this.telegramInput[device.telegramUser[i]].inst}`;
                        this.log.debug(`[${JSON.stringify(device.name)}]: telegram message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        this.sendTo(strTele, `send`, {
                            text: msg,
                            user: user
                        });
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: TELEGRAM}: "${error}"`);
            };

            // send whatsapp
            try {
                if (device.whatsapp && this.whatsappInput != undefined) {
                    for (const i in device.whatsappID) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: whatsapp message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        await this.setCheckedState(this.whatsappInput[device.whatsappID[i]].path, msg);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: WHATSAPP}: "${error}"`);
            };

            // send alexa
            try {
                if (device.alexa && !value.dnd.val && this.alexaInput != undefined) {
                    for (const i in device.alexaID) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: Alexa message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        await this.sendMsgSpeaker(id, this.alexaInput[device.alexaID[i]], time, msg);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: ALEXA}: "${error}"`);
            };

            // send sayit
            try {
                if (device.sayIt && !value.dnd.val && this.sayitInput != undefined) {  //sayit 
                    for (const i in device.sayItID) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: sayIt message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        await this.sendMsgSpeaker(id, this.sayitInput[device.sayItID[i]], time, msg);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: SAYIT}: "${error}"`);
            };

            // send pushover
            try {
                if (device.pushover && this.pushoverInput != undefined) { // pushover nachricht versenden
                    for (const i in device.pushoverID) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: pushover message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        const strPush = `pushover${this.pushoverInput[device.pushoverID[i]].inst}`;
                        let objTemp = {
                            message: msg,
                            sound: this.pushoverInput[device.pushoverID[i]].sound,
                            priority: this.pushoverInput[device.pushoverID[i]].prio
                        };

                        if (this.pushoverInput[device.pushoverID[i]].prio == undefined) {
                            delete objTemp.priority;
                        };
                        this.log.debug(`[${JSON.stringify(device.name)}]: PUSHOVER OBJECT SENDTO: ${JSON.stringify(objTemp)}`);
                        this.sendTo(strPush, "send", objTemp);
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: PUSHOVER}: "${error}"`);
            };

            // send email
            try {
                if (device.email && this.emailInput != undefined) { // email nachricht versenden
                    for (const i in device.emailID) {
                        this.log.debug(`[${JSON.stringify(device.name)}]: email message wird ausgefuehrt! Msg: ${JSON.stringify(msg)}`);
                        this.sendTo("email", "send", {
                            text: msg,
                            to: this.emailInput[device.emailID[i]].emailTo,
                            subject: msg,
                            from: this.emailInput[device.emailID[i]].emailFrom
                        });
                    };
                };
            } catch (error) {
                this.log.error(`[ERROR] {sendMsg: EMAIL}: "${error}"`);
            };
            // this.log.debug(`bufferArr: ${JSON.stringify(bufferArr)}`)
        };

        switch (type) {
            case "start":
                msg = await this.createObjMsg(device.startMessageText);
                this.log.debug(`[${JSON.stringify(device.name)}]: startmessage: ${JSON.stringify(device.startMessageText)}`);
                sendMsg(id, msg);
                break;
            case "end":
                msg = await this.createObjMsg(device.endMessageText);
                this.log.debug(`[${JSON.stringify(device.name)}]: endmessage: ${JSON.stringify(device.endMessageText)}`);
                sendMsg(id, msg);
                if (!bPresence) {
                    const objTemp = { obj: device, msg: msg }
                    bufferArr.push(objTemp);
                    this.log.debug(`[${device.name}] added in bufferArr`);
                };
                break;
            case 'alert':
                msg = `[${device.name}]: ${alert.text_alert}`;
                this.log.debug(`[${JSON.stringify(device.name)}]: message 'alert': ${JSON.stringify(msg)}`);
                sendMsg(id, msg);
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
            await this.setCheckedState(input.path, msg);
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
            case "alexa": {
                if (device.alexa) {
                    for (const i in device.alexaID) {
                        const strVol = '.speak-volume';
                        await this.volume(this.alexaInput[device.alexaID[i]], action, strVol)
                    };
                };
                break;
            };
            case "sayit": {
                if (device.sayIt) {
                    for (const i in device.sayItID) {
                        const strVol = '.volume';
                        await this.volume(this.sayitInput[device.sayItID[i]], action, strVol)
                    };
                };
                break;
            };
            default: {
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
        let pathOld = ``;
        let pathNew = ``;
        let length = 0;
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
                    obj.volOld = val.val;
                } else {
                    obj.volOld = null
                };
                await this.setCheckedState(pathNew, obj.volume);

            } else {
                if (obj.timeout != null) {
                    clearTimeout(obj.timeout);
                    obj.timeout = null;
                };
                if (obj.volOld !== null) {
                    obj.timeout = setTimeout(async () => {  //timeout starten
                        await this.setCheckedState(pathNew, obj.volOld);
                    }, 2000);
                };
            };
        };
    };

    /**
    * @param {string} objMsg
    */
    async createObjMsg(objMsg) {
        let msgTemp = ``;
        let length = 0;
        let lengthTotal = 0;
        length = (objMsg.lastIndexOf(".") + 1);
        lengthTotal = objMsg.length;
        if (objMsg != `` && objMsg != undefined) {
            // message != undefined
            if (length < lengthTotal) {
                // last digit is a dot TRUE
                if (await this.getForeignObjectAsync(objMsg) != null) {
                    // msg from DP TRUE
                    const result = await this.getCheckedState('foreign', objMsg, `[ERROR] Object Message not found`);;
                    msgTemp = result.val;
                } else {
                    // msg from DP false
                    msgTemp = objMsg;
                }
            } else {
                // last digit is a dot FALSE
                msgTemp = objMsg;
            };
        } return msgTemp;
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
            return val;
        } catch (error) {
            this.log.error(`[getCheckedState]: ${error}`)
            return val;
        };
    };

    /**
    * @param {string} path
    * @param {any} state
    */
    // set foreign state
    async setCheckedState(path, state) {
        try {
            this.setForeignStateAsync(path, state);
        } catch (error) {
            this.log.error(`[setCheckedState]: ${error}`)
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
                this.delTimeout(this.devicesCompleted[i].timeoutAlert, i);
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
        try {
            this.log.debug(`Data from configuration received : ${JSON.stringify(obj)}`);

            const counter = await obj.message;
            this.log.debug(`COUNTER ON MESSAGE: ${JSON.stringify(counter)}`);

            const name = obj.command.cmd;
            let objMessenger = {};

            if (name == 'telegram') {
                objMessenger = { name: name, path: 'communicate.users' };
            };
            if (name == 'whatsapp-cmb') {
                objMessenger = { name: name, path: 'sendMessage' };
            };

            if (name == 'telegram' || name == 'whatsapp-cmb') {
                await this.getInstance(obj, objMessenger.name, objMessenger.path, counter);
            } else {
                await this.ctrlInput(obj, obj.command, obj.message);
            };
        } catch (error) {
            this.log.error(`[ERROR] {onMessage}: "${error}"`);
        };
    };

    async ctrlInput(obj, cmd, array) {
        let checked = [];
        let failed = [];

        for (const i in array) {
            array[i].check = 'open';
        };

        switch (cmd.cmd) {
            case 'val': {
                for (let val = cmd.cntr; val > 0; val--) {
                    for (const i in array) {
                        if (array[i][cmd[val]] != undefined && array[i][cmd[val]] != `` && array[i].check == 'open') {
                            if (cmd[val] != 'name' && array[i][cmd[val]] != undefined && array[i][cmd[val]] != ``) {
                                if (!await this.getForeignObjectAsync(array[i][cmd[val]])) array[i].check = 'err';
                            };
                        } else if (cmd[val] !== 'switch') array[i].check = 'err';
                        if (array[i].check == 'open' && val == 1) {
                            checked.push({ name: array[i]['name'], id: array[i].id });
                        } else if (array[i].check == 'err' && val == 1) failed.push(array[i]['name']);
                    };
                };
                break;
            };
            case 'type': {
                for (let val = cmd.cntr; val > 0; val--) {
                    for (const i in array) {
                        if (array[i][cmd[val]] == undefined || array[i][cmd[val]] == `` && array[i].check == 'open') array[i].check = 'err';
                        if (array[i].check == 'open' && val == 1) {
                            checked.push({ name: array[i]['name'], id: array[i].id });
                        } else if (array[i].check == 'err' && val == 1) failed.push(array[i]['name']);
                    };
                };
                break;
            };
            case 'email': {
                for (let val = cmd.cntr; val > 0; val--) {
                    for (const i in array) {
                        const email = array[i][cmd[val]];
                        // E-Mail-Adresse prüfen
                        if (cmd[val] !== 'name') {
                            if (!(await this.validateEmail(email)) && array[i].check == 'open') array[i].check = 'err';
                        } else if (array[i][cmd[val]] == undefined || array[i][cmd[val]] == `` && array[i].check == 'open') array[i].check = 'err';
                        if (array[i].check == 'open' && val == 1) {
                            checked.push({ name: array[i]['name'], id: array[i].id });
                        } else if (array[i].check == 'err' && val == 1) failed.push(array[i]['name']);
                    };
                };
                break;
            };
        };

        const result = {
            checked: checked,
            failed: failed
        };

        await this.respond(obj, result, this)
    };

    async getInstance(obj, val1, val2, counter) {
        this.log.debug('this.getInstance wird ausgefuehrt')
        let arrInstance = [];
        const a = await this.getObjectViewAsync('system', 'instance', { startkey: 'system.adapter.', endkey: 'system.adapter.\u9999' }, async (err, state) => {
            try {
                if (err) {
                    this.log.error(err);
                };
                let result = [];
                let inst = ``;
                state.rows.forEach(async (element) => {
                    result.push(element.id);
                });
                result.forEach(async (element) => {
                    for (let i = 0; i < 10; i++) {
                        if (element === `system.adapter.${val1}.${i}`) {
                            inst = `${i}`;
                            let arr = { name: `${val1}.${i}.${val2}`, inst: inst };
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
                        arrTemp.push({ name: strTemp, id: counter, nameFinal: objTemp[j].firstName, inst: `.${arr[i].inst}` });
                        counter++;
                    };
                    if (objTemp[j].userName != undefined && objTemp[j].userName !== "") {
                        strTemp = `[${arr[i].inst}]${objTemp[j].userName}`;
                        arrTemp.push({ name: strTemp, id: counter, nameFinal: objTemp[j].userName, inst: `.${arr[i].inst}` });
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
                arrTemp.push({ name: `[${arr[i].inst}]cmb`, nameFinal: `[${arr[i].inst}]cmb`, id: counter, inst: `.${arr[i].inst}` });
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