addTemplateContent('controllerLight.html', '<img class="bgplayControlPanelDivFlagIco" src="{{imageRoot}}config.png" alt="Open config" title="Open config"/>'+
''+
'<div class="bgplayControlAnimationDiv">'+
'    <div class="bgplayControlAnimationPrev">'+
'        <img src="{{imageRoot}}play_prev.png" alt="Previous event" title="Previous event"/>'+
'    </div>'+
'    <div class="bgplayControlAnimationStartPause">'+
'        <img src="{{imageRoot}}pause.png" alt="Pause animation" title="Pause animation"/>'+
'        <img src="{{imageRoot}}play.png" alt="Play animation" title="Play animation"/>'+
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
'    {{#selectableRrcs}}'+
'    <div class="bgplayControlRRCDiv">'+
'        <label style="float:left; clear:both; width:100%;">Route Collectors: </label>'+
'        {{#selectedRrcs}}'+
'        <div class="bgplayRrcsSelect">'+
'            <label>{{.}}</label><input name="bgplayRrcSelect" type="checkbox" value="{{.}}" checked="checked"/></label>'+
'        </div>'+
'        {{/selectedRrcs}}'+
''+
'        {{#possibleRrcs}}'+
'        <div class="bgplayRrcsSelect">'+
'            <label>{{.}}</label><input name="bgplayRrcSelect" type="checkbox" value="{{.}}"/>'+
'        </div>'+
'        {{/possibleRrcs}}'+
'    </div>'+
'    {{/selectableRrcs}}'+
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