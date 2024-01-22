// @ts-nocheck
/*
offene Punkte
- createData() -> getIds() -> hier werden leere Objekte uebergeben, deswegen koennen die Tabellen nicht aufgebaut werden
*/

// hier wird die komplette GUI des Adapters im Admin erstellt

let headerOpened = ``;
let lastHeaderOpened = '';
let dataGlobal = {}; // Objektinhalt : alle Daten aus der native + tabelleninformationen wie tableID
let tableIds = {}; // Objektinhalt : HTML Informationen fuer die einzelnen Tabellen
let tableContent = {}; // Objektinhalt : Ids + Counter aller Tabellen
let settingsGlobal;
let onChangeGlobal;
let showSaveBtn;
let deviceTypes = [];
let checkedUserInput = {}; // alle geprueften User Inputs werden hier gespeichert
let dataTableHead = {};

// This will be called by the admin adapter when the settings page loads

async function load(settings, onChange) {

    const adapterInstance = `system.adapter.device-reminder.${instance}`;

    if (!settings) return;

    // Pruefen, ob Adapter laeuft, da sonst keine Pruefungen im Backend ausgefuehrt werden koennen
    socket.emit('getState', `${adapterInstance}.alive`, async (err, state) => {
        if (state.val) {
            showSaveBtn = onChange;
            settingsGlobal = settings;
            onChangeGlobal = onChange;
            await createGUI(settingsGlobal, onChange);

            $('.collapsible').collapsible();
            $('.modal').modal();
            $('.timepicker').timepicker({ "twelveHour": false });
            onChange(false);
            // cntrlUserInputNew('test')
        } else {
            $(`#gui`).html(`<div style="background: red"> ERROR: >>>Start device-reminder first! ${adapterInstance} state: ${state.val}<<< </div>`);
        }

    });
};

