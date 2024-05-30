//@Spectrum GUI

this._rect = {x:0,y:0,w:0,h:0};
this._prevEnergies = [];
this.bufferSize = 100;
this.dBSensivility = -60;
this.maxDB = 0;

this.onStart = function(){this._prevEnergies = [];}

this.onRenderGUI = function(){

	if (!LS.Globals.FilterBanks)
    return;
	
  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  
  var transx = 100;//w/4;
  var transy = h*0.6;
  
  var rect = this._rect;
  
  
  // SPECTOGRAM OF MEL FILTER BANK ENERGIES
  var filterBanks = LS.Globals.FilterBanks;
  var nfft = filterBanks.fftSize/2;
  gl.translate(transx,transy);
  
  rect.w = 300 / this.bufferSize;
  rect.h = 300 / filterBanks.numFilters;
  
  // Init buffers
  if (this._prevEnergies.length == 0)
    this.initBuffers(this._prevEnergies, filterBanks.numFilters);
  if (this._prevEnergies[0])
    if (this._prevEnergies.length != this.bufferSize) this.initBuffers(this._prevEnergies, filterBanks.numFilters);

  // Background rectangle
  gl.fillStyle = "rgba(127,127,127,0.7)";
  gl.fillRect(-80, rect.h*2, 300+100, -rect.h*1.1*filterBanks.numFilters-rect.h*2);
  this._prevEnergies.pop(); // Delete last element
  this._prevEnergies.unshift([]); // Add new array
  for (var i = 0; i<filterBanks.numFilters; i++){
    // Buffer
    this._prevEnergies[0][i] = filterBanks.bankEnergies[i];
    

    // Go over buffer
    for (var j = 0; j<this.bufferSize; j++){
      var energy =  this._prevEnergies[j][i]; // All the energies of a band
      if (energy === -Infinity) energy = this.dBSensivility;
      if (energy === undefined) energy = this.dBSensivility;
      
      var value = Math.max(0, (energy - this.maxDB - this.dBSensivility)/Math.abs(this.dBSensivility));
      value = (1-value)*255;
      
     	gl.fillStyle = "rgba("+value+","+value+","+value+",0.8)";
    	// Draw rectangles as bins
    	gl.fillRect(j*rect.w*1.01, -i*rect.h*1.1, rect.w, rect.h);
      
    }
    
    // Show frequencies
    gl.font = "12px Arial";
    gl.fillStyle = "rgba(255,255,255,0.8)";
    gl.textAlign = "center";
    if (filterBanks.bankFreqs[i] !== undefined)
    	gl.fillText(filterBanks.bankFreqs[i].toFixed(1)+" Hz", -40, -1.1*i*rect.h+10);
    
  }
  LS.Globals.buffer = this._prevEnergies;

  
  gl.translate(-transx,-transy);  

  
  gl.finish2D();

}

// Initialize buffers
this.initBuffers = function(buffer, numFilters){
  for (var i = 0; i<this.bufferSize; i++){
    buffer[i] = [];
    for (var j = 0; j<numFilters; j++){
    	buffer[i][j] = -Infinity; // yes?
    }
  }
}