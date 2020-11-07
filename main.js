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

const arrObj = {};
const arrDevices = [];

// Load your modules here, e.g.:
// const fs = require(`fs`);

class Template extends utils.Adapter {

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
        //this.on(`objectChange`, this.onObjectChange.bind(this));
        // this.on(`message`, this.onMessage.bind(this));
        this.on(`unload`, this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        objectInput = this.config.devicesFinal; // load objects
        alexaInput = this.config.alexaFinal;
        sayitInput = this.config.sayitFinal;
        whatsappInput = this.config.whatsappFinal;

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
            if (sayitInput != "" && sayitInput.length != undefined) {
                sayitInput = await this.checkInput(sayitInput, "sayit");
            };
            if (whatsappInput != "" && whatsappInput != undefined) {
                whatsappInput = await this.checkInput(whatsappInput, "whatsapp");
            };

            for (const i in objectInput) {
                this.log.debug(`element for each ${JSON.stringify(objectInput[i])}`)
                const id = objectInput[i].pathConsumption;
                const obj = objectInput[i];
                this.log.debug(`obj in constructor "${JSON.stringify(obj)}"`);
                arrObj[id] = await this.funcCreateObject(obj);
                await this.stateIni(arrObj);
                this.log.debug(`objFinal ${JSON.stringify(arrObj)}`);
                this.subscribeForeignStates(id);
                this.log.debug(`subscribe ${JSON.stringify(id)}`);
            };

        } else {
            this.log.error(`No devices were created. Please create a device!`);
        };
    };

    async checkInput(obj, type) {
        let objTemp = obj;
        if (type === "alexa" || type === "sayit" || type === "whatsapp") {
            for (const i in objTemp) {
                if (! await this.getForeignObjectAsync(objTemp[i].path)) {
                    this.log.error(`${type} "${objTemp[i].name}": Path could not be found! Please check your entry! Device deleted`);
                    delete objTemp[i];
                };
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
                        await this.setStateAsync(obj[i].pathStatus, `standby`, true);
                        break;
                    };
                    case false: {
                        await this.setStateAsync(obj[i].pathStatus, `ausgeschaltet`, true);
                        break;
                    };
                    default: {
                        await this.setStateAsync(obj[i].pathStatus, `undefined`, true);
                        break;
                    };
                };
            };
            await this.setStateAsync(obj[i].pathLiveConsumption, 0, true);
            await this.setStateAsync(obj[i].timeTotal, `00:00:00`, true);
            await this.setStateAsync(obj[i].messageDP, ``, true);
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
             * @param {string | string} zustand
             * @param {string | number} verbrauchAktuell
             * @param {string | number} laufzeit
             * @param {string | string} messageDP
             */
            constructor(obj, zustand, verbrauchAktuell, laufzeit, messageDP, startValue, endValue, startCount, endCount) {
                // Attribute
                // Vorgaben
                // DPs
                this.deviceName = obj.name;
                this.deviceType = obj.type;
                this.currentConsumption = obj.pathConsumption;
                this.switchPower = obj.pathSwitch;
                // script intern
                this.pathStatus = zustand;
                this.pathLiveConsumption = verbrauchAktuell;
                this.timeTotal = laufzeit;
                this.messageDP = messageDP;
                // boolean
                this.startMessageSent = false;
                this.endMessageSent = false;
                this.started = false;
                // boolean Benutzervorgaben
                this.autoOff = obj.autoOff;
                // number
                this.verbrauch = null;
                this.resultStart = null;
                this.resultEnd = null;
                this.resultStandby = null;
                // Verbrauchswerte
                this.startValue = startValue;
                this.endValue = endValue;
                // Zaehler Abbruchbedingungen
                this.startCount = startCount;
                this.endCount = endCount;
                // timeout
                this.timeoutMsg = null;
                this.startZeit = 0;
                this.endZeit = 0;
                // array
                this.arrStart = [];
                this.arrAbbruch = [];
                this.arrStandby = [];

                // Methoden
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
                if (obj.timer != `` && obj.timer !== undefined && obj.timer != 0) {
                    this.timeoutInMS = (Math.floor(obj.timer) * 60 * 1000); // Umrechnung auf ms
                    if (this.timeoutInMS > 0) {
                        this.timer = true;
                    };
                } else {
                    this.timer = false;
                } this.timeout = null;

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
                    this.alexa = true;
                } else {
                    this.alexa = false;
                };

                /*obj sayIt erstellen*/
                if (obj.sayit.length >= 1) {
                    this.sayItID = obj.sayit;
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
        const zustand = (`${obj.name}.Zustand`);
        const verbrauchAktuell = (`${obj.name}.Verbrauch aktuell`);
        const laufzeit = (`${obj.name}.Laufzeit`);
        const messageDP = (`${obj.name}.messageDP`);

        await this.setObjectNotExistsAsync(zustand, {
            type: `state`,
            common: {
                name: `Zustand ${obj.name}`,
                type: `string`,
                role: `indicator`,
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(verbrauchAktuell, {
            type: `state`,
            common: {
                name: `Verbrauch aktuell ${obj.name}`,
                type: `number`,
                role: `indicator`,
                unit: `W`,
                read: true,
                write: false,
            },
            native: {},
        });
        await this.setObjectNotExistsAsync(laufzeit, {
            type: `state`,
            common: {
                name: `Laufzeit ${obj.name}`,
                type: `string`,
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

        // Objekt bauen (obj, ... , startVal, endVal, startCount, endCount)
        switch (obj.type) {
            case `Waschmaschine`: {
                const WaMa = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, messageDP, 30, 15, 5, 65);
                objTemp = WaMa;
                arrDevices.push(WaMa);
                break;
            };
            case `Trockner`: {
                const Trockner = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, messageDP, 120, 15, 5, 50);
                objTemp = Trockner;
                arrDevices.push(Trockner);
                break;
            };
            case `Geschirrspueler`: {
                const GS = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, messageDP, 15, 4, 2, 150);
                objTemp = GS;
                arrDevices.push(GS);
                break;
            };
            case `Computer`: {
                const Computer = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, messageDP, 20, 5, 2, 3);
                objTemp = Computer;
                arrDevices.push(Computer);
                break;
            };
            case `Wasserkocher`: {
                const WaKo = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, messageDP, 10, 5, 2, 2);
                objTemp = WaKo;
                arrDevices.push(WaKo);
                break;
            };
            case `Mikrowelle`: {
                const MW = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, messageDP, 50, 20, 2, 1);
                objTemp = MW;
                arrDevices.push(MW);
                break;
            };
            case `Test`: {
                const Test = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, messageDP, 1, 10, 2, 2);
                objTemp = Test;
                arrDevices.push(Test);
                break;
            };
            default:
                this.log.debug(`Device name was not recognized! Please report this to the developer!`);
                break;
        };

        this.log.debug(`RETURN ${JSON.stringify(objTemp)}`);
        this.log.info(`Gerät ${JSON.stringify(objTemp.deviceName)} wurde erfolgreich angelegt`)
        return objTemp;
    };

    /**
     * @param {string | number} id
     */
    onStateChange(id) {
        this.Evaluation(id);
    };

    /**
     * @param {string | number} id
     */
    async Evaluation(id) {
        const obj = arrObj[id];
        const result = await this.getForeignStateAsync(obj.currentConsumption);
        obj.verbrauch = result.val;
        let status;
        this.log.debug(`Verbrauchswert Live ${JSON.stringify(obj.verbrauch)} von ${JSON.stringify(obj.deviceName)}`);
        this.log.debug(`Wert Verbrauch START: ${JSON.stringify(obj.resultStart)}`);
        if (!obj.started) {    // device nicht gestartet, Zustand ermitteln wenn autoOff == false
            this.log.debug("ermittlung standby")
            await this.calcStandby(obj, 10);
            this.log.debug(`ergebnis standby: ${obj.resultStandby}, Länge array standby: ${obj.arrStandby.length}`);
            if (obj.resultStandby < 1 && obj.arrStandby.length >= 10) {
                await this.setStatus(obj, status = 0);
            };
        } else {
            obj.arrStandby = [];
        };
        if (obj.verbrauch > obj.startValue && obj.started == false) {
            obj.startZeit = Date.now(); // Startzeit loggen
            this.calcStart(obj); //Startwert berechnen und ueberpruefen
            if (obj.resultStart > obj.startValue && obj.resultStart != null && obj.arrStart.length >= obj.startCount && obj.started == false) {
                obj.started = true; // Vorgang started
                // await this.setStateAsync(obj.pathStatus, `started`, true); // Status in DP schreiben
                this.log.debug(`startMessage: ${obj.startMessage} startMessageSent ${obj.startMessageSent}`);
                if (obj.startMessage && !obj.startMessageSent) { // Start Benachrichtigung aktiv?
                    if (obj.timeoutMsg != null) {
                        clearTimeout(obj.timeoutMsg);
                        obj.timeoutMsg = null;
                    };
                    obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                        this.message(obj, "start");
                    }, 1000);
                };
                obj.startMessageSent = true; // startMessage wurde versendet
                obj.endMessageSent = false; // Ende Benachrichtigung freigeben
            } else if (obj.resultStart < obj.startValue && obj.resultStart != null && obj.arrStart.length >= obj.startCount && obj.started == false) {
                obj.started = false; // Vorgang started
                await this.setStatus(obj, status = 2);
            };
        } else if (obj.verbrauch < (obj.startCount / 2) && obj.arrStart.length != 0 && obj.started == false) { // Wert mind > obj.startCount/2 & arrStart nicht leer und nicht started, sonst `Abbruch`
            obj.arrStart = []; // array wieder leeren
            this.log.debug(`Startphase abgebrochen, array Start wieder geloescht`);
            await this.setStatus(obj, status = 0);
        };
        if (obj.started) { // wurde geraet started?
            await this.calcEnd(obj); // endeberechnung durchfuehren
        };
        this.log.debug(`in Betrieb? Name: ${JSON.stringify(obj.deviceName)} Ergebnis ENDE: ${JSON.stringify(obj.resultEnd)} Wert ENDE: ${JSON.stringify(obj.endValue)} started: ${JSON.stringify(obj.started)} Arraylength: ${JSON.stringify(obj.arrAbbruch.length)} Zaehler Arr Ende: ${JSON.stringify(obj.endCount)} `);
        if (obj.resultEnd > obj.endValue && obj.resultEnd != null && obj.started) { // Wert > endValue und Verbrauch lag 1x ueber startValue
            if (obj.timeout != null) {
                clearTimeout(obj.timeout);
                obj.timeout = null;
            };
            await this.setStatus(obj, status = 1);
            await this.time(obj);
        } else if (obj.resultEnd < obj.endValue && obj.resultEnd != null && obj.started && obj.arrAbbruch.length >= (obj.endCount / 2)) { // geraet muss mind. 1x ueber startValue gewesen sein, arrAbbruch muss voll sein und ergebis aus arrAbbruch unter endValue
            obj.started = false; // vorgang beendet
            /* auto off*/
            if (obj.autoOff && obj.timer > 0) {
                this.log.debug(`AUTO OFF TRUE`);
                if (obj.timer && obj.timeout == null) {
                    if (obj.timeout != null) {
                        clearTimeout(obj.timeout);
                        obj.timeout = null;
                    };
                    obj.timeout = setTimeout(async () => {  //timeout starten
                        await this.setStatus(obj, status = 0);
                    }, obj.timeoutInMS);
                } else {
                    this.log.debug(`auto off ohne timeout`);
                    await this.setStatus(obj, status = 0);
                };
            } else {
                this.log.debug(`gerät in standby`);
                await this.setStatus(obj, status = 2);
            };
            obj.endZeit = Date.now(); // ende Zeit loggen
            obj.arrStart = []; // array wieder leeren
            obj.arrAbbruch = []; // array wieder leeren
            if (obj.endMessage && !obj.endMessageSent && obj.startMessageSent) {  // Ende Benachrichtigung aktiv?
                if (obj.timeoutMsg != null) {
                    clearTimeout(obj.timeoutMsg);
                    obj.timeoutMsg = null;
                };
                obj.timeoutMsg = setTimeout(async () => {  //timeout starten
                    this.message(obj, "end");
                    this.log.debug(`${obj.endMessageText}`);
                }, 1000);
            };
            obj.endMessageSent = true;
            obj.startMessageSent = false;
        };
        await this.setStateAsync(obj.pathLiveConsumption, `${obj.verbrauch}`, true);
    };

    async setStatus(obj, status) {
        switch (status) {
            case 0: {
                if (obj.switchPower != "" && await this.getForeignStateAsync(obj.switchPower) && obj.autoOff) {
                    await this.setForeignStateAsync(obj.switchPower, false); // Geraet ausschalten, falls angewaehlt
                };
                await this.setStateAsync(obj.pathStatus, `ausgeschaltet`, true); // Status in DP schreiben;
                break;
            };
            case 1: {
                await this.setStateAsync(obj.pathStatus, `in Betrieb`, true); // Status in DP schreiben
                break;
            };
            case 2: {
                await this.setStateAsync(obj.pathStatus, `Standby`, true); // Status in DP schreiben
                break;
            };
            default:
                await this.setStateAsync(obj.pathStatus, `Initialisiere`, true); // Status in DP schreiben
                break;
        };
    };

    /**
     * **************************************************
     * *********** functions and calculations  ************
     * ***************************************************/

    async calcStart(obj) { // Calculate values operation `START`
        this.log.debug(`Startwertberechnung wird fuer ${JSON.stringify(obj.deviceName)} ausgefuehrt`);
        let zahl = 0;
        let ergebnisTemp = 0;
        obj.arrStart.push(obj.verbrauch);
        // Berechnung durchfuehren
        for (const counter in obj.arrStart) {
            zahl = parseFloat(obj.arrStart[counter]);
            ergebnisTemp = ergebnisTemp + zahl;
        };
        // Ergebnis an obj uebergeben
        obj.resultStart = Math.round((ergebnisTemp / parseFloat(obj.arrStart.length) * 10) / 10);
    };

    async calcEnd(obj) { // Calculate values operation `END`
        this.log.debug(`Endwertberechnung wird fuer ${JSON.stringify(obj.deviceName)} ausgefuehrt`);
        let zahl = 0;
        let ergebnisTemp = 0;
        obj.arrAbbruch.push(obj.verbrauch); //neuen Wert ins array schreiben
        // Berechnung durchfuehren
        for (const counter in obj.arrAbbruch) {
            zahl = parseFloat(obj.arrAbbruch[counter]);
            ergebnisTemp = ergebnisTemp + zahl;
        };
        // Ergebnis an obj uebergeben
        obj.resultEnd = Math.round((ergebnisTemp / parseFloat(obj.arrAbbruch.length) * 10) / 10);
        if (obj.arrAbbruch.length > obj.endCount) {
            obj.arrAbbruch.shift();
        };
    };

    async calcStandby(obj, valCount) { // Calculate values operation `END`
        this.log.debug(`Endwertberechnung wird fuer ${JSON.stringify(obj.deviceName)} ausgefuehrt`);
        let zahl = 0;
        let ergebnisTemp = 0;
        obj.arrStandby.push(obj.verbrauch); //neuen Wert ins array schreiben
        // Berechnung durchfuehren
        for (const counter in obj.arrStandby) {
            zahl = parseFloat(obj.arrStandby[counter]);
            ergebnisTemp = ergebnisTemp + zahl;
        };
        // Ergebnis an obj uebergeben
        obj.resultStandby = (ergebnisTemp / parseFloat(obj.arrStandby.length));
        if (obj.arrStandby.length > valCount) {
            obj.arrStandby.shift();
        };
    };

    async time(obj) {
        //Laufzeit berechnen
        let diff = 0;
        let time = `00:00:00`;
        const vergleichsZeit = Date.now();
        const startZeit = obj.startZeit;
        diff = (vergleichsZeit - startZeit);
        time = this.formatDate(Math.round(diff), `hh:mm:ss`);
        await this.setStateAsync(obj.timeTotal, time, true); // Status in DP schreiben
    };

    // /**
    //  * @param {{ telegram: boolean; message: string; telegramUser: string; whatsapp: boolean; whatsappID: any; alexa: boolean; alexaID: string | any[]; }} obj
    //  */
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
                // timeMin = await this.str2time(whatsappInput[obj.whatsappID[i]].timeMin);
                // timeMax = await this.str2time(whatsappInput[obj.whatsappID[i]].timeMax);
                // if (time >= timeMin && time < timeMax) {
                await this.setForeignStateAsync(whatsappInput[obj.whatsappID[i]].path, msg);
                // };
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
                    let output = ``;
                    output = `${sayitInput[obj.sayItID[i]].volume};${msg}`;
                    await this.setForeignStateAsync(sayitInput[obj.sayItID[i]].path, output);
                };
            };
        };
        // trigger dp
        await this.setStateAsync(obj.messageDP, msg, true);
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
                if (arrObj[i].timeout) {
                    clearTimeout(arrObj[i].timeout);
                    this.log.debug(`timeout ${arrObj[i].deviceName}: was deleted`);
                };
            };
            callback();
        } catch (e) {
            callback();
        };
    };

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    // onObjectChange(id, obj) {
    //     if (obj) {
    //         // The object was changed
    //         this.log.debug(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.debug(`object ${id} deleted`);
    //     };
    // };

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires `common.message` property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    //     if (typeof obj === `object` && obj.message) {
    //         if (obj.command === `send`) {
    //             // e.g. send email or pushover or whatever
    //             this.log.debug(`send command`);

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, `Message received`, obj.callback);
    //         };
    //     };
    // };
};


// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Template(options);
} else {
    // otherwise start the instance directly
    new Template();
};
