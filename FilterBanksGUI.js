//@Filter Banks GUI

this._rect = {x:0,y:0,w:0,h:0};
this.onRenderGUI = function(){

	if (!LS.Globals.FilterBanks)
    return;
	
  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  
  var transx = 40;//w/4;
  var transy = h*0.2;
  
  var rect = this._rect;
  
  
  
  // FILTER BANKS
  var filterBanks = LS.Globals.FilterBanks;
  var nfft = filterBanks.fftSize/2;
  //console.log(nfft, filterBanks);
  gl.translate(transx,transy);
  
  rect.w = 2048/nfft;
  rect.h = 40;
  
  for (var i = 0; i<filterBanks.filterBanks.length; i++){
    gl.beginPath();
    
    // Draw lines
    gl.moveTo(0,0);
    for (var j = 0; j<nfft; j++)
      gl.lineTo(j * rect.w, -filterBanks.filterBanks[i][j]*rect.h);
    
    gl.strokeStyle = "rgba(255,255,255,0.9)";
    gl.stroke();
  }
  // Show frequencies
  gl.font = "14px Arial";
  gl.fillStyle = "rgba(255,255,255,0.8)";
  gl.textAlign = "center";
  // mhi
  gl.fillText(filterBanks.highFreq+"Hz", filterBanks.highFreq/(filterBanks.fs*0.5) * nfft * rect.w, 15);
  // Half freq
  gl.fillText(filterBanks.fs/4 + "Hz", (nfft/2)*rect.w, 15);
  // Max freq
  gl.fillText(filterBanks.fs/2 + "Hz", (nfft-1)*rect.w, 15);
  
  gl.translate(-transx,-transy);  

  
  gl.finish2D();

}