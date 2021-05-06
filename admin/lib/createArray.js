function createArray(obj) {

    const name = obj.name;

    let objTemp = {};
    for (const i in obj.ids) {
        if (i !== undefined) {
            const data = obj.ids[i];
            if (name === 'devices') {
                const dataTable = obj.idsTable[i]; // devices hat zwei daten arrays

                // prüfen ob data in dataTable vorhanden ist
                // und finales 'device' objekt erstellen
                if (data.id == dataTable.id) {
                    objTemp[data.id] = {
                        name: data.name,
                        type: data.type,
                        pathConsumption: data.consumption,
                        pathSwitch: data.switch,
                        pathConsumptionTotal: data.consumptionTotal,
                        startText: data.startText,
                        endText: data.endText,
                        runtimeMax: data.runtimeMax,
                        enabled: dataTable.enabled,

                        alexa: dataTable.alexa,
                        sayit: dataTable.sayit,
                        whatsapp: dataTable.whatsapp,
                        telegram: dataTable.telegram,
                        pushover: dataTable.pushover,
                        email: dataTable.email,
                        timer: dataTable.timer,

                        autoOff: dataTable.autoOff,
                        abort: dataTable.abort,
                        id: dataTable.id
                    };
                };
            };

            if (name === "alexa" || name === "sayit") {
                timeMin = "";
                timeMax = "";
                let timeMinHourTemp = ``;
                let timeMinMinTemp = ``;
                let timeMaxHourTemp = ``;
                let timeMaxMinTemp = ``;
                if (data.timeMinHour !== `` && data.timeMinMin !== `` && data.timeMaxHour !== `` && data.timeMaxMin !== ``) {
                    timeMinHourTemp = data.timeMinHour;
                    timeMinMinTemp = data.timeMinMin;
                    timeMaxHourTemp = data.timeMaxHour;
                    timeMaxMinTemp = data.timeMaxMin;
                    timeMin = `${timeMinHourTemp}:${timeMinMinTemp}`;
                    timeMax = `${timeMaxHourTemp}:${timeMaxMinTemp}`;
                };
                if (data.volume < 0 || data.volume > 100 || data.volume === undefined || data.volume === '') {
                    data.volume = 50;
                };
            };

            switch (name) {
                case "alexa": {
                    objTemp[data.id] = {
                        name: data.name,
                        path: data.path,
                        volume: data.volume,
                        timeMin: timeMin,
                        timeMax: timeMax
                    };
                    break;
                };
                case "sayit": {
                    objTemp[data.id] = {
                        name: data.name,
                        path: data.path,
                        timeMin: timeMin,
                        timeMax: timeMax,
                        volume: data.volume
                    };
                    break;
                };
                case "whatsapp": {
                    objTemp[data.id] = {
                        name: data.name,
                        path: `whatsapp-cmb${data.inst}.sendMessage`,
                    };
                    break;
                };
                case "typeID": {
                    objTemp[data.id] = {
                        name: data.name,
                        startVal: data.startVal,
                        endVal: data.endVal,
                        startCount: data.startCount,
                        endCount: data.endCount
                    };
                    break;
                };
                case "telegram": {
                    objTemp[data.id] = {
                        name: data.nameFinal,
                        inst: data.inst
                    };
                    break;
                };
                case "pushover": {
                    objTemp[data.id] = {
                        name: data.name,
                        inst: data.inst,
                        prio: data.prio,
                        sound: data.sound,
                    };
                    if (objTemp[data.id].prio == 'high') {
                        objTemp[data.id].prio = 1;
                    } else if (objTemp[data.id].prio == 'quiet') {
                        objTemp[data.id].prio = -1;
                    } else {
                        delete objTemp[data.id].prio;
                    };
                    break;
                };
                case "email": {
                    objTemp[data.id] = {
                        name: data.name,
                        emailFrom: data.emailFrom,
                        emailTo: data.emailTo
                    };
                    break;
                };
            };
        };
    };
    return objTemp;
};