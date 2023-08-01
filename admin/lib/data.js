/*
Doku:
Hier stehen alle benoetigten Daten fuer die einzelnen Tabellen drin. Wenn eine neue Tabelle (zb. ein neuer Messenger) hinzugefuegt werden soll,
muss man unter "dataTable" alle Tabellenrelevanten Daten angeben.
In dataTable stehen alle Daten, um die HTML der einzelnen Tabellen erstellen zu koennen. 
*/

async function createData(settings) {

    let dataTable = {
        "linkedDevice": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "th": {
                    // "1": {
                    //     "name": "enabled",
                    //     "class": "header translate header10",
                    //     "dataType": "checkbox",
                    //     "dataLang": "active",
                    // },
                    "0": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device name",
                        "disabled": true,
                        "data_default": '',
                    },
                    "1": {
                        "name": "alexa",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "alexa",
                        "data_default": {},
                    },
                    "2": {
                        "name": "sayit",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "sayit",
                        "data_default": {},
                    },
                    "3": {
                        "name": "telegram",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "telegram",
                        "data_default": {},
                    },
                    "4": {
                        "name": "whatsapp",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "whatsapp",
                        "data_default": {},
                    },
                    "5": {
                        "name": "pushover",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "pushover",
                        "data_default": {},
                    },
                    "6": {
                        "name": "signal",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "signal",
                        "data_default": {},
                    },
                    "7": {
                        "name": "email",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "email",
                        "data_default": {},
                    },
                    "8": {
                        "name": "autoOff",
                        "class": "header translate header10",
                        "dataType": "select",
                        "dataLang": "switch off",
                        "data_default": "false",
                        "dataOptions": [
                            { "name": "false", "id": false },
                            { "name": "true", "id": true },
                        ]
                    },
                    "9": {
                        "name": "timer",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "switch off after minutes",
                        "data_default": 0,
                    },
                    "10": {
                        "name": "abort",
                        "class": "header translate header10",
                        "dataType": "select",
                        "dataLang": "abort detection",
                        "data_default": "false",
                        "dataOptions": [
                            { "name": "false", "id": false },
                            { "name": "true", "id": true },
                        ]
                    },
                    "11": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "status": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "th": {
                    "1": {
                        "name": "stateAction",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "in action",
                    },
                    "2": {
                        "name": "stateStandby",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "standby",
                    },
                    "3": {
                        "name": "stateOff",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device off",
                    },
                    "4": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "deviceValues": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new device",
                        // "disabled": true,
                    },
                    "2": {
                        "name": "startVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold start (watt)",
                        "min": 0,
                        "data_default": 10,
                    },
                    "3": {
                        "name": "endVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold end (watt)",
                        "min": 0,
                        "data_default": 1,
                    },
                    "4": {
                        "name": "standby",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold standby (watt)",
                        "min": 0,
                        "data_default": 5,
                    },
                    "5": {
                        "name": "startCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of start values",
                        "min": 1,
                        "data_default": 1,
                    },
                    "6": {
                        "name": "endCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of end values",
                        "min": 1,
                        "data_default": 3,
                    },
                    "7": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "8": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "measuringDevice": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device name",
                        "tdClass": "validate values-input",
                    },
                    "2": {
                        "name": "type",
                        "class": "header translate select",
                        "dataType": "select",
                        "dataLang": "device type",
                        "tdClass": "validate values-input select",
                    },
                    "3": {
                        "name": "consumption",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "consumption",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "4": {
                        "name": "switch",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "Power switch",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,

                    },
                    "5": {
                        "name": "startText",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "starttext",
                        "tdClass": "validate values-input oid-select",

                    },
                    "6": {
                        "name": "endText",
                        "class": "header translate",
                        "tdClass": "validate values-input oid-select",
                        "dataType": "text",
                        "dataLang": "endtext",

                    },
                    "7": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",

                    },
                    "8": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id"
                    },
                }
            }
        },
        "alexa": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "tdClass": "validate values-input",
                        "data_default": "new device",
                    },
                    "2": {
                        "name": "path",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "'alexa2/../announcement'/'speak'",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "3": {
                        "name": "volume",
                        "class": "header10 translate",
                        "dataType": "number",
                        "dataLang": "volume 0-100",
                        "min": 0,
                        "max": 100,
                        "data_default": 25,
                    },
                    "4": {
                        "name": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "00:00",
                    },
                    "5": {
                        "name": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "23:59",
                    },
                    "6": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "7": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "sayit": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new device",
                    },
                    "2": {
                        "name": "path",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "'sayit/../text'",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "3": {
                        "name": "volume",
                        "class": "header10 translate",
                        "dataType": "number",
                        "dataLang": "volume 0-100",
                        "min": 0,
                        "max": 100,
                        "data_default": 25
                    },
                    "4": {
                        "name": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "00:00"
                    },
                    "5": {
                        "name": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "23:59"
                    },
                    "6": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "7": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "telegram": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new user"
                    },
                    "2": {
                        "name": "username",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "username",
                        "data_default": "username"
                    },
                    "3": {
                        "name": "Chat ID",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "Chat ID",
                        "data_default": "0123456789"
                    },
                    "4": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "5": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "whatsapp": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new user"
                    },
                    "2": {
                        "name": "path",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "'whatsapp-cmb/../sendMessage'",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "3": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "4": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",

                    },
                }
            }
        },
        "pushover": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new user"
                    },
                    "2": {
                        "name": "title",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "title",
                        "data_default": "new title"
                    },
                    "3": {
                        "name": "prio",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "priority",
                        "dataOptions": [
                            { "name": "normal", "id": 0 },
                            { "name": "high", "id": 1 },
                            { "name": "quiet", "id": 2 }
                        ],
                        "tdClass": "validate values-input select",
                    },
                    "4": {
                        "name": "sound",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "sound",
                        "dataOptions": [
                            { "name": "pushover", "id": 0 },
                            { "name": "bike", "id": 1 },
                            { "name": "bugle", "id": 2 },
                            { "name": "cashregister", "id": 3 },
                            { "name": "classical", "id": 4 },
                            { "name": "cosmic", "id": 5 },
                            { "name": "falling", "id": 6 },
                            { "name": "gamelan", "id": 7 },
                            { "name": "incoming", "id": 8 },
                            { "name": "intermission", "id": 9 },
                            { "name": "magic", "id": 10 },
                            { "name": "mechanical", "id": 11 },
                            { "name": "pianobar", "id": 12 },
                            { "name": "siren", "id": 13 },
                            { "name": "spacealarm", "id": 14 },
                            { "name": "tugboat", "id": 15 },
                            { "name": "alien", "id": 16 },
                            { "name": "climb", "id": 17 },
                            { "name": "persistent", "id": 18 },
                            { "name": "echo", "id": 19 },
                            { "name": "updown", "id": 20 },
                            { "name": "none", "id": 21 }
                        ]
                    },
                    "5": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "6": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "signal": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                    },
                    "2": {
                        "name": "phone",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "phone",
                    },
                    "3": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "4": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "email": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                    },
                    "2": {
                        "name": "emailFrom",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "sender address",
                    },
                    "3": {
                        "name": "emailTo",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "receiver address",
                    },
                    "4": {
                        "name": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "5": {
                        "name": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
    };

    // Daten aus dem Adapter native holen und ins Objekt schreiben [wenn vorhanden]
    for (const name of Object.keys(dataTable)) {

        dataTable[name].data = {
            idHTML: `${name}ID`,
        };

        if (settings[name] !== undefined) {
            if (settings[name].data !== undefined) {
                dataTable[name].ids = settings[name].data
            } else {
                dataTable[name].ids = [];
            }
            if (settings[name].counter !== undefined) {
                dataTable[name].counter = settings[name].counter
            } else {
                dataTable[name].counter = 0;
            };
        } else {
            dataTable[name].ids = [];
            dataTable[name].counter = 0;
        }
    };

    return dataTable;
};