addTemplateContent('controllerTraceroutes.html', '<img class="bgplayControlPanelDivFlagIco" src="{{imageRoot}}config.png" alt="Open config" title="Open config"/>'+
''+
'<div class="bgplayControlAnimationDiv">'+
'    <div class="bgplayControlAnimationPrev">'+
'        <img src="{{imageRoot}}play_prev.png" alt="Previous event" title="Previous event"/>'+
'    </div>'+
'    <div class="bgplayControlAnimationStartPause">'+
'        <img class="bgplayControlAnimationPause" src="{{imageRoot}}pause.png" alt="Pause animation" title="Pause animation"/>'+
'        <img class="bgplayControlAnimationStart" src="{{imageRoot}}play.png" alt="Play animation" title="Play animation or press shift/ctrl to repeat the last event"/>'+
'        <div class="bgplayControlAnimationRepeat"/>'+
'    </div>'+
''+
'    <div class="bgplayControlAnimationStop">'+
'        <img src="{{imageRoot}}stop.png" alt="Stop animation" title="Stop animation"/>'+
'    </div>'+
''+
'    <div class="bgplayControlAnimationNext">'+
'        <img src="{{imageRoot}}play_next.png" alt="Next event" title="Next event"/>'+
'    </div>'+
'</div>'+
'<div class="bgplayControlPanelDivComplete">'+
''+
'    <div>'+
'        <label for="bgplayStarttimestampPicker">Start date: </label>'+
'        <input class="bgplayStarttimestampPicker" type="text"/>'+
'    </div>'+
'    <div>'+
'        <label for="bgplayEndtimestampPicker">End date: </label>'+
'        <input class="bgplayEndtimestampPicker" type="text"/>'+
'    </div>'+
''+
    '<div>'+
    '<label for="bgplayMeasurementId">Target: </label>' +
    '<select class="bgplayMeasurementId">' +
    '{{#selectableTargets}}<option value="{{msmId}}">{{msmId}} - {{address}} {{description}}</option>{{/selectableTargets}}' +
    '</select>' +
    '</div>'+

'    <div class="searchProbesByASWizard">'+
'        <label for="bgplayMeasurementId">Autonomous System: </label>'+
'        <input class="bgplayProbeAS" type="text" value=""/>'+
'        <fieldset>'+
'            <legend>Probes:</legend>'+
'        </fieldset>'+
'    </div>'+
'    {{#showResourceController}}'+
'    <div>'+
'        <label for="bgplayControlProbesValue">Probes: </label><img class="bgplayControlProbesWizard" src="{{imageRoot}}wizard.png" alt="Wizard" title="Wizard">'+
'        <div class="bgplayControlProbesDiv">'+
'            <div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>'+
''+
'            <div class="viewport">'+
'                <div class="overview bgplayControlProbesValue">'+
'                    <div>'+
''+
'                        {{#selectedProbes}}'+
'                        <div>'+
'                            <input name="bgplayControlProbesValues" type="text" value="{{.}}"/>'+
'                            <img class="bgplayControlProbesDelete" src="{{imageRoot}}delete.png" alt="Delete this probe" title="Delete this probe"/>'+
'                        </div>'+
'                        {{/selectedProbes}}'+
''+
'                    </div>'+
'                    <img class="bgplayControlProbesMore" alt="more" title="more" src="{{imageRoot}}more.png"/>'+
'                </div>'+
'            </div>'+
'        </div>'+
'    </div>'+
'    {{/showResourceController}}'+
''+
'    <div class="bgplaySuppressReannounceDiv">'+
'        {{^ignoreReannouncements}}'+
'        <label for="bgplaySuppressReannounce">Ignore re-announcements</label><input class="bgplaySuppressReannounce" type="checkbox"/>'+
'        {{/ignoreReannouncements}}'+
''+
'        {{#ignoreReannouncements}}'+
'        <label for="bgplaySuppressReannounce">Ignore re-announcements</label><input class="bgplaySuppressReannounce" type="checkbox" checked="checked"/>'+
'        {{/ignoreReannouncements}}'+
'    </div>'+
''+
'    <input type="button" class="bgplayControlApplyButton"/>'+
'    <input type="button" class="bgplayControlDiscardButton"/>'+
'</div>'+
'');