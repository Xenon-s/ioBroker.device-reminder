/*
Doku:
Hier stehen alle benoetigten Daten fuer die einzelnen Tabellen drin. Wenn eine neue Tabelle (zb. ein neuer Messenger) hinzugefuegt werden soll,
muss man unter "dataTable" alle Tabellenrelevanten Daten angeben.
In dataTable stehen alle Daten, um die HTML der einzelnen Tabellen erstellen zu koennen. 
*/

async function createTableHeadData(settings) {

    let dataTable = {
        "linked-device": {
            "head": {
                "class": "translate collapsible-inactive dynamic-table-devices"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": false,
                "submitbtn": false,
                "th": {
                    "0": {
                        "dataName": "enabled",
                        "class": "header translate header10",
                        "dataType": "checkbox",
                        "dataLang": "active",
                        "id": "_enabled",
                    },
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device name",
                        "disabled": true,
                        "dataDefault": '',
                        "id": "_name",
                    },
                    "2": {
                        "dataName": "alexa",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "alexa",
                        "dataDefault": {},
                        "id": "_alexa",
                    },
                    "3": {
                        "dataName": "sayit",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "sayit",
                        "dataDefault": {},
                        "id": "_sayit",
                    },
                    "4": {
                        "dataName": "telegram",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "telegram",
                        "dataDefault": {},
                        "id": "_telegram",
                    },
                    "5": {
                        "dataName": "whatsapp",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "whatsapp",
                        "dataDefault": {},
                        "id": "_whatsapp",
                    },
                    "6": {
                        "dataName": "pushover",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "pushover",
                        "dataDefault": {},
                        "id": "_pushover",
                    },
                    "7": {
                        "dataName": "signal",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "signal",
                        "dataDefault": {},
                        "id": "_signal",
                    },
                    "8": {
                        "dataName": "email",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "email",
                        "dataDefault": {},
                        "id": "_email",
                    },
                    "9": {
                        "dataName": "matrix",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "matrix",
                        "dataDefault": {},
                        "id": "_matrix",
                    },
                    "10": {
                        "dataName": "autoOff",
                        "class": "header translate header10",
                        "dataType": "checkbox",
                        "dataLang": "switch off",
                        "dataDefault": false,
                    },
                    "11": {
                        "dataName": "timer",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "switch off after minutes",
                        "dataDefault": 0,
                    },
                    "12": {
                        "dataName": "abort",
                        "class": "header translate header10",
                        "dataType": "checkbox",
                        "dataLang": "abort detection",
                        "dataDefault": false,
                    },
                    "99": {
                        "dataName": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "devices": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device name",
                    },
                    "2": {
                        "id": "deviceTypeID",
                        "dataName": "type",
                        "class": "header translate select",
                        "dataType": "select",
                        "dataLang": "device type",
                    },
                    "3": {
                        "dataName": "consumption",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "consumption",
                        "disabled": true,
                    },
                    "4": {
                        "dataName": "switch",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "Power switch",
                        "disabled": true,

                    },
                    "5": {
                        "dataName": "startText",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "starttext",
                        "dataDefault": "device started"
                    },
                    "6": {
                        "dataName": "endText",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "endtext",
                        "dataDefault": "device finished"
                    },
                    "7": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",

                    },
                    "99": {
                        "dataName": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id"
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
                "addbtn": false,
                "submitbtn": false,
                "th": {
                    "1": {
                        "dataName": "stateAction",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "in action",
                        "dataDefault": "in action"
                    },
                    "2": {
                        "dataName": "stateStandby",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "standby",
                        "dataDefault": "standby"
                    },
                    "3": {
                        "dataName": "stateOff",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device off",
                        "dataDefault": "device off"
                    },
                    "99": {
                        "dataName": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "default": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": false,
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "new device",
                        "disabled": true,
                    },
                    "2": {
                        "dataName": "startVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold start (watt)",
                        "min": 0,
                        "dataDefault": 10,
                    },
                    "3": {
                        "dataName": "endVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold end (watt)",
                        "min": 0,
                        "dataDefault": 1,
                    },
                    "4": {
                        "dataName": "standby",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold standby (watt)",
                        "min": 0,
                        "dataDefault": 5,
                    },
                    "5": {
                        "dataName": "startCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of start values",
                        "min": 1,
                        "dataDefault": 1,
                    },
                    "6": {
                        "dataName": "endCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of end values",
                        "min": 1,
                        "dataDefault": 3,
                    },
                    "99": {
                        "dataName": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "custom": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "new device",
                        // "disabled": true,
                    },
                    "2": {
                        "dataName": "startVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold start (watt)",
                        "min": 0,
                        "dataDefault": 10,
                    },
                    "3": {
                        "dataName": "endVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold end (watt)",
                        "min": 0,
                        "dataDefault": 1,
                    },
                    "4": {
                        "dataName": "standby",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold standby (watt)",
                        "min": 0,
                        "dataDefault": 5,
                    },
                    "5": {
                        "dataName": "startCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of start values",
                        "min": 1,
                        "dataDefault": 1,
                    },
                    "6": {
                        "dataName": "endCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of end values",
                        "min": 1,
                        "dataDefault": 3,
                    },
                    "7": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",

                    },
                    "99": {
                        "dataName": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
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
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        //"tdClass": "validate values-input",
                        "dataDefault": "new device",
                    },
                    "2": {
                        "dataName": "path",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "'alexa2/../announcement'/'speak'",
                        //"tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "3": {
                        "dataName": "volume",
                        "class": "header10 translate",
                        "dataType": "number",
                        "dataLang": "volume 0-100",
                        "min": 0,
                        "max": 100,
                        "dataDefault": 25,
                    },
                    "4": {
                        "dataName": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        //"tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "dataDefault": "00:00",
                    },
                    "5": {
                        "dataName": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        //"tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "dataDefault": "23:59",
                    },
                    "6": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
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
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "new device",
                    },
                    "2": {
                        "dataName": "path",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "'sayit/../text'",
                        //"tdClass": "validate values-input oid-select",
                        "disabled": true,
                        "dataDefault": "sayit.0.tts.text"
                    },
                    "3": {
                        "dataName": "volume",
                        "class": "header10 translate",
                        "dataType": "number",
                        "dataLang": "volume 0-100",
                        "min": 0,
                        "max": 100,
                        "dataDefault": 25
                    },
                    "4": {
                        "dataName": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        //"tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "dataDefault": "00:00"
                    },
                    "5": {
                        "dataName": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        //"tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "dataDefault": "23:59"
                    },
                    "6": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
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
                "submitbtn": true,
                "th": {
                    "0": {
                        "dataName": "group",
                        "class": "header10 translate",
                        "dataType": "checkbox",
                        "dataLang": "Group",
                        "dataDefault": false
                    },
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "new user"
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "telegram instance",
                        "dataDefault": ".0",
                        "dataOptions": ".0;.1;.2;.3;.4;.5;.6;.7;.8;.9"
                    },
                    "3": {
                        "dataName": "username",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "username/firstname",
                        "dataDefault": "username/firstname"
                    },
                    "4": {
                        "dataName": "chatID",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "Chat ID",
                        "dataDefault": ""
                    },
                    "5": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
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
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "new user"
                    },
                    "2": {
                        "dataName": "path",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "'whatsapp-cmb/../sendMessage'",
                        //"tdClass": "validate values-input oid-select",
                        "disabled": true,
                        "dataDefault": "whatsapp-cmb.0.sendMessage"
                    },
                    "3": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
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
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "new user"
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "pushover instance",
                        "dataOptions": ".0;.1;.2;.3;.4;.5;.6;.7;.8;.9",
                        "dataDefault": ".0",
                    },
                    "3": {
                        "dataName": "title",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "title",
                        "dataDefault": ""
                    },
                    "4": {
                        "dataName": "deviceID",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device ID",
                        "dataDefault": ""
                    },
                    "5": {
                        "dataName": "prio",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "priority",
                        "dataOptions": "normal;high;quiet;confirmation",
                        "dataDefault": "normal"
                    },
                    "6": {
                        "dataName": "sound",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "sound",
                        "dataOptions": "pushover; bike; bugle; cashregister; classical; cosmic; falling; gamelan; incoming; intermission; magic; mechanical; pianobar; siren; spacealarm; tugboat; alien; climb; persistent; echo; updown; none",
                        "dataDefault": "pushover"
                    },
                    "7": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
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
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "Signal user",
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "signal instance",
                        "dataOptions": ".0;.1;.2;.3;.4;.5;.6;.7;.8;.9",
                        "dataDefault": ".0",
                    },
                    "3": {
                        "dataName": "phone",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "phone",
                        "dataDefault": "0123456789",
                    },
                    "4": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
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
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "email user",
                    },
                    "2": {
                        "dataName": "emailFrom",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "sender address",
                    },
                    "3": {
                        "dataName": "emailTo",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "receiver address",
                    },
                    "4": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
                        "class": "none",
                        "dataType": "number",
                        "dataLang": "id",
                    },
                }
            }
        },
        "matrix": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "submitbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "dataDefault": "matrix server",
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "matrix instance",
                        "dataDefault": ".0",
                        "dataOptions": ".0;.1;.2;.3;.4;.5;.6;.7;.8;.9"
                    },
                    "4": {
                        "dataName": "delete",
                        "class": "header10 translate",
                        "dataType": "delete",
                        "dataLang": "delete",
                    },
                    "99": {
                        "dataName": "id",
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
            if (settings[`${name}_counter`] !== undefined) {
                dataTable[name].counter = settings[`${name}_counter`];
            } else {
                dataTable[name].counter = 0;
            };
        } else {
            dataTable[name].ids = [];
            dataTable[name].counter = 0;
        };
    };
    return dataTable;
};

