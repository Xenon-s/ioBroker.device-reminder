// @ts-nocheck
`use strict`;

/*
 * Created with @iobroker/create-adapter v1.29.0
 */

/* 
- wenn maschine vorher abgeschaltet wird, berechnung abbrechen
- timeout einbringen 
*/

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require(`@iobroker/adapter-core`);

let arrObjInput = [];
let arrAlexaInput = [];
let arrSayItInput = [];

let arrObj = {};
let arrDevices = [];

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

        // Objekte Input speichern
        arrObjInput = this.config.device;       // Objekte
        arrAlexaInput = this.config.alexaID;    // Alexa speichern 
        arrSayItInput = this.config.sayitID;    // sayIt speichern

        // Input auf Plausibilität prüfen
        if (arrObjInput !== undefined) {
            this.log.debug(`ARR INPUT ${JSON.stringify(arrObjInput)}`)
            if (arrObjInput.length >= 1) {
                arrObjInput = await this.inputPruefen(arrObjInput);
                // Alexa Pfade pruefen
                if (arrAlexaInput !== undefined) {
                    if (arrAlexaInput.length >= 1) {
                        arrAlexaInput = await this.createAlexa(arrAlexaInput);
                    };
                };
                // sayIt Pfade pruefen
                if (arrSayItInput !== undefined) {
                    if (arrSayItInput.length >= 1) {
                        arrSayItInput = await this.createSayIt(arrSayItInput);
                    };
                };
                this.log.debug(`ARRTEMP SAYIT "${JSON.stringify(arrSayItInput)}"`);
                /**
* @param {{ pathConsumption: string; }} element
*/
                // alexaID => alle vorhandenen Alexa IDs
                // idAlexa => alle für das Gerät ausgewählte Alexas
                await arrObjInput.forEach(async element => {
                    const id = element.pathConsumption;
                    const obj = element;
                    if (obj.enabled && obj.deviceName !== `` && obj.pathConsumption !== `` && obj.pathSwitch !== ``) {
                        arrObj[id] = await this.funcCreateObject(obj);
                        this.log.debug(`objFinal ${JSON.stringify(arrObj)}`);
                        this.subscribeForeignStates(id);
                        this.log.debug(`subscribe ${JSON.stringify(id)}`);
                    };
                });
            };
        } else {
            this.log.error(`No devices were created. Please create a device!`)
        };
    };

    async inputPruefen(arrObjInput) {
        const arrTemp = [];
        const objPruef = {};
        const arrPruef = [];
        for (const i in arrObjInput) {
            if (await this.getForeignObjectAsync(arrObjInput[i].pathConsumption)) {
                if (await this.getForeignObjectAsync(arrObjInput[i].pathSwitch)) {
                    objPruef[`pConsumption`] = arrObjInput[i].pathConsumption
                    objPruef[`pSwitch`] = arrObjInput[i].pathSwitch;
                    arrPruef.push(objPruef);
                    arrTemp.push(arrObjInput[i]);
                } else {
                    this.log.warn(`Gerät ${arrObjInput[i].deviceName}: Path ${arrObjInput[i].pathSwitch} could not be found! Please check your entry!`);
                };
            } else {
                this.log.warn(`Gerät ${arrObjInput[i].deviceName}: Path ${arrObjInput[i].pathConsumption} could not be found! Please check your entry!`);
            };
        };
        this.log.debug(`arrPruef ${JSON.stringify(arrPruef)}`);
        return arrTemp;
    };

    async createAlexa(arrAlexaInput) {
        const arrTemp = [];
        let timeMinHourTemp = ``;
        let timeMinMinTemp = ``;
        let timeMaxHourTemp = ``;
        let timeMaxMinTemp = ``;
        if (arrAlexaInput.length >= 1) {
            for (const i in arrAlexaInput) {
                if (await this.getForeignObjectAsync(arrAlexaInput[i].alexaPath)) {
                    if (arrAlexaInput[i].alexaTimeMinHour !== `` && arrAlexaInput[i].alexaTimeMinMin !== `` && arrAlexaInput[i].alexaTimeMaxHour !== `` && arrAlexaInput[i].alexaTimeMaxMin !== ``) {
                        timeMinHourTemp = arrAlexaInput[i].alexaTimeMinHour;
                        timeMinMinTemp = arrAlexaInput[i].alexaTimeMinMin;
                        timeMaxHourTemp = arrAlexaInput[i].alexaTimeMaxHour;
                        timeMaxMinTemp = arrAlexaInput[i].alexaTimeMaxMin;
                        arrAlexaInput[i].timeMin = `${timeMinHourTemp}:${timeMinMinTemp}`;
                        arrAlexaInput[i].timeMax = `${timeMaxHourTemp}:${timeMaxMinTemp}`;
                        delete arrAlexaInput[i].alexaTimeMinHour;
                        delete arrAlexaInput[i].alexaTimeMinMin;
                        delete arrAlexaInput[i].alexaTimeMaxHour;
                        delete arrAlexaInput[i].alexaTimeMaxMin;
                        arrTemp.push(arrAlexaInput[i]);
                        this.log.debug(`Alexa "${arrAlexaInput[i].alexaName}" was created successfully`);
                    };
                } else {
                    this.log.warn(`Alexa "${arrAlexaInput[i].alexaName}": Path could not be found! Please check your entry!`);
                };
            };
            return arrTemp;
        };
    };

    async createSayIt(arrSayItInput) {
        const arrTemp = [];
        let timeMinHourTemp = ``;
        let timeMinMinTemp = ``;
        let timeMaxHourTemp = ``;
        let timeMaxMinTemp = ``;
        if (arrSayItInput) {
            for (const i in arrSayItInput) {
                if (await this.getForeignObjectAsync(arrSayItInput[i].sayitPath)) {
                    if (arrSayItInput[i].sayitTimeMinHour !== `` && arrSayItInput[i].sayitTimeMinMin !== `` && arrSayItInput[i].sayitTimeMaxHour !== `` && arrSayItInput[i].sayitTimeMaxMin !== ``) {
                        timeMinHourTemp = arrSayItInput[i].sayitTimeMinHour;
                        timeMinMinTemp = arrSayItInput[i].sayitTimeMinMin;
                        timeMaxHourTemp = arrSayItInput[i].sayitTimeMaxHour;
                        timeMaxMinTemp = arrSayItInput[i].sayitTimeMaxMin;
                        arrSayItInput[i].timeMin = `${timeMinHourTemp}:${timeMinMinTemp}`;
                        arrSayItInput[i].timeMax = `${timeMaxHourTemp}:${timeMaxMinTemp}`;
                        delete arrSayItInput[i].sayitTimeMinHour;
                        delete arrSayItInput[i].sayitTimeMinMin;
                        delete arrSayItInput[i].sayitTimeMaxHour;
                        delete arrSayItInput[i].sayitTimeMaxMin;
                        arrTemp.push(arrSayItInput[i]);
                        this.log.debug(`sayit "${arrSayItInput[i].sayitName}" was created successfully`);
                    };
                } else {
                    this.log.warn(`sayit "${arrSayItInput[i].sayitName}": Path could not be found! Please check your entry!`);
                };
            };
            return arrTemp;
        };
    };


    /**
     * @param {{enabled: boolean;deviceName: string; deviceType: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: array; idWhatsapp: string; idsayit: array; autoOff: boolean; timer: boolean; idTimer: number}} obj
     */
    async funcCreateObject(obj) {
        let objTemp = {};

        /**
         * @param {{enabled: boolean;deviceName: string; deviceType: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: array; idWhatsapp: string; idsayit: array; autoOff: boolean; timer: boolean; idTimer: number}} obj
         */
        //Klasse erstellen
        class Geraet {
            /**
             * @param {{enabled: boolean;deviceName: string; deviceType: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: array; idWhatsapp: string; idsayit: array; autoOff: boolean; timer: boolean; idTimer: number}} obj
             * @param {number} startValue
             * @param {number} endValue
             * @param {number} startCount
             * @param {number} endCount
             * @param {string | number} zustand
             * @param {string | number} verbrauchAktuell
             * @param {string | number} laufzeit
             */
            constructor(obj, zustand, verbrauchAktuell, laufzeit, startValue, endValue, startCount, endCount) {
                // Attribute
                // Vorgaben
                // DPs
                this.geraeteName = obj.deviceName;
                this.geraeteTyp = obj.deviceType;
                this.currentConsumption = obj.pathConsumption;
                this.switchPower = obj.pathSwitch;
                // script intern
                this.pfadZustand = zustand;
                this.pfadVerbrauchLive = verbrauchAktuell;
                // Strings
                this.startnachrichtText = obj.startText;
                this.endenachrichtText = obj.endText;
                // boolean
                this.startnachrichtVersendet = false;
                this.endenachrichtVersendet = false;
                this.gestartet = false;
                // boolean Benutzervorgaben
                this.autoOff = obj.autoOff;
                // number
                this.verbrauch = null;
                this.resultStart = null;
                this.resultEnd = null;
                // Verbrauchswerte
                this.startValue = startValue;
                this.endValue = endValue;
                // Zaehler Abbruchbedingungen
                this.startCount = startCount;
                this.endCount = endCount;
                // timeout
                this.startZeit = 0;
                this.endZeit = 0;
                this.gesamtZeit = laufzeit;
                // array
                this.arrStart = [];
                this.arrAbbruch = [];

                // Methoden

                /*obj Startext erstellen*/
                if (obj.startText !== `` && obj.startText != null) {
                    this.startnachricht = true;
                } else {
                    this.startnachricht = false;
                };

                /*obj Endtext erstellen*/
                if (obj.endText !== `` && obj.endText != null) {
                    this.endenachricht = true;
                } else {
                    this.endenachricht = false;
                };

                /*obj timer erstellen*/
                if (obj.idTimer !== `` && obj.idTimer !== null) {
                    this.timeoutInMS = (Math.floor(obj.idTimer) * 60 * 1000); // Umrechnung auf ms
                    if (this.timeoutInMS > 0) {
                        this.timer = true;
                    } else {
                        this.timer = false;
                    };
                    this.timeout = null;
                };

                /*obj telegram erstellen*/
                if (obj.idTelegram !== `` && obj.idTelegram != null) {
                    this.telegramUser = obj.idTelegram.toString();
                    this.telegram = true;
                } else {
                    this.telegram = false;
                };

                /*obj alexa erstellen*/
                if (obj.idAlexa.length >= 1) {
                    let arrTemp = [];
                    for (const c in arrAlexaInput) { //Jede Alexa aus Input laden
                        for (const i in obj.idAlexa) {   // Jede Alexa aus dem jeweiligen Objekt mit Input abgleichen
                            if (arrAlexaInput[c].alexaPath === obj.idAlexa[i])
                                arrTemp.push(arrAlexaInput[c]);
                        };
                    };
                    if (arrTemp.length >= 1) {
                        this.alexaID = arrTemp;
                        this.alexa = true;
                    } else {
                        this.alexa = false;
                    };
                };

                /*obj sayIt erstellen*/
                if (obj.idsayit.length >= 1) {
                    let arrTemp = [];
                    for (const c in arrSayItInput) {
                        for (const i in obj.idsayit) {
                            if (arrSayItInput[c].sayitPath === obj.idsayit[i])
                                arrTemp.push(arrSayItInput[c]);
                        };
                    };
                    if (arrTemp.length >= 1) {
                        this.sayItID = arrTemp;
                        this.sayIt = true;
                    } else {
                        this.sayIt = false;
                    };
                };

                /*obj whatsapp erstellen*/
                // if (obj.idWhatsapp !== `` && obj.idWhatsapp != null) {
                //     this.whatsappID = obj.idWhatsapp;
                //     this.whatsapp = true;
                // } else {
                //     this.whatsapp = false;
                // };
            };
        };

        // Objekte erstellen
        /**
         * @param {{ geraeteName: string; deviceType: string; enabled: boolean; deviceName: string; pathConsumption: string; pathSwitch: string; startText: string; endText: string; idTelegram: string; idAlexa: string; idWhatsapp: string; idsayit: array; autoOff: boolean; }} obj
         */
        //DPs erstellen
        const zustand = (`${obj.deviceName}.Zustand`);
        const verbrauchAktuell = (`${obj.deviceName}.Verbrauch aktuell`);
        const laufzeit = (`${obj.deviceName}.Laufzeit`);

        this.setObjectNotExistsAsync(zustand, {
            type: `state`,
            common: {
                name: `Zustand ${obj.deviceName}`,
                type: `string`,
                role: `indicator`,
                read: true,
                write: false,
            },
            native: {},
        });
        this.setObjectNotExistsAsync(verbrauchAktuell, {
            type: `state`,
            common: {
                name: `Verbrauch aktuell ${obj.deviceName}`,
                type: `number`,
                role: `indicator`,
                unit: `W`,
                read: true,
                write: false,
            },
            native: {},
        });
        this.setObjectNotExistsAsync(laufzeit, {
            type: `state`,
            common: {
                name: `Laufzeit ${obj.deviceName}`,
                type: `string`,
                role: `indicator`,
                read: true,
                write: false,
            },
            native: {},
        });


        // Objekt bauen (obj, ... , startVal, endVal, startCount, endCount)
        switch (obj.deviceType) {
            case `Waschmaschine`: {
                const WaMa = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, 30, 5, 3, 65);
                objTemp = WaMa;
                arrDevices.push(WaMa);
                break;
            };
            case `Trockner`: {
                const Trockner = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, 120, 10, 5, 50);
                objTemp = Trockner;
                arrDevices.push(Trockner);
                break;
            };
            case `Geschirrspueler`: {
                const GS = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, 20, 4, 3, 100);
                objTemp = GS;
                arrDevices.push(GS);
                break;
            };
            case `Computer`: {
                const Computer = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, 20, 5, 2, 3);
                objTemp = Computer;
                arrDevices.push(Computer);
                break;
            };
            case `Wasserkocher`: {
                const WaKo = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, 10, 5, 2, 2);
                objTemp = WaKo;
                arrDevices.push(WaKo);
                break;
            };
            case `Test`: {
                const Test = new Geraet(obj, zustand, verbrauchAktuell, laufzeit, 1, 10, 2, 2);
                objTemp = Test;
                arrDevices.push(Test);
                break;
            };
            default:
                this.log.warn(`Gerätename wurde nicht erkannt, bitte die Schreibweise ueberpruefen oder Geraet ist unbekannt`);
                break;
        };

        this.log.debug(`RETURN ${JSON.stringify(objTemp)}`);
        return objTemp;
    };

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            for (const i in arrObj) {
                clearTimeout(arrObj[i].timeout);
                this.log.debug(`timeout ${arrObj[i].deviceName}: was deleted, state: ${arrObj[i].timeout}`);
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
        let result = await this.getForeignStateAsync(obj.currentConsumption);
        obj.verbrauch = result.val;
        this.log.debug(`Verbrauchswert Live ${JSON.stringify(obj.verbrauch)} von ${JSON.stringify(obj.geraeteName)}`);
        this.log.debug(`Wert Verbrauch START: ${JSON.stringify(obj.resultStart)}`);
        this.log.debug(`TIMEOUT ANFANG ${obj.timeout}`)
        //await this.setStateAsync(obj.switchPower, false);
        if (obj.verbrauch > obj.startValue && obj.gestartet == false) {
            obj.startZeit = Date.now(); // Startzeit loggen
            this.calcStart(obj); //Startwert berechnen und ueberpruefen
            if (obj.resultStart > obj.startValue && obj.resultStart != null && obj.arrStart.length >= obj.startCount && obj.gestartet == false) {
                obj.gestartet = true; // Vorgang gestartet
                await this.setStateAsync(obj.pfadZustand, `gestartet`, true); // Status in DP schreiben
                this.log.debug(`Startnachricht: ${obj.startnachricht} Startnachrichtversendet ${obj.startnachrichtVersendet}`)
                if (obj.startnachricht && !obj.startnachrichtVersendet) { // Start Benachrichtigung aktiv?
                    obj.message = obj.startnachrichtText; // Start Benachrichtigung aktiv
                    this.message(obj);
                    this.log.debug(`${obj.message}`);
                };
                obj.startnachrichtVersendet = true; // Startnachricht wurde versendet
                obj.endenachrichtVersendet = false; // Ende Benachrichtigung freigeben
            } else if (obj.resultStart < obj.startValue && obj.resultStart != null && obj.arrStart.length >= obj.startCount && obj.gestartet == false) {
                obj.gestartet = false; // Vorgang gestartet
                await this.setStateAsync(obj.pfadZustand, `Standby`, true); // Status in DP schreiben
            };
        } else if (obj.verbrauch < (obj.startCount / 2) && obj.arrStart.length != 0 && obj.gestartet == false) { // Wert mind > obj.startCount/2 & arrStart nicht leer und nicht gestartet, sonst `Abbruch`
            obj.arrStart = []; // array wieder leeren
            this.log.debug(`Startphase abgebrochen, array Start wieder geloescht`);
            await this.setStateAsync(obj.pfadZustand, `ausgeschaltet`, true); // Status in DP schreiben
        };
        if (obj.gestartet) { // wurde geraet gestartet?
            await this.calcEnd(obj); // endeberechnung durchfuehren
        };
        this.log.debug(`in Betrieb? Name: ${JSON.stringify(obj.geraeteName)} Ergebnis ENDE: ${JSON.stringify(obj.resultEnd)} Wert ENDE: ${JSON.stringify(obj.endValue)} gestartet: ${JSON.stringify(obj.gestartet)} Arraylength: ${JSON.stringify(obj.arrAbbruch.length)} Zaehler Arr Ende: ${JSON.stringify(obj.endCount)} `);
        if (obj.resultEnd > obj.endValue && obj.resultEnd != null && obj.gestartet) { // Wert > endValue und Verbrauch lag 1x ueber startValue
            if (obj.timeout != null) {
                clearTimeout(obj.timeout);
                obj.timeout = null;
            };
            await this.setStateAsync(obj.pfadZustand, `in Betrieb`, true); // Status in DP schreiben
            await this.time(obj);
        } else if (obj.resultEnd < obj.endValue && obj.resultEnd != null && obj.gestartet && obj.arrAbbruch.length >= (obj.endCount / 2)) { // geraet muss mind. 1x ueber startValue gewesen sein, arrAbbruch muss voll sein und ergebis aus arrAbbruch unter endValue
            obj.gestartet = false; // vorgang beendet
            if (obj.autoOff && obj.switchPower) {
                this.log.debug(`timeout ${JSON.stringify(obj.timer)}`)
                this.log.debug(`timeout ${JSON.stringify(obj.timeout)}`)
                this.log.debug(`timeout LÄNGE ${JSON.stringify(obj.timeoutInMS)}`)
                if (obj.timer && obj.timeout == null) {
                    if (obj.timeout != null) {
                        clearTimeout(obj.timeout);
                        obj.timeout = null;
                    };
                    obj.timeout = setTimeout(async() => {  //timeout starten
                        await this.setForeignStateAsync(obj.switchPower, false); // Geraet ausschalten, falls angewaehlt    
                        await this.setStateAsync(obj.pfadZustand, `ausgeschaltet`, true); // Status in DP schreiben
                    }, obj.timeoutInMS);
                } else {
                    await this.setStateAsync(obj.pfadZustand, `Standby`, true); // Status in DP schreiben
                };
            };
            obj.endZeit = Date.now(); // ende Zeit loggen
            obj.arrStart = []; // array wieder leeren
            obj.arrAbbruch = []; // array wieder leeren
            if (obj.endenachricht && !obj.endenachrichtVersendet && obj.startnachrichtVersendet) {  // Ende Benachrichtigung aktiv?
                obj.message = obj.endenachrichtText; // Ende Benachrichtigung aktiv
                this.log.debug(`${obj.message}`);
                this.message(obj);
            };
            obj.endenachrichtVersendet = true;
            obj.startnachrichtVersendet = false;
        };
        await this.setStateAsync(obj.pfadVerbrauchLive, `${obj.verbrauch}`, true);
    };

    /**
     * **************************************************
     * *********** functions and calculations  ************
     * ***************************************************/

    async calcStart(obj) { // Calculate values ​​for operation `START`
        this.log.debug(`Startwertberechnung wird fuer ${JSON.stringify(obj.geraeteName)} ausgefuehrt`);
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

    async calcEnd(obj) { // Calculate values ​​for operation `END`
        this.log.debug(`Endwertberechnung wird fuer ${JSON.stringify(obj.geraeteName)} ausgefuehrt`);
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

    async time(obj) {
        //Laufzeit berechnen
        let diff = 0;
        let time = `00:00:00`;
        let vergleichsZeit = Date.now();
        let startZeit = obj.startZeit;
        diff = (vergleichsZeit - startZeit);
        time = this.formatDate(Math.round(diff), `hh:mm:ss`);
        await this.setStateAsync(obj.gesamtZeit, time, true); // Status in DP schreiben
    };

    /**
     * @param {{ telegram: boolean; message: string; telegramUser: string; whatsapp: boolean; whatsappID: any; alexa: boolean; alexaID: string | any[]; }} obj
     */
    async message(obj) { // telegram nachricht versenden
        this.log.debug(`message wird ausgefuehrt`);
        const a = new Date();
        const aHours = a.getHours();
        const aMin = a.getMinutes();
        let time = `${aHours}:${aMin}`;
        time = await this.str2time(time);
        if (obj.telegram) {
            this.log.debug(`telegram message wird ausgefuehrt`);
            this.sendTo(`telegram`, `send`, {
                text: obj.message,
                user: obj.telegramUser
            });
        };

        // if (obj.whatsapp) { // WhatsApp nachricht versenden
        //     this.log.debug(`whatsapp message wird ausgefuehrt`);
        //     this.sendTo(`whatsapp-cmb`, `send`, {
        //         text: obj.message,
        //         phone: obj.whatsappID
        //     });
        // };

        if (obj.alexa) {    // alexa quatschen lassen
            this.log.debug(`Alexa message wird ausgefuehrt`);
            let timeMin = ``;
            let timeMax = ``;
            for (const i in obj.alexaID) {
                timeMin = await this.str2time(obj.alexaID[i].timeMin);
                timeMax = await this.str2time(obj.alexaID[i].timeMax);
                if (time >= timeMin && time < timeMax) {
                    await this.setForeignStateAsync(obj.alexaID[i].alexaPath, obj.message);
                };
            };
        };

        if (obj.sayIt) {
            this.log.debug(`sayIt message wird ausgefuehrt`);
            let timeMin = ``;
            let timeMax = ``;
            this.log.debug(`ARR INPUT ${JSON.stringify(obj.sayItID)}`)
            for (const i in obj.sayItID) {
                timeMin = await this.str2time(obj.sayItID[i].timeMin);
                timeMax = await this.str2time(obj.sayItID[i].timeMax);
                if (time >= timeMin && time < timeMax) {
                    let output = ``;
                    output = `${obj.sayItID[i].sayitVol};${obj.message}`;
                    this.log.debug(`sayit objekt.path "${output}"`)
                    await this.setForeignStateAsync(obj.sayItID[i].sayitPath, output);
                };
            };
        };
    };

    async str2time(str) {
        return str.split(':')[0] * 100 + parseInt(str.split(':')[1], 10)
    };

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
