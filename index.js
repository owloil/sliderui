



$(document).ready(function(){
    var myUI=new SliderUI("sliders");
    var bsval;

    var baseupdater=function(event,ui){ 
        var newsliderlist={  };
        newsliderlist.baseslider=bsval;
        newsliderlist["0"]={text:"N="+ui.value,ordering:"c",update:true,defaultvalue:myUI.getValue(0)};
        for(var n=1;n<ui.value;n++){
            newsliderlist[""+n]={text:"N="+n}
            if(n===1)
                newsliderlist[""+n].ordering="b";
        }
        myUI.setState(newsliderlist);
        myUI.logAlphabetized();
    };

    var bsval={min:0,ordering:"a",max:100,step:1,defaultvalue:0,onSlideFunc:baseupdater, text:"Base"}


    myUI.add("baseslider",bsval);
    myUI.add("0",{text:"N=0",ordering:"c"});
    myUI.add("1",{text:"foo"});
    myUI.add("2",{text:"man"});
    myUI.add("3",{text:"chu"});
});