// Hier wird die gesamte GUI gebaut
async function createGUI(settingsGlobal, onChange) {
    const result = await createData();
    console.warn(result)
    for (const i of Object.keys(result)) {
        tableIds[i] = result[i].data;
        tableContent[i] = result[i].dataIds;
    };

    // DataGlobal mit allen Daten zusammenbauen
    for (const i of Object.keys(result)) {
        dataGlobal[i] = {
            name: result[i].data.name,
            idHTML: result[i].data.idHTML,
            ids: result[i].dataIds.ids,
            cntr: result[i].dataIds.cntr,
        };
    };
    /*
    ### Header erstellen ###
    */
    // Table Head erstellen fuer alle Tabellen
    await createTableHeader(await createTableHeadData(settingsGlobal));
    // collapsible und modal aktivieren
    $('.collapsible').collapsible();
    $('.modal').modal();

    /*
    ### Table Body erstellen ###
    */
    await dynamicTable(await staticTable());

    // create static table
    async function staticTable() {
        // Zuerst alle Inhalte außer "measuring Devices" erstellen, sonst koennen keine Inhalte aus anderen Tabellen geholt
        for (const i in tableIds) {
            if (!i.includes('devices')) await createTable(i, onChange);
        };

        const checked = await checkInput('all');
        checkedUserInput = checked;

        await createTable('devices', onChange);

        return checked;
    };

    // Static Table erstellen
    async function createTable( /**@type {string}*/ i, onChange) {

        const name = tableIds[i].name;

        values2table(tableIds[i].idHTML, tableContent[i].ids, onChange); // create table

        // create click event "disable save button"
        const btnSave = `#btn-check-${name}`;
        $(btnSave).fadeOut();
        $(btnSave).on('click', async () => {
            tableContent = await btnPressed(settingsGlobal, i, onChange);
            $(btnSave).fadeOut();
            createEvent(`#${name}ID`);
        });

        // create click event "add button"
        const btnAdd = `#btn-add-${name}`;
        $(btnAdd).on('click', async () => {
            $(btnSave).fadeIn();
            showBtns('.btn-save, .btn-save-close', false, onChange);
            onChange(false);
            setTimeout(() => {
                setProps(tableIds[name].idHTML, name);
            }, 200)

            $(`#err-${name}`).html(`<div style="display: flex; align-items: center; color: red;"><span style="font-weight:bold;">${_("Pls check input")}</span></div>`);
        });

        // create click-event "test message button"
        const btnTestMessage = `#btn-test-message-${name}`;
        // $(btnTestMessage).fadeOut();
        $(btnTestMessage).on('click', async () => {
            console.warn(btnTestMessage)
            const data = await table2values(tableIds[i].idHTML)

            sendTestMessage(name, data)

            // Funktion, um eine Testnachricht zu versenden
            async function sendTestMessage(name, dataBackend, successCallback, errorCallback) {

                // let dataBackend = data;
                // dataBackend._name = name

                // console.warn(dataBackend)

                // Daten des zu testenden Messengers ins Backend senden
                try {
                    sendTo(`device-reminder.${instance}`, 'test', { ids: dataBackend, name: name }, async result => {
                        const res = await result;
                        if (res != undefined) {
                            successCallback();
                        };
                    });
                } catch (error) {
                    errorCallback(error);
                };
            };

        });


        const createEvent = async eventID => {
            if (eventID !== '#valStates') {
                $(eventID).find('.values-input').off().on('click change', () => {
                    $(`#btn-check-${name}`).fadeIn();
                    $(`#err-${name}`).html(`<div style="display: flex; align-items: center; color: red;"><span style="font-weight:bold;">${_("Pls check input")}</span></div>`);
                    if (!name.includes('linked')) onChange(false); // Hier wird der Speicherbutton deaktiviert. Reaktivierung erst, wenn "Check Button" geklickt und positives Resultat
                    createEvent(eventID);
                });
                $(eventID).find('.red').on('click', () => {
                    $(`#btn-check-${name}`).fadeIn();
                    $(`#err-${name}`).html(`<div style="display: flex; align-items: center; color: red;"><span style="font-weight:bold;">${_("Pls check input")}</span></div>`);
                    if (!name.includes('linked')) onChange(false); // Hier wird der Speicherbutton deaktiviert. Reaktivierung erst, wenn "Check Button" geklickt und positives Resultat
                    createEvent(eventID)
                    // Save Buttons ausblenden
                    showBtns('.btn-save, .btn-save-close', false, onChange);
                });
            } else {
                $('#valStates').find('.values-input').off().on('change', () => {
                    $('.btn-save, .btn-save-close').fadeIn();
                    onChange(true);
                });
            };
        };

        // create event "change" on table
        const eventID = `#${tableIds[i].idHTML}`;
        await createEvent(eventID)

        setProps(tableIds[i].idHTML, i);

        return true;
    };

    async function dynamicTable(checked) {

        createDynamicTable(checked); // create dynamic table "device"

        if (M) M.updateTextFields();

        return true;
    };

    async function btnPressed(settingsGlobal, name, onChange) {

        tableContent = await createSettings();
        const result = await checkInput(name);
        // console.warn(await cntrlUserInputNew(tableContent, name));

        if (!name.includes('header')) checkedUserInput[name] = result[name];

        dynamicTable(checkedUserInput);

        if (checkedUserInput.devices !== undefined && checkedUserInput.devices.length >= 1) {
            $('.dynamic-table-devices').fadeIn();
            $('.btn-save, .btn-save-close').fadeIn();
        };

        // cntrlUserInputNew(tableContent, name)

        if (M) M.updateTextFields();

        return tableContent;
    };

    // create click event "disable save button"
    const forceSaveBtns = `#btn-save-buttons-linked-device`;;
    $(forceSaveBtns).on('click', async () => {
        console.warn(forceSaveBtns)
        $('.btn-save, .btn-save-close').fadeIn();
        onChange(true);
    });

    // Save buttons ausblenden
    showBtns('.btn-save, .btn-save-close', false, onChange);
    return true;
};

