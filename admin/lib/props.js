// Hier werden die props der einzelnen Tabellen per jquery angepasst
function setProps( /**@type {string}*/ id, /**@type {string}*/ name) {

    if (name.includes('devices')) {
        $(`#${id} [data-name="consumption"`).prop("disabled", true);
        $(`#${id} [data-name="switch"`).prop("disabled", true);
    };

    if (name.includes('alexa') || name.includes('sayit') || name.includes('whatsapp')) {
        $(`#${id} [data-name="path"`).prop("disabled", true);
        $(`#${id} .table-lines [data-name="activeFrom"]`).attr('class', 'values-input timepicker');
        $(`#${id} .table-lines [data-name="activeUntil"]`).attr('class', 'values-input timepicker');
        $('.timepicker').timepicker({ "twelveHour": false });
    };

    if (name.includes('custom') || name.includes('default')) {
        // Attribute fuer device-types aendern
        // Namensfelder bei device-types sperren
        $(`#${id} [data-name="name"`).prop("disabled", true);
        // MIN / MAX einfuegen
        $(`#${id} [data-name="startVal"`).prop("min", 0);
        $(`#${id} [data-name="endVal"`).prop("min", 0);
        $(`#${id} [data-name="standby"`).prop("min", 0);
        $(`#${id} [data-name="startCount"`).prop("min", 1);
        $(`#${id} [data-name="endCount"`).prop("min", 2);
    };

};

// Collapsible Steuerung
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