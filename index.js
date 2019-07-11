



$(document).ready(function(){
    var myUI=new SliderUI("sliders");
    var bsval;

    var baseupdater=function(event,ui){ 
        var newsliderlist={  };
        newsliderlist.baseslider=bsval;
        newsliderlist["0"]={text:"N="+ui.value,ordering:"c",update:true,defaultvalue:myUI.getValue(0)};
        for(var n=1;n<ui.value;n++){
            newsliderlist[""+n]={text:"N="+n}
        }
        myUI.setState(newsliderlist);
    };

    var bsval={min:0,ordering:"a",update:false,max:100,step:1,defaultvalue:0,onSlideFunc:baseupdater, text:"Base"}


    myUI.add("baseslider",bsval);
    myUI.add("newthing",{text:"This is a very long textual description. What will happen?"});
    myUI.add("0",{text:"N=0",ordering:"c"});
});



