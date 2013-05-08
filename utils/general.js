/*
 * BGPlay.js
 * Copyright (c) 2013 Massimo Candela, Giuseppe Di Battista, Claudio Squarcella, Roma Tre University and RIPE NCC
 * http://www.bgplayjs.com
 *
 * See the file LICENSE.txt for copying permission.
 */

var currentUrl=document.location.search;
var isMobile;
var templateCache={};

function getAmountOfTime(timestamp){
    var amount = {};

    amount.days = Math.floor(timestamp/86400); //86400sec = 1 day
    var tmpSec=(timestamp%86400);
    amount.hours =Math.floor(tmpSec/3600); //3600sec = 1 hour
    tmpSec=(timestamp%86400)%3600;
    amount.minutes=Math.floor(tmpSec/60);
    amount.seconds=tmpSec%60;

    return amount;
}

function stringToArray(str){ //A level of indirection useful if you want to change the splitting/joining char
    return str.split(",");
}

function arrayToString(string, symbol){
    var symbol = symbol || ',';
    if (Array.prototype.join) {
        return string.join(symbol);
    }else{
        var out="";
        for(var i = 0, len = this.length; i < len-1; i++) {
            out+=this[i]+symbol;
        }
        out+=this[i+1];
        return out;
    }
}

function getUrlParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function log(text){
    try{ //To avoid errors with browsers without console
        if (debugMode==true){
            console.log((new Date()).toString()+": "+text);
        }
    }catch(e){
        //Don't do nothing
    }
}

function needed(name,obj){
    if (obj==null){
        alert("The following parameters are required: "+name);
    }
}

//This function uses Mustache.js to parse a template file and returns or directly injects the resulting DOM
function parseTemplate(environment,template,object,where,method){
    var templateFile=environment.fileRoot+'js/bgplay/templates/'+template;
    if (where==null)
        alert("DOM is null: "+template);

    var tplResult=templateCache[templateFile]; //try in cache
    if (tplResult==null){
        $.ajax({
            async: false,
            url: templateFile,
            type: 'GET',
            success: function(tpl) {
                tplResult=tpl;
                templateCache[templateFile]=tplResult;
            }
        });
    }
    if (method=="append"){
        $(where).append(Mustache.to_html(tplResult, object));
    }if (method=="prepend"){
        $(where).prepend(Mustache.to_html(tplResult, object));
    }else{
        $(where).html(Mustache.to_html(tplResult, object));
    }
}


var addOffset = function (event, element, forced) {
    var element = element || $(event.target);
    var offset = $(element).offset();
    if (!event.offsetX || forced) {
        event.offsetX = (event.pageX - offset.left);
        event.offsetY = (event.pageY - offset.top);
    }
    return event;
};

function roundTo(decimalpositions){
    var i = this * Math.pow(10,decimalpositions);
    i = Math.round(i);
    return i / Math.pow(10,decimalpositions);
}
Number.prototype.roundTo = roundTo;

var dateToString=function(timestamp){ //This is an indirection, may be useful in the future to manipulate dates
    return dateToUTC(timestamp).format("yyyy-mm-dd HH:MM:ss");
}

function dateToUTC(timestamp){
    var date = new Date(timestamp*1000);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

var isInternetExplorer=function(){
    var version, re, ua;
    version = -1;
    if (navigator.appName == 'Microsoft Internet Explorer'){
        ua = navigator.userAgent;
        re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null){
            version = parseFloat( RegExp.$1 );
        }
    }
    return version;
}

function isMobileBrowser(){
    if (isMobile==null){
        if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
            isMobile = true;
        }else{
            isMobile = false;
        }
    }
    return isMobile;
}

function makeUnselectable(node) {
    if (node.nodeType == 1) {
        node.setAttribute("unselectable", "on");
        try{
            node.style.userSelect = "none";
            node.style.webkitUserSelect = "none";
            node.style.MozUserSelect = "none";
        }catch(e){
        }
    }
    var child = node.firstChild;
    while (child) {
        makeUnselectable(child);
        child = child.nextSibling;
    }
}

function rotateTextInElement(titleElement){
    var titleText, i, length;

    titleText= titleElement.html();
    titleElement.html("");
    for (i = 0, length=titleText.length; i < length; i++) {
        titleElement.append(titleText.charAt(i)+"<br/>");
    }
    titleElement.css("text-align", "center");
}

Backbone.View.prototype.destroyMe=function(){
    try{
        this.unbind();
    }catch(e){
    }

    try{
        this.remove();
    }catch(e){
    }

    try{
        this.model.unbind( 'change', this.render, this );
    }catch(e){
    }

    try{
        delete this.$el;
        delete this.el;
    }catch(e){
    }
}

function areMapsEquals(map1, map2, excludedKey){
    for (var key in map1) {
        if ((excludedKey == null || !arrayContains(excludedKey, key)) && map1[key] != map2[key]){
            return false;
        }
    }
    return true;
}

function arrayContains(array, element){
    for (var i = 0, length = array.length; i<length; i++){
        if (array[i]==element)
            return true;
    }
    return false;
}

function arrayContainsAll(array1, array2){
    var i, element, length;
    for (i = 0, length = array2.length; i<length; i++){
        element = array2[i];
        if (!arrayContains(array1, element)){
            return false;
        }
    }
    return true;
}

function arrayContainsOne(array1, array2){
    var i, element, length;
    for (i = 0, length = array2.length; i<length; i++){
        element = array2[i];
        if (arrayContains(array1, element)){
            return true;
        }
    }
    return false;
}

function removeSubArray(mainArray, subArray){
    var n, i, inarray, length1, length2;
    var tmp=[];
    for (n = 0, length1=mainArray.length; n < length1; n++) {
        inarray=false;
        for (i = 0, length2 = subArray.length; i < length2; i++) {
            if (subArray[i]==mainArray[n]){
                inarray=true;
                break;
            }
        }
        if (inarray==false)
            tmp.push(mainArray[n]);
    }
    return tmp;
}

function removeArrayElement(mainArray, element){
    return removeSubArray(mainArray, [element]);
}

function printLoadingInformation(environment,log){
    var domElement;
    domElement = environment.thisWidget.bgplayDom.find('.bgplayLoadingInformation');

    if (domElement.length!=0){
        domElement.remove();
    }

    domElement = $('<div class="bgplayLoadingInformation">' +
        '<div class="loadingLog"></div>' +
        '</div>');
    environment.thisWidget.bgplayDom.prepend(domElement);

    if (log==""){
        domElement.hide();
    }else{
        domElement.find('.loadingLog').html(log);
        domElement.show();
    }
}