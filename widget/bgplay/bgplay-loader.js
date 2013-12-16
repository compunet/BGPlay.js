/*
 * BGPlay.js
 * Copyright (c) 2013 Massimo Candela, Giuseppe Di Battista, Claudio Squarcella, Roma Tre University and RIPE NCC
 * http://www.bgplayjs.com
 *
 * See the file LICENSE.txt for copying permission.
 */

require.config({
    paths: {
        "jquery": BGPLAY_LIB_URL + "jquery",
        "jquery-ui": BGPLAY_LIB_URL + "jquery-ui.min",
        "underscore": BGPLAY_LIB_URL + "underscore",
        "backbone": BGPLAY_LIB_URL + "backbone",
        "tinyscrollbar": BGPLAY_LIB_URL + "jquery.tinyscrollbar.min",
        "mousewheel": BGPLAY_LIB_URL + "jquery.mousewheel.min",
        "timepicker": BGPLAY_LIB_URL + "jquery-ui-timepicker-addon",
        "mustaches": BGPLAY_LIB_URL + "mustaches",
        "raphael": BGPLAY_LIB_URL + "raphael",
        "raphael-pan": BGPLAY_LIB_URL + "raphael-pan",
        "model": BGPLAY_WIDGET_URL + "bgplayjs-common-model",

        "config": BGPLAY_WIDGET_URL + "bgplay/bgplay-config",
        "modules": BGPLAY_WIDGET_URL + "bgplay/bgplay-modules",


        "TreeMap": BGPLAY_LIB_URL + "TreeMap",
        "dateFormat": BGPLAY_LIB_URL + "dateFormat",
        //"xdomainajax": BGPLAY_LIB_URL + "jquery.xdomainajax",

        "compatibilityTricks": BGPLAY_UTILS_URL + "compatibilityTricks",
        "validator": BGPLAY_UTILS_URL + "validator",
        "graphUtils": BGPLAY_UTILS_URL + "graph",
        "general": BGPLAY_UTILS_URL + "general",
        "cssAlert": BGPLAY_UTILS_URL + "cssAlert",
        "wbrGraph": BGPLAY_LIB_URL + "wbrGraph2",
        "main": BGPLAY_PROJECT_URL + "main",
        "MainView": BGPLAY_MODULES_URL + "MainView"
    },

    shim: {
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        },
        "underscore": {
            exports: "_"
        },
        "backbone": {
            exports: "Backbone",
            deps: ["underscore", "jquery"]
        },
        "mousewheel": {
            exports: "$",
            deps: ['jquery-ui']
        },
        "timepicker": {
            exports: "$",
            deps: ['jquery-ui']
        },
        "tinyscrollbar": {
            exports: "$",
            deps: ['jquery-ui']
        },
        "mustaches": {
            exports: "Mustache"
        },
        "raphael": {
            exports: "raphael"
        },
        "raphael-pan": {
            deps:['raphael']
        },
        "modules": {
            deps:[
                'backbone',
                'jquery'
            ]
        },
        "model": {
            deps:[
                'backbone',
                'jquery'
            ]
        },
        "general": {
            deps:[
                'backbone',
                'jquery',
                'compatibilityTricks',
                'dateFormat'
            ]
        },
        "main": {
            deps:[
                'general',
                'modules',
                'model',
                'MainView'
            ]
        },
        "xdomainajax":{
            deps:[
                'jquery'
            ],
            exports: "$"
        },
        "MainView": {
            deps:[
                'backbone',
                'jquery'
            ]
        },
        "wbrGraph" : {
            deps:[
                'TreeMap',
                'graphUtils'
            ]
        }
    }

});

define([
    "jquery",
    "backbone",
    "mustaches",
    "raphael",
    "config",
    "modules",
    "MainView",
    "main",
    "model",
    BGPLAY_CONNECTORS_URL + "JsonWrapGeneric.js",
    "raphael-pan",
    "tinyscrollbar",
    "mousewheel",
    "timepicker",
    "TreeMap",
    BGPLAY_LIB_URL + "Intersection.js",
    "wbrGraph",
    "validator",
    "general",
    "cssAlert"

], function($, Backbone, Mustache, raphael, config, modules, MainView) {

    debugMode = (getUrlParam("debug")=="true") ? true : false;// false to prevent console logs

    window.Mustache = Mustache;
    loadCss(BGPLAY_STYLESHEETS_URL + 'jquery-ui-191.css');
    loadCss(BGPLAY_STYLESHEETS_URL + 'jquery.ui.datepicker.css');
    loadCss(BGPLAY_STYLESHEETS_URL + 'bgplay.css');
    instanceName = 'BGPlay';

    var main, element, instanceName, instance, initialParams, thisWidget, queryParams;

    instance = getBGPlayInstance(instanceName);

    element = $('#'+instance.domId);
    initialParams = instance.initialParams;
    queryParams = instance.queryParams;

    thisWidget = {
        get_params: function(){
            return queryParams;
        },
        set_params: function(params){
            queryParams = params;
        }
    };

    main = new BGPlay(element);

    //Override of some methods
    main.advancedInit = function(){
        main.environment.thisWidget = thisWidget;
    }


    main.alert = function(msg, type){
        alert(msg);
        //main.environment.dom.append(misc.infoMessage(type,msg));
    }


    //Initialization of the BGPlay environment
    main.init({
        width: initialParams.width,
        height: initialParams.height,
        config: config,
        modules: modules,
        mainView: MainView,
        fileRoot: BGPLAY_PROJECT_URL,
        imageRoot: BGPLAY_IMAGES_URL,
        templateRoot: BGPLAY_TEMPLATES_URL
    });

    main.setDefaultParams(initialParams);

    main.retrieveData();


    return this;
});

