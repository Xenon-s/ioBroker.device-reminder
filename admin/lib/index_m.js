let headerOpened = ``;
let lastHeaderOpened = '';
let dataGlobal = {}; // alle native Daten aus "settings" werden hier gespeichert

let cntrRow = {}; // Zaehler fuer Tabellenzeilen 

// This will be called by the admin adapter when the settings page loads
async function load(settings, onChange) {

    $('.btn-save, .btn-save-close').css("display", "none");

    if (!settings) return;
    let namespace = `${adapter}.${instance}`;
    // instance alive?
    socket.emit('getState', `system.adapter.${namespace}.alive`, async(err, state) => {
        // try {
        const active = (state && state.val);
        if (!active) {
            $(`#gui`).html(`<div class="collapsible-header red lighten-1"><i class="large material-icons">error_outline</i>Please activate the device-reminder.${instance} instance!</div>`);
        } else {

            // create GUI
            createData(settings) // Settings aus der Konfig holen
                .then(async data => {
                    await createGUI(dataTable, data, onChange); // html der GUI erstellen (inklusive Tabellen)
                    return data;
                }).then(async data => {
                    const result = await staticTable(data, settings, onChange); // Inhalt der staticTable (values2table) erstellen
                    return { result, data };
                }).then(async(data) => {
                    await dynamicTable(data.data, onChange);
                })
                // .catch(error => {
                //     console.error(`Error while creating GUI: ${error}`);
                // })
                .finally(() => {
                    // console.info('finally');;
                    $('.collapsible').collapsible();
                    $('.modal').modal();
                    $('.timepicker').timepicker();
                    $('.select').formSelect();
                    showBtns('.btn-save, .btn-save-close, .footer', false, onChange);

                    for (const name of Object.keys(dataTable)) { // tabellenattribute setzen
                        setTableParam(settings, name, onChange);
                    };
                });
            // };
        };

        // } catch (e) {
        //     console.error(e)
        // };
    });
};

// createGUI
async function createGUI(tableHead, settings, onChange) {

    let html = "";

    html += `<!-- Header -->
    <div id="header-area" class="row">
        <div id="header-logo-title" class="col s6">
            <img class="logo" src="icon.png"> <!-- Adapter Logo -->
            <p>
                <span class="translate h-title" data-lang="device-reminder">${_("device-reminder")}</span><br />
                <span class="translate h-sub-title" data-lang="Monitoring of devices based on consumption">${_("Monitoring of devices based on consumption")}</span>
            </p>
        </div>
    </div>
    <!-- Tabs -->
    <div class="col s12" id="tab-area">
    <!-- Tab Area -->
    </div>
    <!-- Tab Config -->
    <div class="col s12">
        <p></p>
    </div>
    <div id="tab-config" class="col s12 page">
    <!-- JS Loop -->
    <!-- collapsible table -->
    <ul class="collapsible popout">
    `

    for (const i of Object.keys(tableHead)) {

        const key = i; // Objekt key
        const data = tableHead[i]; // Daten des Tables
        const classHead = data.head.class; // Class des Headers
        const name = tableHead[i].head.name; // Bezeichnung des Table Inhaltes (Alexa, Devices, etc...)
        const tableClass = tableHead[i].table.class; // Class des Tables

        // table head
        if (name !== "header-linked-devices") {

            html += `
                <li>
                    <!-- Header Collapsible -->
                    <div id="header-${key}" class="${classHead}"
                        onclick="selectedHeader('header-${key}')">
                        <div class="collapsible-header blue lighten-2 tabs translate">
                            <i class="material-icons">create</i>
                            <span>${_(name)}</span>
                        </div>
                    </div>
                    <!-- Header Collapsible End-->
                    <!-- Body Collapsible -->
                    <div class="collapsible-body" id="${key}ID">
                        <div class="col s12">
                            <p></p>
                        </div>
                        <div class="row">
                            <div style="display: flex; align-items: center;">`

            // if (name !== "linked-devices") { // linked-devices benötigt keinen add button und keine Preufung
            if (tableHead[i].table.addbtn) {

                html += `<!-- Add btn -->
                            <div>
                                <a id="btn-add-${key}"
                                    class="btn-floating waves-effect waves-light blue table-button-add">
                                    <i class="material-icons">add_circle_outline</i></a>
                                <span class="translate" style="font-weight:bold;" data-lang="add">${_("add")}</span>
                                <a id="btn-check-${key}" class="waves-effect waves-light btn translate"
                                data-lang="check">${_("check")}</a>
                            </div>
                            <!-- Add btn End-->
                            <!-- Input Check -->
                            <div class="col left s2">
                            <!-- Help btn -->
                            <a class="waves-effect waves-light btn modal-trigger translate" href="#modal-${key}"
                                data-lang="help">${_("help")}</a>
                            <!-- Help btn End-->
                            </div>`
            };
            html += `
                        <!-- Modal Structure Help-->
                        <div id="modal-${key}" class="modal">
                            <div id="help-${key}" class="modal-content translate">
                                <div>
                                    <div>
                                        <h4>create ${_(name)}</h4>
                                        <!-- <p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README.md#${name}" target="_blank">${name} english</a></p>
                                        <p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README_GER.md#${name}" target="_blank">${name} deutsch</a></p> -->
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <a href="#!" class="translate modal-close waves-effect waves-green btn-flat"
                                        data-lang="close">${_("close")}</a>
                                </div>
                            </div>
                        </div>
                        <!-- Modal Structure Help End -->
                    </div>
                </div>
                <!-- Table -->
                <div class="col s12">
                    <p></p>
                </div>
                <table id="table-${key}" class="${tableClass}">
                <thead>
                <tr>`

            for (const j of Object.keys(data.table.th)) {

                const th = data.table.th[j]; // Inhalt des gesamten Table Head

                html += `<th class="${th.class}">${_(th.dataLang)}</th></th>`
            };

            html += `</tr></thead>`

            // Table Body erstellen

            html += `<!-- Table head End -->
                        <tbody id="${key}-body" class="table-lines"></tbody>
                        <!-- Table End -->
                        </table>
                    </div>
                </li>
                <!-- Body Collapsible End-->`
        };
    };
    html += `</ul>
    </div>
    <!-- Tab Config End-->`;

    $(`#gui`).html(html)

    return true;

};

