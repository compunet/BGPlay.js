window.fileRoot="http://192.168.1.3/bgplayjs/src/";
//window.fileRoot="http://wbr3.webrobotics.net/bgplayjs/src/";
//window.fileRoot="http://dia.uniroma3.it/~candela/bgplayjs/src-9660/";

define([
    STAT_WIDGET_API_URL + "js/misc.js",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + 'lib/underscore.js',
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + 'lib/backbone.js',
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "lib/mustaches.js",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "lib/raphael.js",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "lib/jquery.tinyscrollbar.min.js",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "lib/jquery.mousewheel.min.js",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "lib/jquery-ui-timepicker-addon.js",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "config.js",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "allInOneFile.php",
    STAT_WIDGET_API_URL + "lib/js/order.js!" + window.fileRoot + "modules.js"


], function(misc, underscore, backbone, Mustache, raphael, tinyscrollbar, mousewheel, timepicker, config, allInOneFile, modules) {

    var $ = jQuery;
    var instances=0;

    if (!window.$)
        window.$=$;

    if (!window.Mustache)
        window.Mustache=Mustache;

    misc.loadCss('../view/css/style_widget.css');
    misc.loadCss('../view/css/ui-lightness/jquery-ui-1.8.23.custom.css');
    //misc.loadCss('../view/css/jquery-ui-191.css');


    $.fn.statBGPlay = function(data, widget_width) {
        var environment={};
        environment.fullScreenVersionPosition="widget-fullscreen.html";
        environment.config=config;
        environment.modules=modules;
        environment.fileRoot=window.fileRoot;

        environment.eventAggregator=_.extend({}, Backbone.Events);

        var thisWidget, jsonWrap, mainView, params, cssListener, cssListenerInterval, cssListenerTimeout, thisDom, initialInstant, oldParams;
        log("Data collected");
        var internalDivClass="bgplayjs";

        this.html("<div class=\""+internalDivClass+"\"></div>");

        if (!thisDom){
            thisDom = $(this);
            thisWidget = thisDom.statWidget();
            thisWidget.dom = thisDom;
            thisWidget.misc = misc;
            thisWidget.bgplayDom = thisDom.find('.'+internalDivClass);
            environment.cssAlert = new cssAlert(thisWidget.bgplayDom, "bgplayjs");

            thisWidget.alert = function(msg,type){
                thisWidget.dom.append(thisWidget.misc.infoMessage(type,msg));
            };
            environment.thisWidget = thisWidget;
        }

        instances++;
        environment.instances = instances;
        environment.paramsInUrl = thisWidget.get_params().paramsInUrl || environment.config.controller.parametersInUrl;

        jsonWrap=new JsonWrapRipestat(environment);
        params = jsonWrap.getParams(thisWidget.get_params());
        environment.jsonWrap = jsonWrap;
        environment.params = params;
        environment.optionalParams = [];
        environment.dynamicParams = [];

        if (jsonWrap.readJson(data) == true){
            delete data;
            log("Objects created");
            environment.bgplay.set({inputParams:params,silent:true});

            cssListenerInterval=50; //50 ms
            cssListenerTimeout=10000; // 10 secs
            cssListener = setInterval(function(){
                if(thisWidget.bgplayDom.css("margin-left") === "-10px"){
                    clearInterval(cssListener);
                    mainView=new MainView({el:environment.thisWidget.bgplayDom, environment:environment});
                    mainView.loadViews();
                }else{
                    if (cssListenerTimeout<=0){
                        clearInterval(cssListener);
                        environment.thisWidget.alert("It is impossible to load the stylesheets.","error");
                    }
                    cssListenerTimeout -= cssListenerInterval;
                }
            },cssListenerInterval);
        }else{
            thisWidget.alert(environment.message.text, environment.message.type);
            setTimeout(function(){thisWidget.update(environment.oldParams)}, 5000);
        }

        // meta info
        var metaInfo = misc.formatMetaInfo({
            "queryStarttime": new Date(data.query_starttime*1000),
            "queryEndtime": new Date(data.query_endtime*1000),
            "resource": data.resource
        }, widget_width);
        $(this).append(metaInfo);

        return this;
    };

});

