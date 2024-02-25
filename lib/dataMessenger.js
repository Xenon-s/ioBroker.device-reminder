"use strict";

// Definieren der Alexa2-Konfiguration mit den unterstützten Aktionen
const alexa2 = {
    target: ["speak", "announcement"]
};

// Platzhalter für zukünftige Erweiterungen oder spezifische Anwendungen
const sayit = {};

// Platzhalter für zukünftige Erweiterungen oder spezifische Anwendungen
const telegram = {};

// Platzhalter für zukünftige Erweiterungen oder spezifische Anwendungen
const whatsapp_cmb = {};

// Konfiguration für den Pushover-Messenger mit Prioritäten und Soundoptionen
const pushover = {
    priority: ["normal", "high", "quiet", "confirmation"],
    sound: ["pushover", "bike", "bugle", "cashregister", "classical", "cosmic", "falling", "gamelan", "incoming", "magic", "mechanical", "pianobar", "siren", "spacealarm", "tugboat", "alien", "climb", "persistent", "echo", "updown", "none"]
};

// Platzhalter für zukünftige Erweiterungen oder spezifische Anwendungen
const signal_cmb = {};

// Platzhalter für zukünftige Erweiterungen oder spezifische Anwendungen
const email = {};

// Platzhalter für zukünftige Erweiterungen oder spezifische Anwendungen
const matrix_org = {};

// Platzhalter für zukünftige Erweiterungen oder spezifische Anwendungen
const discord = {};

// Exportieren der einzelnen Messenger-Konfigurationen als Module
module.exports = {
    alexa2,
    sayit,
    telegram,
    whatsapp_cmb,
    pushover,
    signal_cmb,
    email,
    matrix_org,
    discord
};
