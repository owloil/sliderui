/* Dumb and slow implementation of a Reactlike or d3like update model. You pass in a list of Slider State objects, and it updates/adds/deletes elements for you as needed. This is a dumb implementation, so it might not be sufficient for future projects. At the very least it doesn't leak memory in my testing :)
 *
UI State objects look like the following:

state={
    slider1:{ 
        text:string,             <-- The text header that appears to the left of the slider. Necessary! All other values are optional and may be left undefined.
        min:number,  
        max:number, 
        step:number, 
        defaultValue:number,     <-- set to this value upon a rebuild() or if it's instantiated.
        update:bool,             <-- If true and this.setState is called, the corresponding element will be updated and then curState[key] is set to false.
        slide:function(event,ui) <-- Passed to the jquery-ui .on("slide",fn) event.
    }, 
    slider2: { ... },
    slider3: { ... }
};

Slider State Objects refer to the values ( {text:"hi"} ) in the above.

var SliderUI=function(ident){
    var curState={ }

    // Delete all elements of the UI and remove them from the DOM. Clear curState.
    this.clear=function()

    // Set the state to whatever you want. This updates/deletes the minimal number of elements.
    // If you have changed state[key]'s fields but have not set state[key].update=true, then the element will not be updated and the changes to its data will not even be stored!!!
    this.setState=function(state)

    //Removes all UI elements and rebuilds the tree from its model of the document in curState.
    this.rebuild=function()

    //Returns the available keys in curState
    this.keys=function()

    //Directly remove/add a specific key. Also updates DOM/yadda yadda.
    this.remove=function(key)
    this.add=function(key,statevalue)

    //Return the JQuery object corresponding to the slider.
    this.$get=function(key)

    //Return the value of the slider with the given key.    
    this.getValue=function(key)
}

 * */

var SliderUI=function(ident){
    var curState={ };

    this.clear=function(){
        if(curState){
        for(key in curState){
            $("#"+key).remove();
        }
        }
    };
    this.setState=function(state){
        /* Values are only considered to have changed/update if the key was changed or removed. */
        for(key in state){
            if( curState[key]===undefined){
                //Element added. "enter" selection.
                this.add(key,state[key]);
            }  else if(state[key].update===true){
                //Element updated. "update"
                this.update(key,state[key]);
            }
        }
        for(key in curState){
            if(state[key]===undefined){
                //Element removed. "exit" selection.
                this.remove(key);
            }
        }
    };
    this.rebuild=function(){
        var tmpCurState=curState;
        //delete all
        this.setState({ });
        //rebuild all
        this.setState(tmpCurState);
    };
    //Returns the available keys in curState
    this.keys=function() {
        return Object.keys(curState);
    };

    //Directly remove/add a specific key. Also updates DOM/yadda yadda.
    this.remove=function(key) { 
        if(curState[key]!==undefined){
            //Element removed. "Exit" selection.
            $("#"+ident+key+"div").remove();
            delete curState[key];
        } else {
            console.log("Warning: SliderUI.remove called with nonexistent element "+key+".");
        }
    };

    this.add=function(key,statevalue) {
        if(key===undefined || statevalue===undefined){
            console.log("Error: SliderUI.add called with key or statevalue undefined. Exiting function.");
            return;
        } else if( curState[key]!==undefined){
            console.log("Error: SliderUI.add called with already existing key "+key+". Exiting function.");
            return;
        }
        //Element added. "enter" selection.
        $("#"+ident).append('<div class="sliderholder" id="'+ident+key+'div"><span>'+statevalue.text+': </span><div class="minislider" id="'+ident+key+'"></div></div>');
        var v=(statevalue.defaultvalue===undefined )? 0.5:statevalue.defaultvalue; 
        var minv=(statevalue.min===undefined )? 0:statevalue.min; 
        var maxv=(statevalue.max===undefined )? 1:statevalue.max; 
        var stepv=(statevalue.step===undefined )? 0.001:statevalue.step; 
        $("#"+ident+key).slider({ min:minv, max:maxv ,step:stepv,value:v,slide:statevalue.onSlideFunc});

        //Copy the values into our curState
        curState[key]=Object.assign({ },statevalue);
        curState[key].update=false;
    };
    this.update=function(key,statevalue){
        if(key===undefined){
            this.rebuild();
        } else if(curState[key]===undefined){
            console.log("Warning: SliderUI.update() called with nonexistent key "+key+". Exiting function.");
        } else {

            if(statevalue===undefined){
                statevalue=curState[key];
            }

            var el=$('#'+ident+key);
            var v=(statevalue.defaultvalue===undefined )? 0.5:statevalue.defaultvalue; 
            var minv=(statevalue.min===undefined )? 0:statevalue.min; 
            var maxv=(statevalue.max===undefined )? 1:statevalue.max; 
            var stepv=(statevalue.step===undefined )? 0.001:statevalue.step; 

            //Update text label
            $('#'+ident+key+"div > span").html(statevalue.text+": ");

            //Update slider options min/max/step/value
            el.slider( "option", "min", minv );
            el.slider( "option", "max", maxv );
            el.slider( "option", "step", stepv );
            el.slider( "option", "value", v );

            //Update "on slide" function
            el.on("slide",statevalue.onSlideFunc);

            //Update the curState values
            curState[key]=Object.assign({ },statevalue);
            curState[key].update=false;
        }

    };

    //Return the JQuery object corresponding to the slider.
    this.$get=function(key){
        if(curState[key]===undefined){
            console.log("Error: SliderUI.$get() called with nonexistent key "+key+". Exiting function.");
            return;
        }
        return $("#"+ident+key);
    };

    //Return the value of the slider with the given key.    
    this.getValue=function(key){
        if(curState[key]===undefined){
            console.log("Error: SliderUI.getValue() called with nonexistent key "+key+". Exiting function.");
            return 0;
        }
        return $("#"+ident+key).slider("option","value");
    };
};
