//@Energy Normalization

// Compute RMS of wave data when voiced (pitch confidence over 3 for example)
// From that, store maximum RMS. MaxRMS should decay over time and changed when a new maximum is found
// Use this maxRMS to calculate a certain amount of dBs that should be added to the spectral shape

var EnergyNormalization = function(analyser, opt){
	this.analyser = analyser;
  
  var opt = opt || {};
  
  // RMS reference
  this.refRMS = opt.refRMS || 0.6;
  // Decay
  this.decay = opt.decay || 0.995;
  // Voiced threshold to start decay
  this.confThreshold = opt.confThreshold  || 5; // Confidence goes from 0 to 15 approax.
  
  // Waveform
  this.wave = new Float32Array(this.analyser.fftSize);
  this.fftSize = this.analyser.fftSize;
  
	this.init();
}

// Initialize
EnergyNormalization.prototype.init = function(){
  // RMS
  this.RMS = 0;
  // Max RMS
  this.maxRMS = 0;
  // dBs
  this.dBs = 0;
}


// Update maxRMS
EnergyNormalization.prototype.update = function(voicedConfidence){
  
  this.RMS = this.computeRMS();
  
  // No info about voiced
  if (voicedConfidence === undefined){
    this.maxRMS *= this.decay;
		this.assignMax();
 	}
  // Voiced
  else if (voicedConfidence > this.confThreshold){
    this.maxRMS *= this.decay;
  	this.assignMax();
  } 
  // Not voiced 
  else {
  	
  }
  
  // Compute dBs
  this.dBs = 20*Math.log10(this.maxRMS / this.refRMS);
	
}


EnergyNormalization.prototype.normalizeBanks = function(melBanks){
  for (var i = 0; i<melBanks.length; i++){
  	melBanks[i] += -this.dBs*2;
  }
}



EnergyNormalization.prototype.assignMax = function(){
  if (this.RMS > this.maxRMS){
  	this.maxRMS = this.RMS;
    //console.log("New maximum RMS:", this.maxRMS);
  }
}


// Root Mean Square - RMS
EnergyNormalization.prototype.computeRMS = function(){
  // Wave data
  if (!this.analyser.wave) this.analyser.getFloatTimeDomainData(this.wave);
  else this.wave = this.analyser.wave;
  
  var energy = 0;
  for (var i = 0; i<this.wave.length; i++){
  	energy += this.wave[i]*this.wave[i];
  }
  var rms = Math.sqrt(energy/this.wave.length);
  
	return rms;
}