/*
Alle hier stehenden Daten werden benoetigt, um die Usereingaben spaeter pruefen und validieren zu koennen
*/
async function dataCntrlInput() {

    let dataSendTo = {};

    dataSendTo.devices = {
        name: 'devices',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-devices`,
            header: 'header-devices',
            name: 'Measuring devices',
            anchorEn: `create-devices`,
            anchorGer: `devices-anlegen`,
            anchorName: `devices`
        }
    }
    dataSendTo.alexa = {
        name: 'alexa',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-alexa`,
            header: 'header-alexa',
            name: 'alexa',
            anchorEn: `create-alexa`,
            anchorGer: `alexa-erstellen`,
            anchorName: `alexa`
        }
    };
    dataSendTo.telegram = {
        name: 'telegram',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-telegram`,
            header: 'header-telegram',
            name: 'telegram',
            anchorEn: `create-telegram`,
            anchorGer: `telegram-erstellen`,
            anchorName: `telegram`
        }
    };
    dataSendTo.sayit = {
        name: 'sayit',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-sayit`,
            header: 'header-sayit',
            name: 'sayit',
            anchorEn: `create-sayit`,
            anchorGer: `sayit-erstellen`,
            anchorName: `sayit`
        }
    };
    dataSendTo.whatsapp = {
        name: 'whatsapp',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-whatsapp`,
            header: 'header-whatsapp',
            name: 'whatsapp',
            anchorEn: `create-whatsapp`,
            anchorGer: `whatsapp-erstellen`,
            anchorName: `whatsapp`
        }
    };
    dataSendTo.pushover = {
        name: 'pushover',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-pushover`,
            header: 'header-pushover',
            name: 'pushover',
            anchorEn: `create-pushover-user`,
            anchorGer: `pushover-user-erstellen`,
            anchorName: `pushover`
        }
    };
    dataSendTo.email = {
        name: 'email',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-email`,
            header: 'header-email',
            name: 'email',
            anchorEn: `create-email-user`,
            anchorGer: `email-user-erstellen`,
            anchorName: `email`
        }
    };
    dataSendTo.default = {
        name: 'default',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-default`,
            header: 'header-default',
            name: 'default type config',
            anchorEn: `default-devices`,
            anchorGer: `default-devices`,
            anchorName: `default-type`
        }
    };
    dataSendTo.custom = {
        name: 'custom',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-custom`,
            header: 'header-custom',
            name: 'custom type config',
            anchorEn: `custom-devices`,
            anchorGer: `custom-devices`,
            anchorName: `create-custom-type`
        }
    };
    dataSendTo.status = {
        name: 'status',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-status`,
            header: 'header-status',
            name: 'device status',
            anchorEn: `custom-states`,
            anchorGer: `eigene-zustaende`,
            anchorName: `custom-status`
        }
    };
    dataSendTo.signal = {
        name: 'signal',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-signal`,
            header: 'header-signal',
            name: 'signal-cmb',
            anchorEn: `create-signal`,
            anchorGer: `signal-user-erstellen`,
            anchorName: `signal`
        }
    };
    dataSendTo.matrix = {
        name: 'matrix',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-matrix`,
            header: 'header-matrix',
            name: 'matrix',
            anchorEn: `create-matrix`,
            anchorGer: `matrix-user-erstellen`,
            anchorName: `matrix`
        }
    };

    return dataSendTo;
};

