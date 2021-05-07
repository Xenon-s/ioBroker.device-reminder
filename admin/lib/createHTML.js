/**
 * @param {string} name
 * @param {string} id
 * @param {number} cntr
 */
async function createHTML(name, id, cntr) {

    let table = '';
    table = `
        <table class="table-values changeOnChangeEvent remove-last-column" id="table-${name}">
            <thead>
        <tr>`;
    if (name !== 'status' && name !== 'costs') {
        console.warn(name)
        table += `
            <th data-name="_index" style="width: 40px" class="header translate">${_("")}</th>
            <th data-name="name" style="width: 150px" data-type="text" class="header translate">${_("*name")}</th>`;
    };

    switch (name) {
        case 'devices':
            table += `
            <th id="deviceTypeID" data-name="type" style="width: 200px;" data-type="select" style="width: 150px"class="header translate" data-options="">${_("device type")}</th>
            <th data-name="consumption" style="width: 100px" data-type="OID" class="header translate">${_("consumption")}</th>
            <th data-name="switch" style="width: 100px" data-type="OID" class="header translate">${_("Power switch")}</th>
            <th data-name="startText" data-type="OID" class="header translate">${_("starttext")}</th>
            <th data-name="endText" data-type="OID" class="header translate">${_("endtext")}</th>
            <th data-name="consumptionTotal" style="width: 100px" data-type="OID" class="header translate" data-lang="total consumption" id="">${_("showConsTotal")}</th>
            <th data-name="unit" style="width: 100px" data-type="select" data-options="kWh;wh" data-default="kWh" class="header translate" id="showUnit">${_("unit")}</th>`;
            break;
        case 'alexa':
            table += `
            <th data-name="path" data-type="OID" class="header translate">${_("'alexa2/../announcement'/'speak'")}</th>`;
            break;
        case 'sayit':
            table += `
            <th data-name="path" data-type="OID" class="header translate">${_("*'sayit/../text'")}</th>`;
            break;
        case 'pushover':
            table += `
            <th data-name="inst" data-type="select" class="header translate" data-default=".0" data-options=".0;.1;.2;.3;.4;.5">${_("*pushover instance")}</th>
            <th data-name="prio" data-type="select" class="header translate" data-default="normal" data-options="normal;high;quiet">${_("*priority")}</th>
            <th data-name="sound" data-type="select" class="header translate" data-default="pushover"data-options="pushover; bike; bugle; cashregister; classical; cosmic; falling; gamelan; incoming; intermission; magic; mechanical; pianobar; siren; spacealarm; tugboat; alien; climb; persistent; echo; updown; none">${_("*sound")}</th>`;
        break;
        case 'email':
            table += `
            <th data-name="emailFrom" data-type="text" class="header translate">${_("*sender address")}</th>
            <th data-name="emailTo" data-type="text" class="header translate">${_("*receiver address")}</th>`;
        break;
        case 'types':
            table += `
            <th class="header translate" data-type="number" data-name="startVal">${_("threshold 'start' (watt)")}</th>
            <th class="header translate" data-type="number" data-name="endVal">${_("threshold 'end' (watt)")}</th>
            <th class="header translate" data-type="number" data-name="standby">${_("threshold 'standby' (watt)")}</th>
            <th class="header translate" data-type="number" data-name="startCount">${_("number of 'start' values")}</th>
            <th class="header translate" data-type="number" data-name="endCount">${_("number of ​'end' values")}</th>`;
        break;
        case 'status':
            table += `
            <th class="header translate" data-type="text" data-name="stateAction">${_("status: 'in action'")}</th>
            <th class="header translate" data-type="text" data-name="stateStandby">${_("status: 'standby'")}</th>
            <th class="header translate" data-type="text" data-name="stateOff">${_("status: 'device off'")}</th>`;
            break;
        case 'costs':
            table += `
            <th class="header translate" data-type="checkbox" data-options="true;false" data-name="active" style="width: 60px" data-lang=${_("active")} id="checkCosts">${_("active")}</th>
            <th class="header translate" data-type="number" data-name="costs" style="width: 150px" data-lang="">${_("costs")}</th>
            <th class="header translate" data-type="text" data-name="currency" style="width: 150px" data-lang="">${_("currency")}</th>`;
            break;
    };

    if (name === 'alexa' || name === 'sayit') {
        table += `
        <th data-name="volume" style="width: 80px" data-type="number" class="header translate" data-default="50">${_("*volume 0-100")}</th>
        <th data-name="timeMinHour" style="width: 80px" data-type="select" class="header translate" data-default="0"data-options="0;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23">${_("active from hour")}</th>
        <th data-name="timeMinMin" style="width: 80px" data-type="select" class="header translate" data-default="00"data-options="00;15;30;45">${_("active from minute")}</th>
        <th data-name="timeMaxHour" style="width: 80px" data-type="select" class="header translate" data-default="23"data-options="0;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23">${_("inactive from hour")}</th>
        <th data-name="timeMaxMin" style="width: 80px" data-type="select" class="header translate" data-default="59"data-options="00;15;30;45;59">${_("inactive from minute")}</th>`
    };

    if (name !== 'status' && name !== 'costs') {
        table += `
        <th data-buttons="delete" style="width: 80px" class="header translate del-Btn">${_("delete")}</th>`;
    };
    table += `
                <th data-name="id" style="width: 0px; display: none;" class="header translate">id</th>
            </tr>
        </thead>
    </table>`;

    let strHtml = '';
    let addBtn = '';
    let reqField = '';
    if (name !== 'status' && name !== 'costs') {
        addBtn = `
        <div class="col left s2">
            <a id='btn-add-${name}'
                class="btn-floating waves-effect waves-light blue table-button-add">
                <i class="material-icons">add_circle_outline</i>
            </a>
            <div>
                <p></p>
                <span class="translate" style="font-weight:bold;">${_("Required fields")}</span>
            </div>
        </div>`
    };
    strHtml = `
<li>
    <div id="header-${name}" class="translate" onclick="selectedHeader('${name}')">
    </div>
    <div class="collapsible-body blue lighten-5" id="${id}">
        <div class="row">
            <div style="display: flex; align-items: center;">
                ${addBtn}
                ${reqField}
                <div class="col s2">
                    <a id="btn-check-${name}" class="waves-effect waves-light btn translate">${_("save")}</a>
                </div>
                <div class="col s8" id="err-${name}"></div>
                <!-- Modal Trigger -->
                <a class="waves-effect waves-light btn modal-trigger translate" href="#modal${cntr}">help</a>
                <!-- Modal Structure -->
                <div id="modal${cntr}" class="modal">
                    <div id="help-${name}" class="modal-content translate">
                        <div>
                            <!-- text -->
                        </div>
                        <div class="modal-footer">
                            <a href="#!" class="modal-close waves-effect waves-green btn-flat">close</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${table}
    </div>
</li>`;

    return strHtml;
};