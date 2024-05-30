//@F0GUI

this._rect = {x:0,y:0,w:0,h:0};



this.onRenderGUI = function(){
  
  if (!LS.Globals.FormantSpectrum)
    return;
  
  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  
  var transx = 20;//w/4;
  var transy = h*0.8;
  
  var rect = this._rect;
  
  // TRANSLATE
  gl.translate(transx,transy);
  
  var formSpec =  LS.Globals.FormantSpectrum;
  var arr = LS.Globals.FormantSpectrum.corrInd;
  
  rect.w = w*0.5/arr.length;
  gl.fillStyle = "rgba(255,255,255,0.9)";
  // Draw rectangles
  gl.beginPath();
  gl.moveTo(0,0);
  for (var i = 0; i<arr.length; i++){
    //rect.w = 2;
    //rect.h = 2;
    //gl.fillRect(i*rect.w, -Math.min(arr[i]/10000, 500), rect.w, rect.h);
    gl.lineTo(rect.x + rect.w*i, rect.y + -arr[i]/10000);
  }
  gl.strokeStyle = "rgba(255,255,255,0.9)";
  gl.lineWidth=2;
  gl.stroke();
  
  // Plot legend
  gl.font = "15px Arial";
  gl.fillStyle = "rgba(255,255,255,0.8)";
  gl.textAlign = "center";
  gl.textBaseline = "middle"; 
  gl.fillText(formSpec.highFreqLim+" Hz", rect.x, rect.y + 20);
  gl.fillText(formSpec.lowFreqLim+ " Hz", rect.x + arr.length*rect.w, rect.y + 20);
  // F0
  var pFundFreq = formSpec.indFundFreq - (formSpec.fs / formSpec.highFreqLim);
  gl.fillText(formSpec.fundFreq.toFixed(2)+ " Hz", rect.x + pFundFreq*rect.w, rect.y + 40);
	gl.fillText(formSpec.fundFreqConf.toFixed(2), rect.x + pFundFreq*rect.w, rect.y+60);
  // Second peak
  var pFundFreq = formSpec.secPeakInd - (formSpec.fs / formSpec.highFreqLim);
  gl.fillText(formSpec.secondPeak.toFixed(2)+ " Hz", rect.x + pFundFreq*rect.w, rect.y + 40);
  
  // TRANSLATE BACK
  gl.translate(-transx,-transy);
  
  
  
  // Use plot function
  plot(LS.Globals.FormantSpectrum.wave, {dx: 0.02});
  
  
  gl.finish2D();
  
}