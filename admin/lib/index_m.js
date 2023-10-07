/*
offene Punkte
-> save function noch offen
    -> linkedDevice wird noch nicht richtig zusammen gebaut
*/

// hier wird die komplette GUI des Adapters im Admin erstellt

let headerOpened = ``;
let lastHeaderOpened = '';
let dataGlobal = {}; // alle native Daten aus "settings" werden hier gespeichert
let settingsGlobal;
let onChangeGlobal;
let showSaveBtn;
let deviceTypes = [];
let checkedUserInput = {}; // alle geprueften User Inputs werden hier gespeichert
let dataGlobalNew = {};
// let cntrRow = {}; // Zaehler fuer Tabellenzeilen
let dataTableHead = {};

// This will be called by the admin adapter when the settings page loads
async function load(settings, onChange) {

    if (!settings) return;

    // Pruefen, ob Adapter laeuft, da sonst keine Pruefungen im Backend ausgefuehrt werden koennen
    const namespace = `${adapter}.${instance}`;
    socket.emit('getState', `system.adapter.${namespace}.alive`, async(err, state) => {
        showSaveBtn = onChange;
        settingsGlobal = settings;
        onChangeGlobal = onChange;
        await createGUI(settings, onChange)
        $('.collapsible').collapsible();
        $('.modal').modal();
        $('.timepicker').timepicker();
    });
};

// Hier wird die gesamte GUI gebaut
async function createGUI(settings, onChange) {
    showBtns('.btn-save, .btn-save-close, .footer', true, onChange);
    dataGlobal = await createData(settings);

    /*
    ### Header erstellen ###
    */
    // Table Head erstellen fuer alle Tabellen
    console.info('Daten fuer Table Head abrufen');
    dataTableHead = await createTableHeadData(settings)
    console.info('Daten fuer Table Head erfolgreich erstellt');
    console.info('Table Header erstellen');
    await createTableHeader(dataTableHead);
    console.info('Table Header wurden erstellt');
    // collapsible und modal aktivieren
    $('.collapsible').collapsible();
    $('.modal').modal();

    /*
    ### Table Body erstellen ###
    */
    // Table Body erstellen fuer alle Tabellen
    console.info('Static Table erstellen');
    const resChecked = await staticTable(dataGlobal);
    console.info('Static Table erstellen abgeschlossen');
    console.info('Dynamic Table erstellen');

    await dynamicTable(dataGlobal, resChecked, onChange);
    console.info('Dynamic Table erstellen abgeschlossen');
    onChange(false);

    // create static table
    async function staticTable(data) {

        // Zuerst alle Inhalte außer "measuring Devices" erstellen, sonst koennen keine Inhalte aus anderen Tabellen geholt
        for (const i in data) {
            if (!data[i].name.includes('devices')) await createTable(data, i);
        };

        // trigger im "default table" setzen
        // default hat keinen "add button" 
        $('#defaultTypeID').find('.values-input').on('change', () => { // default hat keinen "add button"
            $('#btn-check-default').removeClass('disabled');
        });

        const checked = await checkInput(data, 'all');
        checkedUserInput = checked;

        await createTable(data, 'devices');

        $('#disableFirstField').find('td:first-child .values-input').prop('disabled', true); // disable "name" in table default-types

        return checked;
    };

    async function createTable(data, i) {

        const name = data[i].name;
        values2table(data[i].idHTML, data[i].ids, onChange); // create table

        // create click event "disable save button"
        const btnSave = `#btn-check-${name}`;
        $(btnSave).on('click', async() => {
            dataGlobal = await btnPressed(settings, i);
        });

        // create click event "add button"
        const btnAdd = `#btn-add-${name}`;
        $(btnAdd).on('click', async() => {
            $(btnSave).fadeIn();
            setTimeout(() => {
                // Attribute aendern
                $(`#${name}ID .table-lines [data-name="activeFrom"]`).attr('class', 'values-input timepicker');
                $(`#${name}ID .table-lines [data-name="activeUntil"]`).attr('class', 'values-input timepicker');
                $('.timepicker').timepicker({ "twelveHour": false });
            }, 200)

            $(`#err-${name}`).html(`<div style="display: flex; align-items: center; color: red;">
                                                <span style="font-weight:bold;">${_("Pls check input")}</span></div>`);
            // $('.btn-save, .btn-save-close').fadeOut();
            // onChange(false);
        });

        // create event "change" on table
        const eventID = `#${data[i].idHTML}`;
        if (eventID !== '#valStates') {
            $(eventID).on('change keyup', () => {
                $(`#btn-check-${name}`).fadeIn();
                $(`#err-${name}`).html(`<div style="display: flex; align-items: center; color: red;">
                                                    <span style="font-weight:bold;">${_("Pls check input")}</span></div>`);
                // $('.btn-save, .btn-save-close').fadeOut();
                // onChange(false);
            });
        } else {
            $('#valStates').find('.values-input').on('change', () => {
                $('.btn-save, .btn-save-close').fadeIn();
                onChange(true);
            });
        };

        return true;
    }

    async function dynamicTable(data, checked, onChange) {
        dataGlobal = await createDynamicTable(data, checked, onChange); // create dynamic table "device"
        if (M) M.updateTextFields();
    };

    async function btnPressed(settings, name) {

        const actData = await createData(settings)
        const data = await createSettings(actData);
        const result = await checkInput(actData, name);
        if (!name.includes('header')) checkedUserInput[actData[name].name] = result[name];

        // Wenn in Custom Types geaendert werden, muss die GUI neu geladen werden, da sonst die neuen Types nicht auftauchen
        if (name.includes('custom')) {
            deviceTypes = [];
            $(`#gui`).html();
            await createGUI(settings, onChange)
            selectedHeader(`header-${name}`, true)
        };

        dynamicTable(actData, checkedUserInput);

        if (checkedUserInput.devices !== undefined && checkedUserInput.devices.length >= 1) {
            $('.dynamic-table-devices').fadeIn();
            $('.btn-save, .btn-save-close').fadeIn();
        };

        if (M) M.updateTextFields();

        return data;
    };
    return true;
};

