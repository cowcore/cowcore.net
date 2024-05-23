
let setOverscan = function(perc){
    $("#warp").attr("x","-"+perc+"%");
    $("#warp").attr("y","-"+perc+"%");
    $("#warp").attr("width",(100+perc*2)+"%");
    $("#warp").attr("height",(100+perc*2)+"%");
}


let doResize = function(){
    //$("#terminal").height($("body").height());
    console.log($("#terminal").width());
    let w = $("#terminal").width();
    let h = $("#terminal").height();
    let ratio = ((h/w)*2)*100;
    console.log(ratio);
    $("#filterSource").attr("viewBox","0 0 "+w+" "+h);
    $("#filterSource2").attr("viewBox","0 0 "+w+" "+h);
    $(".xterm-screen").height($("#terminal").height())
}
let colDur=1500;
let lastCol = 0;
let curCol = 0;
let colFlip = function(){
    let target = getRandomArbitrary(0,360);
    $({foo:0}).animate({foo:100}, {
        step: function(val) {
            x = val
            curCol = Math.floor(lastCol+target*(x/100))
            $("body").css("filter","hue-rotate("+curCol+"deg)")
        },
        duration:colDur,
        complete:function(){
            lastCol=curCol;
            colFlip()
        }
    })
}
let distort = function(intensity,speed,func,rtn=true,callback=-1){
    if(callback==-1){
        callback = function(){}
    }
    $({foo:0}).animate({foo:100}, {
        step: function(val) {
            if(rtn){
                if(val<50) x = val;
                else x = 100-val;
            }else{
                x=val;
            }
            func(x*intensity);
            //            $("#despMap2").attr("scale",x*intensity)
        },
        duration:speed,
        complete:callback
    })
}
let Ddistort = function(i){
            $("#despMap2").attr("scale",i)
}
let stopOverscan=false
let overscanPlaying=false
let loopOverscan = function(){
    if(!stopOverscan){
        overscanPlaying=true
        distort(options.overscanIntensity,options.overscanSpeed,setOverscan,true,loopOverscan)
    }else{
        stopOverscan=false;
        overscanPlaying=false
    }
}
$(function(){
    setOverscan(17);
    doResize();
    $(".xterm-screen").height($("#terminal").height())


})

let startTerm = function(){
    const term = new Terminal({
        cols: 100,
        cursorBlink: true,
        fontSize:32,
        rows: 120
    });
    term.open(document.getElementById('terminalInner'), true)
    term.writeln('\n\nHello World!')
    term.onKey((k) => {
        console.log(k)
        if(k.key=="\r"){
            term.write("\r\n");
        }else{
            term.write(k.key);
        }
    });
    for(i=0;i<30;i++){
            term.write("Hello World!\r\n");
    }
}



var path = document.getElementById('the-path');

var roundTo = function (input, sigdigs) {
  return Math.round(input * Math.pow(10, sigdigs) ) / Math.pow(10, sigdigs);
}

var makeSpiralPoints = function(origin, revolutions, pointCount, clockwise, padding){
  var direction = clockwise ? 1 : -1;
  var circ = padding / (2 * Math.PI);
  var step = (2 * Math.PI * revolutions) / pointCount;
  var points = [], angle, x, y;
  for (var i = 0; i <= pointCount ; i++){
    angle = direction * step * i;
  	x = roundTo((circ * angle) * Math.cos(angle) + origin.x, 2);
    y = roundTo((circ * angle) * Math.sin(angle) + origin.y, 2);
    points.push(x + " " + y);
  }
  
  return('M ' + points.shift() + ' S ' + points.join(' '));
}
let chromaticAbberation=function(r1,r2,b1,b2){
    let channels = ["red_","blue_"];
    let inp = [[r1,r2],[b1,b2]]
    for(ch in channels){
        $("feOffset[in="+channels[ch]+"]").attr("dx",inp[ch][0]).attr("dy",inp[ch][1]);
    }
}

path.setAttribute('d', makeSpiralPoints({x:75,y:75},20, 2048, false, 4));


let getRandomEl = function(array){
    return array[Math.floor(Math.random() * array.length)];
}