async function dynamicTable(settings, onChange) {

    for (const i of Object.keys(settings)) {
        if (settings[i].ids.length > 0) {
            for (const j of Object.keys(settings[i].ids)) {};
        };
    };

    let curDevice = null;
    const settingsTable = settings.linkedDevices.idsTable;
    let inputTable = {}; // Daten aus den einzelnen tables für den linkedDevice table

    for (const i of Object.keys(settings)) {
        const name = i;
        inputTable[name] = settings[i].ids
        showHeader('linkedDevicesID', name, settings[i].ids)
    };

    const devices = inputTable.measuringDevice;

    $('#linkedDevicesID .table-lines').html("");

    for (const i in devices) {

        curDevice = null;

        let data = [];
        const ID = devices[i].name;
        let deviceId = devices[i].id;

        const resultCurDevice = await createCurDevice();

        if (resultCurDevice == null || resultCurDevice == undefined) {
            curDevice = {
                enabled: true,
                name: devices[i].name,
                alexa: -1,
                sayit: -1,
                whatsapp: -1,
                telegram: -1,
                pushover: -1,
                email: -1,
                autoOff: false,
                timer: 0,
                abort: false,
                id: -1
            };
        } else {
            curDevice = resultCurDevice;
        };

        async function createCurDevice() {
            let objTemp = null;
            for (const j in settingsTable) {
                if (settingsTable[j].deviceName == ID || settingsTable[j].name == ID) { // in Version 1.1 hat sich der ".deviceName" in ".name" geaendert!
                    objTemp = settingsTable[j];
                };
            };
            return objTemp;
        };

        // data fuer dynamic table erstellen
        data = [
            { type: 'checkbox', name: "enabled", value: curDevice.enabled },
            { type: 'label', name: "name", value: curDevice.name },
            { type: 'multiple', data: inputTable.alexa, name: "alexa", value: curDevice.alexa },
            { type: 'multiple', data: inputTable.sayit, name: "sayit", value: curDevice.sayit },
            { type: 'multiple', data: inputTable.telegram, name: "telegram", value: curDevice.telegram },
            { type: 'multiple', data: inputTable.whatsapp, name: "whatsapp", value: curDevice.whatsapp },
            { type: 'multiple', data: inputTable.pushover, name: "pushover", value: curDevice.pushover },
            { type: 'multiple', data: inputTable.email, name: "email", value: curDevice.email },
            { type: 'checkbox', name: "autoOff", value: curDevice.autoOff },
            { type: 'timer', name: "timer", value: parseInt(curDevice.timer) },
            { type: 'checkbox', name: "abort", value: curDevice.abort },
            { type: 'id', name: "id", value: parseInt(deviceId) }
        ];

        let col = "<tr>";
        for (const j in data) {
            if (data[j].data == undefined || data[j].data.length > 0) {
                let style = 'style="text-align:center;"';
                if (data[j].name == "name") {
                    style = 'style="font-weight:bold; text-align:center;"';
                };
                col += `<td data-type=${data[j].type} data-name="${data[j].name}" ${style}>`;
                switch (data[j].type) {
                    case 'checkbox':
                        let checked = '';
                        if (data[j].value == true || data[j].value == 'on') {
                            checked = 'checked="checked"';
                        }
                        col += `<label><input type="checkbox" class="values-input filled-in" ${checked} data-old-value="${data[j].value}"><span></span></label>`;
                        break;
                    case 'label':
                        col += `<span class="values-input" data-old-value="${data[j].value}">${data[j].value}</span>`;
                        break;
                    case 'multiple':
                        if (data[j].data != undefined && data[j].data.length > 0) {
                            col += `<select multiple class="values-input" data-old-value="${data[j].value}">`;
                            data[j].data.forEach(name => {
                                let checked = '';
                                if ($.inArray(name, data[j].value))
                                    checked = 'selected';
                                col += `<option ${checked} value='${name.id}'>${name.name}</option>`
                            });
                            col += `</select>`;
                        };
                        break;
                    case 'timer':
                        col += `<input type="number" min="0" class="values-input" data-old-value="${data[j].value}" style="text-align:center">`;
                        break;
                    case 'id':
                        col += `<span class="values-input" data-old-value="${data[j].value}">${data[j].value}</span>`;
                        break;
                    default:
                        col += `Test`;
                        break;
                };
                col += `</td>`;
            };
        };

        col += "</tr>";
        $('#linkedDevicesID .table-lines').append(col);

        // vom User gesetzte "multiple options" in der Tabelle anzeigen
        $('#linkedDevicesID .table-lines').children().eq(i).children().each(function() {
            if ($(this).data('type') == 'multiple') {
                $(this).find('select').val(curDevice[$(this).data('name')]);
            } else {
                $(this).find('input').val(curDevice[$(this).data('name')]);
            };
        });

        // trigger im dynamic table setzen
        $('#linkedDevicesID .table-lines').find('.values-input').on('change', function() {
            showBtns('.btn-save, .btn-save-close, .footer', true, onChange);
        });
    };

    if (curDevice != null) {
        const selectInstance = M.FormSelect.getInstance($('select'));
        instances = M.FormSelect.init($('select'));
        M.updateTextFields();
    };

    if (M) M.updateTextFields();
    dataGlobal = settings;
};

