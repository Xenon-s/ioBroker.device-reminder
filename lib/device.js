"use strict";

async function create(obj, /**@type{string}*/ stateID, /**@type{string}*/ namespace, implementedMessenger) {

    class device {
        constructor(obj, namespace, implementedMessenger) {
            /** @type {string} */ this.name = obj.common.name;
            /** @type {string} */ this.pathLiveConsumption = stateID;
            /** @type {string} */ this.unit = obj.common.unit != undefined ? obj.common.unit || null : null;
            this.messenger = {};
    
            // Alle messenger IDs und Messenger anlegen und als Attribut an newDevice schreiben
            implementedMessenger.forEach(element => {
                if (obj.common.custom[namespace][element] != undefined && obj.common.custom[namespace][element].length > 0) {
                    this.messenger[`${element}`] = obj.common.custom[namespace][element];
                };
            });
        };
    };
    
    return new device(obj, namespace, implementedMessenger);
};

module.exports = {
    create,
};