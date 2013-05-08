/*
 * BGPlay.js
 * Copyright (c) 2013 Massimo Candela, Giuseppe Di Battista, Claudio Squarcella, Roma Tre University and RIPE NCC
 * http://www.bgplayjs.com
 *
 * See the file LICENSE.txt for copying permission.
 */


define(function(){
    return [
        {"types":["bgp"], "modes":["consistent"], "view":BgpDataChecksView}, //look! types and modes are in OR
        {"types":["bgp"], "modes":["inconsistent"], "domClass": "bgplayControllerDiv", "view":ControllerQuerySimpleView},
        {"types":["all"], "modes":["consistent"], "domClass": "bgplayInfoDiv", "view":InfoPanelView},
        {"types":["all"], "modes":["consistent"], "domClass": "bgplayGraphDiv", "view":GraphView},
        {"types":["all"], "modes":["consistent"], "domClass": "bgplayTimelineDiv", "view":TimelineView},
        {"types":["bgp"], "modes":["consistent"], "domClass": "bgplayControllerDiv", "view":ControllerView},
        {"types":["bgp"], "modes":["consistent"], "domClass": "bgplayLegendDiv", "view":LegendView},
        {"types":["all"], "modes":["consistent"], "view":NodePositionView},
        {"types":["all"], "modes":["consistent"], "view":OptionPopupView},
        {"types":["all"], "modes":["consistent"], "view":OptionAnimationSpeedView},
        {"types":["all"], "modes":["consistent"], "view":OptionRestoreGraph}
        //{"type":"all", "elementId": "bgplayFullscreen", "view":FullScreenView},
        //{"type":"all", "elementId": "bgplayScreenshot", "view":ScreenShotView},
        //{"type":"all", "view":LivePermalinkView}
    ]
});