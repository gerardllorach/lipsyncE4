//@Lipsync E4 GUI

this._rect = {x:0,y:0,w:0,h:0};
this._showGUI = true;

// Assign this script to globals
// Globals
if (!LS.Globals)
  LS.Globals = {};
LS.Globals.equalizationGUI = this;

this.onRenderGUI = function(){
	if (!this._showGUI)
    return;
  
	if (!LS.Globals.LSCtrl)
    return;
	
  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  
  var transx = w*0.7;
  var transy = h*0.3;
  
  var rect = this._rect;
  
 /* gl.translate(transx,transy);
  
  
  // BLEND WEIGHTS
 	var weights = LS.Globals.LSCtrl._weights;

  rect.w = 20;
  rect.h = 10;
  
  
  gl.fillStyle = "rgba(255,255,255,0.8)";
  for (var i = 0; i<weights.length; i++){
  	//gl.fillRect(rect.w * i, 0, rect.w * 0.8, weights[i]*rect.h);
  
    gl.textAlign = "center";
  	gl.font = "15px Arial";
  	gl.fillText(weights[i].toFixed(1), rect.w * i*2, -20);
  }
  
  
  gl.translate(-transx,-transy);  */

  
  gl.finish2D();
  
  
  
 	// EQUALIZATION
  if (!LS.Globals.LipsyncE4)
    return;
  
  
  
  gl.start2D();
  transx = w*0.65;
  transy = h*0.4;
  gl.translate(transx,transy);
  
  rect.w = 60
  rect.h = 0.3;
  
  var ls = LS.Globals.LipsyncE4;
  var eqKeys = Object.keys(ls.EQBands);
  
  for (var i = 0; i<eqKeys.length; i++){
    var bandName = eqKeys[i];
  	var dBs = ls.EQBands[bandName].dB;
  	gl.fillStyle = "rgba(200,200,200,0.8)";
    gl.fillRect(rect.w * i, 0, rect.w*0.8, -dBs*rect.h);
    gl.fillStyle = "rgba(255,255,255,0.8)";
    gl.fillText(bandName, 20+rect.w*i, 20 + (i%3)*20);
    gl.fillText(dBs.toFixed(1)+"dB", 20+rect.w*i, -dBs*rect.h - 15);
  }
  gl.fillText("EQUALIZATION", eqKeys.length*0.4*rect.w +20, 90);
  
  
  
  
  gl.translate(-transx,-transy); 
  gl.finish2D();

}

