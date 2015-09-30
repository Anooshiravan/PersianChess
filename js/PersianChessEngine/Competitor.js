/*
   _____              _                _____ _                   
  |  __ \            (_)              / ____| |                  
  | |__) |__ _ __ ___ _  __ _ _ __   | |    | |__   ___  ___ ___ 
  |  ___/ _ \ '__/ __| |/ _` | '_ \  | |    | '_ \ / _ \/ __/ __|
  | |  |  __/ |  \__ \ | (_| | | | | | |____| | | |  __/\__ \__ \
  |_|   \___|_|  |___/_|\__,_|_| |_|  \_____|_| |_|\___||___/___/
                                                                
════════════════════════════════════════════════════════════════════
 Persian Chess (www.PersianChess.com)
 Copyright 2006 - 2015 
 Anooshiravan Ahmadi (aahmadi@schubergphilis.com)
 http://www.PersianChess.com/About
 Licensed under GNU General Public License 3.0
 ════════════════════════════════════════════════════════════════════
*/

// ══════════════════════════
//  Engine competition
// ══════════════════════════


function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
function startVsEngine()
{
    if (inIframe() == true)
    {
        vs_engine = true;
    }
}
startVsEngine();

/*
index.html for iFrames parent window

<html>
<head>
<title>Play 2 Engines</title>
<script>
window.onmessage = function(e){
    if (e.data == "request") 
    {
        engine1.contentWindow.postMessage("request", '*');
        return;
    }
    if (e.data.split('-')[0] == "fen")
    {
        var fen = e.data.split('-')[1];
        engine2.contentWindow.postMessage("fen-"+fen, '*');
        return;
    }
    
    var engine = e.data.split('-')[0];
    var move = e.data.split('-')[1] + '-' + e.data.split('-')[2];
    if (engine == 'engine1') 
        {
            timeout = setTimeout(function(){ 
                engine2.contentWindow.postMessage(move, '*');
            }, 300);
        }
    else if (engine == 'engine2') 
        {
            timeout = setTimeout(function(){ 
                engine1.contentWindow.postMessage(move, '*');
            }, 300);
        }
}
</script>
</head>
<body>
    <div>
        <iframe id="engine1" src="PersianChess/index.html" frameborder="0" scrolling="no" width="100%" align="left"></iframe>
    </div>
    <div>
        <iframe id="engine2" src="PersianChess.1.3.4/index.html" frameborder="0" scrolling="no" width="100%" align="left"></iframe>
    </div>
    <script>
        function setHeight(){
            var h = (window.innerHeight/2) - 4 ;
            document.getElementById("engine1").style.height = h + 'px';
            document.getElementById("engine2").style.height = h + 'px';
        }
        setHeight();
    </script>
</body>
</html>

*/

// ════════════════════════════════════════════════════
debuglog ("Competitor.js is loaded.")