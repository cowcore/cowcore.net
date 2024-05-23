let options = {
    aSpeed:5000,
    wSpeed:600,
    loopScript:false,

    textColor:"black",
    textSize:"200",
    textOpacity:1,
    textBlendMode:"none",
    textOutlineColor:"black",
    textOutlineWidth:0,
    textGlow:false,
    textGlowStart:"#fff",
    textGlowEnd:"pink",
    textGlowSpeed:"1s",
    textBlur:false,
    textFont:"",
    
    blinkTime:2,

    spiralSpeed : "0.075s",
    spiralOpacity : 1,
    spiralBlendMode:"normal",
    spiralWidth:1.2,
    spiralColor:"red",
    
    backgroundColor:"#00ffdb",
//    backgroundGradient:"none",
    backgroundGradient:" radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
    
    overscanPlay:false,
    overscanIntensity:10,
    overscanSpeed:2500,
}
var set = new Proxy(options, {
  set: function (target, key, value) {
      target[key] = value;
      loadSettings();
      return true;
  }
});
let loadFile = function(url,dummy=false){
    if(!dummy){
        url =`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    }
    fetch(url)
        .then((res) => res.text())
        .then((text) => {
            if(!dummy){
                console.log(text)
                 text = JSON.parse(text).contents
            }
            processInput(text,dummy)
        })
        .catch((e) => console.error(e));
}
//loadFile("https://pastebin.com/raw/BZD6rZEw")
// loadFile("./dummydata2.txt",true)
let currentLine;
let lines;

let currentFont = "";
let loadedFonts = [];
let sFont = function(font){
    $("h1").css({ "font-family": font })
    currentFont = font;
}
let setFont = function(font,preload=false){
    if(loadedFonts.includes(font)){
        sFont(font);
        return;
    }
    try{

    WebFont.load({
        timeout: 3000,
        google: { 
               families: [font] 
         },
         active: () => {
             if(!preload){
                 sFont(font);
                 loadedFonts.push(font);
             }
         }
    });  
    }catch(err){
        console.log("E",err);
    }
}
let loadSettings = function(cb=-1,opt){
    if(currentFont!=options.textFont){
        setFont(options.textFont)
    }
    if(options.textGlow){
        $("h1").addClass("glow")
    }else{
        $("h1").removeClass("glow")
    }
    if(options.textBlur){
        $("h1").addClass("blur")
    }else{
        $("h1").removeClass("blur")
    }
    $(":root").css({"--glow-1":options.textGlowStart,"--glow-2":options.textGlowEnd});
    glowSettings.html('.glow{animation-duration:'+options.textGlowSpeed+';}');
    $("h1").css({color:options.textColor,"font-size":options.textSize+"px",opacity:options.textOpacity,"mix-blend-mode":options.textBlendMode,"-webkit-text-stroke-width":options.textOutlineWidth,"-webkit-text-stroke-color":options.textOutlineColor})
    $("#the-path animateTransform").attr("dur",options.spiralSpeed)
    $("#the-path").css({"stroke-width":options.spiralWidth,stroke:options.spiralColor})
    $("#spiral").css({"opacity":options.spiralOpacity,"mix-blend-mode":options.spiralBlendMode})
    if(options.backgroundGradient=="none"){
       $("#terminal").css({"background-image":"url('img/bg-test.png')" ,"background-blend-mode":"multiply"}); 
    }else{
       $("#terminal").css({"background-image":options.backgroundGradient,"background-blend-mode":"unset"}); 
    }
    if(options.overscanPlay && !overscanPlaying){
        loopOverscan();
    }
    if(options.overscanPlay==false && overscanPlaying==true){
        stopOverscan = true
    }
    if(cb!=-1){
        cb()
    }
}
let processInput = function(input,dummy){
    currentLine = 0;
    if(dummy){
        lines = input.split("\n")
    }else{
        lines = input.split("\r\n")
    }
    lines = lines.filter(n => n)
}
let processCmd = function(inp,opt){
    let validBlend = ["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity","plus-darker","plus-lighter"];
    opt = opt||{}
    inp = inp.substr(1,inp.length-2)
    inp = inp.split(",");
    for(i in inp){
        let c = inp[i];
        c = c.split(":")
        let key = c[0];
        let val = c[1];
        if(typeof(options[key])!=="undefined"){
            if(typeof(options[key])=="number"){
                options[key]=parseFloat(val);
            }else{
                options[key]=val;
            }
        }

        if(key=="preloadFonts"){
            val = val.split("/")
            for(nn in val){
                setFont(val[nn],true);
            }
        }
        if(key=="textBlend"){
            if(validBlend.includes(val)){
                options.textBlendMode=val;
            }else if(val=="random"){
                options.textBlendMode=getRandomEl(validBlend);
            }
        }
        if(key=="spiralBlend"){
            if(validBlend.includes(val)){
                options.spiralBlendMode=val;
            }else if(val=="random"){
                options.spiralBlendMode=getRandomEl(validBlend);
            }
        }
        if(key=="speed"){
            if(val.substr(-1)=="s"){
                val = parseInt(val.substr(0,key.length-1))*1000
            }
            options["aSpeed"]=parseInt(val)
        }
    }
    currentLine++;
    if(opt.loop){
        loadSettings(processFrame,opt)
    }else{
        loadSettings(-1,opt)
    }
}

const resolveAfter = (value, delay) =>
  new Promise(resolve => {
    setTimeout(() => resolve(value, delay));
  });

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
function processSingle(){
    processFrame({loop:false})
}
let playing=false;
function run(){
   playing=true; 
   processFrame()
}
async function processFrame(opt){
    if(!playing) return;
    opt=opt||{};
    let mode="normal";
    opt.loop=typeof(opt.loop)=="undefined"?1:opt.loop;
    if(currentLine>=lines.length){
        console.log("out of lines")
        currentLine=0;
        if(!options.loopScript){
           playing=false;
           return;
        }
    }
    cLine = lines[currentLine]
    if(cLine[0]=="["){ // handle settings
        processCmd(cLine,opt);
        return;
    }else if (cLine[0]=="#"){ // skip comments
        currentLine++;
        processFrame(opt);
        return;
    }else{
        let cmd
        if(cLine[0]=="!"){
            let c = cLine.split(" ");
            cmd = c[0];
            c.shift();
            cLine = c.join(" ")
        }else{
            cmd=""
        }
        if(cmd=="!blink"){
           cLine = cLine.split("/"); 
            for(cc in cLine){
                $("h1").text(cLine[cc]);
                await wait(options.blinkTime*1000)
            }
            currentLine++;
            if(opt.loop){
                await wait(options.aSpeed)
                processFrame();
            }
            return
        }else if(cmd=="!flash"){
            $("h1").addClass("blink")
        }else{
            $("h1").removeClass("blink")
        }
        $("h1").text(cLine);
    }
    currentLine++;
    if(opt.loop){
        await wait(options.aSpeed)
        $("h1").text("");
        await wait(options.wSpeed)
        processFrame();
    }
    
}
let playVideo=function(){
    $("video").get(0).play();
}

let glowSettings;
let blurSettings;
$(function(){
    loadurl();
    $("head").append('<style type="text/css"></style>');
    glowSettings = $("head").children(':last');
    glowSettings.html('.glow{animation-duration:1s;}');
 //   blurSettings = $("head").children(':last');
//    blurSettings.html('.blur{animation-duration:1s;}');
    set.spiralSpeed = 0; 
    $("#outer").click(function(){
        if(!playing){
            run()
        }else{
            playing=false;
        }
    })
    colFlip()
    chromaticAbberation(-6,6,6,-6)
    Ddistort(6)
})
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  
let hueSpeed = 500;
let colorShift=function(){
    $( "body" ).animate({
        filter: "hue-rotate("+getRandomArbitrary(0,360)+"deg)"
      }, hueSpeed, function() {
        //   colorShift();
      });
}

let loadurl=function(){
    let pr = new URLSearchParams(window.location.search)
    if(pr.has("url")){
        console.log("url",pr.get("url"))
       loadFile(pr.get("url")) 
    }
}