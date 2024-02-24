"use strict";
const { isObject } = require("./tools");
/**
 * @description Remove Value from Array
 * @param {Array} arr
 * @param {string} value
 */
async function removeValue(arr, value) {
    return arr.filter(element => {
        return element != value;
    });
};

// In dieser Funktion wird der Adapter Name extrahiert
async function extractAdapterName(/**@type{string}*/ str) {
    const lastIndex = str.lastIndexOf(".");
    const secondLastIndex = str.lastIndexOf(".", lastIndex - 1);
    const result = str.substring(secondLastIndex + 1, lastIndex);
    return result
};

// In dieser Funktion wird die Instanz ID aus dem String extrahiert und zurueck gegeben
async function extractNumberFromString(/**@type{string}*/ str) {
    const regex = /\d+$/; // Regulärer Ausdruck, um die Zahl am Ende des Strings zu finden
    const match = str.match(regex); // Die Zahl am Ende des Strings extrahieren

    if (match) {
        const result = parseInt(match[0]); // Die extrahierte Zahl in eine Ganzzahl umwandeln
        return result;
    } else {
        return null // Wenn keine Zahl gefunden wurde, null zurückgeben
    };
};

// Adapterinstanz Zahl in Objekt umwandeln
async function createObjectFromNumber(/**@type{number}*/ number) {
    return { label: number, value: number };
};

async function changeName(/**@type{string}*/ str) {
    let name = str.replace("show", "").toLowerCase();  // Adapter mit einem "-" im Namen muessen in der Config mit "_" abgespeichert werden. Hier wird wieder aus "_" ein "-", damit der Adapter gefunden wird
    if (name.includes('_')) name = name.replace("_", "-").toLowerCase();
    return name;
};

module.exports = {
    extractAdapterName,
    removeValue,
    extractNumberFromString,
    createObjectFromNumber,
    changeName,
};