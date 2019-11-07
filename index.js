$(document).ready(function(){
    var myUI=new SliderUI("sliders");
    var bsval;

    var baseupdater=function(event,ui){ 
        var newsliderlist={  };
        newsliderlist.baseslider=bsval;
        
        for(var n=1;n<ui.value;n++){
            var obj={text:"N="+n};
            if(n==1){
                obj={text:"This is a very long textual description. What will happen", ordering:"c", display:"above",hlineabove:true};
            } else if(n==2){
                obj={text:"Hair Color",hlineabove:true,ordering:"b"};
            } else if(n==3){
                obj={text:"Eyebrow Length", display:"inline",ordering:"d"};
            } else if(n==4){
                obj={text:"N=0",ordering:"c"};
            }
            newsliderlist[""+n]=obj;
        }
        myUI.setState(newsliderlist);
    };

    bsval={min:1,ordering:"a",update:false,max:20,step:1,defaultvalue:0,onSlideFunc:baseupdater, text:"Base"}


    myUI.add("baseslider",bsval);
});
