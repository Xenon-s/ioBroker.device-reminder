// Pruefung des User-Inputs auf Plausibilitaet

async function cntrlUserInputNew(data, /**@type {string}*/ name) {

    const dataSendTo = await dataCntrlInput(name);
    console.warn(dataSendTo);

    console.warn(data[name])
    console.warn(name)

    // Wenn Usereingaben vorhanden, dann pruefen
    if (Object.keys(data[name].ids.length > 0)) {

        // Alle Usereingaben pruefen
        return new Promise((resolve, reject) => {

            /**@type {string []}*/
            const dataCntrlStates = dataSendTo[name].obj.dataCntrl.states != undefined ? dataSendTo[name].obj.dataCntrl.states || [] : [];
            /**@type {string []}*/
            const dataCntrlKeys = dataSendTo[name].obj.dataCntrl.keys != undefined ? dataSendTo[name].obj.dataCntrl.keys || [] : [];
            const ids = data[name].ids;
            // Ergebnis der Pruefung fuer return
            let objResult = {
                /**@type {string []}*/
                checked: dataSendTo[name].obj.dataChecked,
                /**@type {string []}*/
                failed: dataSendTo[name].obj.dataFailed
            };

            try {
                // externe Datenpunkte prufen
                if (dataCntrlStates.length > 0) {
                    for (const i of dataCntrlStates) {
                        socket.emit('getState', `0_userdata.0.TestWert`, async(err, state) => {
                            if (state != null && state != undefined) {
                                // Pruefung erfolgreich
                                objResult.checked.push();
                            } else {
                                // Pruefung ergibt Fehler
                                objResult.failed.push();
                            };
                        });
                    };
                };

                // Pflichteingaben pruefen
                if (dataCntrlKeys.length > 0) {
                    for (const i of dataCntrlKeys) {
                        if (dataCntrlKeys[i] != undefined) {
                            // Pruefung erfolgreich
                            objResult.checked.push();
                        } else {
                            // Pruefung ergibt Fehler
                            objResult.failed.push();
                        };
                    };
                };
                resolve(objResult); // Keine Eingaben zum Pruefen vorhanden
            } catch (error) {
                reject(error);
            };
        });
    };
};