var audioURL;
var fullUrl = "http://spread.swr3.de/gadget.php";
var updateInterval = 30000; //ms
var rotateInterval = 2000;  //ms
var output;
var symbol = 0;
var longestValue = 0;
var posX = 120;
var posX2 = 120;
var animValues, animValues2;
window.onload = function()
{

  audioURL = "https://liveradio.swr.de/sw331ch/swr3/";
	var currentSetting = System.Gadget.Settings.read("stationPicker");
	if (currentSetting != ""){
		mediaPlayer.url  = currentSetting;}
	else{
		mediaPlayer.url = audioURL;}

	
  
  var ajaxUpdate=setInterval("AjaxGet()",updateInterval);
  var rotateValues=setInterval("rotate()", rotateInterval);
  
  AjaxGet();

}

function anim(){
  if(animCont.offsetWidth>95){
    posX --;
    animCont.style.left = posX;
    if (posX<-animCont.offsetWidth) posX = 95;
  }else {
    animCont.style.left = 0;
    clearInterval(animValues);
  }
}

function anim2(){
  if(animCont2.offsetWidth>95){
    posX2 --;
    animCont2.style.left = posX2;
    if (posX2<-animCont2.offsetWidth) posX2 = 95;
  }else {
    animCont2.style.left = 0;
    clearInterval(animValues2);
  }
}

function rotate(){
  symbol++;
  if (symbol>3) symbol=1;
  parseData();
}

function AjaxGet(){
		req = new ActiveXObject("Microsoft.XMLHTTP");
    if (req) {
        req.onreadystatechange = infoReceived;
        req.open("GET", fullUrl, true);
        req.send();
    }
}

function parseData(){
  	
	if (output.length)
	{
		output = output.replace(/\n+/m, '');
		output = output.replace(/&#39/g, "'");

		var fieldArray = output.split("|");

    animCont.innerHTML = SentenceCase(fieldArray[0]);
    animCont2.innerHTML = SentenceCase(fieldArray[1]);
	}
}

function SentenceCase(str){
  var re = /\s*((\S+\s*)*)/;
	var str = str.replace(re, "$1");
  str = str.toLowerCase();
  return str;
}

function infoReceived() {
	 if (req.readyState == 4) {
        if (req.status == 200) {
          output = req.responseText;
          //animCont.style.left = 0;
          clearInterval(animValues);
          clearInterval(animValues2);
          animValues = setInterval("anim()",50);
          animValues2 = setInterval("anim2()",50);
		      parseData();
         }
    }
}

function SettingsClosed() 
{
	var currentSetting = System.Gadget.Settings.read("stationPicker");
	if (currentSetting != "")
		mediaPlayer.url  = currentSetting;
}

function controlImageClick() {		
	if(controlImage.src == "images/stop.png"){
		mediaPlayer.controls.stop();}
	else{
		mediaPlayer.controls.play();}
}

function playStateChange(newstate) {
	switch (newstate){ 
	case 1: // Stopped
		animCont2.innerHTML = "";
		controlImage.src = "images/play.png";
		break;

	case 2: // Paused
		animCont2.innerHTML = "";
		controlImage.src = "images/play.png";
		break;
	
	case 3: // Playing
		animCont2.innerHTML = "";
		controlImage.src = "images/stop.png";
		break;

	case 6: // Buffering
		animCont2.innerHTML = "";
		break;

	case 7: // Waiting
		animCont2.innerHTML = "";
		break;

	case 8: // Media Ended
		animCont2.innerHTML = "";
		controlImage.src = "images/play.png";
		break;

	case 9: // Transitioning
		animCont2.innerHTML = "";
		break;

	case 10: // Ready
		animCont2.innerHTML = "";
		controlImage.src = "images/play.png";
		break;
	}
}