// create table input
function staticTable(data, settings, onChange) {

    // console.info(data)
    // console.info(settings)


    let strNames = '';
    for (const i in data) {
        const name = data[i].name;

        // values2table(data[i].idHTML, data[i].ids, onChange); // create table
        $('#table-default').find('td:first-child .values-input').prop('disabled', true); // disable "name" in table default-types

        // create click event "disable save button"
        const btnSave = `#btn-check-${name}`;
        showBtns(btnSave, false, onChange); // save buttons deaktivieren bis events auf "add button" erkannt
        $(btnSave).on('click', async() => {

            btnPressed(settings, onChange);
            showBtns(btnSave, false, onChange);
        });

        // create click event "add button"
        const btnAdd = `#btn-add-${name}`;
        $(btnAdd).on('click', async() => {

            dynamicTableNew(name, settings, onChange);

            showBtns(btnSave, true, onChange);
            setTableParam(settings, name, onChange);
            showBtns('.btn-save, .btn-save-close, .footer', false, onChange);
        });

        // create event "change" on table
        const eventID = `#${data[i].idHTML}`;
        if (eventID !== '#linkedDevicesID' && eventID !== '#statusID') {
            $(eventID).on('change keyup', () => {
                showBtns(`#btn-check-${name}`, true, onChange);
                // $(`#err-${name}`).html(`<div style="display: flex; align-items: center; color: red;"><span style="font-weight:bold;">${_("Pls check input")}</span></div>`);
                showBtns('.btn-save, .btn-save-close, .footer', false, onChange);
            });
        } else {
            $('#statusID').find('.table-lines .values-input').on('change', () => {
                showBtns('.btn-save, .btn-save-close, .footer', true, onChange);
            });
        };
    };

    // trigger im "default table" setzen
    // default hat keinen "add button" 
    $('#defaultTypeID').find('.values-input').on('change', () => { // default hat keinen "add button"
        $('#btn-check-default').removeClass('disabled');
    });

    $('#disableFirstField').find('td:first-child .values-input').prop('disabled', true); // disable "name" in table default-types
};

