const arrDP = {
    show: {
        statusDevice: {
            name: `statusDevice`,
            path: `Status`,
            parse: {
                "name": `Status`,
                "type": "string",
                "role": "indicator",
                "read": true,
                "write": false
            }
        },
        consumpLive: {
            name: `consumpLive`,
            path: `live consumption`,
            parse: {
                "name": `live consumption`,
                "type": "number",
                "role": "indicator",
                "unit": "W",
                "read": true,
                "write": false
            }
        },
        runtime: {
            name: `runtime`,
            path: `runtime`,
            parse: {
                "name": `runtime`,
                "type": "string",
                "role": "indicator",
                "read": true,
                "write": false
            }
        },
        runtimeMS: {
            name: `runtimeMS`,
            path: `runtime in ms`,
            parse: {
                "name": `runtime in ms`,
                "type": "number",
                "role": "indicator",
                "read": true,
                "write": false
            }
        },
        lastRuntime: {
            name: `lastRuntime`,
            path: `lastRuntime`,
            parse: {
                "name": `last runtime `,
                "type": "string",
                "role": "indicator",
                "read": true,
                "write": false
            }
        },
        messageDP: {
            name: `messageDP`,
            path: `messageDP`,
            parse: {
                "name": `messageDP`,
                "type": "string",
                "role": "indicator",
                "read": true,
                "write": false
            }
        },
        averageConsumption: {
            name: `averageConsumption`,
            path: `average consumption`,
            parse: {
                "name": `average consumption`,
                "type": "number",
                "role": "indicator",
                "unit": "W",
                "read": true,
                "write": false
            }
        },
        startTotalConsumption: {
            name: `startTotalConsumption`,
            path: `total consumption at start`,
            parse: {
                "name": `total consumption at start`,
                "type": "number",
                "role": "indicator",
                "unit": "Wh",
                "read": true,
                "write": false
            }
        },
        alertRuntime: {
            name: `alertRuntime`,
            path: `alert runtime`,
            parse: {
                "name": `alert runtime`,
                "type": "boolean",
                "role": "indicator",
                "read": true,
                "write": false
            }
        },
        lastOperations: {
            name: `lastOperations`,
            path: `last operations`,
            parse: {
                "name": `last operations`,
                "type": "json",
                "role": "indicator",
                "read": true,
                "write": false
            }
        },
    },
    config: {
        doNotDisturb: {
            name: `doNotDisturb`,
            path: `do not disturb`,
            parse: {
                "name": `do not disturb`,
                "type": "boolean",
                "role": "indicator",
                "read": true,
                "write": true
            }
        },
        runtimeMax: {
            name: `runtimeMax`,
            path: `runtime max`,
            parse: {
                "name": `runtime max`,
                "type": "number",
                "min": 0,
                "role": "indicator",
                "unit": "min",
                "read": true,
                "write": true
            }
        },
        // autoOffDP: { name: `autoOff`, path: `auto Off`, parse: { "name": `auto Off`, "type": "boolean", "role": "indicator", "read": true, "write": true } }
    }
};

module.exports = arrDP;