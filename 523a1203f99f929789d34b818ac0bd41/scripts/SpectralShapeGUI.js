//@Spectral Shape GUI

this._rect = {x:0,y:0,w:0,h:0};
this.onRenderGUI = function(){

	if (!LS.Globals.FormantSpectrum)
    return;
  if (!LS.Globals.FormantSpectrum.spectrum)
    return;
	
  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  
  var transx = 40;//w/4;
  var transy = h*0.4;
  
  var rect = this._rect;
  

  // Spectral shape
  var fSpec = LS.Globals.FormantSpectrum;
  var nfft = fSpec.fftSize/2;
  gl.translate(transx,transy);
  
  rect.w = 2048/nfft;
  rect.h = 2;
  
  // Show spectral shape
  gl.beginPath();
  // Draw lines
  gl.moveTo(0,-fSpec.specShape[0]*rect.h);
  for (var i = 0; i<nfft; i++)
  	gl.lineTo(i * rect.w, -fSpec.specShape[i]*rect.h);
	gl.lineWidth=2;
  gl.strokeStyle = "rgba(255,255,255,0.9)";
  gl.stroke();
  
  // Show spectrum
  gl.beginPath();
  gl.moveTo(0,-fSpec.spectrum[0]*rect.h);
  for (var i = 0; i<nfft; i++)
  	gl.lineTo(i * rect.w, -fSpec.spectrum[i]*rect.h);
  gl.lineWidth=1;
  gl.strokeStyle = "rgba(0,255,0,0.9)";
  gl.stroke();
  
  
  // Show frequencies
  gl.font = "14px Arial";
  gl.fillStyle = "rgba(255,255,255,0.8)";
  gl.textAlign = "center";
  // mhi
  gl.fillText(fSpec.maxHarmFreq+"Hz", fSpec.maxHarmFreq/(fSpec.fs*0.5) * nfft * rect.w, 100);
  
  gl.translate(-transx,-transy);
  
  gl.finish2D();

}