function setTableParam(settings, /**@type{string}*/ name, onChange) {

    // console.info('setTableParam')
    // console.info(name)
    // attribute setzen
    setTimeout(() => {

        // zusatz klassen setzen
        $(`#table-${name} .table-lines .red`).on('click', async() => { // Wenn Zeile geloescht wird, muss "linkedDevices" neu erstellt werden
            setTimeout(async() => {
                // setTableParam(settings, name, onChange); // Klick Event neu setzen, wenn Zeile geloescht wurde
                btnPressed(settings, onChange); // Daten neu auslesen und in 'linkedDevices' schreiben
            }, 100);
        });

        // Min / Max setzen
        // $(`#table-${name} .table-lines [data-name="volume"]`).attr('min', 0).attr('max', 100); // Eingabe Volume 0 - 100
        // $(`#table-${name} .table-lines [data-name="inst"]`).attr('min', 0); // Intanz mind 0

        // Attribute aendern
        $(`#table-${name} .table-lines [data-name="activeFrom"]`).attr('class', 'timepicker');
        $(`#table-${name} .table-lines [data-name="activeUntil"]`).attr('class', 'timepicker');

        $('.timepicker').timepicker({ "twelveHour": false });

    }, 200);
};

// Select ID
function selectOID(data) {
    const nameData = $(data).data('name');
    const index = $(data).data('index');
    const $input = $('.values-input[data-name="' + nameData + '"][data-index="' + index + '"]');
    const val = $input.val() || '';
    showSelectIdDialog(val, function(newValue, oldValue) {
        if (newValue !== oldValue) {
            $input.val(newValue).trigger('change');
        }
    });
    // });
}


// 
async function btnPressed(settings, onChange) {
    const data = await createSettings(await createData(settings));
    dynamicTable(data, onChange);
    showBtns('.btn-save, .btn-save-close, .footer', true, onChange);
    dataGlobal = data;
};

// create click event "delete device (delete button)"
function clickEventDelBtn(settings, onChange) {

    if (headerOpened !== ``) { // Abfrage welcher button geklickt wurde
        clearTimeout;
        setTimeout(() => {
            btnPressed(settings, onChange)
            showBtns('.btn-save, .btn-save-close, .footer', true, onChange);
            if (dataGlobal.devices !== undefined && dataGlobal.devices.ids.length >= 1) {
                showBtns('.dynamic-table-devices, .btn-save, .btn-save-close', true, onChange);
            } else {
                showBtns('.dynamic-table-devices', false, onChange);
            };
        }, 100);
    };
};

function showBtns( /**@type {string}*/ id, /**@type {boolean}*/ cmd, onChange) {
    if (cmd) {
        $(id).fadeIn(); // einblenden
    } else {
        $(id).fadeOut(); // ausblenden
    };
    onChange(cmd);
};

// Collapsible Header oeffnen / schliessen
function selectedHeader( /**@type {string}*/ id) {

    if (headerOpened === ``) {
        headerOpened = id;
        $(`#${id}`).addClass('collapsible-active');
        $(`#${id}`).removeClass('collapsible-inactive');
    } else {
        headerOpened = headerOpened === id ? `` : id;
        if (lastHeaderOpened !== id) {
            $(`#${lastHeaderOpened}`).addClass('collapsible-inactive');
            $(`#${lastHeaderOpened}`).removeClass('collapsible-active');
            $(`#${id}`).addClass('collapsible-active');
            $(`#${id}`).removeClass('collapsible-inactive');
        } else {
            $(`#${id}`).addClass('collapsible-inactive');
            $(`#${id}`).removeClass('collapsible-active');
        };
    };

    lastHeaderOpened = id;
};

