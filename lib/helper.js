"use strict";

/**
 * Entfernt einen Wert aus einem Array.
 * @param {Array} arr - Das Array, aus dem der Wert entfernt werden soll.
 * @param {string} value - Der Wert, der entfernt werden soll.
 * @returns {Array} - Das Array ohne den entfernten Wert.
 */
async function removeValue(arr, value) {
    // Verwendung von 'filter', um das Array zu filtern und den Wert zu entfernen
    return arr.filter(element => {
        return element !== value; // Verwendung von '!==', um strenge Gleichheit sicherzustellen
    });
}

/**
 * Extrahiert den Adapternamen aus einem String.
 * @param {string} str - Der Eingabestring, aus dem der Adaptername extrahiert werden soll.
 * @returns {Promise<string>} - Ein Promise, das den extrahierten Adapternamen enthält.
 */
async function extractAdapterName(/**@type{string}*/ str) {
    return new Promise(async (resolve, reject) => {
        // Verwendung von 'lastIndexOf' und 'substring', um den Adapternamen zu extrahieren
        const lastIndex = str.lastIndexOf(".");
        const secondLastIndex = str.lastIndexOf(".", lastIndex - 1);
        const newString = str.substring(secondLastIndex + 1, lastIndex);
        const result = await changeName(newString, "-", "_")
        resolve(result);
    });
}

/**
 * Ändert den Namen gemäß den angegebenen Regeln.
 * @param {string} str - Der ursprüngliche Name, der geändert werden soll.
 * @param {string} val1 - Wert, der gefunden und ersetzt werden soll.
 * @param {string} val2 - Wert, mit dem ersetzt werden soll.
 * @returns {Promise<string>} - Ein Promise, das den geänderten Namen enthält.
 */
async function changeName(/**@type{string}*/ str, /**@type{string}*/ val1, /**@type{string}*/ val2) {
    return new Promise((resolve, reject) => {
        // Führe die Änderungen am Namen aus
        let name = str.replace("show", "").toLowerCase();

        // Ersetze den Wert val1 durch val2 und wandele in Kleinbuchstaben um
        if (name.includes(val1)) name = name.replace(val1, val2).toLowerCase();
        
        // Gebe den geänderten Namen zurück
        resolve(name);
    });
}

/**
 * Extrahiert die Instanz-ID aus einem String.
 * @param {string} str - Der Eingabestring, aus dem die Instanz-ID extrahiert werden soll.
 * @returns {Promise<number|null>} - Ein Promise, das die extrahierte Instanz-ID oder null enthält, wenn keine gefunden wurde.
 */
async function extractNumberFromString(/**@type{string}*/ str) {
    return new Promise((resolve, reject) => {
        // Verwendung von regulären Ausdrücken, um die Zahl am Ende des Strings zu finden
        const regex = /\d+$/;
        const match = str.match(regex);

        if (match) {
            // Parsen der extrahierten Zahl zu einer Ganzzahl
            const result = parseInt(match[0]);
            resolve(result);
        } else {
            resolve(null); // Rückgabe von null, wenn keine Zahl gefunden wurde
        }
    });
}

/**
 * Wandelt eine Adapterinstanz-Zahl in ein Objekt um.
 * @param {number} number - Die Adapterinstanz-Zahl, die umgewandelt werden soll.
 * @returns {Object} - Das erzeugte Objekt mit 'label' und 'value'.
 */
async function createObjectFromNumber(/**@type{number}*/ number) {
    return { label: number, value: number };
}

// Export aller Funktionen für die Verwendung in anderen Modulen
module.exports = {
    extractAdapterName,
    changeName,
    removeValue,
    extractNumberFromString,
    createObjectFromNumber,
};