async function createDynamicTable(settings, checked, onChange) {

    console.warn(settings)

    let curDevice = null;
    // const settingsDevice = settings.linkedDevice.ids;
    const settingsTable = settings.linkedDevice.idsTable;
    const devices = checked.devices;

    // alte Tabelleninhalte loeschen
    $('#link-device-body').html("");

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
                signal: -1,
                email: -1,
                matrix: -1,
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
                if (settingsTable[j].deviceName == ID || settingsTable[j].name == ID) {
                    objTemp = settingsTable[j];
                };
            };
            return objTemp;
        };

        // data fuer dynamic table erstellen
        data = [{
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
                data: checked.pushover,
                name: "signal",
                value: curDevice.pushover,
                disable: false
            },
            {
                type: 'multiple',
                data: checked.email,
                name: "email",
                value: curDevice.email,
                disable: false
            }, {
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
                        let disableCheckbox = '';
                        if (data[j].disable) disableCheckbox = `disabled`;
                        if ((data[j].value == true || data[j].value == 'on') && !data[j].disable) {
                            checked = 'checked="checked"';
                        };
                        col += `<label><input type="checkbox" class="values-input" ${checked} data-old-value="${data[j].value}" ${disableCheckbox}><span></span></label>`;
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
                        let disableTimer = '';
                        if (data[j].disable) {
                            disableTimer = `disabled`;
                        };
                        col += `<input type="number" min="0" class="values-input" data-old-value="${data[j].value}" style="text-align:center" ${disableTimer}>`;
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
        $('#link-device-body').append(col);

        // vom User gesetzte "multiple options" in der Tabelle anzeigen
        $('#link-device-body').children().eq(i).children().each(function() {
            if ($(this).data('type') == 'multiple') {
                $(this).find('select').val(curDevice[$(this).data('name')]);
            } else {
                $(this).find('input').val(curDevice[$(this).data('name')]);
            };
        });

        // trigger im dynamic table setzen
        $('#link-device-body').find('.values-input').on('change', function() {
            $('.btn-save, .btn-save-close').fadeIn();
            onChangeGlobal(true);
        });
    };

    if (curDevice != null) {
        // const selectInstance = M.FormSelect.getInstance($('select'));
        instances = M.FormSelect.init($('select'));
        M.updateTextFields();
    };

    return settings;
};

