const dataSendTo = {
    telegram : {
        name: 'telegram',
        obj: {
            dataChecked: [],
            dataFailed: []
        },
        objType: {
            cmd: 'telegram'
        }
    },
    devices : {
        name: 'devices',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-devices`,
            header: 'header-device',
            name: `'devices'`,
            anchorEn: `create-device`,
            anchorGer: `device-anlegen`,
            anchorName: `device`
        },
        objType: {
            cmd: 'val',
            1: 'name',
            2: 'consumption',
            3: 'switch',
            4: 'consumptionTotal',
            cntr: 4
        }
    },
    alexa : {
        name: 'alexa',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-alexa`,
            header: 'header-alexa',
            name: `'alexa devices'`,
            anchorEn: `create-alexa`,
            anchorGer: `alexa-erstellen`,
            anchorName: `alexa`
        },
        objType: {
            cmd: 'val',
            1: 'name',
            2: 'path',
            cntr: 2
        }
    },
    sayit : {
        name: 'sayit',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-sayit`,
            header: 'header-sayit',
            name: `'sayit devices'`,
            anchorEn: `create-sayit-device`,
            anchorGer: `sayit-device-erstellen`,
            anchorName: `sayit`
        },
        objType: {
            cmd: 'val',
            1: 'name',
            2: 'path',
            cntr: 2
        }
    },
    whatsapp : {
        name: 'whatsapp',
        obj: {
            dataChecked: [],
            dataFailed: []
        },
        objType: {
            cmd: 'whatsapp-cmb'
        }
    },
    pushover : {
        name: 'pushover',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-pushover`,
            header: 'header-pushover',
            name: `'pushover user'`,
            anchorEn: `create-pushover-user`,
            anchorGer: `pushover-user-erstellen`,
            anchorName: `pushover`
        },
        objType: {
            cmd: 'type',
            1: 'name',
            2: 'inst',
            3: 'prio',
            4: 'sound',
            cntr: 4
        }
    },
    email : {
        name: 'email',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-email`,
            header: 'header-email',
            name: `'email user'`,
            anchorEn: `create-email-user`,
            anchorGer: `email-user-erstellen`,
            anchorName: `email`
        },
        objType: {
            cmd: 'email',
            1: 'name',
            2: 'emailFrom',
            3: 'emailTo',
            cntr: 3
        }
    },
    types : {
        name: 'types',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-types`,
            header: 'header-types',
            name: `'types type config'`,
            anchorEn: `types-devices`,
            anchorGer: `types-devices`,
            anchorName: `types-type`
        },
        objType: {
            cmd: 'type',
            1: 'name',
            2: 'startVal',
            3: 'endVal',
            4: 'startCount',
            5: 'endCount',
            cntr: 5
        }
    },
    status : {
        name: 'status',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-status`,
            header: 'header-status',
            name: `'device status'`,
            anchorEn: `custom-states`,
            anchorGer: `eigene-zustaende`,
            anchorName: `custom-status`
        }
    },
    costs : {
        name: 'costs',
        obj: {
            dataChecked: [],
            dataFailed: [],
            err: `err-costs`,
            header: 'header-costs',
            name: `'costs'`,
            anchorEn: `costs`,
            anchorGer: `Kosten`,
            anchorName: `costs`
        }
    }
}

// module.exports = dataSendTo;