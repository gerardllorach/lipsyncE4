//@Bank Energies GUI

this._rect = {x:0,y:0,w:0,h:0};
this.scaleHz = false;

this.setScaleHz = function(value){
	this.scaleHz = value;
}

this.onRenderGUI = function(){

	if (!LS.Globals.FilterBanks)
    return;
	
  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  
  var transx = 40;//w/4;
  var transy = h*0.8;
  
  var rect = this._rect;
  
  
  
  // FILTER BANKS
  var filterBanks = LS.Globals.FilterBanks;
  var nfft = filterBanks.fftSize/2;
  gl.translate(transx,transy);
  
  rect.w = 700 / filterBanks.numFilters;
  rect.h = 0.5;//40;
  var offset = 150;
  
   gl.beginPath();
    
  // Draw lines
  gl.moveTo(0,0);
  for (var i = 0; i<filterBanks.numFilters; i++){
    if (!this.scaleHz)
    	gl.lineTo((i+0.5)*rect.w, -rect.h*(filterBanks.bankEnergies[i]+offset));
    else{
      var bandwidth = 10*(filterBanks.bankFreqs[i+1] - filterBanks.bankFreqs[i])/filterBanks.highFreq;
      gl.lineTo((i+0.5)*rect.w*bandwidth, -rect.h*(filterBanks.bankEnergies[i]+offset));
    }
  }
	gl.lineWidth = 2;
  gl.strokeStyle = "rgba(255,255,255,0.9)";
  gl.stroke();
  
  gl.fillStyle = "rgba(255,255,255,0.8)";
  for (var i = 0; i<filterBanks.numFilters; i++){
		// Draw rectangles as bins
    if (!this.scaleHz)
    	gl.fillRect(i*rect.w, 0, rect.w*0.8, -rect.h*(filterBanks.bankEnergies[i]+offset));
    else{
      var bandwidth = 10*(filterBanks.bankFreqs[i+1] - filterBanks.bankFreqs[i])/filterBanks.highFreq;
    	gl.fillRect(i*rect.w*bandwidth, 0, rect.w*0.8*bandwidth, -rect.h*(filterBanks.bankEnergies[i]+offset));
    }
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