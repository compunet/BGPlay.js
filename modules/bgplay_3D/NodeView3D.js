/**
 * Created with JetBrains WebStorm.
 * User: Bobby
 * Date: 28/03/13
 * Time: 20.03
 * To change this template use File | Settings | File Templates.
 */


var NodeView3D=Backbone.View.extend({

    initialize:function(){
        this.environment=this.options.environment;
        this.scene=this.options.scene;
        this.object = this.options.object;
        this.height = this.options.height;
        this.model=this.options.model;
        this.target=this.options.target;
        this.eventAggregator=this.environment.eventAggregator;
        //console.log(this.environment.config.graph);
        this.x=Math.floor(Math.random()*100);
        this.z=Math.floor(Math.random()*100);
        this.y=this.z;
        this.oldX=this.x;
        this.oldZ=this.z;
        this.oldY=this.oldZ;
        //console.log("node",this);
        this.colorpin=0x737485;

        this.neighbors=[];
        this.id=this.model.id;
        this.model.on('change',this.render,this);
        this.model.view=this;
        this.Pin=this.SetPin();
        this.scene.add(this.Pin);

        this.eventAggregator.on("updateNodesPosition",function(){
            this.updatePosition();
        },this);
    },

    updatePosition:function(){
        this.z=this.y;
        //console.log(this);
        this.translate(this.x,this.z,this);
        this.oldX=this.x;
        this.oldZ=this.z;
        this.oldY=this.y;
        this.eventAggregator.trigger("nodeMoved",this.model);
    },

    translate:function(x,z,$this){
        if (!$this)
            $this=this;

        $this.Pin.position.set(x,0,z);
        //$this.x+=x;
        //$this.z+=z;
        //$this.eventAggregator.trigger("nodeMoved",$this.model);
    },

    SetPin:function(){

        var pin,material, tip, base, top, colore;
        pin = new THREE.Object3D();

        if(this.getLabel()==this.target){

            //colore=0xff0000;
            material = new THREE.MeshLambertMaterial({
                color: 0xff0000//, wireframe:true //0x006400
            });

            tip = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, this.height, 32, false), material);
            tip.position.set(0,this.height/2+1,0);
            top = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), material);
            top.position.set(0,this.height+5,0);
            base= new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 5, 32, false), material);

        }else{

            //colore=this.colorpin;
            material = new THREE.MeshLambertMaterial({
                color: this.colorpin//, wireframe:true //0x006400
            });

            tip = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, this.height, 32, false), material);
            tip.position.set(0,this.height/2+1,0);
            top = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), material);
            top.position.set(0,this.height+5,0);
            base= new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 2, 32, false), material);

        }




        //base.name=this.getLabel();
        //tip.name=this.getLabel();
        //top.name=this.getLabel();

        pin.add(base);
        //object.push per renderlo cliccabile
        this.object.push(base);
        pin.add(tip);
        this.object.push(tip);
        pin.add(top);
        this.object.push(top);

        pin.name=this.getLabel();

        pin.position.x=this.x;
        pin.position.z=this.z;

        //set(this.x,0,this.z);
        //console.log("pin",pin);
        return pin;
    },

    getLabel:function(){
        return this.model.toString();
    }
});