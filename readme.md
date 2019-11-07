
 Dumb and slow implementation of a Reactlike or d3like update model. You pass in a list of Slider State objects, and it updates/adds/deletes elements for you as needed. This is a dumb implementation, so it might not be sufficient for future projects. At the very least it doesn't leak memory in my testing :)
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


