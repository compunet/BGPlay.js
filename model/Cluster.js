/*
 * BGPlay.js
 * Copyright (c) 2013 Massimo Candela, Giuseppe Di Battista, Claudio Squarcella, Roma Tre University and RIPE NCC
 * http://www.bgplayjs.com
 *
 * See the file LICENSE.txt for copying permission.
 */

/**
 * @class Cluster
 * @module model
 */
var Cluster = Backbone.Model.extend({
    defaults:{
        type:"cluster"
    },
    urlRoot : '/cluster',

    /**
     * The initialization method of this object.
     * @method initialize
     * @param {Map} A map of parameters
     */
    initialize:function(){
        this.attributes.nodes = new Array();
    },

    /**
     * Adds a node to this cluster.
     * @method addSource
     * @param {Object} An instance of Node
     */
    addNode:function(node){
        if (!this.contains(node)){
            this.get("nodes").push(node);
        }
    },

    getNode:function(id){
        var n, length, nodes;
        nodes = this.get("nodes");
        length = nodes.length;
        for (n=0; n<length; n++){
            if (nodes[n].id == id){
                return nodes[n];
            }
        }
        return null;
    },

    contains:function(node){
        var n, length, nodes;
        nodes = this.get("nodes");
        length = nodes.length;
        for (n=0; n<length; n++){
            if (nodes[n] == node){
                return true;
            }
        }
        return false;
    },

    /**
     * The validation method of this object.
     * This method is used to check the initialization parameters.
     * @method validate
     * @param {Map} A map of parameters
     * @return {Array} An array of {String} errors
     */
    validate:function(attrs){
        var err=new Array();
        if(attrs.id==null)
            err.push("An id is required!");

        if (err.length>0)
            return err;
    },

    /**
     * Returns a string representing this object.
     * @method toString
     * @return {String} A string representing this object
     */
    toString:function(){
        return this.get("id");
    }
});

var Clusters=Backbone.Collection.extend({
    model:Node
});
