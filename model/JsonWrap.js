/*
 * BGPlay.js
 * Copyright (c) 2013 Massimo Candela, Giuseppe Di Battista, Claudio Squarcella, Roma Tre University and RIPE NCC
 * http://www.bgplayjs.com
 *
 * See the file LICENSE.txt for copying permission.
 */

function JsonWrap(wrap){
    if (wrap.nodes.length==0){
        alert('No information available');
        document.location=this.environment.config.homeUrl;
    }
    bgplay = new Bgplay({
        cur_instant:new Instant({
            id:0,
            timestamp:wrap.starttimestamp
        }),
        starttimestamp:wrap.starttimestamp,
        endtimestamp:wrap.endtimestamp,
        type:wrap.type
    });

    function createNodes(wrap){
        var node;
        var newnode;
        if (wrap.type=='bgp'){
            for (var n=0;n<wrap.nodes.length;n++){
                node=wrap.nodes[n];
                newnode=new Node({id:node.id,asnumber:node.info.asnumber,as:node.info.as,owner:node.info.owner,nodeUrl:node.info.url,companywebsite:node.info.companywebsite});
                bgplay.addNode(newnode);
            }
        }
        delete wrap.nodes;
    }

    function createSources(wrap){
        var source;
        var sourceNode;
        var newsource;
        if (wrap.type=='bgp'){
            for (var n=0;n<wrap.sources.length;n++){
                source=wrap.sources[n];
                sourceNode=bgplay.getNode(source.group);
                newsource=new Source({id:source.id,group:sourceNode,shortdescription:source.shortdescription,longdescription:source.longdescription,url:source.url});
                bgplay.addSource(newsource);
                if (sourceNode!=null)
                    sourceNode.addSource(newsource);
            }
        }
        delete wrap.sources;
    }

    function createTargets(wrap){
        var target;
        var newtarget;
        if (wrap.type=='bgp'){
            for (var n=0;n<wrap.targets.length;n++){
                target=wrap.targets[n];
                newtarget=new Target({id:target.id,shortdescription:target.shortdescription,longdescription:target.longdescription,url:target.url});
                bgplay.addTarget(newtarget);
            }
        }
    }

    function createInitialState(wrap){
        var path,event,initialstate,source,tmpPath,target;
        var uniquePAth=[];

        if (wrap.type=='bgp'){
            for (var n=0;n<wrap.initialstate.length;n++){
                initialstate=wrap.initialstate[n];

                target=bgplay.getTarget(initialstate.target);
                source=bgplay.getSource(initialstate.source);

                path=new Path({id:n,announcedPath:initialstate.path,target:target,source:source});
                uniquePAth[source.id+"-"+target.id]=path;

                tmpPath=initialstate.path.split(" ");


                bgplay.getNode(tmpPath[tmpPath.length-1]).addTarget(target); //In this way we can check hijacking


                for (var i=0;i<tmpPath.length;i++){
                    if (!tmpPath[i-1] || tmpPath[i-1]!=tmpPath[i])
                        path.addNode(bgplay.getNode(tmpPath[i]));
                }
                event=new Event({subType:"initialstate",type:"initialstate",source:source,target:target,path:path,instant:bgplay.get("cur_instant"),shortdescription:initialstate.shortdescription,longdescription:initialstate.longdescription});
                source.addEvent(event);
                bgplay.get("allEvents").put(bgplay.get("cur_instant"),event);
                delete wrap.initialstate[n];
            }
        }
        return uniquePAth;
    }
    /*
     function subCreateEvents(events,event_id){
     if (events.length==0)
     return;
     var event,instant,eventType,currentPath,attributes,shortdescription,source,longdescription,path,target,tmpEvent,prevPath,tmpPath,subType;
     event=events[0];

     eventType=event.type;
     attributes=event.attrs;
     currentPath=attributes.currentpath;
     source=bgplay.getSource(attributes.source);
     instant=new Instant({id:event_id,timestamp:event.timestamp});
     target=bgplay.getTarget(attributes.target);
     path=new Path({id:event_id,announcedPath:currentPath});//n is a good id (must be integer)
     tmpEvent=new Event({source:source,target:target,type:event.type,instant:instant,community:attributes.community});

     prevPath=tmpEvent.getPath();
     tmpPath=currentPath.split(" ");

     if (eventType=='W'){
     shortdescription="The route "+ prevPath.toString()+" has been withdrawn.";
     longdescription="The route "+ prevPath.toString()+" has been withdrawn...more";
     subType="withdrawal";
     }else if (eventType=='A' || eventType=='B'){

     bgplay.getNode(tmpPath[tmpPath.length-1]).addTarget(target); //In this way we can check hijacking

     for (var i=0;i<tmpPath.length;i++){
     if (!tmpPath[i-1] || tmpPath[i-1]!=tmpPath[i])
     path.addNode(bgplay.getNode(tmpPath[i]));
     }


     if (prevPath==null){
     shortdescription="The new route "+ path.get('announcedPath')+" has been announced";
     longdescription="The new route "+ path.get('announcedPath')+" has been announced..more";
     subType="announce";
     }else{
     if (prevPath.toString()==path.toString()){
     if (prevPath.get('announcedPath')==path.get('announcedPath')){
     shortdescription="The route "+ prevPath.get('announcedPath')+" has been announced again";
     longdescription="The route "+ prevPath.get('announcedPath')+" has been announced again..more";
     subType="reannounce";
     }else{
     shortdescription="The route "+ prevPath.get('announcedPath')+" introduced prepending "+path.get('announcedPath');
     longdescription="The route "+ prevPath.get('announcedPath')+" introduced prepending "+path.get('announcedPath')+" ..more";
     subType="prepending";
     }
     tmpEvent.attributes.path=prevPath;
     }else{
     shortdescription="The route "+ prevPath.get('announcedPath')+" is changed to "+path.get('announcedPath');
     longdescription="The route "+ prevPath.get('announcedPath')+" is changed to "+path.get('announcedPath')+" ..more";
     subType="pathchange";
     tmpEvent.attributes.path=path;
     }
     }

     }
     tmpEvent.attributes.shortdescription=shortdescription;
     tmpEvent.attributes.longdescription=longdescription;
     tmpEvent.attributes.subType=subType;
     source.addEvent(tmpEvent);
     bgplay.get("allEvents").put(instant,tmpEvent);
     //event_id++;
     return subCreateEvents(events.slice(1),event_id+1);
     }

     */
    function createEvents(uniquePAth,wrap){
        var event_id=1;
        var event,instant,eventType,currentPath,attributes,shortdescription,source,longdescription,path,target,tmpEvent,prevPath,tmpPath,subType;
        var ignoreReannouncements=(getUrlParam("reannouncements")==null)?this.environment.config.ignoreReannouncementsByDefault : (getUrlParam("reannouncements")=="false")
        var path_start_id=uniquePAth.length;

        if (wrap.type=='bgp'){

            for (var n=0;n<wrap.events.length;n++){
                event=wrap.events[n];
                eventType=event.type;
                attributes=event.attrs;
                source=bgplay.getSource(attributes.source);

                target=bgplay.getTarget(attributes.target);

                prevPath=uniquePAth[source.id+"-"+target.id];



                if (eventType=='W' && prevPath==null)//We don't know nothing about..nothing (in withdrawal entry there isn't a path and there isn't a previous path in cache)
                    continue;

                currentPath=attributes.currentpath;
                instant=new Instant({id:event_id,timestamp:event.timestamp});
                path=new Path({id:n+path_start_id,announcedPath:currentPath,target:target,source:source});//n is a good id (must be integer)
                tmpEvent=new Event({source:source,target:target,type:event.type,instant:instant,community:attributes.community});
                tmpPath=currentPath.split(" ");

                if (eventType=='W' && prevPath!=null){
                    shortdescription="The route "+ prevPath.toString()+" has been withdrawn.";
                    longdescription="The route "+ prevPath.toString()+" has been withdrawn...more";
                    subType="withdrawal";
                    tmpEvent.attributes.path=null;
                }else if (eventType=='A' || eventType=='B'){

                    bgplay.getNode(tmpPath[tmpPath.length-1]).addTarget(target); //In this way we can check hijacking

                    for (var i=0;i<tmpPath.length;i++){
                        if (!tmpPath[i-1] || tmpPath[i-1]!=tmpPath[i])
                            path.addNode(bgplay.getNode(tmpPath[i]));
                    }

                    if (prevPath==null){
                        shortdescription="The new route "+ path.get('announcedPath')+" has been announced";
                        longdescription="The new route "+ path.get('announcedPath')+" has been announced..more";
                        subType="announce";
                        tmpEvent.attributes.path=path; //The new path
                    }else{
                        if (prevPath.toString()==path.toString()){
                            if (prevPath.get('announcedPath')==path.get('announcedPath')){
                                if (!ignoreReannouncements){
                                    shortdescription="The route "+ prevPath.get('announcedPath')+" has been announced again";
                                    longdescription="The route "+ prevPath.get('announcedPath')+" has been announced again..more";
                                    subType="reannounce";
                                    tmpEvent.attributes.path=prevPath; //The previous path for re-announcements
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
            delete wrap.events[n];
        }
        delete uniquePAth;
    }

    /*
     function createEvents(wrap){
     return subCreateEvents(wrap.events,0);
     }
     */

    createNodes(wrap);
    createSources(wrap);
    createTargets(wrap);
    createEvents(createInitialState(wrap),wrap);

    bgplay.updateState();
}
