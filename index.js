

var slider


$(document).ready(function(){
    var myUI=new SliderUI("sliders");
    var bsval;

    var baseupdater=function(event,ui){ 
        var newsliderlist={  };
        newsliderlist.baseslider=bsval;
        newsliderlist[0]={text:"N="+ui.value,update:true,defaultvalue:myUI.getValue(0)};
        for(var n=1;n<ui.value;n++){
            newsliderlist[n]={text:"N="+n}
        }
        myUI.setState(newsliderlist);
    };

    var bsval={min:0,max:100,step:1,defaultvalue:0,onSlideFunc:baseupdater, text:"Base"}


    myUI.add("baseslider",bsval);
    myUI.add(0,{text:"N="});
});



