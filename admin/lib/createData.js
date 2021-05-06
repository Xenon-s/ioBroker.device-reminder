function createData(settings) {
    let data = {}
    data = {
        devices: {
            name: 'devices',
            idHTML: 'deviceID',
            ids: settings.devices !== undefined ? settings.devices.id || [] : [],
            idsTable: settings.devices !== undefined ? settings.devices.final || [] : [],
            cntr: settings.devices_counter !== undefined ? settings.devices_counter || 0 : 0,
        },
        alexa: {
            name: 'alexa',
            idHTML: 'alexaID',
            ids: settings.alexa !== undefined ? settings.alexa.id || [] : [],
            cntr: settings.alexa_counter !== undefined ? settings.alexa_counter || 0 : 0,
        },
        sayit: {
            name: 'sayit',
            idHTML: 'sayitID',
            ids: settings.sayit !== undefined ? settings.sayit.id || [] : [],
            cntr: settings.sayit_counter !== undefined ? settings.sayit_counter || 0 : 0,
        },
        whatsapp: {
            name: 'whatsapp',
            idHTML: '',
            ids: settings.whatsapp !== undefined ? settings.whatsapp.id || [] : [],
            cntr: 0, // wird automatisiert ausgelesen
        },
        telegram: {
            name: 'telegram',
            idHTML: '',
            ids: settings.telegram !== undefined ? settings.telegram.id || [] : [],
            cntr: 0, // wird automatisiert ausgelesen
        },
        pushover: {
            name: 'pushover',
            idHTML: 'pushoverID',
            ids: settings.pushover !== undefined ? settings.pushover.id || [] : [],
            cntr: settings.pushover_counter !== undefined ? settings.pushover_counter || 0 : 0,
        },
        email: {
            name: 'email',
            idHTML: 'emailID',
            ids: settings.email !== undefined ? settings.email.id || [] : [],
            cntr: settings.email_counter !== undefined ? settings.email_counter || 0 : 0,
        },
        types: {
            name: 'types',
            idHTML: 'typesID',
            ids: settings.types.id !== undefined ? settings.types.id || [] : settings.types,
            cntr: settings.types_counter !== undefined ? settings.types_counter || 0 : 0,
        },
        status: {
            name: 'status',
            idHTML: 'valStates',
            ids: settings.status.id !== undefined ? settings.status.id || [] : settings.status,
            cntr: settings.status_counter !== undefined ? settings.status_counter || 0 : 0,
        },
        presence: {
            name: 'presence',
            idHTML: 'presence',
            ids: settings.presence.id !== undefined ? settings.presence.id || [] : settings.presence,
            cntr: settings.presence_counter !== undefined ? settings.presence_counter || 0 : 0,
        },
        costs: {
            name: 'costs',
            idHTML: 'valCosts',
            ids: settings.costs.id !== undefined ? settings.costs.id || [] : settings.costs,
            cntr: settings.costs_counter !== undefined ? settings.costs_counter || 0 : 0,
        },
    };
    return data;
};