/**
 * Created with JetBrains WebStorm.
 * User: Bobby
 * Date: 26/03/13
 * Time: 17.38
 * To change this template use File | Settings | File Templates.
 */


var GraphView3D=Backbone.View.extend({

    events:function(){
        return {
            "mousedown":"onDocumentMouseDown",
            "mouseup":"onDocumentMouseUp",
            "mousemove":"onDocumentMouseMove"
        }
    },


    initialize:function(){

        this.environment=this.options.environment;
        this.bgplay=this.environment.bgplay;
        this.fileRoot=this.environment.fileRoot;
        this.imageRoot = this.environment.imageRoot;
        this.eventAggregator=this.environment.eventAggregator;
        this.el=this.options.el;
        this.model=this.options.model;
        this.pathViews={};
        this.uniquePathsCheck=[];
        this.staticPaths=[];
        this.subtrees=[];
        this.graphAnimationsOngoing=0;

        this.dom=$(this.el);
        this.WIDTH=this.dom.width();
        this.HEIGHT=this.dom.height();

        this.graph=new BgplayGraph({parentDimensionX:this.WIDTH,parentDimensionY:this.HEIGHT, environment:this.environment});

        this.cliccato=false;
        this.isMouseDown=false;

        //console.log(this.dom);

        // set some camera attributes
        this.VIEW_ANGLE = 45;
        this.ASPECT = this.WIDTH / this.HEIGHT;
        this.NEAR = 1;
        this.FAR = 10000;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(  this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR  );
        this.camera.position.set(1, 700, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.initControl();

        this.object = [];
        this.sphere=new THREE.Mesh();
        this.projector = new THREE.Projector();
        this.mesh1=new THREE.Mesh();

        //Definizione Colori
        this.colorpin=	0x737485;
        this.colorf=new Array(
            0xff0000, 0xffcc00, 0x00ffaa, 0x005299, 0xf780ff, 0x590000, 0x594700, /*0xbfffea, 0xbfe1ff, */
            0x590053, 0x99574d, 0x66644d, 0x005947, 0x001433, 0xb3008f, 0x992900, 0x8f9900, 0x00ffee,
            0x001f73, 0xff0088, 0xffa280, 0xfbffbf, 0x003033, 0x0022ff, 0x804062, 0xffd0bf, 0xccff00,
            0x53a0a6, 0x8091ff, 0x99003d, 0xff6600, 0x293300, 0x00ccff, 0x7c82a6, 0x664d57, 0x332b26,
            0xa1e673, 0x00aaff, 0x6c29a6, 0xff0044, 0x593000, 0x44ff00, 0x003c59, 0xe1bfff, 0x330d17,
            0xffa640, 0x00590c, 0x23698c, 0x220033, 0xffbfd0, 0xd9b56c, 0x53a674, 0x4d5e66, 0xcc00ff,

            0xffcc00, 0x00ffaa, 0x005299, 0xf780ff, 0x590000, 0x594700, 0xbfffea, /*0xbfe1ff, 0xff0000, */
            0x590053, 0x99574d, 0x66644d, 0x005947, 0x001433, 0xb3008f, 0x992900, 0x8f9900, 0x00ffee,
            0x001f73, 0xff0088, 0xffa280, 0xfbffbf, 0x003033, 0x0022ff, 0x804062, 0xffd0bf, 0xccff00,
            0x53a0a6, 0x8091ff, 0x99003d, 0xff6600, 0x293300, 0x00ccff, 0x7c82a6, 0x664d57, 0x332b26,
            0xa1e673, 0x00aaff, 0x6c29a6, 0xff0044, 0x593000, 0x44ff00, 0x003c59, 0xe1bfff, 0x330d17,
            0xffa640, 0x00590c, 0x23698c, 0x220033, 0xffbfd0, 0xd9b56c, 0x53a674, 0x4d5e66, 0xcc00ff
        );

        this.heightpin=100;

        this.initWebGl();
        this.init();
        this.animate();

    },

    initWebGl:function(){
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.setClearColorHex(0xdddddd, 1);
    },

    initControl:function(){
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.minPolarAngle=0;
        this.controls.maxPolarAngle=Math.PI/2;
        this.controls.minDistance=50;
        this.controls.maxDistance=5000;
        this.controls.userPanSpeed= 8;
    },

    init:function(){

        this.scene.add(this.camera);

        //per attaccare il renderer al div giusto
        this.bgplayDom=this.environment.thisWidget.bgplayDom;
        this.GraphDiv=this.bgplayDom.find('.bgplayGraphDiv');
        this.GraphDiv.append(this.renderer.domElement);

        this.light	= new THREE.SpotLight( 0xFFAA88, 2 );
        this.light.position.set(-500,300,-500);
        this.light.shadowCameraFov = 120;
        this.light.target.position.set( 0, 0, 0 );
        this.light.shadowCameraNear = 0.01;
        this.light.castShadow = true;
        this.light.shadowDarkness = 0.5;
        this.light.shadowCameraVisible = true;
        this.scene.add(this.light);

        this.createAllNodes();
        this.createAllFlux();

        this.computeSubTrees();

        this.changeTree();

        this.graph.computePosition();
        console.log("graph",this);

        this.eventAggregator.trigger("updateNodesPosition");

        this.eventAggregator.trigger("firstPathDraw");

        this.eventAggregator.on("graphAnimationComplete",function(value){
            this.graphAnimationsOngoing += (value) ? -1 : +1;

            if (this.graphAnimationsOngoing==0){
                this.eventAggregator.trigger("allAnimationsCompleted",null);
            }

        },this);

    },

    changeTree:function(){
        var alpha=0, i,altezza,height1,height2,divisione;
        var $this=this;
        alpha=this.bgplay.attributes.sources.length;

        this.bgplay.get("sources").each(function(source){
            $.each(source.get("events"),function(key,tree){
                var path,target,event, n,staticPath,trovato;
                event=tree.first();
                path=event.get("path");
                staticPath=$this.staticPaths;
                trovato=false;
                for(n=0;n<staticPath.length;n++){
                    if(staticPath[n].attributes.announcedPath==event.attributes.path.attributes.announcedPath && trovato==false){
                        trovato=true;
                        alpha--;
                    }
                }
            });
        });

        divisione=alpha+$this.subtrees.length
        altezza= this.heightpin/divisione;
        height1=altezza*this.subtrees.length;
        height2=height1+altezza;
        i=this.subtrees.length;

        this.bgplay.get("sources").each(function(source){
                $.each(source.get("events"),function(key,tree){ //A tree for each target, almost always one
                    var path,target,event, n, j,h1,h2,sottoalbero,trovato,colore;
                    event=tree.first();
                    path=event.get("path");
                    target=event.get("target");
                    //console.log($this,path);
                    trovato=false;
                    for(n=0;n<$this.subtrees.length && trovato==false;n++){
                        sottoalbero=$this.subtrees[n];
                        for(j=0;j<sottoalbero.length && trovato==false;j++){
                            if(path.attributes.announcedPath==sottoalbero[j].attributes.announcedPath && trovato==false){
                                trovato=true;
                                h1=altezza*n;
                                h2=h1+altezza;
                                colore=$this.colorf[n];
                                $this.pathViews[source.id+"-"+target.id] = new PathView3D({scene:$this.scene,height1:h1,height2:h2,color:colore,source:source,target:target,path:path,visible:(event.get("type")=="initialstate"), environment:$this.environment, graphView:$this,toDraw:true});
                            }
                        }
                    }
                    if(trovato==false){
                        $this.pathViews[source.id+"-"+target.id] = new PathView3D({scene:$this.scene,height1:height1,height2:height2,color:$this.colorf[i],source:source,target:target,path:path,visible:(event.get("type")=="initialstate"), environment:$this.environment, graphView:$this,toDraw:true});
                        i++;
                        height1+=altezza;
                        height2+=altezza;
                    }
                });
        });

    },

    /////////////////////////////////////////////////////////////////////
    createAllNodes:function(){
        var $this=this;
        var target= $this.bgplay.get("targets").models[0].attributes.nodes[0].id;
        //console.log("mm", $this.bgplay.get("targets").models[0].attributes.nodes[0].id);
        this.bgplay.get("nodes").forEach(function(node){

            var xx= new NodeView3D({model:node,scene:$this.scene,object:$this.object,height:$this.heightpin, environment:$this.environment, target: target});
            $this.graph.addNode(xx);

        });
    },



    //////////////////////////////////////////
    createAllFlux:function(){

        var alpha=0, i,altezza,height1,height2;
        var $this=this;
        alpha=this.bgplay.attributes.sources.length;

        altezza= this.heightpin/alpha;
        height1=0;
        height2=altezza;
        i=0;

        this.bgplay.get("sources").each(function(source){
            $.each(source.get("events"),function(key,tree){ //A tree for each target, almost always one
                var path,target,event;
                event=tree.first();
                path=event.get("path");
                target=event.get("target");
                //console.log("mm",target.attributes.nodes[0].id);

                $this.pathViews[source.id+"-"+target.id] = new PathView3D({scene:$this.scene,height1:height1,height2:height2,color:$this.colorf[i],source:source,target:target,path:path,visible:(event.get("type")=="initialstate"), environment:$this.environment, graphView:$this,toDraw:false});

                tree.forEach(function(event){
                    var path=event.get("path");
                    if (path!=null){
                        var target=path.get("target");
                        var keyForUniquenessCheck=source.id+"-"+path.toString()+"-"+target.id;
                        var keyForStaticCheck=source.id+"-"+target.id;

                        if ($this.uniquePathsCheck[keyForUniquenessCheck]==null){ //In this stage, we want to skip both null and duplicated paths in order to have only unique and valid paths
                            $this.uniquePathsCheck[keyForUniquenessCheck]=true;
                            $this.pathViews[keyForStaticCheck].static=($this.pathViews[keyForStaticCheck].static==null)?true:false;
                            $this.graph.addPath(path);
                        }
                    }
                });

            });
            i++;
            height1=height1+altezza;
            height2=height2+altezza;
        });

        $.each(this.pathViews,function(key,element){
            if (element.static==true){
                $this.staticPaths.push(element.path);
            }
        });
    },
    /////////////////////////////////////

    thereIsCycle:function(path1,path2){
        var nodes1,nodes2;

        nodes1=path1.get("nodes");
        nodes2=path2.get("nodes");

        //First fast check
        if (nodes1[nodes1.length-1].id!=nodes2[nodes2.length-1].id){
            return true; //Avoids checks between paths with different targets
        }
        return (this.checkCycleOneWay(nodes1,nodes2) || this.checkCycleOneWay(nodes2,nodes1)); //If the first check returns true, the second will not start
    },

    checkCycleOneWay:function(path1,path2){
        var n,node,iteration;
        var notCommon=false;

        iteration=path1.length-1;
        for (n=1;n<=iteration;n++){
            node=path1[iteration-n]; //On-fly reverse

            if (!path2.contains(node)){

                notCommon=true;
            }else{
                if (notCommon){
                    return true; //A common node after a notCommon node
                }
            }
        }
        return false; //There isn't a cycle (the worst case for this algorithm, all nodes were checked)
    },

    computeSubTrees:function(){
        if (this.staticPaths.length==0)
            return;

        var n, i, tree, h, path1, path2, inThisTree,key;
        this.subtrees.push([this.staticPaths[0]]); //Initializes the first set (alias tree)
        this.pathViews[this.staticPaths[0].get("source").id+"-"+this.staticPaths[0].get("target").id].subTreeId=0;//The id of the subTree is the index of the array
         //console.log(this);
        for (h=1;h<this.staticPaths.length;h++){ //For each static path
            path1=this.staticPaths[h];

            inThisTree=true;
            for (n=0;n<this.subtrees.length;n++){ //Tries to insert the current static path in a set
                inThisTree=true;

                tree=this.subtrees[n];

                for (i=0;i<tree.length;i++){ //Checks if there is a cycle between the new path and the paths already in the set
                    path2=tree[i]; //A path in the set

                    if (this.thereIsCycle(path1,path2)){ //There is a cycle between two paths in the same set
                        inThisTree=false;
                        break; //Skip to check the other paths in the same tree
                    }
                }

                if (inThisTree){ //If no checks generates a negative result then we can put this path in the current set
                    this.pathViews[path1.get("source").id+"-"+path1.get("target").id].subTreeId=n;//The id of the subTree is the index of the array
                    this.subtrees[n].push(path1);
                    break; //Don't check in other trees
                }
            }

            if (!inThisTree){

                this.pathViews[path1.get("source").id+"-"+path1.get("target").id].subTreeId=this.subtrees.length;
                this.subtrees.push([path1]);
            }
        }
        this.applyTreeAtEdges();

    },

    applyTreeAtEdges:function(){
        var $this=this;

        this.graph.edges.forEach(function(edge){

            edge.subTreeId=$this.pathViews[edge.key].subTreeId;
        });
        //console.log($this);
    },

    ////////////////////////

    animate:function() {
        var that = this;
        requestAnimationFrame( function() { that.animate(); } );
        TWEEN.update();
        this.render();
    },

    render:function(){
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    cursorPositionInCanvas:function(canvas, event) {
        var x, y;
        canoffset = $(canvas).offset();

        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

        return [x,y];

    },

    onDocumentMouseDown:function(event){

        var $this=this;
        var mouse=[];
        event.preventDefault();
        this.isMouseDown=true;

        //console.log(event.clientX, event.clientY);

        mouse.x = ((this.cursorPositionInCanvas( this.renderer.domElement, event )[0]) / this.WIDTH) * 2 - 1;
        mouse.y = - ((this.cursorPositionInCanvas( this.renderer.domElement, event )[1])/ this.HEIGHT) * 2 + 1;

        var vector= new THREE.Vector3( mouse.x, mouse.y, 0.5);

        if(event.which == 1){

            this.projector.unprojectVector(vector, this.camera);

            var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

            var intersect = ray.intersectObjects(this.object);

            if(intersect.length>0){
                this.cliccato=true;

                //intersect[0].object.material.color.setHex(Math.random()*0xffffff);

                //CREAZIONE SCRITTA
                var canvas1 = document.createElement('canvas');
                canvas1.setAttribute('height', 25);

                var context1 = canvas1.getContext('2d');
                context1.font = "Bold 20px Arial";
                context1.fillStyle = "rgba(255,0,0,0.95)";
                context1.fillText(intersect[0].object.parent.name, 100, 20);

                // canvas contents will be used for a texture
                var texture1 = new THREE.Texture(canvas1);
                texture1.needsUpdate = true;

                var material1 = new THREE.MeshBasicMaterial( {map: texture1, depthWrite: true, depthTest: false,side:THREE.DoubleSide } );
                material1.transparent = true;

                this.mesh1 = new THREE.Mesh(
                    new THREE.PlaneGeometry(canvas1.width, canvas1.height),
                    material1
                );
                this.mesh1.position = intersect[0].point;
                this.mesh1.position.y= this.heightpin+30;
                this.mesh1.lookAt(this.camera.position);
                scritta= new THREE.Object3D();
                this.scene.add(this.mesh1);

                this.bgplay.get("nodes").forEach(function(node){

                    if(node.id==intersect[0].object.parent.name){
                        $this.eventAggregator.trigger("selectedNode",node );
                    }

                });

                //FINE CREAZIONE SCRITTA

            }else{
                //alert("cliccato a vuoto..");
            }
        }

    },

    onDocumentMouseMove:function(event){
        event.preventDefault();

        if(this.isMouseDown && this.cliccato){
            this.mesh1.lookAt(this.camera.position);
        }
    },

    onDocumentMouseUp:function(event){
        event.preventDefault();
        var $this=this;
        this.isMouseDown=false;
        this.cliccato=false;
        this.scene.remove(this.mesh1);
        $this.eventAggregator.trigger("infoPanelReleased", true);
    }
});