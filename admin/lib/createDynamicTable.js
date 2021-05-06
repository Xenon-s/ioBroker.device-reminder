async function createDynamicTable(settings, onChange, checked) {

    let curDevice = null;
    const settingsDevice = settings.devices.ids;
    const settingsTable = settings.devices.idsTable;
    const devices = checked.devices;

    $('#dynamic-table-body').html("");

    for (const i in devices) {
        curDevice = null;

        let data = [];
        const ID = devices[i].name;
        let deviceId = devices[i].id;

        const resultCurDevice = await createCurDevice();

        if (resultCurDevice == null || resultCurDevice == undefined) {
            curDevice = {
                enabled: true, name: devices[i].name, alexa: -1, sayit: -1, whatsapp: -1, telegram: -1, pushover: -1, email: -1, autoOff: false, timer: 0, abort: false, id: -1
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
        // in Version 1.1 haben sich die Namen geaendert!! (das "id" vor dem Namen ist verschwunden!)
        data = [
            { type: 'checkbox', name: "enabled", value: curDevice.enabled },
            { type: 'label', name: "name", value: curDevice.name },
            { type: 'multiple', data: checked.alexa, name: "alexa", value: curDevice.alexa },
            { type: 'multiple', data: checked.sayit, name: "sayit", value: curDevice.sayit },
            { type: 'multiple', data: checked.telegram, name: "telegram", value: curDevice.telegram },
            { type: 'multiple', data: checked.whatsapp, name: "whatsapp", value: curDevice.whatsapp },
            { type: 'multiple', data: checked.pushover, name: "pushover", value: curDevice.pushover },
            { type: 'multiple', data: checked.email, name: "email", value: curDevice.email },
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
                        col += `<label><input type="checkbox" class="values-input" ${checked} data-old-value="${data[j].value}"><span></span></label>`;
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
        $('#dynamic-table-body').append(col);

        // vom User gesetzte "multiple options" in der Tabelle anzeigen
        $('#dynamic-table-body').children().eq(i).children().each(function () {
            if ($(this).data('type') == 'multiple') {
                $(this).find('select').val(curDevice[$(this).data('name')]);
            }
            else {
                $(this).find('input').val(curDevice[$(this).data('name')]);
            };
        });

        // trigger im dynamic table setzen
        $('#dynamic-table-body').find('.values-input').on('change', function () {
            $('.btn-save, .btn-save-close').fadeIn();
            onChange(true);
        });
    };

    if (curDevice != null) {
        const selectInstance = M.FormSelect.getInstance($('select'));
        instances = M.FormSelect.init($('select'));
        M.updateTextFields();
    };

    return settings;
};