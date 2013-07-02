/*
 * BGPlay.js #9660
 * A web-based service for the visualization of the Internet routing
 *
 * Copyright (c) 2012 Roma Tre University and RIPE NCC
 *
 * See the file LICENSE.txt for copying permission.
 */

/**
 * This class is a wrapper of the inputs.
 * @class JsonWrapTraceroutes
 * @module model
 */
function JsonWrap(environment){
    return {

        getRemoteLayoutUrl: function(idLayout, params){
            var remoteLayout, server, target, probes, expandedClusters, graphType;

            remoteLayout = getUrlParam("remoteLayout");

            if (remoteLayout!= "" && remoteLayout!=null){
                return remoteLayout;
            }

            target = params.targets;
            probes = params.selectedProbes;
            graphType = (params.radial) ? "radial" : "linear";


            if (idLayout == null){
                server = "http://nero.dia.uniroma3.it:8080/api/v0/traceroute-history/layout/javaserver/"+ graphType +"/create";
                return server + "/" + target + "/" + probes +"/" +
                    "?start=" + params.starttimestamp +
                    "&end=" + params.endtimestamp+
                    "&removeProbesWithIncompleteMetadata=true" +
                    "&clonePrivateAddresses=true" +
                    "&applyIpToAsHeuristics=true" +
                    "&addProbeNodes=true" +
                    "&collapseNullNodeSequencesIntoSingleNodes=true" +
                    "&addVirtualClusters=true";
            }else{
                expandedClusters = params.expandedClusters;

                server = "http://nero.dia.uniroma3.it:8080/api/v0/traceroute-history/layout/javaserver/"+ graphType +"/morph/";

                return server
                    + idLayout +
                    "?currently_expanded_clusters=" + expandedClusters;
            }

        },

        getType: function(){
            return "traceroutes";
        },

        confirm: function(data){
            return (data.events.length + data.initialState.length > environment.config.safetyMaximumEvents ||
                data.nodes.length > environment.config.safetyMaximumNodes);
        },

        _getConversionList: function(){
            var conversionList = {
                starttimestamp : "starttime",
                endtimestamp : "endtime",
                targets : "resource"
            };
            return conversionList;
        },

        _fromExternalToInternal: function(external, internal){
            var out, conversionList;

            out = internal || {};

            conversionList = this._getConversionList();

            for (var key in conversionList){
                out[key] = external[conversionList[key]];
            }

            for (var key in external){
                if (!out[key]){
                    out[key] = external[key];
                }
            }

            return out;
        },

        _fromInternalToExternal: function(internal, external){
            var out, conversionList;

            out = external || {};


            conversionList = this._getConversionList();

            for (var key in conversionList){
                out[conversionList[key]] = internal[key];
            }

            for (var key in internal){
                if (!out[conversionList[key]]){
                    out[key] = internal[key];
                }
            }

            return out;
        },

        /**
         * This method converts input parameters.
         * @param {Map} A Map of parameters valid outside the environment
         * @return {Map} A Map of parameters valid inside the environment
         */
        getParams:function(data){
            var out, selectedProbes, n, length, params, internalParams;
            out = {};

            params = this.externalParams || environment.thisWidget.get_params();

            internalParams = environment.params || {};

            if (!data){
                out = this._fromExternalToInternal(params, internalParams);
             }else{

                selectedProbes = [];

                length = data.sources.length;
                for (n=0; n<length; n++){
                    selectedProbes.push(data.sources[n].prb_id);
                }

                out = {
                    starttimestamp: params.starttime || data.query_starttime,
                    endtimestamp: params.endtime || data.query_endtime,
                    targets: params.resource || data.targets[0].msm_id,
                    showResourceController: params.showResourceController || true,
                    //instant: "0,"+data.query_starttime,
                    instant: null,
                    radial: params.radial || false,
                    selectedProbes: params.selectedProbes || arrayToString(selectedProbes, ","),
                    expandedClusters: params.expandedClusters,
                    type: "traceroutes"
                };
            }
            return out;
        },

        /**
         * This method converts input parameters.
         * @param {Map} A Map of parameters valid inside the environment
         * @return {Map} A Map of parameters valid outside the environment
         */
        setParams:function(params){
            environment.params = params;
            params = this._fromInternalToExternal(params, {});
            this.externalParams = params;

            return params;
        },

        /**
         * This method returns the URL where the json file related to the provided parameters is placed.
         * @param {String} A string where the data-source is placed
         * @param {Map} A Map of parameters valid inside the environment
         * @return {String} An URL
         */
        getJsonUrl:function(params){
            var remoteHistory, url;

            remoteHistory = getUrlParam("remoteHistory");
            if (remoteHistory != "" && remoteHistory != null){
                return remoteHistory;
            }

            var server, target, probes;

            server = "http://nero.dia.uniroma3.it:8080/api/v0/traceroute-history/data";
            target = params.targets;
            probes = params.selectedProbes;

            url = server + "/" + target + "/" + probes +"/" +
                "?start=" + (params.starttimestamp) +
                "&end=" + (params.endtimestamp)+
                "&removeProbesWithIncompleteMetadata=true" +
                "&clonePrivateAddresses=true" +
                "&applyIpToAsHeuristics=true" +
                "&addProbeNodes=true" +
                "&collapseNullNodeSequencesIntoSingleNodes=true" +
                "&addVirtualClusters=true";

            log(url);
            return url;
        },

        /**
         * This method populates Bgplay instantiating all the object of the model layer.
         * @param {Object} A json data object
         */
        readJson:function(wrap){
            if (wrap.nodes.length==0){
                if (environment.thisWidget){
                    environment.message={text: "No information available for these query parameters.", type:"info"};
                    return false;
                }else{
                    alert('No information available');
                    document.location=environment.config.homeUrl;
                }
            }

            printLoadingInformation(environment,"Reconstructing the history.");
            environment.bgplay = new Bgplay({
                cur_instant:new Instant({
                    id:0,
                    timestamp:wrap.query_starttime
                }),
                starttimestamp:wrap.query_starttime,
                endtimestamp:wrap.query_endtime,
                type:"bgp"
            });
            var bgplay = environment.bgplay;


            function createClusters(wrap){
                var length, n, clusters, id, holder, cluster, wrapClusters, asNumber, isVirtual, isPrivate;
                clusters = bgplay.get("clusters");
                wrapClusters = wrap.clusters;
                length = wrapClusters.length;

                for (n=0; n<length; n++){
                    cluster = wrapClusters[n];

                    id = cluster.id;
                    asNumber = cluster.as_number;
                    holder = cluster.holder;
                    isVirtual = cluster.is_virtual;
                    isPrivate = cluster.is_private;

                    if (id != null){
                        clusters.put(id, new Cluster({id:id, asNumber:asNumber, virtual: isVirtual, private:isPrivate, holder:holder, realCluser:true, environment:environment}));
                    }
                }
            }


            function createNodes(wrap){
                var node, address, id, newNode, length, nodes, idCluster, isPrivate, clusters, isNull, ip, cluster;
                nodes = wrap.nodes;
                length = nodes.length;

                for (var n=0; n<length; n++){
                    node = wrap.nodes[n];
                    address = node.address;
                    idCluster = node.cluster_id;
                    isPrivate = node.is_private;
                    id = node.id;
                    isNull = node.is_null || false;

                    newNode = new Node({
                        id:id,
                        address: address,
                        isPrivate: isPrivate,
                        isNull: isNull,
                        nodeUrl: "http://whatismyipaddress.com/ip/"+address,
                        environment:environment});
                    bgplay.addNode(newNode);

                    clusters = bgplay.get("clusters");
                    cluster = clusters.get(idCluster);
                    cluster.addNode(newNode);
                    newNode.set({cluster: cluster});
                }
            }



            function createSources(wrap){
                var source, newSource, wrapSources, n, id, idNode, length, sourceNode,idProbe;

                wrapSources = wrap.sources;
                length = wrapSources.length;

                for (n=0; n<length; n++){
                    source = wrapSources[n];

                    id = source.id;
                    idNode = source.node_id;
                    idProbe = source.prb_id;

                    sourceNode = bgplay.getNode(idNode);

                    newSource = new Source({id:id, label: idProbe, idProbe: idProbe, group:sourceNode, environment:environment});
                    bgplay.addSource(newSource);
                    if (sourceNode!=null){
                        sourceNode.addSource(newSource);
                    }
                }


            }



            function createTargets(wrap){
                var target, idNode, newTarget, wrapTargets, n, id, description, idProbe, length, targetNode;

                wrapTargets = wrap.targets;
                length = wrapTargets.length;

                for (n=0; n<length; n++){
                    target = wrapTargets[n];

                    id = target.id;
                    idProbe = target.msm_id;
                    description = target.description;
                    idNode = target.node_id;
                    targetNode = bgplay.getNode(idNode);

                    newTarget = new Target({
                        id: id,
                        description: description,
                        idProbe: idProbe,
                        group: targetNode,
                        environment: environment});

                    bgplay.addTarget(newTarget);
                    targetNode.addTarget(newTarget);
                }
            }



            function createInitialState(wrap){
                var path, event, initialstate, source, tmpPath, target, tmpNode;
                var uniquePAth = [];

                for (var n = 0, length=wrap.initialState.length; n<length; n++){
                    initialstate = wrap.initialState[n];

                    target = bgplay.getTarget(initialstate.target_id);
                    source = bgplay.getSource(initialstate.source_id);

                    if (initialstate.path.length==0){
                        continue;
                    }

                    path = new Path({
                        id:n,
                        announcedPath:initialstate.path.join(" "),
                        target:target,
                        source:source,
                        environment:environment});

                    uniquePAth[source.id+"-"+target.id] = path;

                    tmpPath = initialstate.path;

                    tmpNode = bgplay.getNode(tmpPath[tmpPath.length-1]);
                    if (tmpNode.get("targets").length==0){
                        continue; //Traceroute incompleto
                    }
                    //tmpNode.addTarget(target); //In this way we can check hijacking

                    for (var i=0; i<tmpPath.length; i++){
                        if (!tmpPath[i-1] || tmpPath[i-1]!=tmpPath[i])
                            path.addNode(bgplay.getNode(tmpPath[i]));
                    }
                    event = new Event({
                        subType: "initialstate",
                        type: "initialstate",
                        source: source,
                        target: target,
                        path: path,
                        instant: bgplay.get("cur_instant"),
                        environment: environment
                    });

                    source.addEvent(event);
                    bgplay.get("allEvents").put(bgplay.get("cur_instant"), event);
                }

                //console.log(uniquePAth);
                return uniquePAth;
            }

            function createEvents(uniquePAth,wrap){
                var event_id = 1;
                var event, n, length, tmpNode, instant,eventType,currentPath,attributes,shortdescription,source,longdescription,path,target,tmpEvent,prevPath,tmpPath,subType, numNotValidWithdrawal;
                var ignoreReannouncements = (environment.params.ignoreReannouncements || environment.config.ignoreReannouncementsByDefault);
                var path_start_id = uniquePAth.length;

                numNotValidWithdrawal = 0;

                length = wrap.events.length;
                for (n=0; n<length; n++){
                    event = wrap.events[n];
                    eventType = event.type;
                    attributes = event.attrs;
                    source = bgplay.getSource(attributes.source_id);
                    target = bgplay.getTarget(attributes.target_id);

                    prevPath = uniquePAth[source.id+"-"+target.id];

                    if (eventType == 'W' && prevPath == null){
                        numNotValidWithdrawal++;
                        continue;
                    }

                    if (attributes.path != null && attributes.path.length == 0){
                        continue;
                    }

                    currentPath = (attributes.path)?attributes.path.join(" "):"";
                    instant = new Instant({id:event_id, timestamp:event.timestamp, environment:environment});
                    path = new Path({id:n+path_start_id,announcedPath:currentPath,target:target,source:source, environment:environment});//n is a good id (must be integer)
                    tmpEvent = new Event({source:source,target:target,type:event.type,instant:instant,community:(attributes.community)?attributes.community.join(","):null, environment:environment});
                    tmpPath = attributes.path;

                    if (eventType == 'W' && prevPath != null){
                        shortdescription = "The route " + prevPath.toString() +" has been withdrawn.";
                        longdescription = "The route " + prevPath.toString() +" has been withdrawn...more";
                        subType = "withdrawal";
                        tmpEvent.attributes.path = null;
                    }else if (eventType == 'A' || eventType == 'B'){

                        tmpNode = bgplay.getNode(tmpPath[tmpPath.length-1]);
                        if (tmpNode.get("targets").length==0){
                            continue; //Traceroute incompleto
                        }
                        //tmpNode.addTarget(target); //In this way we can check hijacking
                        if (!arrayContains(target.get("nodes"), tmpNode)){
                            target.addNode(tmpNode);
                        }

                        for (var i=0; i<tmpPath.length; i++){
                            if (!tmpPath[i-1] || tmpPath[i-1]!=tmpPath[i])
                                path.addNode(bgplay.getNode(tmpPath[i]));
                        }

                        if (prevPath==null){
                            shortdescription = "The new route "+ path.get('announcedPath')+" has been announced";
                            longdescription = "The new route "+ path.get('announcedPath')+" has been announced..more";
                            subType = "announce";
                            tmpEvent.attributes.path = path; //The new path
                        }else{
                            if (prevPath.toString()==path.toString()){
                                if (prevPath.get('announcedPath')==path.get('announcedPath')){
                                    if (!ignoreReannouncements){
                                        shortdescription="The route "+ prevPath.get('announcedPath')+" has been announced again";
                                        longdescription="The route "+ prevPath.get('announcedPath')+" has been announced again..more";
                                        subType="reannounce";
                                        tmpEvent.attributes.path=prevPath; //The previous path
                                    }else{
                                        continue; //skip re-announcements
                                    }
                                }else{
                                    shortdescription="The route "+ prevPath.get('announcedPath')+" introduced/removed prepending "+path.get('announcedPath');
                                    longdescription="The route "+ prevPath.get('announcedPath')+" introduced/removed prepending "+path.get('announcedPath')+" ..more";
                                    subType="prepending";
                                    tmpEvent.attributes.path=path;
                                }
                            }else{
                                shortdescription="The route "+ prevPath.get('announcedPath')+" is changed to "+path.get('announcedPath');
                                longdescription="The route "+ prevPath.get('announcedPath')+" is changed to "+path.get('announcedPath')+" ..more";
                                subType="pathchange";
                                tmpEvent.attributes.path=path;//The new path
                            }
                        }
                    }
                    uniquePAth[source.id+"-"+target.id]=tmpEvent.attributes.path;
                    tmpEvent.attributes.shortdescription=shortdescription;
                    tmpEvent.attributes.longdescription=longdescription;
                    tmpEvent.attributes.prevPath=prevPath;
                    tmpEvent.attributes.subType=subType;
                    source.addEvent(tmpEvent);
                    bgplay.get("allEvents").put(instant,tmpEvent);
                    event_id++;
                }

                if (numNotValidWithdrawal>0){
                    if (numNotValidWithdrawal == 1){
                        environment.cssAlert.alert("A withdrawal applied to a not existent path","warning",3000);
                    }else{
                        environment.cssAlert.alert(numNotValidWithdrawal+" withdrawals applied to a not existent paths","warning",3000);
                    }
                }
            }

            createClusters(wrap);
            createNodes(wrap);
            createSources(wrap);
            createTargets(wrap);
            createEvents(createInitialState(wrap),wrap);

            bgplay.updateState();

            return true;
        }
    }
}
