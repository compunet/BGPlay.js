/*
 * BGPlay.js
 * Copyright (c) 2013 Massimo Candela, Giuseppe Di Battista, Claudio Squarcella, Roma Tre University and RIPE NCC
 * http://www.bgplayjs.com
 *
 * See the file LICENSE.txt for copying permission.
 */

/**
 * LegendView provides a legend explaining colours used in the representation.
 * Template: legend.html
 * @class LegendView
 * @module modules
 */
var LegendView=Backbone.View.extend({

    /**
     * The initialization method of this object.
     * @method initialize
     * @param {Map} A map of parameters
     */
    initialize:function(){
        this.environment=this.options.environment;
        this.bgplay=this.environment.bgplay;
        this.fileRoot=this.environment.fileRoot;
        this.eventAggregator=this.environment.eventAggregator;


        this.el=this.options.el;
        this.$el.show();

        if (this.environment.widget_width<480){
            this.$el.hide();
        }

        this.nodeColourTarget=this.environment.config.graph.targetColor;
        this.nodeColourNormal=this.environment.config.graph.nodeColor;
        this.nodeColourSource=this.environment.config.graph.sourceColor;

        this.nodeColourTargetBorder=this.environment.config.graph.targetBorderColor;
        this.nodeColourNormalBorder=this.environment.config.graph.nodeBorderColor;
        this.nodeColourSourceBorder=this.environment.config.graph.sourceBorderColor;

        this.nodeColourTargetText=this.environment.config.graph.targetTextColor;
        this.nodeColourNormalText=this.environment.config.graph.nodeTextColor;
        this.nodeColourSourceText=this.environment.config.graph.sourceTextColor;



        this.render();
        log("Legend view loaded.");
        this.eventAggregator.trigger("moduleLoaded", this);
    },

    /**
     * This method draws this module (eg. inject the DOM and elements).
     * @method render
     */
    render:function(){
        parseTemplate(this.environment,'legend.html',this,this.el);
        return this;
    }
});