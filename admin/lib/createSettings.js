async function createSettings(data, type) {

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
                let result = {};
                if (name !== 'telegram' && name !== 'whatsapp') {
                    result = await table2values(idHTML);
                } else {
                    if (name === 'telegram' || name === 'whatsapp') {
                        result = checkedUserInput[name];
                    };
                };
                objTemp[name] = result
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

    let body = $('#dynamic-table-body');
    let geraete = [];

    body.children().each(function () {  // daten aus dyn. tabelle sichern
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
        geraete.push(data); // device daten in array pushen
    });
    obj.devices.idsTable = geraete; // dynamische daten in devices sichern
    return obj; // settings zurueckgeben
};