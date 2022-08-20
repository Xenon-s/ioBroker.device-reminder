/*
Doku:
Hier stehen alle benoetigten Daten fuer die einzelnen Tabellen drin. Wenn eine neue Tabelle (zb. ein neuer Messenger) hinzugefuegt werden soll,
muss man unter "dataTable" alle Tabellenrelevanten Daten angeben.
In dataTable stehen alle Daten, um die HTML der einzelnen Tabellen erstellen zu koennen. 
*/

async function createData(settings) {

    let dataTable = {
        "linkedDevices": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "th": {
                    "1": {
                        "name": "enabled",
                        "class": "header translate header10",
                        "dataType": "checkbox",
                        "dataLang": "active",
                    },
                    "2": {
                        "name": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device name",
                        "disabled": true,
                    },
                    "3": {
                        "name": "alexa",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "alexa",
                    },
                    "4": {
                        "name": "sayit",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "sayit",
                    },
                    "5": {
                        "name": "telegram",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "telegram",
                    },
                    "6": {
                        "name": "whatsapp",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "whatsapp",
                    },
                    "7": {
                        "name": "pushover",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "pushover",
                    },
                    "8": {
                        "name": "email",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "email",
                    },
                    "9": {
                        "name": "autoOff",
                        "class": "header translate header10",
                        "dataType": "checkbox",
                        "dataLang": "switch off",
                    },
                    "10": {
                        "name": "timer",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "switch off after minutes",
                    },
                    "11": {
                        "name": "abort",
                        "class": "header translate header10",
                        "dataType": "checkbox",
                        "dataLang": "abort detection",
                    },
                    "12": {
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
                        "disabled": true,
                    },
                    "2": {
                        "name": "startVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold start (watt)",
                        "min": 0,
                    },
                    "3": {
                        "name": "endVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold end (watt)",
                        "min": 0,
                    },
                    "4": {
                        "name": "standby",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold standby (watt)",
                        "min": 0,
                    },
                    "5": {
                        "name": "startCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of start values",
                        "min": 0,
                    },
                    "6": {
                        "name": "endCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of end values",
                        "min": 0,
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
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "device type",
                        "dataOptions": ["washing-machine", "dryer", "dishwasher"],
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
                        "max": 100
                    },
                    "4": {
                        "name": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                    },
                    "5": {
                        "name": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
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
                        "max": 100
                    },
                    "4": {
                        "name": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                    },
                    "5": {
                        "name": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
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
                    },
                    "2": {
                        "name": "username",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "username",
                    },
                    "3": {
                        "name": "Chat ID",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "Chat ID",
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
                    },
                    "2": {
                        "name": "title",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "title",
                    },
                    "3": {
                        "name": "prio",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "priority",
                        "dataOptions": ["normal", "high", "quiet"],
                        "tdClass": "validate values-input select",
                    },
                    "4": {
                        "name": "sound",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "sound",
                        "dataOptions": ["pushover", "bike", "bugle", "cashregister", "classical", "cosmic", "falling", "gamelan", "incoming", "intermission", "magic", "mechanical", "pianobar", "siren", "spacealarm", "tugboat", "alien", "climb", "persistent", "echo", "updown", "none"]
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
                dataTable[name].data.ids = settings[name].data
            } else {
                dataTable[name].data.ids = [];
            }
            if (settings[name].counter !== undefined) {
                dataTable[name].data.counter = settings[name].counter
            } else {
                dataTable[name].data.counter = 0;
            };
        } else {
            dataTable[name].data.ids = [];
            dataTable[name].data.counter = 0;
        }
    };

    console.warn(dataTable)
    return dataTable;
};