
var radioText   = "SWR3";
var radioUrl    = "https://www.swr3.de";                     // Homepage

var streamUrl   = "https://liveradio.swr.de/sw331ch/swr3/";  // Stream Adresse

var scraperUrl1 = "https://scraper.onlineradiobox.com/";     // Scraper Basis Adresse
var scraperUrl2 = "de.swr3live";                             // Scraper Adresse

var cover = "images/swr3.jpg";  // Wird angezeigt, wenn kein Cover verfügbar ist

// -------------------------------------------------------------------------------------------------
var orbUrl      = "https://onlineradiobox.com/"
var trackId     = "";

var updateInterval  =  20000;   // Aktualisierung Titel/Interpret in ms
var rotateInterval  =   1000;   // Aktualisierung Scrollen in ms, Restzeit FreeKey
var output;
var longestValue = 0;
var posX = 120;
var posX2 = 120;
var posX3 = 120;
var animValues, animValues2, animValues3;
var intVol;
var strVol;
var offset_Width = 115;

//FreeKey
var updateIntervalF = 120000;   // Aktualisierung FreeKey Status in ms
var remaining = 0;              // Restzeit FreeKey
var remainingStr = "00:00:00";
var remainingReceived;
var logoutTime;
var LoggedOut = -1;
var delayFreeKeyMessage = 2;    // Statusmeldungen FreeKey
var up = "up";
var dn = "dn";

// kein Netzwerk, also auch keine Verbindung zu FreeKey : Anzeige "no internet" , ">>SWR3" oder "00:00:00"
// Netzwerk ok, FreeKey nicht erreichbar/vorhanden      : Anzeige    Titel      , ">>SWR3"
// Netzwerk ok, FreeKey ok                              : Anzeige    Titel      , Restzeit
var NetworkConnected = true;
var FreeKeyConnected = true;

// if ((remaining <=0) && (internetOK))
//     HotspotGet();

