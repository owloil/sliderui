

var SliderUI=function(ident) {
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


    //An index of -1 means you should insert the element to the beginning of the DOM
    //Else, you should insert right after the index with key alphabetized[index][1].
    var getInsertIndex=function(order){
        //Find the first element where alphabetized[i]<=order in RLO.
        return alphabetized.findIndex( (a) => a[0].localeCompare(order)<=0);
    };



    this.clear=function(){
        if(curState){
            for(key in curState){
                this.remove(key);

            }
        }
    };

    this.setState=function(state){
        /* Values are only considered to have changed/update if the key was changed or removed. */
        for(key in state){
            if( curState[key]===undefined){
                //Element added. The "enter" selection.
                this.add(key,state[key]);
            }  else if(state[key].update===true){
                //Element updated. The "update" selection.
                this.update(key,state[key]);
            }
        }
        for(key in curState){
            if(state[key]===undefined){
                //Element removed. The "exit" selection.
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

        //Default ordering will be "zzz". The element gets added to the end of the list.
        var ordering=statevalue.ordering;
        if(ordering===undefined){
            ordering="zzz";
        }

        /* Build the actual html of the element */
        var divid=ident+key+'div';
        var spanclass="";
        var spantext=statevalue.text+": ";
        var sliderid=ident+key;
        var sliderclass=' class="sliderui-minislider"';

        var hrhtml="";
        if(statevalue.hlineabove)
            hrhtml="<hr>";

        if(statevalue.display==="above"){
            spantext=statevalue.text; // remove the ": ".
            sliderclass=' class="sliderui-fullslider"'; //Let the slider span 100% of the width
            spanclass=' class="sliderui-sliderabove"'; //Underline the text.
        }

        var html=`<div class="sliderui-sliderholder" id="${divid}">${hrhtml}
            <span${spanclass}>${spantext}</span>
            <div${sliderclass} id="${sliderid}"></div>
        </div>`;

        /* Insert the HTML at the right element */
        var index=getInsertIndex(ordering);
        if(index===-1)
            $("#"+ident).prepend(html);
        else
            $("#"+ident+alphabetized[index][1]+"div").after(html);

        /* Build the JQuery-UI slider */
        var v=(statevalue.defaultvalue===undefined )? 0.5:statevalue.defaultvalue; 
        var minv=(statevalue.min===undefined )? 0:statevalue.min; 
        var maxv=(statevalue.max===undefined )? 1:statevalue.max; 
        var stepv=(statevalue.step===undefined )? 0.001:statevalue.step; 
        $("#"+ident+key).slider({ min:minv, max:maxv ,step:stepv,value:v,slide:statevalue.onSlideFunc,range:"min"});

        /* Copy the values into our curState */
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

    this.logAlphabetized=function(){
        console.log(alphabetized);
    };
};