/*
Hier werden alle Daten aus den Settings geholt und in ein Objekt umgewandelt, mit dem die Tabelleninputs erstellt werden
*/
function createData(settings) {

    let data = {};

    data.linkedDevice = {
        name: 'linkedDevice',
        idHTML: 'linked-deviceID',
        ids: settings.linkedDevice !== undefined ? settings.linkedDevice.id || [] : [],
        idsTable: settings.linkedDevice !== undefined ? settings.linkedDevice.final || [] : [],
        cntr: settings.linkedDevice_counter !== undefined ? settings.linkedDevice_counter || 0 : 0,
    };
    data.devices = {
        name: 'devices',
        idHTML: 'devicesID',
        ids: settings.devices !== undefined ? settings.devices.id || [] : [],
        idsTable: settings.devices !== undefined ? settings.devices.final || [] : [],
        cntr: settings.devices_counter !== undefined ? settings.devices_counter || 0 : 0,
    };
    data.alexa = {
        name: 'alexa',
        idHTML: 'alexaID',
        ids: settings.alexa !== undefined ? settings.alexa.id || [] : [],
        cntr: settings.alexa_counter !== undefined ? settings.alexa_counter || 0 : 0,
    };
    data.sayit = {
        name: 'sayit',
        idHTML: 'sayitID',
        ids: settings.sayit !== undefined ? settings.sayit.id || [] : [],
        cntr: settings.sayit_counter !== undefined ? settings.sayit_counter || 0 : 0,
    };
    data.whatsapp = {
        name: 'whatsapp',
        idHTML: 'whatsappID',
        ids: settings.whatsapp !== undefined ? settings.whatsapp.id || [] : [],
        cntr: settings.whatsapp_counter !== undefined ? settings.whatsapp_counter || 0 : 0,

    };
    data.telegram = {
        name: 'telegram',
        idHTML: 'telegramID',
        ids: settings.telegram !== undefined ? settings.telegram.id || [] : [],
        cntr: settings.telegram_counter !== undefined ? settings.telegram_counter || 0 : 0,
    };
    data.pushover = {
        name: 'pushover',
        idHTML: 'pushoverID',
        ids: settings.pushover !== undefined ? settings.pushover.id || [] : [],
        cntr: settings.pushover_counter !== undefined ? settings.pushover_counter || 0 : 0,
    };
    data.email = {
        name: 'email',
        idHTML: 'emailID',
        ids: settings.email !== undefined ? settings.email.id || [] : [],
        cntr: settings.email_counter !== undefined ? settings.email_counter || 0 : 0,
    };
    data.custom = {
        name: 'custom',
        idHTML: 'customID',
        ids: settings.custom !== undefined ? settings.custom.id || [] : [],
        cntr: settings.custom_counter !== undefined ? settings.custom_counter || 0 : 0,
    };
    data.default = {
        name: 'default',
        idHTML: 'defaultID',
        ids: settings.default !== undefined ? settings.default.id || [] : [],
        cntr: settings.default_counter !== undefined ? settings.default_counter || 0 : 0,
    };
    // data.alert = {
    //     name: 'alert',
    //     idHTML: 'alertID',
    //     ids: settings.freqAlert !== undefined ? settings.freqAlert.id || [] : [],
    //     cntr: settings.alert_counter !== undefined ? settings.alert_counter || 0 : 0,
    // };
    // data.presence = {
    //     name: 'presence',
    //     idHTML: 'presenceID',
    //     ids: settings.presence !== undefined ? settings.presence.id || [] : [],
    //     cntr: settings.presence_counter !== undefined ? settings.presence_counter || 0 : 0,
    // };
    data.status = {
        name: 'status',
        idHTML: 'statusID',
        ids: settings.status !== undefined ? settings.status.id || [] : [],
        cntr: settings.status_counter !== undefined ? settings.status_counter || 0 : 0,
    };
    data.signal = {
        name: 'signal',
        idHTML: 'signalID',
        ids: settings.signal !== undefined ? settings.signal.id || [] : [],
        cntr: settings.signal_counter !== undefined ? settings.signal_counter || 0 : 0,
    };
    data.matrix = {
        name: 'matrix',
        idHTML: 'matrixID',
        ids: settings.matrix !== undefined ? settings.matrix.id || [] : [],
        cntr: settings.matrix_counter !== undefined ? settings.matrix_counter || 0 : 0,
    };

    return data;
};