async function createDynamicTable(checked) {

    let curDevice = null;
    const settingsTable = tableContent.linkedDevice.ids;
    // const settingsTable = settingsGlobal.linkedDevice.idsTable;
    const devices = checked.devices;

    // alte Tabelleninhalte loeschen
    $('#linked-device-body').html("");

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
                discord: -1,
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

        // data fuer dynamic table holen
        data = await dataCurDevice(curDevice, checked, devices, deviceId, i);

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
        $('#linked-device-body').append(col);

        // vom User gesetzte "multiple options" in der Tabelle anzeigen

        $('#linked-device-body').children().eq(i).children().each(function () {
            if ($(this).data('type') == 'multiple') {
                $(this).find('select').val(curDevice[$(this).data('name')]);
            } else {
                $(this).find('input').val(curDevice[$(this).data('name')]);
            };
        });

        // trigger im dynamic table setzen
        $('#linked-device-body').find('.values-input').off().on('change', function () {
            $('.btn-save, .btn-save-close').fadeIn();
            onChangeGlobal(true);
        });
    };

    if (curDevice != null) {
        const selectInstance = M.FormSelect.getInstance($('select'));
        instances = M.FormSelect.init($('select'));
        M.updateTextFields();
    };

    return true;
};

async function checkInput(type) {

    const result = await loop(type);
    return result;

    // user input überprüfen und auf callback warten
    async function deviceCheck(dataSendTo, successCallback, errorCallback) {

        const name = dataSendTo.name
        let obj = dataSendTo.obj;

        // Userinput ins Backend schicken und auf Plausibilitaet pruefen
        try {
            sendTo(`device-reminder.${instance}`, name, tableContent[name].ids, async result => {
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
                    showHeader('linked-deviceID', name, res.checked || {}); // erkannte Geraete in "dynamicTable" einblenden
                    successCallback(res.checked);
                };
            });
        } catch (error) {
            errorCallback(error);
        };
    };

    // promise erstellen
    function functionWrapper(dataSendTo) {
        return new Promise((resolve, reject) => {
            deviceCheck(dataSendTo, (successResponse) => {
                resolve(successResponse);
            }, (errorResponse) => {
                reject(errorResponse);
            });
        });
    };

    async function functionLogic(dataSendTo) {
        try {
            const result = await functionWrapper(dataSendTo);
            return result;
        } catch (error) {
            console.error("ERROR:" + error);
        };
    };

    async function loop( /**@type {string}*/ type) {
        // Daten aus dataSendTo.js holen
        let dataSendTo = await dataCntrlInput();

        try {
            let result = {};
            let checkData = {};
            if (type !== 'all' && !type.includes('header')) {
                checkData[type] = dataSendTo[type];
            } else {
                checkData = dataSendTo;
            };

            for (const i in checkData) { // check aller inputs 
                const name = checkData[i].name
                if (name == 'status') { // status wird nicht geprüft, da jede Eingabe erlaubt ist [string]
                    await checked(checkData[name].obj)
                    $('#err-status').css('display', 'none');
                } else {
                    result[name] = [];
                    result[name] = await functionLogic(checkData[i],); // daten in der main.js prüfen und return
                };
            };
            return result;
        } catch (error) {
            console.error(error);
        };
    };

    async function checked(obj) {

        $(`#${obj.header}`).html(`<div class="collapsible-header translate"><i class="material-icons">create</i><span>${_(obj.name)}</span></div>`);
        if (obj.name !== `device status` && (obj.dataChecked.length <= 0) && (obj.dataFailed.length <= 0)) {
            $(`#${obj.err}`).html(`<div style="display: flex; align-items: center; color: grey;">
                    <i class="material-icons">check_circle_outline</i><span>${_("no entries found")}</span> </div>`);
            onChangeGlobal(true);
        } else if (obj.dataFailed.length >= 1) {
            $(`#${obj.err}`).html(`<div style="display: flex; align-items: center; color: red;">
                    <i class="large material-icons">error_outline</i><span><b>${_("invalid input detected")}:</b><br> - ${obj.dataFailed.join('<br> - ')}</span></div>`);
            const text = `${obj.dataFailed.length} error(s) found in `
            $(`#${obj.header}`).html(`<div class="collapsible-header translate"><i class="material-icons">create</i><span>${_("Error(s) found in %s", obj.name)}</span></div>`);
            $(`#header-config`).html(`<div class="collapsible-header translate"><i class="material-icons">create</i><span>${_("Error(s) found in configuration")}</span></div>`);
            onChangeGlobal(false);
        } else {
            $(`#${obj.err}`).html(`<div style="display: flex; align-items: center; color: green;">
                    <i class="material-icons">check_circle_outline</i><span class="translate" style="font-weight:bold;">${_("Input checked")}</span></div>`);
            onChangeGlobal(true);
            showBtns('.btn-save, .btn-save-close', true, onChangeGlobal);
        };
        $(`#help-${obj.anchorName}`).html(`<div><h4>create ${obj.name}</h4><p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README.md#${obj.anchorEn}" target="_blank">${obj.anchorEn} english</a></p>
            <p><a href="https://github.com/Xenon-s/ioBroker.device-reminder/blob/master/README_GER.md#${obj.anchorGer}" target="_blank">${obj.anchorGer} deutsch</a></p></div>`);
    };

    return true;
};

