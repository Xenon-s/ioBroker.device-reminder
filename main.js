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

let objectInput = [];
let alexaInput = [];
let sayitInput = [];
let whatsappInput = [];

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
        // this.on(`stateChange`, this.onStateChange.bind(this));
        // this.on(`objectChange`, this.onObjectChange.bind(this));
        // this.on(`message`, this.onMessage.bind(this));
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


        // Input auf Plausibilität prüfen
        if (objectInput !== "") {

            if (objectInput != "" && objectInput != undefined) {
                objectInput = await this.checkInput(objectInput, "devices");
            };
            if (alexaInput != "" && alexaInput != undefined) {
                alexaInput = await this.checkInput(alexaInput, "alexa");
            };
            if (sayitInput != "" && sayitInput != undefined) {
                sayitInput = await this.checkInput(sayitInput, "sayit");
            };
            if (whatsappInput != "" && whatsappInput != undefined) {
                whatsappInput = await this.checkInput(whatsappInput, "whatsapp");
            };

            for (const i in objectInput) {
                this.log.debug(`element for each ${JSON.stringify(objectInput[i])}`)
                id = objectInput[i].pathConsumption
                const obj = objectInput[i];
                this.log.debug(`obj in constructor "${JSON.stringify(obj)}"`);
                arrObj[id] = await this.funcCreateObject(obj);
                await this.stateIni(arrObj);
                this.log.debug(`objFinal ${JSON.stringify(arrObj)}`);
                // this.subscribeForeignStates(id);
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
            }
        }, 10000);
    };

    async checkInput(obj, type) {
        let objTemp = obj;
        if (type === "alexa" || type === "sayit" || type === "whatsapp") {
            for (const i in objTemp) {
                if (! await this.getForeignObjectAsync(objTemp[i].path)) {
                    this.log.error(`${type} "${objTemp[i].name}": Path could not be found! Please check your entry! Device deleted`);
                    delete objTemp[i];
                };
                if (obj[i].volume === undefined) {
                    obj[i].volume = 50;
                }
                obj[i].timeout = null;
            };
        } else if (type === "devices") {
            for (const i in objTemp) {
                if (! await this.getForeignObjectAsync(objTemp[i].pathConsumption)) {
                    this.log.error(`${type} "${objTemp[i].name}": Path could not be found! Please check your entry! Device deleted`);
                    delete objTemp[i];
                } else {
                    if (objTemp[i].pathSwitch != "") {
                        if (! await this.getForeignObjectAsync(objTemp[i].pathSwitch)) {
                            this.log.error(`${type} "${objTemp[i].name}": Path could not be found! Please check your entry! Device deleted`);
                            delete objTemp[i];
                        };
                    } else {
                        objTemp[i].pathSwitch = null;
                    };
                };
            };
        } return objTemp;
    };

    async stateIni(obj) {
        for (const i in obj) {
            if (obj[i].switchPower !== undefined && obj[i].switchPower !== null && obj[i].switchPower !== ``) {
                const resultSwitch = await this.getForeignStateAsync(obj[i].switchPower);
                const objSwitch = resultSwitch.val;
                switch (objSwitch) {
                    case true: {
                        let consumpTmp = await this.getForeignStateAsync(obj[i].currentConsumption);
                        consumpTmp = consumpTmp.val;
                        if (consumpTmp <= 0.5) {
                            await this.setStateAsync(obj[i].pathStatus, stateOff, true);
                        } else {
                            await this.setStateAsync(obj[i].pathStatus, stateStandby, true);
                        };
                        break;
                    };
                    case false: {
                        await this.setStateAsync(obj[i].pathStatus, stateOff, true);
                        break;
                    };
                    default: {
                        await this.setStateAsync(obj[i].pathStatus, `unknown status`, true);
                        break;
                    };
                };
            };
            await this.setStateAsync(obj[i].pathLiveConsumption, 0, true);
            await this.setStateAsync(obj[i].timeTotal, `00:00:00`, true);
            await this.setStateAsync(obj[i].timeTotalMs, 0, true);
            await this.setStateAsync(obj[i].messageDP, ``, true);
            await this.setStateAsync(obj[i].averageConsumption, 0, true);
            await this.setStateAsync(obj[i].doNotDisturb, false, true);
            await this.setStateAsync(obj[i].autoOffDP, obj[i].autoOff, true);
        };
    };



    /**
     * @param {{enabled: boolean; deviceIdName: string; deviceType: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: array; idWhatsapp: string; idsayit: array; autoOff: boolean; timer: boolean; idTimer: number}} obj
     */
    async funcCreateObject(obj) {
        let objTemp = {};

        /**
         * @param {{enabled: boolean; deviceIdName: string; deviceType: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: array; idWhatsapp: string; idsayit: array; autoOff: boolean; timer: boolean; idTimer: number}} obj
         */
        //Klasse erstellen
        class Geraet {
            /**
             * @param {{enabled: boolean; deviceIdName: string; deviceType: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: array; idWhatsapp: string; idsayit: array; autoOff: boolean; timer: boolean; idTimer: number}} obj
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
                this.autoOffDP = autoOffDP;
                // boolean
                this.startMessageSent = false;
                this.endMessageSent = false;
                this.started = false;
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
                if (objVal.endCount >= 5 && objVal.endCount < 20) {
                    this.valCancel = objVal.endCount - 2;
                } else if (objVal.endCount > 20) {
                    this.valCancel = 20;
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
                    this.telegramUser = obj.telegram.toString();
                    this.telegram = true;
                } else {
                    this.telegram = false;
                };

                /*obj alexa erstellen*/

                if (obj.alexa.length >= 1) {
                    this.alexaID = obj.alexa;
                    this.alexaVolOld = 0;
                    this.alexa = true;
                } else {
                    this.alexa = false;
                };

                /*obj sayIt erstellen*/
                if (obj.sayit.length >= 1) {
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
        /**
         * @param {{ deviceName: string; deviceType: string; enabled: boolean; device.deviceIdName: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: string; idWhatsapp: string; idsayit: array; autoOff: boolean; }} obj
         */
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
        devCusType = this.config.defaultTypeIDFinal;
        devDefType = this.config.customTypeIDFinal;
        let objVal = {
            startVal: null,
            endVal: null,
            startCount: null,
            endCount: null
        };

        for (const i in devCusType) {
            if (devCusType[i].name == obj.type) {
                objVal.startVal = devCusType[i].startVal
                objVal.endVal = devCusType[i].endVal
                objVal.startCount = devCusType[i].startCount
                objVal.endCount = devCusType[i].endCount
            };
        };

        if (objVal.startVal == null) {
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


    // /**
    //  * @param {string | number} id
    //  */
    // async onStateChange(id) {

    //     const obj = arrObj[id];
    //     const result = await this.getForeignStateAsync(obj.currentConsumption);
    //     obj.verbrauch = result.val;

    //     if (result.ack) {
    //         await this.evaluatingInputValue(obj);
    //         await this.evaluateStatus(obj);
    //     };

    // };


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
                    await this.calcStart(obj, "standby");  // Startwert Berechnung
                } else {
                    // Startphase -> Startwertberechnung
                    await this.calcStart(obj, "start");  // Startwert Berechnung
                    // standby Berechnung löschen
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

        // confirm data point
        let dnd = await this.getStateAsync(obj.doNotDisturb);
        dnd = dnd.val;
        await this.setStateAsync(obj.doNotDisturb, dnd, true); // Status in DP schreiben;

        const val = 0.1;

        if (obj.started) {
            if (obj.resultStandby < val && obj.arrStandby.length >= obj.valCancel) { // verbrauch kleiner Vorgabe, Gerät wurde von Hand ausgeschaltet und war in Betrieb
                await this.setStatus(obj, 0);
                await this.setStateAsync(obj.averageConsumption, obj.resultStandby, true);
                if (obj.endMessage && !obj.endMessageSent && obj.startMessageSent) {  // Ende Benachrichtigung aktiv?
                    if (obj.timeoutMsg != null) {
                        clearTimeout(obj.timeoutMsg);
                        obj.timeoutMsg = null;
                    };
                    if (!dnd) {
                        await this.setVolume(obj, true, "alexa");
                        await this.setVolume(obj, true, "sayit");
                        obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                            this.message(obj, "end");
                            await this.setVolume(obj, false, "alexa");
                            await this.setVolume(obj, false, "sayit");
                            this.log.debug(`${obj.endMessageText}`);
                        }, 1000);
                    };
                };

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
        } else {
            if (obj.arrStandby.length >= obj.valCancel) {
                if (obj.resultStandby < (2 * val)) {
                    await this.setStatus(obj, 0);
                } else {
                    await this.setStatus(obj, 2);
                };
            };
        };


        // device wurde gestartet
        this.log.debug(` WERTE für START${obj.verbrauch}; ${obj.startValue}; ${obj.started}`);
        if (obj.resultStart > obj.startValue && obj.resultStart != null && obj.arrStart.length >= obj.startCount && obj.started == false) {
            obj.started = true; // Vorgang started
            obj.startZeit = Date.now(); // Startzeit loggen
            await this.setStatus(obj, 1);
            this.log.debug(`Gerät gestartet, device läuft`);

            if (obj.startMessage && !obj.startMessageSent) { // Start Benachrichtigung aktiv?
                if (obj.timeoutMsg != null) {
                    clearTimeout(obj.timeoutMsg);
                    obj.timeoutMsg = null;
                };

                if (!dnd) {
                    await this.setVolume(obj, true, "alexa");
                    await this.setVolume(obj, true, "sayit");
                    obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                        this.message(obj, "start");
                        await this.setVolume(obj, false, "alexa");
                        await this.setVolume(obj, false, "sayit");
                    }, 1000);
                };
            };

            obj.startMessageSent = true; // startMessage wurde versendet
            obj.endMessageSent = false; // Ende Benachrichtigung freigeben

        };

        // device läuft, Live Verbrauch berechnen
        if (obj.started) { // wurde geraet started?
            this.log.debug(`ENDWERTBERECHNUNG`);
        };
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
            obj.started = false; // vorgang beendet
            this.log.debug("Vorgang beendet, Gerät fertig");

            await this.setStatus(obj, 2);
            await this.autoOff(obj);

            obj.endZeit = Date.now(); // ende Zeit loggen
            obj.arrStart = []; // array wieder leeren
            obj.arrEnd = []; // array wieder leeren

            if (obj.endMessage && !obj.endMessageSent && obj.startMessageSent) {  // Ende Benachrichtigung aktiv?
                if (obj.timeoutMsg != null) {
                    clearTimeout(obj.timeoutMsg);
                    obj.timeoutMsg = null;
                };
                if (!dnd) {
                    await this.setVolume(obj, true, "alexa");
                    await this.setVolume(obj, true, "sayit");
                    obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                        this.message(obj, "end");
                        await this.setVolume(obj, false, "alexa");
                        await this.setVolume(obj, false, "sayit");
                        this.log.debug(`${obj.endMessageText}`);
                    }, 1000);
                };
            };

            obj.endMessageSent = true;
            obj.startMessageSent = false;
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
        } else {
            await this.setStatus(obj, 2); // kein auto Off aktiv
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
            this.log.debug(`telegram message wird ausgefuehrt`);
            this.sendTo(`telegram`, `send`, {
                text: msg,
                user: obj.telegramUser
            });
        };

        if (obj.whatsapp) { // WhatsApp nachricht versenden
            this.log.debug(`whatsapp message wird ausgefuehrt`);
            for (const i in obj.whatsappID) {
                await this.setForeignStateAsync(whatsappInput[obj.whatsappID[i]].path, msg);
            };
        };

        if (obj.alexa) {    // alexa quatschen lassen   
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

        if (obj.sayIt) {  //sayit 
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
                        this.volume(alexaInput[obj.alexaID[i]], action, strVol)
                    };
                };
                break;
            };
            case "sayit": {
                if (obj.sayIt) {
                    for (const i in obj.sayItID) {
                        const strVol = '.volume';
                        this.volume(sayitInput[obj.sayItID[i]], action, strVol)
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