//==================================================================================================
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
  swapDockState();                           // Siehe Beschreibung unten

  var ajaxUpdate=setInterval("AjaxGet()",updateInterval);    // Aktualisierung Titel/Interpret
  var rotateValues=setInterval("rotate()", rotateInterval);  // Aktualisierung Scrollen
  
  AjaxGet();                                                 // Titel bei onlineradiobox abfragen

  //FreeKey
  var hotspotUpdate=setInterval("HotspotGet()",updateIntervalF);  // Aktualisierung Free Key Status
  HotspotGet();

  logoutTime = Date.now();
  remainingReceived = Date.now();
}
//==================================================================================================
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
    offset_Width   = 115;           // Offset in Pixel, ab dem der text gescrollt wird
    offset_Width_R =  80;           // Offset in Pixel, ab dem Restzeit gescrollt wird
    with (document.body.style) {
      width =130;
      height=73;
      backgroundImage = "url('images/Docked.png')";
      backgroundColor = "#E50635";
    }  
    with (remainingText.style) {    // FreeKey Zeile
      marginTop  =   "0px";
      marginLeft =   "3px";
      fontSize   =  "18px";
      width      =  "80px";
      height     =  "20px";
    }
    with (song_title.style) {        // obere Zeile 
      marginTop  =   "26px";
      marginLeft =   "3px";
      fontSize   =  "10px";
      width      = "115px";
      height     =  "12px";
    }
    with (song_info.style) {        // untere Zeile
      marginTop  =   "0px";
      marginLeft =   "3px";
      fontSize   =  "10px";
      width      = "115px";
      height     =  "12px";
    }
    with (playbackControls.style) {  // Position Play Button
      left      =    "9px";
      top        =  "20px";
    }
    clearAnimInterval();
  }  
  else {                             // Gadget Undocked = verdoppelte Größe
    offset_Width   = 230;
    offset_Width_R = 160;
    with (document.body.style) {
      width =260;
      height=146;
      backgroundImage = "url('images/Undocked.png')";
      //backgroundColor = "#FFFFFF";
    }
    with (remainingText.style) {
      marginTop  =   "0px";
      marginLeft =   "6px";
      fontSize   =  "32px";
      width      = "160px";
      height     =  "40px";
    }
    with (song_title.style) {
      marginTop  =  "52px";
      marginLeft =  "12px";
      fontSize   =  "15px";
      width      = "230px";
      height     =  "20px";
    }
    with (song_info.style) {
      marginTop  =   "0px";
      marginLeft =  "12px";
      fontSize   =  "15px";
      width      = "230px";
      height     =  "20px";
    }
    with (playbackControls.style) {
      left       =  "18px";
      top        =  "52px";
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
}// -------------------------------------------------------------------------------------------------
function anim3(){
  if(animCont3.offsetWidth>offset_Width_R){
    posX3 --;
    animCont3.style.left = posX3;
    if (posX3<-animCont3.offsetWidth) posX3 = offset_Width_R;
  }else {
    animCont3.style.left = 0;
    clearInterval(animValues3);
  }
}
// -------------------------------------------------------------------------------------------------
function rotate(){
  //System.Debug.outputString("LoggedOut :" + LoggedOut);
  if (LoggedOut >= 0) {
    if (LoggedOut == 0) {
      HotspotGet();
    }
    LoggedOut--;
  }
  parseData();
}
// -------------------------------------------------------------------------------------------------
// Titel bei onlineradiobox abfragen
function AjaxGet(){
  req = new XMLHttpRequest();
  if (req) {
      req.onreadystatechange = infoReceived;
      req.open("POST", scraperUrl1 + scraperUrl2, true);
      req.send();
  }
}
// -------------------------------------------------------------------------------------------------
function parseData(){
  
  getRemainingStr();
  animCont3.innerHTML = remainingStr;

  // siehe function messageFreeKey(s)
  if (delayFreeKeyMessage > 0) {
    delayFreeKeyMessage--;
    return;
  }  
  
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
      animCont.innerHTML = " ";
      animCont2.innerHTML = output;
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
  clearInterval(animValues3);
  var i = 15;
  if (System.Gadget.docked) 
    i = 50;
  animValues  = setInterval("anim()" , i);
  animValues2 = setInterval("anim2()", i);
  animValues3 = setInterval("anim3()", i);
}
// -------------------------------------------------------------------------------------------------
function infoReceived() {
  //System.Debug.outputString("infoReceived, State : " + req.readyState + " / Status : " + req.status);
  
  if (req.readyState == 4) {
    if (req.status == 200) {      
      NetworkConnected = true;
      
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
        cover = "images/swr3.jpg";        
        //cover = "";
      }            

      // Titel/Interpret korrigieren
      output = output.replace(" / ", " | ");
      output = output.replace(" - ", "|");
      output = output.replace("\\u0026", "&");
      output = output.replace("Ã„", "&Auml;");
    
      // Animation zurücksetzen
      //animCont.style.left = 0;
      clearAnimInterval();
      parseData();
    }
    else
    {
      output = "no internet ? |";
      remaining = 0;
      if (req.status == 12007)
        NetworkConnected = false;
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
    controlImage.src = "images/play.png";
    break;

  case 2: // Paused
    controlImage.src = "images/play.png";
    break;
  
  case 3: // Playing
    controlImage.src = "images/stop.png";
    break;

  case 6: // Buffering
    break;

  case 7: // Waiting
    break;

  case 8: // Media Ended
    controlImage.src = "images/play.png";
    break;

  case 9: // Transitioning
    break;

  case 10: // Ready
    controlImage.src = "images/play.png";
    break;
  }
}
//==================================================================================================

// FreeKey

//==================================================================================================
// Statusmeldungen FreeKey
function messageFreeKey(s){
  animCont.innerHTML  = " ";
  animCont2.innerHTML = "FreeKey: " + s;
  //output = "|" + s;
  delayFreeKeyMessage = 2;
}
//--------------------------------------------------------------------------------------------------
function getRemainingStr(){
  if (remaining <= 0) {
    //remainingStr = "logged out"; 
    remainingStr = ">>SWR3"; 
    //remainingStr = "FreeKey?"; 
    //remainingStr = "no inet?"; 
    //remainingStr = "00:00:00";
    with (remainingText.style) {   // obere Zeile 
      color    =  "#FFFFFF";       // #FFFF00 gelb, #00FF00 grün, #0000FF blau
    }  
  } else {
    st = remaining - ( Date.now() - remainingReceived )/1000;
    if (st<0)
      st = 0;
    // st zu String konvertieren für Anzeige
    hx = Math.floor(st/3600);
    mx = Math.floor((st-hx*3600)/60);
    sx = Math.floor(st%60);
    remainingStr = zeroStr(hx) + ":"  + zeroStr(mx) + ":"  + zeroStr(sx) + "";

    with (remainingText.style) {   // obere Zeile 
      color =  "#FFFFFF";          // weiß
      if (st < 600) {              // 10 min
      //if (st < 14600) {
        color    =  "#00FF00";     // #FFFF00 gelb, #00FF00 grün, #0000FF blau
        remainingStr = "--" + remainingStr + "--";
      }
    }  
  }
}
//--------------------------------------------------------------------------------------------------
function getItem(s, name) {
  var rex = new RegExp('.*' + name + ' *value="');
  s = s.replace(rex, "");
  rex  = /".*/;
  s = s.replace(rex, "");
  return s;
}
//--------------------------------------------------------------------------------------------------
function zeroStr ( i ) {
  return ("00" + i).slice(-2);
}
//--------------------------------------------------------------------------------------------------
function doubleClick() {
  System.Debug.outputString("DoubleClick");
  
  HotspotLogout();
}
//==================================================================================================
// wird alle updateInterval Millisekunden aufgerufen.
function HotspotGet(){
  r = new XMLHttpRequest();
  //r = new ActiveXObject("Microsoft.XMLHTTP");
  if (r) {
    r.onreadystatechange = HotspotStatus;
    r.open("GET", "http://hotspot.free-key-de.eu/status", true);
    //r.open("GET", "http://hotspot.free-key-de.eu", true);
    r.setRequestHeader("Accept-Language","de-DE");
    r.setRequestHeader("Pragma", "no-cache");
    r.setRequestHeader("Cache-Control", "no-cache");
    r.send();
  }
}
//--------------------------------------------------------------------------------------------------
// Fragt den Status des Hotspots ab. Ist "logout" im responseText vorhanden, ist man eingeloggt.
// Wenn eingeloggt, bekommt man die Restzeit angezeigt. Wenn nicht, wird man angemeldet.
function HotspotStatus() {
  //System.Debug.outputString("HotspotStatus, State : " + r.readyState + " / Status : " + r.status);
  if (r.readyState == 4) {
    if (r.status == 200) {
      NetworkConnected = true;
      FreeKeyConnected = true;
      messageFreeKey("Get Status");
      o = r.responseText;
      if (o.indexOf("logout") > -1) {
        //-------------------------------------------------------------------------------- Logged in
        remainingReceived = Date.now();
        //System.Debug.outputString("HotspotStatus : Logged in !");
        //System.Debug.outputString("HotspotStatus : Response Text : " + r.responseText);

        // online check ???? geht das hier?  http://network-test.debian.org/nm

        o = o.replace(/[\r\t]/g,'');
        o = o.replace(/[\n]/g,'\t');

        // string o verkleinern
        re = /.*<table/;
        o = o.replace(re, "");
        re  = /<\/table>.*/;
        o = o.replace(re, "");
        //System.Debug.outputString("Verkleinert Response Text : " + o);


        // IP-Adresse (nicht verwendet)
        re = /.*IP-Address:<\/td><td>/;
        ip1 = o.replace(re, "");
        re = /Datenverbrauch.*/;
        ip1 = ip1.replace(re, "");
        re = /<\/td>.*/;
        ip1 = ip1.replace(re, "");
        //System.Debug.outputString('IP:"' + ip1 + '"');

        // machte Fehler, wenn nicht ganz abgemeldet (nicht verwendet)
        // MAC-Adresse
        re = /.*MAC-Adresse lautet: /;
        mac = o.replace(re, "");
        re = /!.*/;
        mac = mac.replace(re, "");
        //System.Debug.outputString('Mac:"' + mac + '"');

        /*
        [2488] Verkleinert Response Text :  border="1" class="tabula">
        <tr><td align="right">IP-Address:</td><td>10.5.2.40</td></tr> 
        <tr><td align="right">
        Datenverbrauch in Bytes up/down:</td><td>487.2 KiB / 727.9 KiB</td></tr>  
        <tr><td align="right">
        Verbindungszeit / Noch verfügbar:</td><td>11m47s / 3h48m4s</td></tr>
        <tr><td align="right">Letzte Satusaktualisierung vor:</td><td>1m</td>  
        */

        // Up / Down
        re = /.*up\/down:<\/td><td>/;
        updn = o.replace(re, "");
        re = /<\/td>.*Verbindungszeit.*/;
        updn = updn.replace(re, "");
        while (updn.indexOf("i") > -1) {
          updn = updn.replace("KiB", "KB");
          updn = updn.replace("MiB", "MB");
          updn = updn.replace("GiB", "GB");
        }
        re = / \/.*/;
        up = updn.replace(re, "");
        re = /.* \/ /;
        dn = updn.replace(re, "");
        up = "up " + up;
        dn = "dn " + dn;

        //System.Debug.outputString('up:"' + up + ',' + 'dn:"' + dn + '"');
        
        //////////////////////////////////////////////////////////////////

        // Verbindungszeit / Restzeit
        re = /.*Noch verf.*gbar:<\/td><td>/;
        time1 = o.replace(re, "");
        re = /<\/td><\/tr>.*/;
        time1 = time1.replace(re, "");
        
        re = /.*\/ /;
        time2 = time1.replace(re, "");
        re = / \/.*/;
        time1 = time1.replace(re, "");

        //System.Debug.outputString('Verbindungszeit:"' + time1 + '"');
        //System.Debug.outputString('Noch verfuegbar:"' + time2 + '"') ;

        // Konvertierung in Sekunden
        if (time2.indexOf("h") < 0) {
          h = 0;
        } else {
          h = parseInt(time2);
          re = /.*h/;
          time2 = time2.replace(re, "");
        }
        if (time2.indexOf("m") < 0) {
          m = 0;
        } else {
          m = parseInt(time2);
          re = /.*m/;
          time2 = time2.replace(re, "");
        }
        if (time2.indexOf("s") < 0) {
          s = 0;
        } else {
          s = parseInt(time2);
        }
        st = s + m*60 + h*60*60;
        remaining = st;
        //System.Debug.outputString("Zeit=" + h + "h," + m + "m," + s + "s. Total=" + st + "s ");

        // st runterzählen je nach aktueller Zeit
        st = st - ( Date.now() - remainingReceived )/1000;

        // dann st zzu String konvertieren für Anzeige
        hx = Math.floor(st/3600);
        mx = Math.floor((st-hx*3600)/60);
        sx =  Math.floor(st%60);
        remainingStr = zeroStr(hx) + ":"  + zeroStr(mx) + ":"  + zeroStr(sx) + "";
        //System.Debug.outputString("remainingStr: " + remainingStr);
        
        //o = o.replace(/[\t]/g,'\n');
        //System.Debug.outputString( o );

        // Nur notwendiste Ausgaben ? 
        messageFreeKey("Get Status");
      } else {  
        //------------------------------------------------------------------------------ Logged out
        //System.Debug.outputString("HotspotStatus : Anmeldung Teil 1 ");
        
        remaining = 0;
        
        // Enfernen der Sonderzeichen, Zeilenumbrüche werden zu Tabs u.a. für debugging
        o = o.replace(/[\r\t]/g,'');
        o = o.replace(/[\n]/g,'\t');

        // string o verkleinern
        re = /.*"redirect"/;
        o = o.replace(re, "");
        re  = /<h4.*/;
        o = o.replace(re, "");

        // redirect
        re = /.*action="/;
        redirect = o.replace(re, "");
        re = /".*/;
        redirect = redirect.replace(re, "");
        //System.Debug.outputString("redirect:" + redirect);

        mac = getItem(o, '"mac"');
        ip1 = getItem(o, '"ip"');
        usr = getItem(o, '"username"');
        llo = getItem(o, '"link-login-only"');
        l_o = getItem(o, '"link-orig"');
        l_s = getItem(o, '"link-status"');
        s_a = getItem(o, '"server-address"');
        s_n = getItem(o, '"server-name"');
        id1 = getItem(o, '"identity"');
        err = getItem(o, '"error"');
        
        //l_o = "http%3A%2F%2F192.168.178.1%2F";
        
        //System.Debug.outputString("1:"+redirect +","+ mac +","+ ip1 +","+ usr);
        //System.Debug.outputString("2:"+llo +","+ l_o +","+ l_s );
        //System.Debug.outputString("3:"+s_a +","+ s_n);
        //System.Debug.outputString("4:"+id1 +","+ err );
        
        //o = o.replace(/[\t]/g,'\n');
        //System.Debug.outputString("o : " + o );

        //pd ="?mac=" + mac;
        pd = "mac=" + mac;
        pd = pd + "&ip="              + ip1;
        pd = pd + "&username="        + usr;
        pd = pd + "&link-login-only=" + llo;
        //pd = pd + "&link-logout=http%3A%2F%2Fhotspot.free-key-de.eu%2Flogout";
        pd = pd + "&link-orig="       + l_o;
        pd = pd + "&link-status="     + l_s;
        pd = pd + "&server-address="  + s_a;
        pd = pd + "&server-name="     + s_n;
        pd = pd + "&identity="        + id1;
        pd = pd + "&error=";
        while (pd.indexOf(":") > -1) 
          pd = pd.replace(":", "%3A");
        while (pd.indexOf("/") > -1) 
          pd = pd.replace("/", "%2F");
  
        //pd = redirect + pd;
        //System.Debug.outputString("pdx:" + pd);
        
        //Ticket für das Anmelden holen
        r2 = new XMLHttpRequest();
        if (r2) {
          r2.onreadystatechange = HotspotLogin1;
          r2.open("POST", redirect, true);
          r2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          r2.setRequestHeader("Content-length", pd.length);
          r2.setRequestHeader("Accept-Language","de-DE");
          //r2.setRequestHeader("Accept", "text/html, text/plain, text/sgml, text/css, */*;q=0.01\r");
          r2.setRequestHeader("Pragma", "no-cache");
          r2.setRequestHeader("Cache-Control", "no-cache");
          //r2.setRequestHeader("User-Agent", "Lynx/2.9.2 libwww-FM/2.14FM SSL-MM/1.4.1 OpenSSL/3.3.1");
          r2.send(pd);
        }
        messageFreeKey("Login");
      }
    } else {
      remaining = 0;
      if (req.status == 12007) 
        NetworkConnected = false;
      if (req.status == 404)
        FreeKeyConnected = false;
    }
  }
}
//==================================================================================================
function HotspotLogin1() {
  //System.Debug.outputString("Anmeldung Teil 2, State : " + r2.readyState + " / Status : " + r2.status);

  if (r2.readyState == 4) {
    if (r2.status == 200) {
      messageFreeKey("Login 1");

      o = r2.responseText;
      
      // Enfernen der Sonderzeichen, Zeilenumbrüche werden zu Tabs u.a. für debugging
      o = o.replace(/[\r\t]/g,'');
      o = o.replace(/[\n]/g,'\t');
        
      // Ticket extrahieren
      re = /.*FREEKEYWIFI=/;
      ticket = o.replace(re, "");
      re = /&.*/;
      ticket = ticket.replace(re, "");

      pd = "FREEKEYWIFI=" + ticket + "&privacy=1&agb=1&type=agb&send=1&action=auth&FREEKEYWIFI=" + ticket ;

      //System.Debug.outputString("ticket pd:" + pd); 

      r3 = new XMLHttpRequest();
      if (r3) {
        r3.onreadystatechange = HotspotLogin2;
        r3.open("POST", "http://service.free-key-de.eu", true);
        r3.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        r3.setRequestHeader("Content-length", pd.length);
        r3.setRequestHeader("Accept-Language","de-DE");
        r3.setRequestHeader("Pragma", "no-cache");
        r3.setRequestHeader("Cache-Control", "no-cache");
        r3.send(pd);
      }
    }
  }
}
//--------------------------------------------------------------------------------------------------
function HotspotLogin2() {
  //System.Debug.outputString("Anmeldung Teil 3, State : " + r3.readyState + " / Status : " + r3.status);

  if (r3.readyState == 4) {
    if (r3.status == 200) {
      //System.Debug.outputString("r3 responseText:" + r3.responseText );

      messageFreeKey("Login 2");
      /*      
      <h4>Die Anmeldung war erfolgreich</h4><p>Wenn Sie nicht in 5 Sekunden automatisch weitergeleitet werden, klicken Sie bitte auf</p>
      <form name="login" action="http://hotspot.free-key-de.eu/login" method="post" >
      <input type="hidden" name="username" value="00:13:EF:D0:01:86" >
      <input type="hidden" name="password" value="freekey" >
      <input type="hidden" name="dst" value="https://www.gigu.de" >
      <input type="submit" class="btn btn-lg btn-freekey" value="weiter" >
      </form><p>&nbsp;</p><p>&nbsp;</p>
      */
      
      o = r3.responseText;

      // Enfernen der Sonderzeichen, Zeilenumbrüche werden zu Tabs u.a. für debugging
      o = o.replace(/[\r\t]/g,'');
      o = o.replace(/[\n]/g,'\t');
      
      // string o verkleinern
      re = /.*<form/;
      o = o.replace(re, "");
      re  = /<\/form.*/;
      o = o.replace(re, "");
      //System.Debug.outputString("verkleinert" + o );

      dst = getItem(o, '"dst"');
      //System.Debug.outputString("dst:" + dst );

      pd = "username=" + mac + "&password=freekey&dst=" + dst;
      
      while (pd.indexOf(":") > -1) 
        pd = pd.replace(":", "%3A");
      while (pd.indexOf("/") > -1) 
        pd = pd.replace("/", "%2F");

      //System.Debug.outputString("dst pd:" + pd); 

      r4 = new XMLHttpRequest();
      if (r4) {
        r4.onreadystatechange = HotspotLogin3;
        r4.open("POST", "http://hotspot.free-key-de.eu/login", true);
        r4.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        r4.setRequestHeader("Content-length", pd.length);
        r4.setRequestHeader("Accept-Language","de-DE");
        r4.setRequestHeader("Pragma", "no-cache");
        r4.setRequestHeader("Cache-Control", "no-cache");
        r4.send(pd);
      } 
    }
  }
}
//--------------------------------------------------------------------------------------------------
function HotspotLogin3() {
  //System.Debug.outputString("Login done, State : " + r4.readyState + " / Status : " + r4.status);
  // Fragt man readyState und status ab, wird HotspotLogin3 mehrmals aufgerufen, sonst einmal
  //System.Debug.outputString("Login done");
  
  if (r4.readyState == 4) {
    if (r4.status >= 0) {
      
      messageFreeKey("Login done");

      System.Debug.outputString("FreeKey Login done");
      remaining    =  14400;
      remainingStr = "04:00:00";
    }
  }
  // online checken ???? mit dem hier ?  http://network-test.debian.org/nm
}
//==================================================================================================
function HotspotLogout() {
  //System.Debug.outputString("HotspotLogout 1");

  messageFreeKey("Logout 1");

  ro = new XMLHttpRequest();
  if (ro) {
    ro.onreadystatechange = HotspotLogout2;
    ro.open("GET", "http://hotspot.free-key-de.eu/logout", true);
    ro.setRequestHeader("Accept", "text/html, text/plain, text/sgml, text/css, */*;q=0.01\r");
    ro.setRequestHeader("Accept-Language","de-DE");
    ro.setRequestHeader("User-Agent", "Lynx/2.9.2 libwww-FM/2.14FM SSL-MM/1.4.1 OpenSSL/3.3.1");
    ro.send();
  } 
}
//--------------------------------------------------------------------------------------------------
function HotspotLogout2() {
  //System.Debug.outputString("HotspotLogout 2, State : " + ro.readyState + " / Status : " + ro.status);

  if (ro.readyState == 4) {
    if (ro.status == 200) {
    
      messageFreeKey("Logout 2");

      o = ro.responseText;
      //System.Debug.outputString("HotspotLogout 2, Response Text : " + ro.responseText); 
      
      // Enfernen der Sonderzeichen, Zeilenumbrüche werden zu Tabs u.a. für debugging
      o = o.replace(/[\r\t]/g,'');
      o = o.replace(/[\n]/g,'\t');

      // string o verkleinern
      re = /.*<form/;
      o = o.replace(re, "");
      re  = /<\/form.*/;
      o = o.replace(re, "");
      //System.Debug.outputString("HotspotLogout 2x, o : " + o);

      // redirect2
      re = /.*action="/;
      redirect2 = o.replace(re, "");
      re = /".*/;
      redirect2 = redirect2.replace(re, "");
      //System.Debug.outputString("redirect:" + redirect);

      mac = getItem(o, '"mac"');
      ip1 = getItem(o, '"ip"');
      usr = getItem(o, '"username"');
      llt = getItem(o, '"link-logout"'); 
      llo = getItem(o, '"link-login-only"');
      l_o = getItem(o, '"link-orig"');
      l_s = getItem(o, '"link-status"');
      s_a = getItem(o, '"server-address"');
      s_n = getItem(o, '"server-name"');
      id1 = getItem(o, '"identity"');
      err = getItem(o, '"error"');

      //System.Debug.outputString("1:"+redirect2 +","+ mac2 +","+ ip12 +","+ usr2);
      //System.Debug.outputString("2:"+llt2+","+llo2 +","+ l_o2 +","+ l_s2 );
      //System.Debug.outputString("3:"+s_a2 +","+ s_n2);
      //System.Debug.outputString("4:"+id12 +","+ err2 );
      //1:http://service.free-key-de.eu/logout.php,00:13:EF:D0:01:86,10.5.2.5,00:13:EF:D0:01:86
      //2:http://hotspot.free-key-de.eu/logout,http://hotspot.free-key-de.eu/login,,http://hotspot.free-key-de.eu/status
      //3:10.5.0.1:80,d1cd1186302b2699c5f11282c0a301b21594802068
      //4:id-1226,


      // username = MAC-Addresse und link-logout
      pd ="mac=" + mac;
      pd = pd + "&ip="              + ip1;
      pd = pd + "&username="        + usr;
      pd = pd + "&link-logout="     + llt;
      pd = pd + "&link-login-only=" + llo;
      pd = pd + "&link-orig="       + l_o;
      pd = pd + "&link-status="     + l_s;
      pd = pd + "&server-address="  + s_a;
      pd = pd + "&server-name="     + s_n;
      pd = pd + "&identity="        + id1;
      pd = pd + "&error="           + err;
      while (pd.indexOf(":") > -1) 
        pd = pd.replace(":", "%3A");
      while (pd.indexOf("/") > -1) 
        pd = pd.replace("/", "%2F");

      //System.Debug.outputString("logout pd:" + pd);
      //mac=00%3A13%3AEF%3AD0%3A01%3A86&
      //ip=10.5.2.5&
      //username=00%3A13%3AEF%3AD0%3A01%3A86&
      //link-logout=http%3A%2F%2Fhotspot.free-key-de.eu%2Flogout&
      //link-login-only=http%3A%2F%2Fhotspot.free-key-de.eu%2Flogin&
      //link-orig=&link-status=http%3A%2F%2Fhotspot.free-key-de.eu%2Fstatus&
      //server-address=10.5.0.1%3A80&
      //server-name=d1cd1186302b2699c5f11282c0a301b21594802068&
      //identity=id-1226&
      //error=

      ro2 = new XMLHttpRequest();
      if (ro2) {
        ro2.onreadystatechange = HotspotLogout3;
        ro2.open("POST", redirect2, true);
        ro2.setRequestHeader("Accept", "text/html, text/plain, text/sgml, text/css, */*;q=0.01\r");
        ro2.setRequestHeader("Accept-Language","de-DE");
        ro2.setRequestHeader("Pragma", "no-cache");
        ro2.setRequestHeader("Cache-Control", "no-cache");
        ro2.setRequestHeader("User-Agent", "Lynx/2.9.2 libwww-FM/2.14FM SSL-MM/1.4.1 OpenSSL/3.3.1");
        ro2.setRequestHeader("Referer", "http://hotspot.free-key-de.eu/logout");
        ro2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ro2.setRequestHeader("Content-length", pd.length);
        ro2.send(pd);
      }
    }
  }
}
//--------------------------------------------------------------------------------------------------
// Redirect zur ReLogin Seite fehlt ?
function HotspotLogout3() {
  //System.Debug.outputString("Logout done, State : " + ro2.readyState + " / Status : " + ro2.status);

  if (ro2.readyState == 4) {
    if (ro2.status >= 0) {
      System.Debug.outputString("FreeKey Logout done");
      if ((Date.now() - logoutTime) > 1000) {  
        logoutTime = Date.now();
      }
      remaining = -1;
      LoggedOut =  1;
      messageFreeKey("Logout done");
      //HotspotGet();  // Re-Login geht noch? nicht
    }
  }
}
//==================================================================================================
