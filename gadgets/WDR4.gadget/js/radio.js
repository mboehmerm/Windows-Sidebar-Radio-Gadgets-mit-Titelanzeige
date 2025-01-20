
var radioText   = "WDR4";
var radioUrl    = "https://www1.wdr.de/radio/wdr4/index.html";  // Homepage

var streamUrl   = "http://wdr-wdr4-live.icecast.wdr.de/wdr/wdr4/live/mp3/128/stream.mp3";  // Stream Adresse

var scraperUrl1 = "https://scraper.onlineradiobox.com/";    // Scraper Basis Adresse
var scraperUrl2 = "de.wdr4";                                // Scraper Adresse

var cover = "images/wdr4.png";  // Wird im Flyout angezeigt, wenn kein Cover verfügbar ist

// -------------------------------------------------------------------------------------------------
var orbUrl      = "https://onlineradiobox.com/"
var trackId     = "";

var updateInterval = 20000;     // Aktualisierung Titel/Interpret in ms
var rotateInterval =  4000;     // Aktualisierung Scrollen in ms
var output;
var longestValue = 0;
var posX = 120;
var posX2 = 120;
var animValues, animValues2;
var intVol;
var strVol;
var offset_Width = 115;
// -------------------------------------------------------------------------------------------------
// Wird beim Starten des Gadgets ausgeführt
window.onload = function(){
  var currentSetting = System.Gadget.Settings.read("stationPicker");
  if (currentSetting != ""){
    mediaPlayer.url  = currentSetting;}
  else{
    mediaPlayer.url = streamUrl;}

  System.Gadget.Flyout.file = "flyout.html"; // Flyout. Hier wird das Cover-Image angezeigt

  System.Gadget.onUndock = swapDockState;    // Initialisierung für Dock / Undock
  System.Gadget.onDock   = swapDockState;
  swapDockState();                                  // Siehe Beschreibung unten

  var ajaxUpdate=setInterval("AjaxGet()",updateInterval);    // Aktualisierung Titel/Interpret
  var rotateValues=setInterval("rotate()", rotateInterval);  // Aktualisierung Scrollen
  
  AjaxGet();                                                 // Titel bei onlineradiobox abfragen
}
// -------------------------------------------------------------------------------------------------
// Einmal aufrufen bedeutet : Kleines Fenster mit abgerundeten Ecken. Gr0ßes Fenster eckige Ecken.
// Oder umgekehrt.
// Zweimal aufrufen behält die Eckenform bei die man aber mit Doubleklick ändern kann.
function swapDockState(){
  swapDock();
  swapDock();
}
// -------------------------------------------------------------------------------------------------
function swapDock(){
  System.Gadget.beginTransition();
  if (System.Gadget.docked) {       // Gadget Docked = normale Größe
    offset_Width = 115;             // Offset in Pixel, ab dem der text gescrollt wird
    with (document.body.style) {
      width =130;
      height=73;
      backgroundImage = "url('images/Docked.png')";
      backgroundColor = "#00335E";
    }  
    with (song_info.style) {        // untere Zeile
      marginTop  =   "0px";
      marginLeft =   "6px";
      fontSize   =  "10px";
      width      = "115px";
      height     =  "12px";
    }
    with (song_title.style) {        // obere Zeile 
      marginTop  =   "6px";
      marginLeft =   "6px";
      fontSize   =  "10px";
      width      = "115px";
      height     =  "12px";
    }
    with (playbackControls.style) {  // Position Play Button
      right      =   "4px";
      bottom     =   "6px";
    }
    clearAnimInterval();
  }  
  else {                             // Gadget Undocked = verdoppelte Größe
    offset_Width = 230;
    with (document.body.style) {
      width =260;
      height=146;
      backgroundImage = "url('images/Undocked.png')";
      //backgroundColor = "#FFFFFF";
    }
    with (song_info.style) {
      marginTop  =   "0px";
      marginLeft =  "12px";
      fontSize   =  "15px";
      width      = "230px";
      height     =  "20px";
    }
    with (song_title.style) {
      marginTop  =  "12px";
      marginLeft =  "12px";
      fontSize   =  "15px";
      width      = "230px";
      height     =  "20px";
    }
    with (playbackControls.style) {
      right      =  "18px";
      bottom     =  "24px";
    }
    clearAnimInterval();
  }
  System.Gadget.endTransition(System.Gadget.TransitionType.none,0);  
}
// -------------------------------------------------------------------------------------------------
// Scrollen von Titel und Interpret, wenn der Test zu lang ist
function anim(){
  if(animCont.offsetWidth>offset_Width){
    posX --;
    animCont.style.left = posX;
    if (posX<-animCont.offsetWidth) posX = offset_Width;
  }else {
    animCont.style.left = 0;
    clearInterval(animValues);
  }
}
// -------------------------------------------------------------------------------------------------
function anim2(){
  if(animCont2.offsetWidth>offset_Width){
    posX2 --;
    animCont2.style.left = posX2;
    if (posX2<-animCont2.offsetWidth) posX2 = offset_Width;
  }else {
    animCont2.style.left = 0;
    clearInterval(animValues2);
  }
}
// -------------------------------------------------------------------------------------------------
function rotate(){
  parseData();
}
// -------------------------------------------------------------------------------------------------
// Titel bei onlineradiobox abfragen
function AjaxGet(){
  req = new XMLHttpRequest();
  if (req) {
      req.onreadystatechange = infoReceived;
      req.open("POST", scraperUrl1 + scraperUrl2 );
      req.send();
  }
}
// -------------------------------------------------------------------------------------------------
function parseData(){
    
  if (output.length)
  {
    output = output.replace(/\n+/m, '');
    output = output.replace(/&#39/g, "'");
    
    if (output.indexOf("|") > -1) {
      var fieldArray = output.split("|");
      animCont.innerHTML = SentenceCase(fieldArray[0]);
      animCont2.innerHTML = SentenceCase(fieldArray[1]);
    }
    else
    {
      animCont.innerHTML = output;
      animCont2.innerHTML = " ";
    }
  }
}
// -------------------------------------------------------------------------------------------------
function SentenceCase(str){
  var re = /\s*((\S+\s*)*)/;
  var str = str.replace(re, "$1");
  //str = str.toLowerCase();
  return str;
}
// -------------------------------------------------------------------------------------------------
function clearAnimInterval() {
  clearInterval(animValues);
  clearInterval(animValues2);
  var i = 15;
  if (System.Gadget.docked) 
    i = 50;
  animValues  = setInterval("anim()" , i);
  animValues2 = setInterval("anim2()", i);
}
// -------------------------------------------------------------------------------------------------
function infoReceived() {
  if (req.readyState == 4) {
    if (req.status == 200) {

      // Titel extrahieren
      var str = req.responseText;
      var re = /.*title":"/;
      str = str.replace(re, "");
      re  = /".*/
      str = str.replace(re, "");
      output = str;

      // TrackId = Video Addresse extrahieren
      str = req.responseText;
      if (str.indexOf('trackId"') > -1) {
        re = /.*trackId":"/;
        str = str.replace(re, "");
        re  = /".*/
        str = str.replace(re, "");
        trackId = str;
      }
      else {
        trackId = "";
      }
      
      // Cover Image Adresse extrahieren
      str = req.responseText;
      if (str.indexOf('iImg":') > -1) {
        re = /.*iImg":"/;
        str = str.replace(re, "");
        re  = /".*/
        str = str.replace(re, "");
        cover = str;
      }
      else {
        cover = "images/wdr4.png";  // Wird angezeigt, wenn kein Cover verfügbar ist
      }

      // Titel/Interpret korrigieren
      output = output.replace(" / "  , " | ");  // SWR3 
      output = output.replace(" - "  , " | ");  // Rockland, WDR4
      output = output.replace(" von ", " | ");  // HR3

      while (output.indexOf("\\u0026") > -1)      // UTF konvertieren
        output = output.replace("\\u0026", "&");
      output = output.replace("Ã„", "&Auml;");    // "Ã„rzte" korrigieren

      // Animation zurücksetzen
      //animCont.style.left = 0;
      clearAnimInterval();
      parseData();
    }
    else
    {
      output = "no internet ? |";
    }
  }  
}      
// -------------------------------------------------------------------------------------------------
function SettingsClosed() {
  var currentSetting = System.Gadget.Settings.read("stationPicker");
  if (currentSetting != "")
    mediaPlayer.url  = currentSetting;
}
// -------------------------------------------------------------------------------------------------
function controlImageClick() {    
  if(controlImage.src == "images/stop.png"){
    mediaPlayer.controls.stop();}
  else{
    mediaPlayer.controls.play();}
}
// -------------------------------------------------------------------------------------------------
function toggleFlyout() {  
  System.Gadget.Settings.write("coverAddress", cover);  
  System.Gadget.Settings.write('radioUrl'    , radioUrl);
  System.Gadget.Settings.write('radioText'   , radioText);
  System.Gadget.Settings.write('playlistUrl' , orbUrl + scraperUrl2.replace(".", "/") + "/playlist/");
  if (trackId.length) {
    System.Gadget.Settings.write('trackUrl'  , orbUrl + "track/" + trackId );
    System.Gadget.Settings.write('trackText' , "Video" );
  }
  else {
    System.Gadget.Settings.write('trackUrl'  , orbUrl );
    System.Gadget.Settings.write('trackText' , "Online Radio Box" );
  }
  if (System.Gadget.Flyout.show == false)
    System.Gadget.Flyout.show = true;
  else
    System.Gadget.Flyout.show = false;
}
// -------------------------------------------------------------------------------------------------
// Lautstärke
function volume(evt) {    

  intVol = parseInt(mediaPlayer.settings.volume);
  
  intVol = intVol + evt / 120 * 5;
  if (intVol < 0) 
    intVol = 0;
  else if (intVol > 100) 
    intVol = 100;
  
  strVol = "" + intVol + "";             // nasty fudge to keep things as a string
  mediaPlayer.settings.volume = strVol;
  
  output = "Volume : " + strVol;
  
  clearAnimInterval();
  parseData()
}
// -------------------------------------------------------------------------------------------------
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
// -------------------------------------------------------------------------------------------------