// Header im "linkedDevices table" anzeigen, wenn Daten vorhanden (zb. alexa)
function showHeader( /**@type {string}*/ tblId, /**@type {string}*/ columnName, arr) {
    // console.info('#' + tblId + ' [data-name="' + columnName + '"]')
    if (columnName !== undefined) {
        if (arr.length > 0 && columnName !== undefined) {
            $('#' + tblId + ' [data-name="' + columnName + '"]').css('display', 'table-cell');
        } else {
            $('#' + tblId + ' [data-name="' + columnName + '"]').css('display', 'none');
        };
    };
};

// Daten ins native schreiben
async function save(callback) {

    const actData = await createSettings(dataGlobal, 'save'); // aktuelle settings holen

    const cntr = await saveCntr(actData); // counter fuer save obj erstellen

    const result = await loopArr(cntr) // devices, messenger, etc "final" erstellen

    let resultTemp = result

    const finalObj = resultTemp; // fertiges objekt fuer native settings

    async function saveCntr(actData) {
        // counter in die native schreiben
        let objTemp = actData;
        for (const name in actData) {
            const cntrName = `${name}_counter`
            objTemp[cntrName] = actData[name].cntr;
        };
        return objTemp;
    };

    async function loopArr(objCntr) {
        let objTemp = objCntr;
        for (const i in dataGlobal) {
            const id = dataGlobal[i].name;
            objTemp[id] = {
                id: dataGlobal[i].ids,
                final: await createArray(dataGlobal[i]),
            };
        };
        return objTemp;
    };

    function createArray(obj) {

        const name = obj.name;

        let objTemp = {};
        for (const i in obj.ids) {
            if (i !== undefined) {
                const data = obj.ids[i];
                if (name === 'measuringDevice') { // ????
                    const dataTable = obj.idsTable[i]; // devices hat zwei daten arrays

                    // prüfen ob data in dataTable vorhanden ist
                    // und finales 'device' objekt erstellen
                    if (data.id == dataTable.id) {
                        objTemp[data.id] = {
                            name: data.name,
                            type: data.type,
                            pathConsumption: data.consumption,
                            pathSwitch: data.switch,
                            startText: data.startText,
                            endText: data.endText,
                            runtimeMax: data.runtimeMax,
                            enabled: dataTable.enabled,

                            alexa: dataTable.alexa,
                            sayit: dataTable.sayit,
                            whatsapp: dataTable.whatsapp,
                            telegram: dataTable.telegram,
                            pushover: dataTable.pushover,
                            email: dataTable.email,
                            timer: dataTable.timer,

                            autoOff: dataTable.autoOff,
                            abort: dataTable.abort,
                            id: dataTable.id
                        };
                    };
                };

                if (name === "alexa" || name === "sayit") {
                    timeMin = "";
                    timeMax = "";
                    let timeMinHourTemp = ``;
                    let timeMinMinTemp = ``;
                    let timeMaxHourTemp = ``;
                    let timeMaxMinTemp = ``;
                    if (data.timeMinHour !== `` && data.timeMinMin !== `` && data.timeMaxHour !== `` && data.timeMaxMin !== ``) {
                        timeMinHourTemp = data.timeMinHour;
                        timeMinMinTemp = data.timeMinMin;
                        timeMaxHourTemp = data.timeMaxHour;
                        timeMaxMinTemp = data.timeMaxMin;
                        timeMin = `${timeMinHourTemp}:${timeMinMinTemp}`;
                        timeMax = `${timeMaxHourTemp}:${timeMaxMinTemp}`;
                    };
                    if (data.volume < 0 || data.volume > 100 || data.volume === undefined || data.volume === '') {
                        data.volume = 50;
                    };
                };

                switch (name) {
                    case "alexa":
                        {
                            objTemp[data.id] = {
                                name: data.name,
                                path: data.path,
                                volume: data.volume,
                                timeMin: timeMin,
                                timeMax: timeMax
                            };
                            break;
                        };
                    case "sayit":
                        {
                            objTemp[data.id] = {
                                name: data.name,
                                path: data.path,
                                timeMin: timeMin,
                                timeMax: timeMax,
                                volume: data.volume
                            };
                            break;
                        };
                    case "whatsapp":
                        {
                            objTemp[data.id] = {
                                name: data.name,
                                path: `whatsapp-cmb${data.inst}.sendMessage`,
                            };
                            break;
                        };
                    case "typeID":
                        {
                            objTemp[data.id] = {
                                name: data.name,
                                startVal: data.startVal,
                                endVal: data.endVal,
                                startCount: data.startCount,
                                endCount: data.endCount
                            };
                            break;
                        };
                    case "telegram":
                        {
                            objTemp[data.id] = {
                                name: data.nameFinal,
                                inst: data.inst
                            };
                            break;
                        };
                    case "pushover":
                        {
                            objTemp[data.id] = {
                                name: data.name,
                                inst: data.inst,
                                prio: data.prio,
                                sound: data.sound,
                            };
                            if (objTemp[data.id].prio == 'high') {
                                objTemp[data.id].prio = 1;
                            } else if (objTemp[data.id].prio == 'quiet') {
                                objTemp[data.id].prio = -1;
                            } else {
                                delete objTemp[data.id].prio;
                            };
                            break;
                        };
                    case "email":
                        {
                            objTemp[data.id] = {
                                name: data.name,
                                emailFrom: data.emailFrom,
                                emailTo: data.emailTo
                            };
                            break;
                        };
                };
            };
        };
        return objTemp;
    };
    callback(finalObj); // daten in native settings schreiben
};

