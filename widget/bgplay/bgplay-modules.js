/*
 * BGPlay.js
 * Copyright (c) 2013 Massimo Candela, Giuseppe Di Battista, Claudio Squarcella, Roma Tre University and RIPE NCC
 * http://www.bgplayjs.com
 *
 * See the file LICENSE.txt for copying permission.
 */


define(
    [
        BGPLAY_MODULES_URL + "bgplay/ControllerView.js",
        BGPLAY_MODULES_URL + "bgplay/GraphView.js",
        BGPLAY_MODULES_URL + "bgplay/InfoPanelView.js",
        BGPLAY_MODULES_URL + "bgplay/NodePositionView.js",
        BGPLAY_MODULES_URL + "bgplay/NodeView.js",
        BGPLAY_MODULES_URL + "bgplay/PathView.js",

        BGPLAY_MODULES_URL + "bgplay/OptionRestoreGraph.js",
        BGPLAY_MODULES_URL + "bgplay/OptionPopupView.js",
        BGPLAY_MODULES_URL + "bgplay/OptionAnimationSpeedView.js",
        BGPLAY_MODULES_URL + "bgplay/TimelineView.js",
        BGPLAY_MODULES_URL + "bgplay/LegendView.js",
        BGPLAY_MODULES_URL + "bgplay/BgpDataChecksView.js",
        BGPLAY_MODULES_URL + "bgplay/ControllerQuerySimpleView.js"

    ],  function(){
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
        ]
    });