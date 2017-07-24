//@Energy Normalization GUI

this._rect = {x:0,y:0,w:0,h:0};

this.onRenderGUI = function(){

	if (!LS.Globals.EnergyNormalization)
    return;
	
  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  
  var transx = w*0.85;
  var transy = h*0.2;
  
  var rect = this._rect;
  
  gl.translate(transx,transy);
  
  
  // ENERGIES
 	var enNorm = LS.Globals.EnergyNormalization;
  
  rect.w = 20;
  rect.h = -80;
  
	// Box background
  gl.fillStyle = "rgba(127,127,127,0.7)";
  gl.fillRect(-40,-rect.h*0.1,rect.w*4+40*1.2,rect.h*1.5);
  
  // RMS
  gl.fillStyle = "rgba(255,255,255,0.8)";
  gl.fillRect(0,0, rect.w, rect.h*enNorm.RMS);
  
  // Max RMS
  gl.fillStyle = "rgba(255,63,63,0.9)";
  gl.fillRect(0, rect.h*enNorm.maxRMS, rect.w, rect.h*0.05);
  
  // dBs
  gl.fillStyle = "rgba(255,255,255,0.8)";
  gl.fillRect(rect.w*2.5,0, rect.w, -rect.h*enNorm.dBs*0.03);
  
  // Show values
  gl.fillStyle = "rgba(255,255,255,0.8)";
  gl.textAlign = "center";
    // title
  gl.font = "18px Arial";
  gl.fillText("RMS  dB", 20, rect.h*1.1);
  // RMS and maxRMS
  gl.font = "15px Arial";
  gl.fillText(enNorm.RMS.toFixed(2), -25, 5+rect.h*enNorm.RMS);
  gl.fillText(enNorm.maxRMS.toFixed(2), 0, -10+rect.h*enNorm.maxRMS);
  // dBs
  gl.fillText(enNorm.dBs.toFixed(2) + " dB", rect.w*2.5, -10 + -rect.h*enNorm.dBs*0.03);

  
  gl.translate(-transx,-transy);  

  
  gl.finish2D();

}