// createTableHeader
async function createTableHeader(tableHead) {

    let html = "";

    html += `
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

    <div class="col s12">
    <!-- forceSaveBtns button-->
        <button id="btn-save-buttons-linked-device" class="btn waves-effect waves-light" data-lang="show save buttons">${_("show save buttons")}
            <i class="material-icons left">save</i>
        </button>
    </div>
    <p></p>
    
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
        if (tableHead[i].table.addbtn || tableHead[i].table.submitbtn || tableHead[i].table.testbtn) {
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
                                <button id="btn-check-${key}" class="btn waves-effect waves-light" type="submit" name="action" data-lang="check-input">${_("check-input")}
                                    <i class="material-icons right">send</i>
                                </button>`
        };

        // Abfrage, ob test-message-Button erstellt wird
        if (tableHead[i].table.testMessageBtn) {
            html += ` 
                                        <p></p>
                                        <!-- Config Test button-->
                                        <button id="btn-test-message-${key}" class="btn waves-effect waves-light" type="submit" name="action" data-lang="test-message">${_("test-message")}
                                            <i class="material-icons right">send</i>
                                        </button>`
        };

        // Abfrage, ob Add- oder Submit-Button erstellt wird
        if (tableHead[i].table.addbtn || tableHead[i].table.submitbtn || tableHead[i].table.testbtn) {
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
    </div>
    <!-- Tab Config End-->`;
    $(`#gui`).html(html);

    return true;
};

function showBtns( /**@type {string}*/ id, /**@type {boolean}*/ cmd, onChange) {
    if (cmd) {
        $(id).fadeIn(); // einblenden
    } else {
        $(id).fadeOut(); // ausblenden
        onChange(false);
    };
    onChange(cmd);
};

