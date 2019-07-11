/* Dumb and slow implementation of a Reactlike or d3like update model. You pass in a list of Slider State objects, and it updates/adds/deletes elements for you as needed. This is a dumb implementation, so it might not be sufficient for future projects. At the very least it doesn't leak memory in my testing :)
 *
UI State objects look like the following:

state={
    slider1:{ 
        text:string,             <-- The text header that appears to the left of the slider. Necessary! All other values are optional and may be left undefined.
        ordering:string,         <-- Sliders/UI elements will be put in lexicographic ordering.
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
    //List of key:StateObject pairs.
    var curState={ }; 

    //An array [[lex,key],...] maintained in reverse lexicographic ordering. eg [["z",key],["y",key],...].
    //Reverse ordering is useful for use with the function findIndex -- if a bunch of elements have the same ordering "zzz", it lets us easily find the last slider on the page.
    var alphabetized=[]; 

    //Add an element and maintain reverse lexicographic ordering (RLO. "z"<"y"<"x".).
    var addAlphabetized=function(order,key){ 
        //Find the first element where alphabetized[i]<order in RLO.
        var indexToSplice=alphabetized.findIndex( (a) => a[0].localeCompare(order)<=0);
        if(indexToSplice===-1){
            //If no such element exists, then we want to push onto the end.
            alphabetized.push([order,key]);
        } else {
            //If such an element exists, then we insert the element just before that.
            alphabetized.splice(indexToSplice,0,[order,key]);
        }
    };
    var removeAlphabetizedByKey=function(key){
        var toremove=alphabetized.findIndex( (a) => (a[1]===key) );
        if(toremove===-1){
            console.log("Internal error in SliderUI removeAlphabetized. Key "+key+" doesn't exist!");
        } else {
            alphabetized.splice(toremove,1);
        }
    };
    var sortAlphabetized=function(){
        alphabetized.sort( (a,b) => b[0].localeCompare(a[0]) );
    };

    //To insert a DOM element in the correct position, you should call $getAlphabetized(order).after("")
    //This will not / cannot work if there are currently zero elements in the DOM!!!
    var $getAlphabetized=function(order){
        if(alphabetized.length===0){
            console.log("Internal error in SliderUI $getAlphabetized. This function cannot be called when length===0.");
            return;
        }
        //Find the first element where alphabetized[i]<=order in RLO.
        var index=alphabetized.findIndex( (a) => a[0].localeCompare(order)<=0);
        console.log(index+", key="+alphabetized[index][1]);
        if(index===-1){
            index=alphabetized.length-1;
        }
        
        return $("#"+ident+alphabetized[index][1]+"div");

    };


    this.logAlphabetized=function(){
        console.log(alphabetized);
    };

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
            removeAlphabetizedByKey(key)
        } else {
            console.log("Warning: SliderUI.remove called with nonexistent element "+key+".");
        }
    };



    this.add=function(key,statevalue) {
        if(key===undefined || statevalue===undefined) {
            console.log("Error: SliderUI.add called with key or statevalue undefined. Exiting function.");
            return;
        } else if( curState[key]!==undefined) {
            console.log("Error: SliderUI.add called with already existing key "+key+". Exiting function.");
            return;
        }

        //Default ordering will be "zzz".
        var ordering=statevalue.ordering;
        if(ordering===undefined){
            ordering="zzz";
        }

        var html='<div class="sliderholder" id="'+ident+key+'div"><span>'+statevalue.text+': </span><div class="minislider" id="'+ident+key+'"></div></div>';
        if(alphabetized.length>0){
            console.log("Calling $getAlphabetized");
            $getAlphabetized(ordering).after(html);
        } else {
            $("#"+ident).append(html);
        }

        var v=(statevalue.defaultvalue===undefined )? 0.5:statevalue.defaultvalue; 
        var minv=(statevalue.min===undefined )? 0:statevalue.min; 
        var maxv=(statevalue.max===undefined )? 1:statevalue.max; 
        var stepv=(statevalue.step===undefined )? 0.001:statevalue.step; 
        $("#"+ident+key).slider({ min:minv, max:maxv ,step:stepv,value:v,slide:statevalue.onSlideFunc});

        //Copy the values into our curState
        curState[key]=Object.assign({ },statevalue);
        curState[key].update=false;
        curState[key].ordering=ordering;
        addAlphabetized(ordering,key);

    };
    this.update=function(key,statevalue){
        if(key===undefined){
            this.rebuild();
        } else if(curState[key]===undefined){
            console.log("Warning: SliderUI.update() called with nonexistent key "+key+". Exiting function.");
        } else {

            //If no statevalue was passed in, we just update the existing element.
            if(statevalue===undefined){
                statevalue=curState[key];
            }

            //If the ordering was not changed, then we update in place. Otherwise we reshuffle the DOM by adding and removing the element.
            if(statevalue.ordering === curState[key].ordering || statevalue.ordering === undefined) {
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
            } else {
                this.remove(key);
                this.add(key,statevalue);
            }
            //Set the element's update field to false.
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
