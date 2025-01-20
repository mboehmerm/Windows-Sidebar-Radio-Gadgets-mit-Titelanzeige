// Standard Stream Addresse
var audioURL   = "https://stream.rockland-digital.de/";
// onlineradiobox Adressen 
var scraperUrl = "https://scraper.onlineradiobox.com/";
var rockUrl    = "de.rocklandlandesweit";
var swr3Url    = "de.swr3live";
var wdr4Url    = "de.wdr4";
var hr3Url     = "de.hr3radio";
var scrUrl     = "";
var fullUrl;
var radioUrl   = "http://www.rockland.de";
var radioText  = "Rockland";
var trackId    = "";
var updateInterval = 20000; //ms
var rotateInterval = 4000;  //ms
var output   = "Rockland Radio | Bester ROCK 'N POP";
var cover    = "images/Rockland.png";
var coverImg = "images/Rockland.png";
var posX  = 140;
var posX2 = 140;
var animValues, animValues2;
var offset_Width = 115;
var radioNoPlaylist = false;
// -------------------------------------------------------------------------------------------------
window.onload = function()
{
  fullUrl = rockUrl;

  var currentSetting = System.Gadget.Settings.read("stationPicker");
  if (currentSetting != ""){
    mediaPlayer.url  = currentSetting;}
  else{
    mediaPlayer.url = audioURL;}

  System.Gadget.settingsUI = "Settings.html";       // Settings
  System.Gadget.onSettingsClosed = SettingsClosed;
  System.Gadget.Flyout.file = "flyout.html";        // Hier wird das Cover-Image angezeigt

  System.Gadget.onUndock = swapDockState;           // Initialisierung für Dock / Undock
  System.Gadget.onDock   = swapDockState;
  swapDockState();                                  // Siehe Beschreibung unten
  
  var ajaxUpdate=setInterval("AjaxGet()",updateInterval);
  var rotateValues=setInterval("rotate()", rotateInterval);
  
  AjaxGet();
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
      backgroundColor = "#000000";
    }  
    with (song_info.style) {        // untere Zeile
      marginTop  =   "0px";
      marginLeft =   "6px";
      fontSize   =  "10px";
      width      = "115px";
      height     =  "12px";
    }
    with (song_title.style) {        // obere Zeile 
      marginTop  =  "40px";
      marginLeft =   "6px";
      fontSize   =  "10px";
      width      = "115px";
      height     =  "12px";
    }
    with (playbackControls.style) {  // Position Play Button
      right      =   "4px";
      bottom     =   "9px";
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
      marginTop  =  "95px";
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
function AjaxGet(){

    fullUrl = "";  

    // onlineradiobox Addresse je nach Stream Adresse.
    // Stream Addressen sind in settings.html
    if (mediaPlayer.url.indexOf("rockland") > -1) {
      fullUrl = scraperUrl + rockUrl;
      scrUrl  = rockUrl;
      radioUrl   = "http://www.rockland.de";
      radioText  = "Rockland";
      }
    else if (mediaPlayer.url.indexOf("swr3") > -1) {
      fullUrl = scraperUrl + swr3Url; 
      scrUrl  = swr3Url;
      radioUrl   = "http://www.swr3.de";
      radioText  = "SWR3";
      }
    else if (mediaPlayer.url.indexOf("wdr4") > -1) {
      fullUrl = scraperUrl + wdr4Url;
      scrUrl  = wdr4Url;
      radioUrl   = "https://www1.wdr.de/radio/wdr4/index.html";
      radioText  = "WDR4";
      }
    else if (mediaPlayer.url.indexOf("hr3") > -1) {
      fullUrl = scraperUrl + hr3Url; 
      scrUrl  = hr3Url;
      radioUrl   = "http://www.hr3.de";
      radioText  = "HR3";
      }
    if (fullUrl != "") {
    //if (fullUrl.length > 0) {
      req = new XMLHttpRequest();
      if (req) {
        req.onreadystatechange = infoReceived;
        req.open("POST", fullUrl, true);
        req.send();
      }
    }  
    else {
      if (output.indexOf("Volume :") > -1)  // löschen von "Volume : xx"
        output = "";
    }    
}
// -------------------------------------------------------------------------------------------------
function parseData(){
    
  if (output.length)  // Sender mit Info über Titel/Interpret, Anzeige Lautstärke oder no Internet
  {
    radioNoPlaylist = false;
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
  else  // Sender ohne Info über Titel/Interpret
  {
    radioNoPlaylist = true;
    radioUrl  = "http://www.rockland.de";
    radioText = "Rockland";
    trackId   = "";
    
    animCont.innerHTML  = "Rockland Radio";
    animCont2.innerHTML = "bester ROCK 'N POP";
    
    if (mediaPlayer.url.indexOf("classic") > -1) {
      animCont2.innerHTML = "Best of Classic Rock";
      coverImg = "images/Classic.png"; }
    else if (mediaPlayer.url.indexOf("softrock") > -1) {
      animCont2.innerHTML = "Best of Soft Rock";
      coverImg = "images/Soft.png"; }
    else if (mediaPlayer.url.indexOf("hardrock") > -1) {
      animCont2.innerHTML = "Best of Hard Rock";
      coverImg = "images/Hard.png"; }
    else if (mediaPlayer.url.indexOf("80rock") > -1) {
      animCont2.innerHTML = "Best of 80er";
      coverImg = "images/80s.png"; }
    else if (mediaPlayer.url.indexOf("90rock") > -1) {
      animCont2.innerHTML = "Best of 90er";
      coverImg = "images/90s.png"; }
    else if (mediaPlayer.url.indexOf("party") > -1) {
      animCont2.innerHTML = "Best of Party Rock";
      coverImg = "images/Party.png"; }
    else if (mediaPlayer.url.indexOf("altrock") > -1) {
      animCont2.innerHTML = "Best of Alternative Rock";
      coverImg = "images/Alternative.png"; }
    else if (mediaPlayer.url.indexOf("deutsch") > -1) {
      animCont2.innerHTML = "Best of Deutsch Rock";
      coverImg = "images/Deutsch.png"; }
    else if (mediaPlayer.url.indexOf("metal/") > -1) {
      animCont2.innerHTML = "Nonstop Metal";
      coverImg = "images/Metal.png"; }
    else if (mediaPlayer.url.indexOf("metallica") > -1) {
      animCont2.innerHTML = "Best of Metallica";
      coverImg = "images/Metallica.png"; }
    else if (mediaPlayer.url.indexOf("acdc") > -1) {
      animCont2.innerHTML = "Best of AC/DC";
      coverImg = "images/ACDC.png"; }
    else if (mediaPlayer.url.indexOf("rammstein") > -1) {
      animCont2.innerHTML = "Best of Rammstein";
      coverImg = "images/Rammstein.png"; }
    else if (mediaPlayer.url.indexOf("xmasrock") > -1) {
      animCont2.innerHTML = "Best of X-Mas Rock";    
      coverImg = "images/Xmas.png"; }
    
    cover   = coverImg;    
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
  // output = "abc";
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
        cover = coverImg;
      }
      
      output = output.replace(" / ", " | ");
      output = output.replace(" - ", "|");
      output = output.replace("\\u0026", "&");
      //output = output.replace("Ã„", "Ä");     // geht nicht
      output = output.replace("Ã„", "&Auml;");  // geht
          
      //animCont.style.left = 0;
      clearAnimInterval();
      parseData();
    }
    else
    {
      //output = "Rockland Radio | internet connection ?";
      output = "  |no internet ?";
    }
  }  
}
// -------------------------------------------------------------------------------------------------
function SettingsClosed() {
  var currentSetting = System.Gadget.Settings.read("stationPicker");
  if (currentSetting != "") {
    mediaPlayer.url = currentSetting;
    output = "";
    AjaxGet();
    parseData();
  }
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
  System.Gadget.Settings.write("coverAddr"  , cover);
  System.Gadget.Settings.write('radioUrl'   , radioUrl);
  System.Gadget.Settings.write('radioText'  , radioText);
  
  if (radioNoPlaylist) {
    System.Gadget.Settings.write('playlistUrl' , "https://onlineradiobox.com/" );
    System.Gadget.Settings.write('playlistText', "No Playlist" );
  } else {
    System.Gadget.Settings.write('playlistUrl' , "https://onlineradiobox.com/" + scrUrl.replace(".", "/") + "/playlist/");
    System.Gadget.Settings.write('playlistText', "Playlist" );
  }
  if (trackId.length) {
    System.Gadget.Settings.write('trackUrl' , "https://onlineradiobox.com/track/" + trackId );
    System.Gadget.Settings.write('trackText', "Video" );
  }
  else {
    System.Gadget.Settings.write('trackUrl' , "https://onlineradiobox.com");
    System.Gadget.Settings.write('trackText', "Online Radio Box" );
  }  
  if (System.Gadget.Flyout.show == false)
    System.Gadget.Flyout.show = true;
  else
    System.Gadget.Flyout.show = false;
}
// -------------------------------------------------------------------------------------------------
function volume(evt) {    

  var intVol = parseInt(mediaPlayer.settings.volume);
  
  intVol = intVol + evt / 120 * 5;
  if (intVol < 0) 
    intVol = 0;
  else if (intVol > 100) 
    intVol = 100;
  
  var strVol = "" + intVol + "";        // nasty fudge to keep things as a string
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