// settings neu erstellen und an die table schicken
async function createSettings(data, /**@type {string}*/ type) {

    let obj = {};
    obj = data;

    // Daten aus tabellen nur holen, wenn neues device erzeugt wurde
    if (type !== 'save') {

        const result = await getDataFromTable(); // daten für jedes device holen

        for (const name in result) { // jedes device aus der tabelle aktualieren und ID vergeben
            obj[name].ids = await createId(result[name], data[name].cntr, `${name}_counter`, name);
        };

        async function getDataFromTable() { // daten aus tabellen holen
            let objTemp = {};
            for (const i in data) {
                const name = data[i].name;
                const idHTML = data[i].idHTML;

                objTemp[name] = await table2values(idHTML);
            };
            return objTemp;
        };

        function createId(array, counter, counter_name, name) { // jedem device eine ID zuweisen
            for (const i in array) {
                if (array[i].id == "") {
                    array[i].id = counter;
                    counter++;
                };
            };
            obj[name].cntr = counter;
            return array;
        };
    };

    let body = $('#linkedDevicesID .table-lines');
    let devices = [];

    body.children().each(function() { // daten aus dyn. tabelle sichern
        let data = {};
        $(this).children().each(function() {
            let value;
            if ($(this).data('type') == 'multiple') {
                value = $(this).find('select').val();
                $(this).find('select').data('old-value', value);
            } else if ($(this).data('type') == 'label') {
                value = $(this).find('span').text();
            } else if ($(this).data('type') == 'checkbox') {
                value = $(this).find('input').prop('checked');
                $(this).find('input').data('old-value', value);
            } else if ($(this).data('type') == 'id') {
                value = $(this).find('span').text();
            } else {
                value = $(this).find('input').val();
                $(this).find('input').data('old-value', value);
            };
            data[$(this).data('name')] = value;
        });
        devices.push(data); // device daten in array pushen
    });

    obj.linkedDevices.ids = devices; // dynamische daten in devices sichern
    return obj; // settings zurueckgeben
};


