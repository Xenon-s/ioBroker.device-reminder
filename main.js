// @ts-nocheck
`use strict`;

/*
 * Created with @iobroker/create-adapter v1.29.0
 */

/*
- wenn maschine vorher abgeschaltet wird, berechnung abbrechen
*/

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require(`@iobroker/adapter-core`);
const { create } = require("domain");

let objectInput = [];
let alexaInput = [];
let sayitInput = [];
let whatsappInput = [];
let telegramInput = [];

let stateAction = ``;
let stateStandby = ``;
let stateOff = ``;

const arrObj = {};
const arrDevices = [];

let status = -1;

let intervall = null;
let id = ``;

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
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        objectInput = await this.config.devicesFinal; // load objects
        alexaInput = await this.config.alexaFinal;
        sayitInput = await this.config.sayitFinal;
        whatsappInput = await this.config.whatsappFinal;
        telegramInput = await this.config.telegramFinal;

        stateAction = await this.config.valStates[0].stateAction;
        if (stateAction === ``) {
            stateAction = `in action`;
        };
        stateStandby = await this.config.valStates[0].stateStandby;
        if (stateStandby === ``) {
            stateStandby = `standby`;
        };
        stateOff = await this.config.valStates[0].stateOff;
        if (stateOff === ``) {
            stateOff = `switched off`;
        };

        this.log.debug(`ARR INPUT devices ${JSON.stringify(objectInput)}`);
        this.log.debug(`ARR INPUT alexa ${JSON.stringify(alexaInput)}`);
        this.log.debug(`ARR INPUT sayit ${JSON.stringify(sayitInput)}`);
        this.log.debug(`ARR INPUT whatsapp ${JSON.stringify(whatsappInput)}`);
        this.log.debug(`ARR INPUT telegram ${JSON.stringify(telegramInput)}`);

        // Input auf Plausibilität prüfen
        if (objectInput !== "") {

            // if (objectInput != "" && objectInput != undefined) {
            //     objectInput = await this.checkInput(objectInput, "devices");
            // };
            // if (alexaInput != "" && alexaInput != undefined) {
            //     alexaInput = await this.checkInput(alexaInput, "alexa");
            // };
            // if (sayitInput != "" && sayitInput != undefined) {
            //     sayitInput = await this.checkInput(sayitInput, "sayit");
            // };
            // if (whatsappInput != "" && whatsappInput != undefined) {
            //     whatsappInput = await this.checkInput(whatsappInput, "whatsapp");
            // };

            for (const i in objectInput) {
                this.log.debug(`element for each ${JSON.stringify(objectInput[i])}`)
                id = objectInput[i].pathConsumption
                const obj = objectInput[i];
                this.log.debug(`obj in constructor "${JSON.stringify(obj)}"`);
                arrObj[id] = await this.funcCreateObject(obj);
                await this.stateIni(arrObj);
                this.log.debug(`objFinal ${JSON.stringify(arrObj)}`);
                this.subscribeStates(arrObj[id].doNotDisturb);
                // this.log.debug(`subscribe ${JSON.stringify(id)}`);
            };

        } else {
            this.log.error(`No devices were created. Please create a device!`);
        };

        // start cyclical status request
        if (intervall != null) {
            clearInterval(intervall);
            intervall = null;
        };
        intervall = setInterval(async () => {
            for (const i in arrObj) {
                this.log.debug(JSON.stringify(arrObj[i].currentConsumption));
                this.getValues(arrObj[i].currentConsumption);
            };
        }, 10000);
    };



    async stateIni(obj) {
        for (const i in obj) {
            await this.setStateAsync(obj[i].pathStatus, `initialize`, true);
            await this.setStateAsync(obj[i].pathLiveConsumption, 0, true);
            await this.setStateAsync(obj[i].timeTotal, `00:00:00`, true);
            await this.setStateAsync(obj[i].timeTotalMs, 0, true);
            await this.setStateAsync(obj[i].messageDP, ``, true);
            await this.setStateAsync(obj[i].averageConsumption, 0, true);
            await this.setStateAsync(obj[i].doNotDisturb, await this.getStateAsync(obj[i].doNotDisturb));
            await this.setStateAsync(obj[i].autoOffDP, obj[i].autoOff, true);
        };
    };

    async funcCreateObject(obj) {
        let objTemp = {};

        //Klasse erstellen
        class Geraet {
            /**
             * @param {number} startValue
             * @param {number} endValue
             * @param {number} startCount
             * @param {number} endCount
             * @param {string | string} statusDevice
             * @param {string | number} consumpLive
             * @param {string | number} averageConsumption
             * @param {string | number} runtime
             * @param {string | string} messageDP
             */
            constructor(obj, statusDevice, consumpLive, runtime, runtimeMS, messageDP, autoOffDP, averageConsumption, doNotDisturb, objVal) {
                // Attribute
                // Vorgaben
                // DPs
                this.deviceName = obj.name;
                this.deviceType = obj.type;
                this.currentConsumption = obj.pathConsumption;
                this.switchPower = obj.pathSwitch;
                // script intern
                this.pathStatus = statusDevice;
                this.pathLiveConsumption = consumpLive;
                this.timeTotal = runtime;
                this.timeTotalMs = runtimeMS;
                this.messageDP = messageDP;
                this.averageConsumption = averageConsumption;
                this.doNotDisturb = doNotDisturb;
                this.dnd = false;
                this.autoOffDP = autoOffDP;
                // boolean
                this.startMessageSent = false;
                this.endMessageSent = false;
                this.started = false;
                this.abort = obj.abort;
                // boolean Benutzervorgaben
                this.autoOff = obj.autoOff;
                // number
                this.verbrauch = 0;
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
                this.startZeit = 0;
                this.endZeit = 0;
                // array
                this.arrStart = [];
                this.arrEnd = [];
                this.arrStandby = [];

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

            };
        };

        // Objekte erstellen
        //DPs erstellen
        const statusDevice = (`${obj.name}.Status`);
        const consumpLive = (`${obj.name}.live consumption`);
        const runtime = (`${obj.name}.runtime`);
        const runtimeMS = (`${obj.name}.runtime in ms`);
        const messageDP = (`${obj.name}.messageDP`);
        const autoOffDP = (`${obj.name}.config.auto Off`);
        const averageConsumption = (`${obj.name}.average consumption`);
        const doNotDisturb = (`${obj.name}.config.do not disturb`);

        //Only displaying data points
        await this.setObjectNotExistsAsync(statusDevice, {
            type: `state`,
            common: {
                name: `Status ${obj.name}`,
                type: `string`,
                role: `indicator`,
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(consumpLive, {
            type: `state`,
            common: {
                name: `live consumption ${obj.name}`,
                type: `number`,
                role: `indicator`,
                unit: `W`,
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(runtime, {
            type: `state`,
            common: {
                name: `runtime ${obj.name}`,
                type: `string`,
                role: `indicator`,
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(runtimeMS, {
            type: `state`,
            common: {
                name: `runtime in ms ${obj.name}`,
                type: `number`,
                role: `indicator`,
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(messageDP, {
            type: `state`,
            common: {
                name: `messageDP ${obj.name}`,
                type: `string`,
                role: `indicator`,
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(averageConsumption, {
            type: `state`,
            common: {
                name: `average consumption ${obj.name}`,
                type: `number`,
                role: `indicator`,
                unit: `W`,
                read: true,
                write: false,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync(doNotDisturb, {
            type: `state`,
            common: {
                name: `do not disturb ${obj.name}`,
                type: `boolean`,
                role: `indicator`,
                read: true,
                write: true,
            },
            native: {},
        });

        // device type ermitteln und Objekt bauen
        let devCusType;
        let devDefType;
        devCusType = await this.config.defaultTypeIDFinal;
        devDefType = await this.config.customTypeIDFinal;

        let objVal = {
            used: false,
            startVal: 0,
            endVal: 0,
            startCount: 0,
            endCount: 0
        };

        for (const i in devCusType) {
            if (devCusType[i].name == obj.type) {
                objVal.used = true;
                objVal.startVal = devCusType[i].startVal;
                objVal.endVal = devCusType[i].endVal;
                objVal.startCount = devCusType[i].startCount;
                objVal.endCount = devCusType[i].endCount;
            };
        };

        if (objVal.used == false) {
            for (const i in devDefType) {
                if (devDefType[i].name == obj.type) {
                    objVal.startVal = devDefType[i].startVal
                    objVal.endVal = devDefType[i].endVal
                    objVal.startCount = devDefType[i].startCount
                    objVal.endCount = devDefType[i].endCount
                };
            };
        };
        this.log.debug(`RETURN ${JSON.stringify(objVal)}`);

        const device = new Geraet(obj, statusDevice, consumpLive, runtime, runtimeMS, messageDP, autoOffDP, averageConsumption, doNotDisturb, objVal);
        objTemp = device;
        arrDevices.push(device);

        this.log.debug(`RETURN ${JSON.stringify(objTemp)}`);
        this.log.debug(`arrDevices ${JSON.stringify(arrDevices)}`);
        this.log.info(`Device ${JSON.stringify(objTemp.deviceName)} was successfully created`)

        return objTemp;
    };

    async onStateChange(id, state) {
        if ((state.val || !state.val) && !state.ack) {
            await this.setStateAsync(id, state.val, true); // Status in DP schreiben;
        };
    };

    /**
    * @param {string | number} id
    */
    async getValues(id) {
        this.log.debug(JSON.stringify(id));
        const obj = arrObj[id];
        const result = await this.getForeignStateAsync(obj.currentConsumption);
        obj.verbrauch = result.val;

        if (result.ack) {
            await this.evaluatingInputValue(obj);
            await this.evaluateStatus(obj);
        };
    }


    async evaluatingInputValue(obj) {

        this.log.debug(`Berechnung gestartet: ${obj.deviceName}`);
        this.log.debug(JSON.stringify(obj.telegramUser));

        switch (obj.started) {
            case true: {
                // standby Berechnung starten
                await this.calcStart(obj, "standby");  // standby Berechnung
                // endwert Berechnung durchfuehren
                await this.calcStart(obj, "end"); // Endwert Berechnung
                obj.arrStart = [];
                this.log.debug(`arrStart gelöscht`);
                break;
            };
            case false: {
                if (obj.verbrauch < obj.startValue) {
                    // Startabbruch -> array leeren
                    obj.arrStart = [];
                    this.log.debug(`arrStart gelöscht`);
                    // standby Berechnung durchfuehren
                    await this.calcStart(obj, "standby");  // standby Berechnung
                } else {
                    // Startphase -> Startwertberechnung
                    await this.calcStart(obj, "start");  // Startwert Berechnung
                    // standby Berechnung löschen
                    await this.setStatus(obj, 4);
                    obj.arrStandby = [];
                    this.log.debug(`arrStandby gelöscht`);
                };
                break;
            };
            default:
                break;
        };
        this.log.debug(`Berechnung beendet: ${obj.deviceName}`);
    };


    async evaluateStatus(obj) {
        this.log.debug(`Auswertung gestartet: ${obj.deviceName}`);

        obj.dnd = await this.getStateAsync(obj.doNotDisturb);
        obj.dnd = await obj.dnd.val;

        const val = 0.2;

        if (obj.abort) {  // Abbrucherkennung aktiviert?
            if (obj.started) {
                if (obj.resultStandby <= val && obj.arrStandby.length >= obj.valCancel) { // verbrauch kleiner Vorgabe, Gerät wurde von Hand ausgeschaltet und war in Betrieb
                    await this.setStatus(obj, 0);
                    await this.setStateAsync(obj.averageConsumption, obj.resultStandby, true);
                    // if (obj.endMessage && !obj.endMessageSent && obj.startMessageSent) {  // Ende Benachrichtigung aktiv?
                    //     if (obj.timeoutMsg != null) {
                    //         clearTimeout(obj.timeoutMsg);
                    //         obj.timeoutMsg = null;
                    //     };
                    //     if (!dnd) {
                    //         await this.setVolume(obj, true, "alexa");
                    //         await this.setVolume(obj, true, "sayit");
                    //         obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                    //             this.message(obj, "end");
                    //             await this.setVolume(obj, false, "alexa");
                    //             await this.setVolume(obj, false, "sayit");
                    //             this.log.debug(`${obj.endMessageText}`);
                    //         }, 1000);
                    //     };
                    // };

                    if (obj.autoOff) { // auto Off aktiviert?
                        await this.autoOff(obj);
                    };
                    obj.started = false;
                    obj.endMessageSent = false;
                    obj.startMessageSent = false;

                    // clear all arrays
                    obj.arrStart = [];
                    obj.arrEnd = [];
                    obj.arrStandby = [];
                };
                // } else {
                //     if (obj.arrStandby.length >= obj.valCancel) {
                //         if (obj.resultStandby <= val) {
                //             await this.setStatus(obj, 0);
                //         } else {
                //             await this.setStatus(obj, 2);
                //         };
                //     };
            };
        };

        // device nich in Betrieb
        // Ermittlung, ob device gestartet wurde
        this.log.debug(` WERTE für START${obj.verbrauch}; ${obj.startValue}; ${obj.started}`);
        if (obj.resultStart > obj.startValue && obj.resultStart != null && obj.arrStart.length >= obj.startCount && !obj.started) {
            // device wurde gestartet
            obj.started = true; // Vorgang started
            obj.startZeit = Date.now(); // Startzeit loggen
            await this.setStatus(obj, 1);
            this.log.debug(`Gerät gestartet, device läuft`);

            if (obj.startMessage && !obj.startMessageSent) { // Start Benachrichtigung aktiv?
                if (obj.timeoutMsg != null) {
                    clearTimeout(obj.timeoutMsg);
                    obj.timeoutMsg = null;
                };
                if (!obj.dnd) {
                    await this.setVolume(obj, true, "alexa");
                    await this.setVolume(obj, true, "sayit");
                };
                obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                    this.message(obj, "start");
                    if (!obj.dnd) {
                        await this.setVolume(obj, false, "alexa");
                        await this.setVolume(obj, false, "sayit");
                    };
                }, 1000);
            };

            obj.startMessageSent = true; // startMessage wurde versendet
            obj.endMessageSent = false; // Ende Benachrichtigung freigeben
        };

        // device in Betrieb
        // Ermittlung, ob device nocht laeuft
        this.log.debug(`in Betrieb? Name: ${JSON.stringify(obj.deviceName)} Ergebnis ENDE: ${JSON.stringify(obj.resultEnd)} Wert ENDE: ${JSON.stringify(obj.endValue)} started: ${JSON.stringify(obj.started)} Arraylength: ${JSON.stringify(obj.arrEnd.length)} Zaehler Arr Ende: ${JSON.stringify(obj.endCount)} `);
        if (obj.resultEnd > obj.endValue && obj.resultEnd != null && obj.started) { // Wert > endValue und Verbrauch lag 1x ueber startValue
            if (obj.timeout != null) {
                clearTimeout(obj.timeout);
                obj.timeout = null;
                this.log.debug(`timeout autoOff gelöscht`);
            };
            await this.setStatus(obj, 1);
            await this.time(obj);
        } else if (obj.resultEnd < obj.endValue && obj.resultEnd != null && obj.started && obj.arrEnd.length >= (obj.endCount * (2 / 3))) { // geraet muss mind. 1x ueber startValue gewesen sein, arrEnd muss voll sein und ergebis aus arrEnd unter endValue
            // Vorgang vom device beendet
            obj.started = false; // device started = false ;
            this.log.debug("Vorgang beendet, Gerät fertig");

            // standby oder off?
            if (obj.resultEnd <= 1) {
                await this.setStatus(obj, 0);
            } else {
                await this.setStatus(obj, 2);
            };

            // autoOff active?
            await this.autoOff(obj);

            obj.endZeit = Date.now(); // ende Zeit loggen
            obj.arrStart = []; // array wieder leeren
            obj.arrEnd = []; // array wieder leeren

            if (obj.endMessage && !obj.endMessageSent && obj.startMessageSent) {  // Ende Benachrichtigung aktiv?
                if (obj.timeoutMsg != null) {
                    clearTimeout(obj.timeoutMsg);
                    obj.timeoutMsg = null;
                };
                if (!obj.dnd) {
                    await this.setVolume(obj, true, "alexa");
                    await this.setVolume(obj, true, "sayit");
                };
                obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                    this.message(obj, "end");
                    if (!obj.dnd) {
                        await this.setVolume(obj, false, "alexa");
                        await this.setVolume(obj, false, "sayit");
                    };
                    this.log.debug(`${obj.endMessageText}`);
                }, 1000);
            };

            obj.endMessageSent = true;
            obj.startMessageSent = false;
        };

        // device nicht in Betrieb
        // device nicht in Startphase
        if (!obj.started) {
            if (obj.resultStandby < 1 && obj.arrStandby.length >= obj.valCancel) {
                await this.setStatus(obj, 0);
            } else if (obj.resultStandby >= 1 && obj.arrStandby.length >= obj.valCancel) {
                await this.setStatus(obj, 2);
            };
        };

        await this.setStateAsync(obj.pathLiveConsumption, `${obj.verbrauch}`, true);

        this.log.debug(`Auswertung beendet: ${obj.deviceName}`);
    };

    async autoOff(obj) {
        /* auto off*/
        if (obj.autoOff) { // auto Off aktiv, timeout aktiv 
            if (obj.timeout == null) {  // timeout <> null?
                obj.timeout = setTimeout(async () => {  //timeout starten
                    await this.setStatus(obj, 3);
                    if (obj.timeout != null) {
                        clearTimeout(obj.timeout);
                        obj.timeout = null;
                        this.log.debug(`autoOff fertig, timeout clear`);
                    };
                }, obj.timeoutInMS);
            };
        };
    };

    async setStatus(obj, status) {
        this.log.debug(`value status: ${status}`);
        switch (status) {
            case 0: {
                await this.setStateAsync(obj.pathStatus, stateOff, true); // Status in DP schreiben;
                break;
            };
            case 1: {
                await this.setStateAsync(obj.pathStatus, stateAction, true); // Status in DP schreiben
                break;
            };
            case 2: {
                await this.setStateAsync(obj.pathStatus, stateStandby, true); // Status in DP schreiben
                break;
            };
            case 3: {
                if (obj.autoOff && obj.switchPower != null) {
                    let result = await this.getForeignStateAsync(obj.switchPower);
                    result = result.val;
                    if (result) {
                        await this.setForeignStateAsync(obj.switchPower, false); // Geraet ausschalten, falls angewaehlt
                    };
                };
                await this.setStatus(obj, 0);
                break;
            };
            case 4: {
                await this.setStateAsync(obj.pathStatus, `initialize`, true); // Status in DP schreiben
                break;
            };
            default: {
                await this.setStateAsync(obj.pathStatus, `unknown status`, true); // Status in DP schreiben
                break;
            };
        };
    };

    async calcStart(obj, type) {
        this.log.debug(`berechnung "${type}" wird fuer ${obj.deviceName} ausgefuehrt`);
        switch (type) {
            case "start": {
                obj.arrStart.push(obj.verbrauch);
                obj.resultStart = await this.calculation(obj.resultStart, obj.arrStart);
                this.log.debug(`resultTemp start: ${obj.resultStart}`);
                this.log.debug(`Länge array start: ${obj.arrStart.length}, Inhalt: [${obj.arrStart}]`);
                await this.setStateAsync(obj.averageConsumption, obj.resultStart, true);
                break;
            };
            case "end": {
                obj.arrEnd.push(obj.verbrauch);
                obj.resultEnd = await this.calculation(obj.resultEnd, obj.arrEnd);
                this.log.debug(`Länge array ende: ${obj.arrEnd.length}, Inhalt: [${obj.arrEnd}]`);
                this.log.debug(`resultTemp end: ${obj.resultEnd}`);
                if (obj.arrEnd.length > obj.endCount) {
                    obj.arrEnd.shift();
                };
                await this.setStateAsync(obj.averageConsumption, obj.resultEnd, true);
                break;
            };
            case "standby": {
                obj.arrStandby.push(obj.verbrauch);
                obj.resultStandby = await this.calculation(obj.resultStandby, obj.arrStandby);
                this.log.debug(`Länge array standby: ${obj.arrStandby.length}, Inhalt: [${obj.arrStandby}]`);
                this.log.debug(`resultTemp standby: ${obj.resultStandby}`);
                if (obj.arrStandby.length > obj.valCancel) {
                    obj.arrStandby.shift();
                };
                await this.setStateAsync(obj.averageConsumption, obj.resultStandby, true);
                break;
            };
            default: {
                this.log.warn(`Calculation could not be completed. Input is wrong. Report this to the developer`);
                break;
            };
        };
    };

    async calculation(obj, arr) {
        let numb = 0;
        let resultTemp = 0;
        for (const counter in arr) {
            numb = parseFloat(arr[counter]);
            resultTemp = resultTemp + numb;
        };

        obj = ((resultTemp / arr.length) * 100);
        obj = Math.round(obj) / 100;

        return obj;
    };

    async time(obj) {
        //Laufzeit berechnen
        let diff = 0;
        let time = `00:00:00`;
        let timeMs = 0;
        const vergleichsZeit = Date.now();
        const startZeit = obj.startZeit;
        diff = (vergleichsZeit - startZeit);
        time = this.formatDate(Math.round(diff), `hh:mm:ss`);
        timeMs = diff;
        await this.setStateAsync(obj.timeTotalMs, timeMs, true); // Status in DP schreiben
        await this.setStateAsync(obj.timeTotal, time, true); // Status in DP schreiben
    };

    async message(obj, type) {
        this.log.debug(`message wird ausgefuehrt`);
        let msg = ``;
        const a = new Date();
        const aHours = a.getHours();
        const aMin = a.getMinutes();
        let time = `${aHours}:${aMin}`;
        time = await this.str2time(time);

        switch (type) {
            case "start": {
                msg = await this.createObjMsg(obj.startMessageText);
                break;
            };
            case "end": {
                msg = await this.createObjMsg(obj.endMessageText);
                break;
            };
        };

        if (obj.telegram) { // telegram nachricht versenden
            for (const i in obj.telegramUser) {
                let user = ``;
                let strTele = ``;
                user = telegramInput[obj.telegramUser[i]].name;
                strTele = `telegram${telegramInput[obj.telegramUser[i]].inst}`;
                this.log.debug(`telegram message wird ausgefuehrt`);
                this.sendTo(strTele, `send`, {
                    text: msg,
                    user: user
                });
            };
        };

        if (obj.whatsapp) { // WhatsApp nachricht versenden
            this.log.debug(`whatsapp message wird ausgefuehrt`);
            for (const i in obj.whatsappID) {
                await this.setForeignStateAsync(whatsappInput[obj.whatsappID[i]].path, msg);
            };
        };

        if (obj.alexa && !obj.dnd) {    // alexa quatschen lassen   
            this.log.debug(`Alexa message wird ausgefuehrt`);
            let timeMin = ``;
            let timeMax = ``;
            for (const i in obj.alexaID) {
                timeMin = await this.str2time(alexaInput[obj.alexaID[i]].timeMin);
                timeMax = await this.str2time(alexaInput[obj.alexaID[i]].timeMax);
                if (time >= timeMin && time < timeMax) {
                    await this.setForeignStateAsync(alexaInput[obj.alexaID[i]].path, msg);
                };
            };
        };

        if (obj.sayIt && !obj.dnd) {  //sayit 
            this.log.debug(`sayIt message wird ausgefuehrt`);
            let timeMin = ``;
            let timeMax = ``;
            for (const i in obj.sayItID) {
                timeMin = await this.str2time(sayitInput[obj.sayItID[i]].timeMin);
                timeMax = await this.str2time(sayitInput[obj.sayItID[i]].timeMax);
                if (time >= timeMin && time < timeMax) {
                    await this.setForeignStateAsync(sayitInput[obj.sayItID[i]].path, msg);
                };
            };
        };
        // trigger dp
        await this.setStateAsync(obj.messageDP, msg, true);
    };

    async setVolume(obj, action, type) {
        switch (type) {
            case "alexa": {
                if (obj.alexa) {
                    for (const i in obj.alexaID) {
                        const strVol = '.speak-volume';
                        await this.volume(alexaInput[obj.alexaID[i]], action, strVol)
                    };
                };
                break;
            };
            case "sayit": {
                if (obj.sayIt) {
                    for (const i in obj.sayItID) {
                        const strVol = '.volume';
                        await this.volume(sayitInput[obj.sayItID[i]], action, strVol)
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
                val = await this.getForeignStateAsync(pathNew);
                if (val !== null && val !== undefined) {
                    obj.volOld = val.val;
                } else {
                    obj.volOld = null
                };
                await this.setForeignStateAsync(pathNew, obj.volume);
            } else {
                if (obj.timeout != null) {
                    clearTimeout(obj.timeout);
                    obj.timeout = null;
                };
                if (obj.volOld !== null) {
                    obj.timeout = setTimeout(async () => {  //timeout starten
                        await this.setForeignStateAsync(pathNew, obj.volOld);
                    }, 2000);
                };
            };
        };
    };

    async createObjMsg(objMsg) {
        let msgTemp = ``;
        if (objMsg != `` && objMsg != undefined) {
            if (await this.getForeignObjectAsync(objMsg)) {
                const result = await this.getForeignStateAsync(objMsg);
                msgTemp = result.val;
            } else {
                msgTemp = objMsg;
            };
        } return msgTemp;
    };


    // send message DP
    async sendMsg(obj, msg) {
        await this.setForeignStateAsync(obj, msg);
    };

    async str2time(str) {
        return str.split(":")[0] * 100 + parseInt(str.split(":")[1], 10);
    };

    /**
    * Is called when adapter shuts down - callback has to be called under any circumstances!
    * @param {() => void} callback
    */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            for (const i in arrObj) {
                this.delTimeout(arrObj[i].timeout, i);
                this.delTimeout(arrObj[i].timeoutMsg, i);
                for (const i in alexaInput) {
                    this.delTimeout(alexaInput[obj.alexaID[i]].timeout, i);
                };
                for (const i in sayitInput) {
                    this.delTimeout(sayitInput[obj.sayItID[i]].timeout, i);
                };
            };
            if (intervall != null) {
                clearInterval(intervall);
                intervall = null;
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

        this.log.info(`Data from configuration received : ${JSON.stringify(obj.command)}`);

        // responds to the adapter that sent the original message
        function respond(response, that) {
            if (obj.callback)
                that.sendTo(obj.from, obj.command, response, obj.callback);
        };

        // const createResult = async () => {
        //     let arr = [];
        //     let arrError = [];
        //     for (const i in obj.message) {
        //         const result = await this.ctrlInput(obj.message[i], arr);

        //         this.log.warn(JSON.stringify(result));

        //         if (result.check === "success") {
        //             arr.push(result);
        //         } else {
        //             arrError.push(result);
        //         };
        //     };
        //     console.error(JSON.stringify(arr));
        //     return(arr);
        // };

        const array = await obj.message;
        const counter = await obj.message;

        let checked = [];
        let failed = [];
        switch (obj.command[0]) {
            case '1val': {
                this.log.warn('1VAL WIRD AUSGEFUEHRT');
                for (const i in array) {
                    if (array[i][obj.command[1]] != undefined && array[i][obj.command[1]] != ``) {
                        checked.push({ name: array[i][obj.command[1]], id: array[i].id });
                    } else {
                        failed.push({ name: array[i][obj.command[1]], id: array[i].id });
                    };
                };
                break;
            };
            case '2val': {
                this.log.warn('2VAL WIRD AUSGEFUEHRT');
                for (const i in array) {
                    if (array[i][obj.command[1]] != undefined && array[i][obj.command[1]] != `` && array[i][obj.command[2]] != undefined && array[i][obj.command[2]] != ``) {
                        if (await this.getForeignObjectAsync(array[i][obj.command[2]])) {
                            checked.push({ name: array[i][obj.command[1]], id: array[i].id });
                        } else {
                            failed.push({ name: array[i][obj.command[1]], id: array[i].id });
                        }
                    } else {
                        failed.push({ name: array[i][obj.command[1]], id: array[i].id });
                    };
                };
                break;
            };
            case '3val': {
                this.log.warn('3VAL WIRD AUSGEFUEHRT');
                for (const i in array) {
                    if (array[i][obj.command[1]] != undefined && array[i][obj.command[1]] != `` && array[i][obj.command[2]] != undefined && array[i][obj.command[2]] != ``) {
                        if (await this.getForeignObjectAsync(array[i][obj.command[2]])) {
                            if (array[i][obj.command[3]] != undefined && array[i][obj.command[3]] != ``) {
                                if (await this.getForeignObjectAsync(array[i][obj.command[3]])) {
                                    checked.push({ name: array[i][obj.command[1]], id: array[i].id });
                                } else {
                                    failed.push({ name: array[i][obj.command[1]], id: array[i].id });
                                }
                            } else {
                                checked.push({ name: array[i][obj.command[1]], id: array[i].id });
                            };
                        } else {
                            failed.push({ name: array[i][obj.command[1]], id: array[i].id });
                        }
                    } else {
                        failed.push({ name: array[i][obj.command[1]], id: array[i].id });
                    };
                };
                break;
            };
            case 'telegram': {  
                this.log.warn('TELEGRAM WIRD AUSGEFUEHRT');
                let arrTelegramUser = [];
                this.getObjectView('system', 'instance',
                    { startkey: 'system.adapter.', endkey: 'system.adapter.\u9999' }, (err, state) => {
                        if (err) {
                            console.error(err);
                        }
                        else {
                            let result = [];
                            let inst = ``;
                            state.rows.forEach(async (element) => {
                                result.push(element.id);
                            });
                            result.forEach(async (element) => {
                                for (let i = 0; i < 10; i++) {
                                    if (element === `system.adapter.telegram.${i}`) {
                                        inst = `${i}`;
                                        let arr = { name: `telegram.${i}.communicate.users`, inst: inst };
                                        arrTelegramUser.push(arr);
                                    };
                                };
                            });
                            let telegram_counter = 0;
                            telegram_counter = counter;
                            arrTelegramUser.forEach(async (element) => {
                                const state = await this.getForeignStateAsync(element.name);
                                if (state != undefined && state != null) {
                                    if (state != ``) {
                                        state.val = await JSON.parse(state.val);
                                        for (const i in state.val) {
                                            let strTemp = ``;
                                            this.log.warn(JSON.stringify(state.val[i].firstName));
                                            if (state.val[i].firstName != undefined && state.val[i].firstName !== "" && state.val[i].firstName != null) {
                                                strTemp = `[${element.inst}]${state.val[i].firstName}`;
                                                checked.push({ name: strTemp, id: telegram_counter, nameFinal: state.val[i].firstName, inst: `.${element.inst}` });
                                                telegram_counter++;
                                            };
                                            if (state.val[i].userName != undefined && state.val[i].userName !== "" && state.val[i].userName != null) {
                                                strTemp = `[${element.inst}]${state.val[i].userName}`;
                                                checked.push({ name: strTemp, id: telegram_counter, nameFinal: state.val[i].userName, inst: `.${element.inst}` });
                                                telegram_counter++;
                                            };
                                            this.log.warn(JSON.stringify(checked));
                                        };
                                    };
                                };
                            });
                        };
                    });
                break;
            }
            default: {

                break;
            };
        };

        const result = {
            checked: checked,
            failed: failed
        }
        this.log.info(JSON.stringify(result));
        respond(result, this);



        // function readUserTelegram(arr) {
        //     let firstName = [];
        //     arr.forEach(async (element) => {
        //         const state = await this.getForeignState(element);
        //         if (state != undefined && state != null) {
        //             if (state.val != ``) {
        //                 state.val.forEach(async (element) => {
        //                     let strTemp = ``;
        //                     if (element.firstName != undefined && element.firstName !== "" && element.firstName != null) {
        //                         strTemP = `[${arrTelegramUser[i].inst}]${element.firstName}`;
        //                         firstName.push({ name: strTemP, id: telegram_counter, nameFinal: element.firstName, inst: `.${arrTelegramUser[i].inst}` });
        //                         telegram_counter++;
        //                     };
        //                     if (element.userName != undefined && element.userName !== "" && element.userName != null) {
        //                         strTemP = `[${arrTelegramUser[i].inst}]${element.userName}`;
        //                         firstName.push({ name: strTemP, id: telegram_counter, nameFinal: element.userName, inst: `.${arrTelegramUser[i].inst}` });
        //                         telegram_counter++;
        //                     };
        //                 });
        //             };
        //         };
        //     });
        //     this.log.warn(`telegram User: ${firstName}`);
        // };

        // function readUserTelegram1(arrTelegramUser) {
        //     // telegram auswahl erstellen
        //     console.log(arrTelegramUser.length);
        //     firstName = [];
        //     for (const i in arrTelegramUser) {
        //         socket.emit('getState', arrTelegramUser[i].name, (err, state) => {
        //             if (state !== null || state !== undefined) {
        //                 if (state.val !== ``) {
        //                     $.each(JSON.parse(state.val), (index, element) => {
        //                         let strTemP = ``;
        //                         if (element.firstName != undefined && element.firstName !== "" && element.firstName != null) {
        //                             strTemP = `[${arrTelegramUser[i].inst}]${element.firstName}`;
        //                             firstName.push({ name: strTemP, id: telegram_counter, nameFinal: element.firstName, inst: `.${arrTelegramUser[i].inst}` });
        //                             telegram_counter++;
        //                         };
        //                         if (element.userName != undefined && element.userName !== "" && element.userName != null) {
        //                             strTemP = `[${arrTelegramUser[i].inst}]${element.userName}`;
        //                             firstName.push({ name: strTemP, id: telegram_counter, nameFinal: element.userName, inst: `.${arrTelegramUser[i].inst}` });
        //                             telegram_counter++;
        //                         };
        //                     });
        //                 };
        //             };
        //         });
        //     };
        //     console.log(firstName);
        // };



        // const test = await createResult();
        // respond(test, this);


        // respond(obj, this);




        // obj.message.forEach(element => {
        //     this.log.warn(JSON.stringify(element.name));
        // });
        // Disable check of const declaration in case function
        // eslint-disable-next-line no-case-declarations
        // const result = await this.readData(obj.message);
        // this.log.debug('Response from Read Data : ' + JSON.stringify(result));
        // if (result === 'success') {
        //     respond('success', this);
        //     // Add new device to array ensuring data polling at intervall time
        //     this.devices[obj.message] = 'xxx';
        // } else {
        // respond('failed', this);

    };

};


// async checkInput(val1, val2, name) {
//     let arrTemp;
//     if (!this.getForeignObjectAsync(val1)) {
//         if (!this.getForeignObjectAsync(val2)) {
//             arrTemp.push()
//         };
//     };
// };




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
