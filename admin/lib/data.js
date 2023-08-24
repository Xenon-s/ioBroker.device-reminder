/*
Doku:
Hier stehen alle benoetigten Daten fuer die einzelnen Tabellen drin. Wenn eine neue Tabelle (zb. ein neuer Messenger) hinzugefuegt werden soll,
muss man unter "dataTable" alle Tabellenrelevanten Daten angeben.
In dataTable stehen alle Daten, um die HTML der einzelnen Tabellen erstellen zu koennen. 
*/

async function createTableHeadData(settings) {
    // async function createData(settings) {

    let dataTable = {
        "link-device": {
            "head": {
                "class": "translate collapsible-inactive dynamic-table-devices"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "th": {
                    "0": {
                        "dataName": "enabled",
                        "class": "header translate header10",
                        "dataType": "checkbox",
                        "dataLang": "active",
                    },
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device name",
                        "disabled": true,
                        "data_default": '',
                    },
                    "2": {
                        "dataName": "alexa",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "alexa",
                        "data_default": {},
                    },
                    "3": {
                        "dataName": "sayit",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "sayit",
                        "data_default": {},
                    },
                    "4": {
                        "dataName": "telegram",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "telegram",
                        "data_default": {},
                    },
                    "5": {
                        "dataName": "whatsapp",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "whatsapp",
                        "data_default": {},
                    },
                    "6": {
                        "dataName": "pushover",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "pushover",
                        "data_default": {},
                    },
                    "7": {
                        "dataName": "signal",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "signal",
                        "data_default": {},
                    },
                    "8": {
                        "dataName": "email",
                        "class": "header translate",
                        "dataType": "multiple",
                        "dataLang": "email",
                        "data_default": {},
                    },
                    "9": {
                        "dataName": "autoOff",
                        "class": "header translate header10",
                        "dataType": "select",
                        "dataLang": "switch off",
                        "data_default": "false",
                        "dataOptions": [
                            { "name": "false", "id": false },
                            { "name": "true", "id": true },
                        ]
                    },
                    "10": {
                        "dataName": "timer",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "switch off after minutes",
                        "data_default": 0,
                    },
                    "11": {
                        "dataName": "abort",
                        "class": "header translate header10",
                        "dataType": "select",
                        "dataLang": "abort detection",
                        "data_default": "false",
                        "dataOptions": [
                            { "name": "false", "id": false },
                            { "name": "true", "id": true },
                        ]
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
        "status": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "th": {
                    "1": {
                        "dataName": "stateAction",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "in action",
                    },
                    "2": {
                        "dataName": "stateStandby",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "standby",
                    },
                    "3": {
                        "dataName": "stateOff",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device off",
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
                "addbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new device",
                        "disabled": true,
                    },
                    "2": {
                        "dataName": "startVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold start (watt)",
                        "min": 0,
                        "data_default": 10,
                    },
                    "3": {
                        "dataName": "endVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold end (watt)",
                        "min": 0,
                        "data_default": 1,
                    },
                    "4": {
                        "dataName": "standby",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold standby (watt)",
                        "min": 0,
                        "data_default": 5,
                    },
                    "5": {
                        "dataName": "startCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of start values",
                        "min": 1,
                        "data_default": 1,
                    },
                    "6": {
                        "dataName": "endCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of end values",
                        "min": 1,
                        "data_default": 3,
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
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new device",
                        // "disabled": true,
                    },
                    "2": {
                        "dataName": "startVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold start (watt)",
                        "min": 0,
                        "data_default": 10,
                    },
                    "3": {
                        "dataName": "endVal",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold end (watt)",
                        "min": 0,
                        "data_default": 1,
                    },
                    "4": {
                        "dataName": "standby",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "threshold standby (watt)",
                        "min": 0,
                        "data_default": 5,
                    },
                    "5": {
                        "dataName": "startCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of start values",
                        "min": 1,
                        "data_default": 1,
                    },
                    "6": {
                        "dataName": "endCount",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "number of end values",
                        "min": 1,
                        "data_default": 3,
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
        "device": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device name",
                        "tdClass": "validate values-input",
                    },
                    "2": {
                        "dataName": "type",
                        "class": "header translate select",
                        "dataType": "select",
                        "dataLang": "device type",
                        "tdClass": "validate values-input select",
                    },
                    "3": {
                        "dataName": "consumption",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "consumption",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "4": {
                        "dataName": "switch",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "Power switch",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,

                    },
                    "5": {
                        "dataName": "startText",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "starttext",
                        "tdClass": "validate values-input oid-select",

                    },
                    "6": {
                        "dataName": "endText",
                        "class": "header translate",
                        "tdClass": "validate values-input oid-select",
                        "dataType": "OID",
                        "dataLang": "endtext",

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
        "alexa": {
            "head": {
                "class": "translate collapsible-inactive"
            },
            "table": {
                "class": "table-values changeOnChangeEvent remove-last-column",
                "addbtn": true,
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "tdClass": "validate values-input",
                        "data_default": "new device",
                    },
                    "2": {
                        "dataName": "path",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "'alexa2/../announcement'/'speak'",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "3": {
                        "dataName": "volume",
                        "class": "header10 translate",
                        "dataType": "number",
                        "dataLang": "volume 0-100",
                        "min": 0,
                        "max": 100,
                        "data_default": 25,
                    },
                    "4": {
                        "dataName": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "00:00",
                    },
                    "5": {
                        "dataName": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "23:59",
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
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new device",
                    },
                    "2": {
                        "dataName": "path",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "'sayit/../text'",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
                    },
                    "3": {
                        "dataName": "volume",
                        "class": "header10 translate",
                        "dataType": "number",
                        "dataLang": "volume 0-100",
                        "min": 0,
                        "max": 100,
                        "data_default": 25
                    },
                    "4": {
                        "dataName": "activeFrom",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active from",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "00:00"
                    },
                    "5": {
                        "dataName": "activeUntil",
                        "class": "header10 translate",
                        "dataType": "text",
                        "dataLang": "active until",
                        "tdClass": "validate values-input timepicker",
                        "disabled": true,
                        "data_default": "23:59"
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
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new user"
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "telegram instance",
                        "data_default": ".0",
                        "dataOptions": ".0;.1;.2;.3;.4;.5;.6;.7;.8;.9"
                    },
                    "3": {
                        "dataName": "username",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "username",
                        "data_default": "username"
                    },
                    "4": {
                        "dataName": "Chat ID",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "Chat ID",
                        "data_default": "0123456789"
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
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new user"
                    },
                    "2": {
                        "dataName": "path",
                        "class": "header translate",
                        "dataType": "OID",
                        "dataLang": "'whatsapp-cmb/../sendMessage'",
                        "tdClass": "validate values-input oid-select",
                        "disabled": true,
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
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                        "data_default": "new user"
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "pushover instance",
                        "data_default": ".0",
                        "dataOptions": ".0;.1;.2;.3;.4;.5;.6;.7;.8;.9"
                    },
                    "3": {
                        "dataName": "title",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "title",
                        "data_default": ""
                    },
                    "4": {
                        "dataName": "deviceID",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "device ID",
                        "data_default": ""
                    },
                    "5": {
                        "dataName": "prio",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "priority",
                        "dataOptions": "normal;high;quiet",
                        "tdClass": "validate values-input select",
                    },
                    "6": {
                        "dataName": "sound",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "sound",
                        "dataOptions": "pushover; bike; bugle; cashregister; classical; cosmic; falling; gamelan; incoming; intermission; magic; mechanical; pianobar; siren; spacealarm; tugboat; alien; climb; persistent; echo; updown; none"
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
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "signal instance",
                        "data_default": ".0",
                        "dataOptions": ".0;.1;.2;.3;.4;.5;.6;.7;.8;.9"
                    },
                    "3": {
                        "dataName": "phone",
                        "class": "header translate",
                        "dataType": "number",
                        "dataLang": "phone",
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
                "th": {
                    "1": {
                        "dataName": "name",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
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
                "th": {
                    "1": {
                        "dataName": "matrix",
                        "class": "header translate",
                        "dataType": "text",
                        "dataLang": "name",
                    },
                    "2": {
                        "dataName": "inst",
                        "class": "header translate",
                        "dataType": "select",
                        "dataLang": "matrix instance",
                        "data_default": ".0",
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
            header: 'header-device',
            name: 'devices',
            anchorEn: `create-device`,
            anchorGer: `device-anlegen`,
            anchorName: `device`
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
            dataFailed: []
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
            name: 'device signal',
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
            name: 'device matrix',
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
    data.devices = {
        name: 'devices',
        idHTML: 'deviceID',
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
        cntr: settings.whatsapp !== undefined ? settings.whatsapp || 0 : 0,

    };
    data.telegram = {
        name: 'telegram',
        idHTML: 'telegramID',
        ids: settings.telegram !== undefined ? settings.telegram.id || [] : [],
        cntr: settings.telegram !== undefined ? settings.telegram || 0 : 0,
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
        cntr: settings.custom_device_counter !== undefined ? settings.custom_counter || 0 : 0,
    };
    data.default = {
        name: 'default',
        idHTML: 'defaultID',
        ids: settings.default !== undefined ? settings.default.id || [] : [],
        cntr: settings.default_counter !== undefined ? settings.default_counter || 0 : 0,
    };
    data.alert = {
        name: 'alert',
        idHTML: 'alertID',
        ids: settings.freqAlert !== undefined ? settings.freqAlert.id || [] : [],
        cntr: settings.alert_counter !== undefined ? settings.alert_counter || 0 : 0,
    };
    data.presence = {
        name: 'presence',
        idHTML: 'presenceID',
        ids: settings.presence !== undefined ? settings.presence.id || [] : [],
        cntr: settings.presence_counter !== undefined ? settings.presence_counter || 0 : 0,
    };
    data.status = {
        name: 'status',
        idHTML: 'statusID',
        ids: settings.status !== undefined ? settings.status.id || [] : [],
        cntr: settings.status_counter !== undefined ? settings.status_counter || 0 : 0,
    };
    data.status = {
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