async function dynamicTableNew( /**@type{string}*/ id, cmd, onChange) {

    let index = cntrRow[id] !== undefined ? cntrRow[id] || 0 : 0;

    const th = dataTable[id].table.th;

    let html = '';

    html += `<tr data-index"${index}">`

    for (const i of Object.keys(th)) {
        switch (th[i].dataType) {
            case 'text':
                if (th[i].tdClass !== undefined && th[i].tdClass.includes('oid-select')) {
                    html += `<td data-index="${index}">
                    <div style="width: calc(100% - 40px)" >
                        <input data-index="${index}" style="width: calc(100% - 40px)" class="${th[i].tdClass || 'values-input'}" type="text" data-name="${th[i].name}"`
                    if (th[i].disabled !== undefined) {
                        html += `readonly=true`
                    };
                    html += `><a data-index="${index}" id="${id}-${th[i].name}" style="max-width: 30px" class="values-buttons btn-floating btn-small waves-effect waves-light blue oid" data-name="${th[i].name}">
                        <i class="material-icons" data-name="${th[i].name}">edit</i></a>
                    </div>`
                } else {
                    html += `<td data-index="${index}">
                    <div>
                    <input data-index="${index}" class="${th[i].tdClass || 'values-input'}" type="text" data-name="${th[i].name}">
                </div>`
                };
                html += `</td>`
                break;

            case 'number':
                // console.info('number');
                html += `
                <td data-index="${index}">
                    <div>
                        <input data-index="${index}" class="${th[i].tdClass || 'values-input'}" type="number" data-name="${th[i].name}"`
                if (th[i].min !== undefined) {
                    html += `min="${th[i].min}"`
                };
                if (th[i].max !== undefined) {
                    html += `max="${th[i].max}"`
                };
                html += `>
                    </div>
                </td>`
                break;

            case 'select':
                // console.info('select');
                html += `
                <td data-index="${index}">
                    <div class="select-wrapper">
                        <select data-index="${index}" class="values-input" data-name="type">
                            <option value="" disabled selected>Choose your option</option>`
                let cntr = 0;
                for (const j of Object.keys(th[i].dataOptions)) {
                    html += `<option value="${cntr}">${th[i].dataOptions[j]}</option>`
                    cntr++
                }
                html += `</select>
                    </div>
                </td>`
                break;

            case 'delete':
                // console.info('delete');
                html += `
                <td data-index"=${index}" onclick="$(this).closest('tr').remove()">
                    <a data-command="delete" class="values-buttons btn-floating btn-small waves-effect waves-light red">
                    <i class="material-icons">delete</i></a>
                </td>`
                break;

            case 'hidden':
                html += `
                <td data-index"=${index}">
                    <div class="input-field" style="text-align: center">
                        <input data-index="${index}" class="${th[i].tdClass || 'values-input'}" type="text" data-name="id"/>
                    </div>
                </td>`
                break;

            default:
                // console.info(`wrong Input: <${th[i]}>`)
                break;
        }
    };

    html += `</tr>`

    $(`#${id}ID .table-lines`).append(html);

    // select fuer device-type neu initialisieren
    try {
        const selectInstance = M.FormSelect.getInstance($('select'));
        instances = M.FormSelect.init($('select'));
    } catch (error) {

    };

    M.updateTextFields();

    // Select ID (OID)
    $(`.oid`).on('click', function() {
        const nameData = $(this).data('name');
        const index = $(this).data('index');
        const $input = $('.values-input[data-name="' + nameData + '"][data-index="' + index + '"]');
        const val = $input.val() || '';
        console.warn(this)
        showSelectIdDialog(val, function(newValue, oldValue) {
            console.warn(newValue)
            if (newValue !== oldValue) {
                // if ()
                $input.val(newValue).trigger('change');
            }
        });
    });

    index++

    cntrRow[id] = index;

    // let curDevice = null;
    // const settingsTable = settings.linkedDevices.idsTable;
    // let inputTable = {}; // Daten aus den einzelnen tables für den linkedDevice table

    // for (const i of Object.keys(settings)) {
    //     const name = i;
    //     inputTable[name] = settings[i].ids
    //     showHeader('linkedDevicesID', name, settings[i].ids)
    // };

    // const devices = inputTable.measuringDevice;

    // $('#linkedDevicesID .table-lines').html("");

    // for (const i in devices) {

    //     curDevice = null;

    //     let data = [];
    //     const ID = devices[i].name;
    //     let deviceId = devices[i].id;

    //     const resultCurDevice = await createCurDevice();

    //     if (resultCurDevice == null || resultCurDevice == undefined) {
    //         curDevice = {
    //             enabled: true,
    //             name: devices[i].name,
    //             alexa: -1,
    //             sayit: -1,
    //             whatsapp: -1,
    //             telegram: -1,
    //             pushover: -1,
    //             email: -1,
    //             autoOff: false,
    //             timer: 0,
    //             abort: false,
    //             id: -1
    //         };
    //     } else {
    //         curDevice = resultCurDevice;
    //     };

    //     async function createCurDevice() {
    //         let objTemp = null;
    //         for (const j in settingsTable) {
    //             if (settingsTable[j].deviceName == ID || settingsTable[j].name == ID) { // in Version 1.1 hat sich der ".deviceName" in ".name" geaendert!
    //                 objTemp = settingsTable[j];
    //             };
    //         };
    //         return objTemp;
    //     };

    //     // data fuer dynamic table erstellen
    //     data = [
    //         { type: 'checkbox', name: "enabled", value: curDevice.enabled },
    //         { type: 'label', name: "name", value: curDevice.name },
    //         { type: 'multiple', data: inputTable.alexa, name: "alexa", value: curDevice.alexa },
    //         { type: 'multiple', data: inputTable.sayit, name: "sayit", value: curDevice.sayit },
    //         { type: 'multiple', data: inputTable.telegram, name: "telegram", value: curDevice.telegram },
    //         { type: 'multiple', data: inputTable.whatsapp, name: "whatsapp", value: curDevice.whatsapp },
    //         { type: 'multiple', data: inputTable.pushover, name: "pushover", value: curDevice.pushover },
    //         { type: 'multiple', data: inputTable.email, name: "email", value: curDevice.email },
    //         { type: 'checkbox', name: "autoOff", value: curDevice.autoOff },
    //         { type: 'timer', name: "timer", value: parseInt(curDevice.timer) },
    //         { type: 'checkbox', name: "abort", value: curDevice.abort },
    //         { type: 'id', name: "id", value: parseInt(deviceId) }
    //     ];

    //     let col = "<tr>";
    //     for (const j in data) {
    //         if (data[j].data == undefined || data[j].data.length > 0) {
    //             let style = 'style="text-align:center;"';
    //             if (data[j].name == "name") {
    //                 style = 'style="font-weight:bold; text-align:center;"';
    //             };
    //             col += `<td data-type=${data[j].type} data-name="${data[j].name}" ${style}>`;
    //             switch (data[j].type) {
    //                 case 'checkbox':
    //                     let checked = '';
    //                     if (data[j].value == true || data[j].value == 'on') {
    //                         checked = 'checked="checked"';
    //                     }
    //                     col += `<label><input type="checkbox" class="values-input filled-in" ${checked} data-old-value="${data[j].value}"><span></span></label>`;
    //                     break;
    //                 case 'label':
    //                     col += `<span class="values-input" data-old-value="${data[j].value}">${data[j].value}</span>`;
    //                     break;
    //                 case 'multiple':
    //                     if (data[j].data != undefined && data[j].data.length > 0) {
    //                         col += `<select multiple class="values-input" data-old-value="${data[j].value}">`;
    //                         data[j].data.forEach(name => {
    //                             let checked = '';
    //                             if ($.inArray(name, data[j].value))
    //                                 checked = 'selected';
    //                             col += `<option ${checked} value='${name.id}'>${name.name}</option>`
    //                         });
    //                         col += `</select>`;
    //                     };
    //                     break;
    //                 case 'timer':
    //                     col += `<input type="number" min="0" class="values-input" data-old-value="${data[j].value}" style="text-align:center">`;
    //                     break;
    //                 case 'id':
    //                     col += `<span class="values-input" data-old-value="${data[j].value}">${data[j].value}</span>`;
    //                     break;
    //                 default:
    //                     col += `Test`;
    //                     break;
    //             };
    //             col += `</td>`;
    //         };
    //     };

    //     col += "</tr>";
    //     $('#linkedDevicesID .table-lines').append(col);

    //     // vom User gesetzte "multiple options" in der Tabelle anzeigen
    //     $('#linkedDevicesID .table-lines').children().eq(i).children().each(function() {
    //         if ($(this).data('type') == 'multiple') {
    //             $(this).find('select').val(curDevice[$(this).data('name')]);
    //         } else {
    //             $(this).find('input').val(curDevice[$(this).data('name')]);
    //         };
    //     });

    //     // trigger im dynamic table setzen
    //     $('#linkedDevicesID .table-lines').find('.values-input').on('change', function() {
    //         showBtns('.btn-save, .btn-save-close, .footer', true, onChange);
    //     });
    // };

    // if (curDevice != null) {
    //     const selectInstance = M.FormSelect.getInstance($('select'));
    //     instances = M.FormSelect.init($('select'));
    //     M.updateTextFields();
    // };

    // if (M) M.updateTextFields();
    // dataGlobal = settings;
};