// Hier werden alle benoetigten Daten fuer den dynamic Table (linked-devices) zusammengebaut und return gegeben
async function dataCurDevice(curDevice, checked, devices, deviceId, i) {
    let data = [{
            type: 'checkbox',
            name: "enabled",
            value: curDevice.enabled,
            disable: false
        },
        {
            type: 'label',
            name: "name",
            value: curDevice.name,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.alexa,
            name: "alexa",
            value: curDevice.alexa,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.sayit,
            name: "sayit",
            value: curDevice.sayit,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.telegram,
            name: "telegram",
            value: curDevice.telegram,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.whatsapp,
            name: "whatsapp",
            value: curDevice.whatsapp,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.pushover,
            name: "pushover",
            value: curDevice.pushover,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.signal,
            name: "signal",
            value: curDevice.signal,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.email,
            name: "email",
            value: curDevice.email,
            disable: false
        },
        {
            type: 'multiple',
            data: checked.matrix,
            name: "matrix",
            value: curDevice.matrix,
            disable: false
        },
        {
            type: 'checkbox',
            name: "autoOff",
            value: curDevice.autoOff,
            disable: devices[i].autoOff
        },
        {
            type: 'timer',
            name: "timer",
            value: parseInt(curDevice.timer),
            disable: devices[i].autoOff
        },
        {
            type: 'checkbox',
            name: "abort",
            value: curDevice.abort,
            disable: false
        },
        {
            type: 'id',
            name: "id",
            value: parseInt(deviceId),
            disable: false
        }
    ];
    return data;
}