// settings neu erstellen und an die table schicken
async function createSettings() {

    // Daten aus Tabellen holen und als Objekt abspeichern [IDs aus Tabellen holen und counter anpassen]
    for (const name of Object.keys(tableContent)) {
        if (!name.includes('counter')) tableContent[name].ids = await getDataFromTable(name);
        if (tableContent[name].ids.length > 0) {
            const resultCreateId = await createId(tableContent[name].ids);
            tableContent[name].ids = resultCreateId.array;
            tableContent[name].cntr = resultCreateId.counter;
        };
    };

    // Daten aus jeder einzelnen Tabelle holen und in Objekt abspeichern
    async function getDataFromTable( /**@type{string}*/ name) { // daten aus tabellen holen
        let dataReturn = {};
        // Static Table auslesen
        if (!name.includes('linked')) {
            dataReturn = await table2values(tableIds[name].idHTML);
        } else {
            // Dynamic Table auslesen (linked-device)
            let body = $(`#linked-deviceID .table-lines`);
            let devices = [];
            body.children().each(function () { // daten aus dyn. tabelle sichern
                let data = {};
                $(this).children().each(function () {
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
            dataReturn = devices;
        };
        return dataReturn;
    };
    return tableContent; // settings zurueckgeben
};

// jedem einzelnen device pro Tabelle eine eindeutige ID zuweisen
async function createId(array) { // jedem device eine ID zuweisen
    // Hoechte ID rausfinden
    let arrIds = [];
    for (const i of Object.keys(array)) {
        if (array[i].id != "" || array[i].id !== undefined) {
            if (!arrIds.includes(array[i].id)) {
                arrIds.push(array[i].id);
            } else {
                array[i].id = '';
            };

        };
    };
    arrIds.sort(function (a, b) {
        return a - b;
    });

    /**@type{number}*/
    let counter = arrIds.length > 0 ? arrIds.length || 0 : 0;
    // let counter = arrIds.length > 0 ? arrIds[arrIds.length - 1] || 0 : 0;

    for (const i of Object.keys(array)) {
        if (array[i].id === "" || array[i].id === undefined) {
            array[i].id = `${counter}`;
            counter++;
        };
    };
    return { array, counter };
};

// Daten ins native schreiben

async function save(callback) {

    tableContent = await createSettings();
    const result = await loopArr() // devices, messenger, etc "final" erstellen
    let resultTemp = result
    const finalObj = resultTemp; // fertiges objekt fuer native settings

    async function loopArr() {
        let objTemp = tableContent;
        for (const name in tableContent) {
            if (!name.includes('counter')) {
                const id = name;
                objTemp[id] = {
                    ids: tableContent[name].ids,
                    finalIds: await createArray(tableContent[name], name),
                };

                if (Object.keys(objTemp[id].finalIds).length == 0) delete objTemp[id].finalIds;
            };
        };
        return objTemp;
    };

    async function createArray(obj, i) {

        const name = i;
        let objTemp = {};

        // Wenn final erstellt wurde pruefen, ob .length zu der Anzahl der erstellten FinalIds passt
        for (const i in obj.ids) {
            if (i != undefined) {
                const data = obj.ids[i];
                if (name.includes('linkedDevice')) {
                    const dataMeasuringDevices = tableContent.devices.ids[i];
                    const dataLinkedDevices = data;
                    /*
                    Daten aus den beiden Tabellen von "linked Device" und "measuring Devices" miteiner verknuepfen und ein finales "linked Device"
                    daraus erstellen. Messenger Daten werden als ID in einem Array angehangen
                    */
                    if (dataMeasuringDevices.id == dataLinkedDevices.id) {
                        objTemp[dataMeasuringDevices.id] = {
                            // Daten kommen aus "measuring Devices"
                            type: dataMeasuringDevices.type,
                            pathConsumption: dataMeasuringDevices.consumption,
                            pathSwitch: dataMeasuringDevices.switch,
                            startText: dataMeasuringDevices.startText != undefined ? dataMeasuringDevices.startText || '' : '',
                            endText: dataMeasuringDevices.endText != undefined ? dataMeasuringDevices.endText || '' : '',
                            runtimeMax: dataMeasuringDevices.runtimeMax,

                            // Daten kommen aus "linked Devices"
                            enabled: dataLinkedDevices.enabled,
                            name: dataLinkedDevices.name,
                            alexa: dataLinkedDevices.alexa != undefined ? dataLinkedDevices.alexa || [] : [],
                            sayit: dataLinkedDevices.sayit != undefined ? dataLinkedDevices.sayit || [] : [],
                            telegram: dataLinkedDevices.telegram != undefined ? dataLinkedDevices.telegram || [] : [],
                            whatsapp: dataLinkedDevices.whatsapp != undefined ? dataLinkedDevices.whatsapp || [] : [],
                            pushover: dataLinkedDevices.pushover != undefined ? dataLinkedDevices.pushover || [] : [],
                            signal: dataLinkedDevices.signal != undefined ? dataLinkedDevices.signal || [] : [],
                            email: dataLinkedDevices.email != undefined ? dataLinkedDevices.email || [] : [],
                            matrix: dataLinkedDevices.matrix != undefined ? dataLinkedDevices.matrix || [] : [],
                            discord: dataLinkedDevices.discord != undefined ? dataLinkedDevices.discord || [] : [],

                            timer: dataLinkedDevices.timer != undefined ? dataLinkedDevices.timer || 0 : 0,
                            autoOff: dataLinkedDevices.autoOff != undefined ? dataLinkedDevices.autoOff || false : false,
                            abort: dataLinkedDevices.abort != undefined ? dataLinkedDevices.abort || false : false,
                            id: dataLinkedDevices.id
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
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                path: data.path,
                                /**@type {number}*/
                                volume: data.volume,
                                /**@type {string}*/
                                timeMin: data.activeFrom,
                                /**@type {string}*/
                                timeMax: data.activeUntil
                            };
                            break;
                        };
                    case "sayit":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                path: data.path,
                                /**@type {number}*/
                                volume: data.volume,
                                /**@type {string}*/
                                timeMin: data.activeFrom,
                                /**@type {string}*/
                                timeMax: data.activeUntil
                            };
                            break;
                        };
                    case "typeID":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {number}*/
                                startVal: data.startVal,
                                /**@type {number}*/
                                endVal: data.endVal,
                                /**@type {number}*/
                                startCount: data.startCount,
                                /**@type {number}*/
                                endCount: data.endCount
                            };
                            break;
                        };
                    case "telegram":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                inst: data.inst,
                                /**@type {string}*/
                                key: data.key,
                                /**@type {string}*/
                                username: data.username,
                                /**@type {string}*/
                                chatId: data.chatId != undefined ? data.chatId || 0 : 0,
                                /**@type {boolean}*/
                                group: data.group
                            };
                            break;
                        };
                    case "whatsapp":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                path: data.path,
                            };
                            break;
                        };
                    case "pushover":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                inst: data.inst,
                                /**@type {string}*/
                                title: data.title,
                                /**@type {string}*/
                                deviceId: data.deviceID,
                                /**@type {string}*/
                                prio: data.prio,
                                /**@type {string}*/
                                sound: data.sound,
                                /**@type {number}*/
                                ttl: data.ttl != undefined ? data.ttl || null : null,
                            };
                            if (objTemp[data.id].prio == 'high') {
                                objTemp[data.id].prio = 1;
                            } else if (objTemp[data.id].prio == 'quiet') {
                                objTemp[data.id].prio = -1;
                            } else if (objTemp[data.id].prio == 'confirmation') {
                                objTemp[data.id].prio = 2;
                            } else {
                                delete objTemp[data.id].prio;
                            };
                            break;
                        };
                    case "signal":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                inst: data.inst
                            };
                            break;
                        };
                    case "email":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                emailFrom: data.emailFrom,
                                /**@type {string}*/
                                emailTo: data.emailTo
                            };
                            break;
                        };
                    case "matrix":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                inst: data.inst,
                            };
                            break;
                        };
                    case "discord":
                        {
                            objTemp[data.id] = {
                                /**@type {string}*/
                                name: data.name,
                                /**@type {string}*/
                                inst: data.inst,
                                /**@type {string}*/
                                userId: data.userId != undefined ? data.userId || null : null,
                                /**@type {string}*/
                                userTag: data.userTag != undefined ? data.userTag || null : null,
                                /**@type {string}*/
                                userName: data.userName,
                                /**@type {string}*/
                                serverId: data.serverId != undefined ? data.serverId || null : null,
                                /**@type {string}*/
                                channelId: data.channelId != undefined ? data.channelId || null : null,
                            };
                            break;
                        };
                };
            };
        };
        // objTemp['messenger'] = ['alexa', 'telegram', 'sayit', 'pushover', 'discord', 'whatsapp', 'signal', 'email', 'matrix', 'discord']
        return objTemp;
    };
    callback(finalObj); // daten in native settings schreiben
};