async function checkInput(data, type) {

    const result = await loop(type);
    return result;

    // user input überprüfen und auf callback warten
    async function deviceCheck(dataSendTo, data, successCallback, errorCallback) {

        const name = dataSendTo.name
        let obj = dataSendTo.obj;
        let arr = {};
        arr = data.ids;

        // Userinput ins Backend schicken und auf Plausibilitaet pruefen
        try {
            sendTo(`device-reminder.${instance}`, name, arr, async result => {
                const res = await result;
                if (res != undefined) {
                    obj.dataChecked = res.checked || [];
                    obj.dataFailed = res.failed || [];
                    if (name === 'default' || name === 'custom') { // device types erstellen
                        for (const i of Object.keys(res.checked)) {
                            deviceTypes.push(`${res.checked[i].name}`);
                        };
                        $(`#deviceTypeID`).attr("data-options", deviceTypes.join(';'));
                    };
                    await checked(obj); // Auswahlfelder erstellen
                    showHeader('link-deviceID', name, res.checked || {}); // erkannte Geraete in "dynamicTable" einblenden
                    successCallback(res.checked);
                };
            });
        } catch (error) {
            errorCallback(error);
        };
    };

    // promise erstellen
    function functionWrapper(dataSendTo, data) {
        return new Promise((resolve, reject) => {
            deviceCheck(dataSendTo, data, (successResponse) => {
                resolve(successResponse);
            }, (errorResponse) => {
                reject(errorResponse);
            });
        });
    };

    async function functionLogic(dataSendTo, data) {
        try {
            const result = await functionWrapper(dataSendTo, data);
            return result;
        } catch (error) {
            console.error("ERROR:" + error);
        };
    };

    async function loop(type) {
        // Daten aus dataSendTo.js holen
        let dataSendTo = await dataCntrlInput();

        // try {
        let result = {};
        let checkData = {};
        if (type !== 'all' && !type.includes('header')) {
            checkData[type] = dataSendTo[type];
        } else {
            checkData = dataSendTo;
        };

        for (const i in checkData) { // check aller inputs 
            const name = checkData[i].name
                // let obj = checkData[i].obj;
                // let arr = data[i].ids;
            if (name == 'status') { // status wird nicht geprüft, da jede Eingabe erlaubt ist [string]
                await checked(checkData[name].obj)
                $('#err-status').css('display', 'none');
            } else {
                result[name] = [];
                result[name] = await functionLogic(checkData[i], data[i]); // daten in der main.js prüfen und return
            };
        };
        return result
            // } catch (error) {
            //     console.error(error);
            // };
    };

    async function checked(obj) {

        if (obj.dataFailed.length > 0) {
            console.warn(obj)
            console.warn(obj.dataFailed)
            console.warn(`#${obj.err}`)
        }


        $(`#${obj.header}`).html(`<div class="collapsible-header translate"><i class="material-icons">create</i><span>${_(obj.name)}</span></div>`);
        if (obj.name !== `device status` && (obj.dataChecked.length <= 0) && (obj.dataFailed.length <= 0)) {
            $(`#${obj.err}`).html(`<div style="display: flex; align-items: center; color: grey;">
                    <i class="material-icons">check_circle_outline</i><span>${_("no entries found")}</span> </div>`);
            // Header innen "config devices"
            // $(`#${obj.header}`).html(`<div class="collapsible-header translate"><i class="material-icons">create</i><span>${_(obj.name)}</span></div>`);

            showSaveBtn(true); // save button einblenden
        } else if (obj.dataFailed.length >= 1) {
            $(`#${obj.err}`).html(`<div style="display: flex; align-items: center; color: red;">
                    <i class="large material-icons">error_outline</i><span><b>${_("invalid input detected")}:</b><br> - ${obj.dataFailed.join('<br> - ')}</span></div>`);
            // Header innen "config devices"
            const text = `${obj.dataFailed.length} error(s) found in `
            $(`#${obj.header}`).html(`<div class="collapsible-header translate"><i class="material-icons">create</i><span>${_("Error(s) found in %s", obj.name)}</span></div>`);
            // Header außen "config devices"
            $(`#header-config`).html(`<div class="collapsible-header translate"><i class="material-icons">create</i><span>${_("Error(s) found in configuration")}</span></div>`);
            $('.btn-save, .btn-save-close').fadeOut();
        } else {
            $(`#${obj.err}`).html(`<div style="display: flex; align-items: center; color: green;">
                    <i class="material-icons">check_circle_outline</i><span class="translate" style="font-weight:bold;">${_("Input checked")}</span></div>`);
            // Header innen "config devices"
            // $(`#${obj.header}`).html(`<div class="collapsible-header"><i class="material-icons">create</i><span>${_(obj.name)}</span></div>`);
        };
        $(`#help-${obj.anchorName}`).html(`<div><h4>create ${obj.name}</h4><p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README.md#${obj.anchorEn}" target="_blank">${obj.anchorEn} english</a></p>
            <p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README_GER.md#${obj.anchorGer}" target="_blank">${obj.anchorGer} deutsch</a></p></div>`);
    };

    return true;
};

