/**
 * Created with JetBrains WebStorm.
 * User: Bobby
 * Date: 03/04/13
 * Time: 17.04
 * To change this template use File | Settings | File Templates.
 */


var PathView3D=Backbone.View.extend({

    initialize:function(){
        this.environment=this.options.environment;
        this.eventAggregator=this.environment.eventAggregator;
        this.scene=this.options.scene;
        this.height1 = this.options.height1;
        this.height2 = this.options.height2;
        this.color = this.options.color;
        this.source=this.options.source;
        this.target=this.options.target;
        this.path=this.options.path;
        this.visible=this.options.visible;
        this.graphView=this.options.graphView;
        this.toDraw=this.options.toDraw;

        this.bgplay=this.environment.bgplay;
        this.fileRoot=this.environment.fileRoot;
        this.key=this.source.id+"-"+this.target.id;

        this.pathP=[];
        //this.threePath="";

        this.userOpts	= {
            duration	: 600,
            delay		: 600
        };

        this.eventAggregator.on('firstPathDraw',function(node){
            if(this.toDraw==true){
                this.firstDraw();
            }

        },this);

        this.eventAggregator.on('nodeMoved',function(node){
            //console.log("path",this,node);
            var h,n;
            if (this.pathP!=null && this.path!=null && this.path.contains(node)){

                for(h=0;h<this.pathP.length;h++){
                    //console.log("1",this,node,nodes);
                    this.scene.remove(this.pathP[h]);
                    this.pathP[h]=null;
                }
            }
        },this);

        this.source.on('curEventChange',function(event){
            if (event.get("target")==this.target){ //Each PathView is a subscriber of its source.

                if (event.get("type")!="initialstate")
                    this.restoreCondition(event);

                if(this.toDraw==true){
                    this.updatePath(event);
                }
            }
        },this);

        this.source.on('curEventNull',function(event){
            if (event!=null && event.get("target")==this.target){
                var n,newPath,nodes;
                newPath=event.get("path");
                nodes=newPath.get("nodes");

                for(n=nodes.length-2;n>=0;n--){
                    this.pathP[n].visible=false;
                }
            }
        },this);

    },

    firstDraw:function(){
        var nodes = this.path.get("nodes");
        var n,node1,node2,drawnEdge,orderedNodes,reversed,sameEdge,myArc;

        for(n=0;n<nodes.length-1;n++){
            node1=nodes[n];
            node2=nodes[n+1];

            orderedNodes=this.graphView.graph.utils.absOrientation(node1,node2);
            reversed=(orderedNodes[0].id==node2.id);
            sameEdge=this.graphView.graph.edges.get({vertexStart:orderedNodes[0].view, vertexStop:orderedNodes[1].view});
            drawnEdge=this.isEdgeDrawn(sameEdge);

            if (drawnEdge==false || drawnEdge.key==this.key){
                myArc=this.getMyArc(sameEdge);
                this.pathP[n]= this.SetFlux([node1.view.x,0,node1.view.z],this.height1,this.height2,[node2.view.x,0,node2.view.z],this.height1,this.height2,"andata",this.color,this.visible);
                this.scene.add(this.pathP[n]);
                //myArc.drawn=true; //non implementato
            }
        }
    },

    getMyArc:function(arcs){
        var n,myArc,length;
        length=arcs.length;
        for (n=length;n--;){
            if (arcs[n].key==this.key){
                myArc=arcs[n];
                break;
            }
        }
        return myArc;
    },


    isEdgeDrawn:function(arcs){ //There is at least a drawn arc for this tree on this edge?
        var n;
        //console.log(arcs);
        for (n= 0;n<arcs.length;n++){
            if (arcs[n].drawn==true && arcs[n].subTreeId==this.subTreeId)
                return arcs[n];
        }
        return false;
    },

    restoreCondition:function(event){
        //this.animateTrueRemove(event);
        var evento=event.get("subType");
        this.path=event.get("prevPath"); //The new state is the previous one
        /////////////
        this.prevPath=this.path;
    },

    updatePath:function(event){
        this.path=event.get("path");
        switch (event.get("subType")) {
            case "withdrawal":
                this.animateTrueRemove(event);
                break;
            case "announce":
                this.animateNewPath(event);
                break;
            case "pathchange":
                this.animateRemoveChange(event);
                break;
            case "reannounce":
                this.animateMinorChanges(event);
                break;
            case "prepending":
                this.animateMinorChanges(event);
                break;
            default:
                //this.updateWithoutAnimation(); //not implemented
                break;
        }
    },

    animateNewPath:function(event){
        this.eventAggregator.trigger("graphAnimationComplete", false);
        var $this=this;

        var delays,h1,h2,nodes, n,node1,node2,color, newPath, seq, visibile=false;
        newPath=event.get("path");
        nodes=newPath.get("nodes");
        seq=0;
        delays=this.environment.config.graph.animationPathChangeDelay;
        h1=this.height1;
        h2=this.height2;
        color=this.color;
        //nodes=event.attributes.path.attributes.nodes;
        if(this.pathP==0){
            for(n=0;n<nodes.length-1;n++){
                node1=nodes[n];
                node2=nodes[n+1];
                this.pathP[n]= this.SetFlux([node1.view.x,0,node1.view.z],h1,h2,[node2.view.x,0,node2.view.z],h1,h2,"andata",color,visibile);
                this.scene.add(this.pathP[n]);
            }
        }

        for(n=nodes.length-2;n>=0;n--){
            this.pathP[n].visible=true;
            this.setUpTween(this.pathP[n],seq);
            seq++;
        }

        setTimeout(function(){
            $this.eventAggregator.trigger("graphAnimationComplete", true);
        },seq*delays);
    },

    animateRemoveChange:function(event){

        this.eventAggregator.trigger("graphAnimationComplete", false);
        var $this=this;
        var n,nodes,nodes2,delays,seq,h1,h2, node1,node2,color, newPath, visibile=false ;
        seq=0;
        //newPath=event.get("path");
        nodes2=event.attributes.path.attributes.nodes;//newPath.get("nodes");
        nodes=this.options.path.attributes.nodes;
        delays=this.environment.config.graph.animationPathChangeDelay;
        h1=this.height1;
        h2=this.height2;
        color=this.color;

        for(n=nodes.length-2;n>=0;n--){
            this.animateRemoveTween(this.pathP[n],seq);
            seq++;
        }
        this.pathP=[];
        seq=0;
        this.options.path=event.attributes.path;

        for(n=0;n<nodes2.length-1;n++){
            node1=nodes2[n];
            node2=nodes2[n+1];
            this.pathP[n]= this.SetFlux([node1.view.x,0,node1.view.z],h1,h2,[node2.view.x,0,node2.view.z],h1,h2,"andata",color,visibile);
            this.scene.add(this.pathP[n]);
        }

        for(n=nodes2.length-2;n>=0;n--){
            this.pathP[n].visible=true;
            this.setUpTween(this.pathP[n],seq);
            seq++;
        }

        setTimeout(function(){
            console.log(seq);
            $this.eventAggregator.trigger("graphAnimationComplete", true);
        },delays*(seq-1));

    },

    animateTrueRemove:function(event){
        this.eventAggregator.trigger("graphAnimationComplete", false);
        var $this=this;
        var n,nodes,delays;
        nodes=this.options.path.attributes.nodes;
        delays=this.environment.config.graph.animationPathChangeDelay;

        for(n=nodes.length-2;n>=0;n--){
            this.removeTween(this.pathP[n],this.height2);
        }

        this.pathP=[];
        this.options.path=event.attributes.path;

        setTimeout(function(){
            $this.eventAggregator.trigger("graphAnimationComplete", true);
        },delays*2);
    },

    animateMinorChanges:function(event){
        this.eventAggregator.trigger("graphAnimationComplete", false);
        var $this=this;
        var n;
        var path=event.get("path");
        var nodes=path.get("nodes");
        var delays=this.environment.config.graph.animationPathChangeDelay;

        for(n=nodes.length-2;n>=0;n--){
            this.minorTween($this.pathP[n],$this.height2);
        }

        setTimeout(function(){
            $this.eventAggregator.trigger("graphAnimationComplete", true);
        },delays*2);
    },

    updateWithoutAnimation:function(event){

    },

    setUpTween: function(flux,time){

        var update = function(){
            flux.scale.x=current.x1;
            flux.scale.z=current.z1;
            flux.position.x=current.x2;
            flux.position.z=current.z2;
        }
        var current= {
            x1: flux.scale.x,
            z1: flux.scale.z,
            x2: flux.position.x,
            z2: flux.position.z
        };

        //TWEEN.removeAll();

        var tweenHead = new TWEEN.Tween(current)
            .to( {
                x1:1,
                z1:1,
                x2:0,
                z2:0
            },this.userOpts.duration)
            .delay(this.userOpts.delay*time)
            .onUpdate(update);

        tweenHead.start();
    },

    animateRemoveTween: function(flux,time){

        var update = function(){
            flux.scale.x=current.x1;
            flux.scale.z=current.z1;
            flux.position.x=current.x2;
            flux.position.z=current.z2;
        }
        var current= {
            x1: flux.scale.x,
            z1: flux.scale.z,
            x2: flux.position.x,
            z2: flux.position.z
        };

        //TWEEN.removeAll();

        var tweenHead = new TWEEN.Tween(current)
            .to( {
                x1:0.0001,
                z1:0.0001,
                x2:flux.geometry.vertices[0].x-2,
                z2:flux.geometry.vertices[0].z-2
            },this.userOpts.duration)
            .delay(this.userOpts.delay*time)
            .onUpdate(update);

        tweenHead.start();
    },//TWEEN FINE

    removeTween: function(flux,h){

        var update = function(){
            flux.scale.y=current.y1;
            flux.position.y=current.y2;
        }
        var current= {
            y1: flux.scale.y,
            y2: flux.position.y
        };

        var tweenHead = new TWEEN.Tween(current)
            .to( {
                y1:2/*20*/,
                y2:-(0.8/*20*/*h)
            },this.userOpts.duration)
            .delay(this.userOpts.delay)
            .onUpdate(update);

        var tweenTail = new TWEEN.Tween(current)
            .to( {
                y1:0.0001,
                y2:0
            },this.userOpts.duration)
            .delay(this.userOpts.delay)
            .onUpdate(update);

        tweenHead.chain(tweenTail);

        tweenHead.start();
    },

    minorTween: function(flux,h){

        var update = function(){
            flux.scale.y=current.y1;
            flux.position.y=current.y2;
        }
        var current= {
            y1: flux.scale.y,
            y2: flux.position.y
        };

        var tweenHead = new TWEEN.Tween(current)
            .to( {
                y1:2/*20*/,
                y2:-(0.8/*20*/*h)
            },this.userOpts.duration)
            .delay(this.userOpts.delay)
            .onUpdate(update);

        var tweenTail = new TWEEN.Tween(current)
            .to( {
                y1:1,
                y2:0
            },this.userOpts.duration)
            .delay(this.userOpts.delay)
            .onUpdate(update);

        tweenHead.chain(tweenTail);

        tweenHead.start();
    },

    SetFlux:function(point1,hi1,hf1,point2,hi2,hf2,viaggio,color,nuovo){
        //viaggio: flusso andata, flusso ritorno per gestire cicli
        var squareMaterial, geom, v1, v2, v3, v4;

        squareMaterial = new THREE.MeshBasicMaterial({
            color: color, side: THREE.DoubleSide, opacity: 0.8, transparent:true
        });

        geom = new THREE.Geometry();
        //point1[]+1 su y per iniziare da (0,0,0)
        if(viaggio=="andata"){
            v1 = new THREE.Vector3(point1[0],point1[1]+hi1+1,point1[2]+2);
            v2 = new THREE.Vector3(point2[0],point2[1]+hi2+1,point2[2]+2);
            v3 = new THREE.Vector3(point2[0],point2[1]+hf2+1,point2[2]+2);
            v4 = new THREE.Vector3(point1[0],point1[1]+hf1+1,point1[2]+2);
        }else{
            v1 = new THREE.Vector3(point1[0],point1[1]+hi1+1,point1[2]-2);
            v2 = new THREE.Vector3(point2[0],point2[1]+hi2+1,point2[2]-2);
            v3 = new THREE.Vector3(point2[0],point2[1]+hf2+1,point2[2]-2);
            v4 = new THREE.Vector3(point1[0],point1[1]+hf1+1,point1[2]-2);
        }

        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);
        geom.vertices.push(v4);

        geom.faces.push( new THREE.Face4( 0, 1, 2 ,3) );

        var object = new THREE.Mesh( geom, squareMaterial );

        if(nuovo==true){
            object.visible=true;
        }else{
            object.scale.set(0.0001,1,0.0001);
            object.position.set(point2[0]-2,0,point2[2]-2);
            object.visible=false;
        }

        return object;
    }

});