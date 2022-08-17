const dataTable = {

    "linkedDevices": {
        "head": {
            "name": "linked devices",
            "id": "header-linked-devices",
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
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "measuringDevice": {
        "head": {
            "name": "measuringDevice",
            "id": "header-measuring-device",
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
                    "dataType": "text",
                    "dataLang": "id"
                },
            }
        }
    },
    "alexa": {
        "head": {
            "name": "alexa",
            "id": "header-alexa",
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
                    "disabled": true,
                },
                "5": {
                    "name": "activeUntil",
                    "class": "header10 translate",
                    "dataType": "text",
                    "dataLang": "active until",
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
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "sayit": {
        "head": {
            "name": "sayit",
            "id": "header-sayit",
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
                    "disabled": true,
                },
                "5": {
                    "name": "activeUntil",
                    "class": "header10 translate",
                    "dataType": "text",
                    "dataLang": "active until",
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
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "telegram": {
        "head": {
            "name": "telegram",
            "id": "header-telegram",
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
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "whatsapp": {
        "head": {
            "name": "whatsapp",
            "id": "header-whatsapp",
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
                    "dataType": "text",
                    "dataLang": "id",

                },
            }
        }
    },
    "pushover": {
        "head": {
            "name": "pushover",
            "id": "header-pushover",
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
                    "name": "inst",
                    "class": "header10 translate",
                    "dataType": "number",
                    "dataLang": "instance",
                    "min": 0,
                },
                "3": {
                    "name": "prio",
                    "class": "header10 translate",
                    "dataType": "select",
                    "dataLang": "priority",
                    "dataOptions": ["normal", "high", "quiet"],
                    "tdClass": "validate values-input select",
                },
                "4": {
                    "name": "sound",
                    "class": "header10 translate",
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
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "email": {
        "head": {
            "name": "email",
            "id": "header-email",
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
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "default": {
        "head": {
            "name": "default type config",
            "id": "header-default-type",
            "class": "translate collapsible-inactive"
        },
        "table": {
            "class": "table-values changeOnChangeEvent remove-last-column",
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
                    "dataLang": "threshold 'start' (watt)",
                    "min": 0,
                },
                "3": {
                    "name": "endVal",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "threshold 'end' (watt)",
                    "min": 0,
                },
                "4": {
                    "name": "standby",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "threshold 'standby' (watt)",
                    "min": 0,
                },
                "5": {
                    "name": "startCount",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "number of 'start' values",
                    "min": 0,
                },
                "6": {
                    "name": "endCount",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "number of 'end' values",
                    "min": 0,
                },
                "7": {
                    "name": "id",
                    "class": "none",
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "custom": {
        "head": {
            "name": "custom type config",
            "id": "header-custom-type",
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
                    "name": "startVal",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "threshold 'start' (watt)",
                    "min": 0,
                },
                "3": {
                    "name": "endVal",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "threshold 'end' (watt)",
                    "min": 0,
                },
                "4": {
                    "name": "standby",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "threshold 'standby' (watt)",
                    "min": 0,
                },
                "5": {
                    "name": "startCount",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "number of 'start' values",
                    "min": 0,
                },
                "6": {
                    "name": "endCount",
                    "class": "header translate",
                    "dataType": "number",
                    "dataLang": "number of 'end' values",
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
                    "dataType": "text",
                    "dataLang": "id",
                },
            }
        }
    },
    "status": {
        "head": {
            "name": "device status",
            "id": "header-device-status",
            "class": "translate collapsible-inactive"
        },
        "table": {
            "class": "table-values changeOnChangeEvent remove-first-column",
            "th": {
                "1": {
                    "name": "id",
                    "class": "none",
                    "dataType": "text",
                    "dataLang": "id",
                },
                "2": {
                    "name": "stateAction",
                    "class": "header translate",
                    "dataType": "text",
                    "dataLang": "status: 'in action'",
                },
                "3": {
                    "name": "stateStandby",
                    "class": "header translate",
                    "dataType": "text",
                    "dataLang": "status: 'standby'",
                },
                "4": {
                    "name": "stateOff",
                    "class": "header translate",
                    "dataType": "text",
                    "dataLang": "status: 'device off'",
                },
            }
        }
    },
};

async function createData(settings) {

    let data = {};
    data.linkedDevices = {
        name: 'linkedDevices',
        idHTML: 'linkedDevicesID',
        ids: settings.linkedDevices !== undefined ? settings.linkedDevices.id || [] : [],
        cntr: settings.linkedDevices_counter !== undefined ? settings.linkedDevices_counter || 0 : 0,
    };
    data.measuringDevice = {
        name: 'measuringDevice',
        idHTML: 'measuringDeviceID',
        ids: settings.measuringDevice !== undefined ? settings.measuringDevice.id || [] : [],
        cntr: settings.measuringDevice_counter !== undefined ? settings.measuringDevice_counter || 0 : 0,
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
        ids: settings.customType !== undefined ? settings.custom.id || [] : [],
        cntr: settings.custom_device_counter !== undefined ? settings.custom_counter || 0 : 0,
    };
    data.default = {
        name: 'default',
        idHTML: 'defaultID',
        ids: settings.default.id !== undefined ? settings.default.id || [] : [],
        cntr: settings.default_counter !== undefined ? settings.default_counter || 0 : 0,
    };

    data.alert = {
        name: 'alert',
        idHTML: 'freqAlert',
        ids: settings.freqAlert !== undefined ? settings.freqAlert.id || [] : [],
        cntr: settings.alert_counter !== undefined ? settings.alert_counter || 0 : 0,
    };
    data.presence = {
        name: 'presence',
        idHTML: 'presence',
        ids: settings.presence !== undefined ? settings.presence.id || [] : [],
        cntr: settings.presence_counter !== undefined ? settings.presence_counter || 0 : 0,
    };
    data.status = {
        name: 'status',
        idHTML: 'statusID',
        ids: settings.status.id !== undefined ? settings.status.id || [] : [],
        cntr: settings.status_counter !== undefined ? settings.status_counter || 0 : 0,
    };

    return data;
};