// createTableHeader
async function createTableHeader(tableHead) {

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
        const tableClass = tableHead[i].table.class; // Class des Tables

        html += `
                <li>
                    <!-- Header Collapsible -->
                    <div id="header-${key}" class="${classHead}"
                        onclick="selectedHeader('header-${key}')">
                        <div class="collapsible-header tabs translate">
                            <i class="material-icons">create</i>
                            <span>${_(key)}</span>
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
            // Abfrage, ob Add- oder Submit-Button erstellt wird
        if (tableHead[i].table.addbtn || tableHead[i].table.submitbtn) {
            html += `<div>`
        };

        // Abfrage, ob Add-Button erstellt wird
        if (tableHead[i].table.addbtn) {
            html += `
                                <!-- Add btn -->
                                <a id="btn-add-${key}"
                                    class="btn-floating waves-effect waves-light blue table-button-add">
                                    <i class="material-icons">add_circle_outline</i></a>
                                <span class="translate" style="font-weight:bold;" data-lang="add">${_("add")}</span>`
        };

        // Abfrage, ob Submit-Button erstellt wird
        if (tableHead[i].table.submitbtn) {
            html += ` 
                                <p></p>
                                <!-- submit button-->
                                <button id="btn-check-${key}" class="btn waves-effect waves-light" type="submit" name="action" data-lang="check">${_("check")}
                                    <i class="material-icons right">send</i>
                                </button>`
        };

        // Abfrage, ob Add- oder Submit-Button erstellt wird
        if (tableHead[i].table.addbtn || tableHead[i].table.submitbtn) {
            html += `</div>`
        };

        html += `
                                <!-- DIV ERROR USERINPUT -->
                                <div class="col s8" id="err-${key}">
                                <!-- text -->
                                </div>
                                <!-- Add btn End-->
                                <!-- Input Check -->
                            <div class="col left s2">
                                <!-- Help btn -->
                                <a class="waves-effect waves-light btn modal-trigger translate" href="#modal-${key}"
                                data-lang="help">${_("help")}</a>
                                <!-- Help btn End-->
                            </div>`
        html += `
                        <!-- Modal Structure Help-->
                        <div id="modal-${key}" class="modal">
                            <div id="help-${key}" class="modal-content translate">
                                <div>
                                    <div>
                                        <h4>create ${_(key)}</h4>
                                        <!-- <p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README.md#${key}" target="_blank">${key} english</a></p>
                                        <p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README_GER.md#${key}" target="_blank">${key} deutsch</a></p> -->
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
                <table class="${tableClass}">
                <thead>
                <tr>`


        // <th></th> erstellen
        for (const j of Object.keys(data.table.th)) {
            const th = data.table.th[j]; // Inhalt des gesamten Table Head
            if (th.dataName.includes('delete')) {
                html += `<th data-buttons="delete" style="width: 80px;" class="header translate del-Btn" data-lang="delete">Löschen</th>`;
            } else {
                let disable = '';
                if (th.disabled) disable = "disabled";
                html += `<th id="${th.id != undefined ? th.id || '' : ''}" class="${th.class}" data-type="${th.dataType}" data-name="${th.dataName}" data-lang="${th.dataLang}" ${disable} data-options="${th.dataOptions != undefined ? th.dataOptions || "" : ""}" data-default="${th.dataDefault != undefined ? th.dataDefault || "" : ""}">${_(th.dataLang)}</th>`
            };

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
            // }; <_
    };
    html += `</ul>
    </div>
    <!-- Tab Config End-->`;
    $(`#gui`).html(html)

    return true;
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
async function selectedHeader( /**@type {string}*/ id, /**@type {boolean}*/ rebuild) {

    if (rebuild) {
        var instance = M.Collapsible.getInstance($('.collapsible')[0]);
        instance.open(4);
    } else {
        if (headerOpened == ``) {
            headerOpened = id;
            $(`#${id}`).addClass('collapsible-active');
            $(`#${id}`).removeClass('collapsible-inactive');
        } else {
            headerOpened = headerOpened == id ? `` : id;
            if (lastHeaderOpened != id) {
                $(`#${lastHeaderOpened}`).addClass('collapsible-inactive');
                $(`#${lastHeaderOpened}`).removeClass('collapsible-active');
                $(`#${id}`).addClass('collapsible-active');
                $(`#${id}`).removeClass('collapsible-inactive');
            } else {
                $(`#${id}`).addClass('collapsible-inactive');
                $(`#${id}`).removeClass('collapsible-active');
            };
        };
    };

    lastHeaderOpened = id;
};

// Header im "linkedDevices table" anzeigen, wenn Daten vorhanden (zb. alexa)
function showHeader( /**@type {string}*/ tblId, /**@type {Boolean}*/ name, arr) {
    if (arr.length > 0) {
        $(`#_${name}`).removeClass('none');
    } else {
        $(`#_${name}`).addClass('none');
    };
};

// settings neu erstellen und an die table schicken
async function createSettings(data, type) {

    // console.warn(data)

    let obj = {};

    obj = data;

    console.warn(obj)

    // Daten aus tabellen nur holen, wenn neues device erzeugt wurde
    if (type != 'save') {

        const result = await getDataFromTable(data); // daten für jedes device holen
        for (const i of Object.keys(result)) {
            if (result[i].length > 0) {
                const resultCreateId = await createId(result[i], data[i]);
                obj[i].ids = resultCreateId.array
                obj[i].cntr = resultCreateId.counter
            };
        };

        // Daten aus jeder einzelnen Tabelle holen und in Objekt abspeichern
        async function getDataFromTable(data) { // daten aus tabellen holen
            let dataReturn = {};
            for (const i in data) {
                dataReturn[i] = await table2values(data[i].idHTML);
            };
            return dataReturn;
        };

        // jedem einzelnen device pro Tabelle eine eindeutige ID zuweisen
        function createId(array, data) { // jedem device eine ID zuweisen
            /**@type{number}*/
            let counter = data.cntr;
            for (const i in array) {
                if (array[i].id == "" || array[i].id == undefined) {
                    array[i].id = counter;
                    counter++;
                };
            };
            return { array, counter };
        };
    };

    let body = $('#link-deviceID .table-lines');
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

    obj.linkedDevice['ids'] = devices;

    return obj; // settings zurueckgeben
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
            if (!name.includes('linked')) {
                const cntrName = `${name}_counter`
                objTemp[cntrName] = actData[name].cntr;
            };
        };
        return objTemp;
    };

    async function loopArr(objCntr) {
        let objTemp = objCntr;
        for (const i in dataGlobal) {
            if (!i.includes('counter')) {
                const id = dataGlobal[i].name;
                objTemp[id] = {
                    id: dataGlobal[i].ids,
                    final: await createArray(dataGlobal[i]),
                };
            };
        };

        return objTemp;
    };

    function createArray(obj) {

        console.warn(obj)

        const name = obj.name;

        let timeMin = "";
        let timeMax = "";

        let objTemp = {};
        for (const i in obj.ids) {
            if (i != undefined) {
                const data = obj.ids[i];
                if (name.includes('linkedDevice')) { // ????
                    const dataTable = obj.ids[i]; // devices hat zwei daten arrays

                    console.warn(data)
                    console.warn(dataTable)

                    // prüfen ob data in dataTable vorhanden ist
                    // und finales 'device' objekt erstellen
                    if (data.id == dataTable.id) {
                        objTemp[data.id] = {
                            enabled: dataTable.enabled,
                            name: data.name,
                            type: data.type,
                            pathConsumption: data.consumption,
                            pathSwitch: data.switch,
                            startText: data.startText,
                            endText: data.endText,
                            runtimeMax: data.runtimeMax,

                            alexa: dataTable.alexa,
                            sayit: dataTable.sayit,
                            telegram: dataTable.telegram,
                            whatsapp: dataTable.whatsapp,
                            pushover: dataTable.pushover,
                            signal: dataTable.pushover,
                            email: dataTable.email,
                            matrix: dataTable.matrix,
                            timer: dataTable.timer,
                            autoOff: dataTable.autoOff,
                            abort: dataTable.abort,
                            id: dataTable.id
                        };
                    };
                };

                if (name.includes("alexa") || name.includes("sayit")) {

                    timeMin = data.activeFrom;
                    timeMax = data.activeUntil;
                    if (data.volume < 0 || data.volume > 100 || data.volume == undefined || data.volume == '') {
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
                                timeMin: data.activeFrom,
                                timeMax: data.activeUntil
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
                            // console.warn(data)
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
    console.warn(finalObj)
    callback(finalObj); // daten in native settings schreiben
};