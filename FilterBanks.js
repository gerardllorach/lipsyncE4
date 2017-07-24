//@FilterBanks

function FilterBanks(analyser, opt){
  
  this.analyser = analyser;
  
  var opt = opt || {};
  
	this.filterBanks = [];
  this.filteredEnergies = [];

  this.numFilters = this.nFilt = opt.numFilters || opt.fBankNum || 22; // Julius 24, HTK 22
  this.lowFreq = opt.lowFreq === undefined ? 0 : opt.lowFreq; // Julius disables hiPass and loPass, max-min freqs? Sampling rate?
  this.highFreq = opt.highFreq || 8000; // mHi is 8000kHz in Julius
  
  // Output
  this.bankEnergies = [];
  
  // Preemphasis filter (freq domain) 
  this.h = [];
  this.preEmph = opt.preEmph || 0.97; 
  
  // For GUI (Hz scaling and legend)
  this.bankFreqs = [];
}

FilterBanks.prototype.init = function(fs)
{
  // Create filter banks
  this.createFilterBanks(fs);
}


// Create filter banks (Matlab implementation)
// https://www.mathworks.com/matlabcentral/fileexchange/32849-htk-mfcc-matlab
FilterBanks.prototype.createFilterBanks = function(fs){
  
  // Half of the fft size
  var K = this.analyser.frequencyBinCount+1;
  var fftSize = this.fftSize = this.analyser.fftSize;
  // Sampling frequency
  var fs = this.fs = fs;
  // Filters
  var M = this.numFilters;
  var lowFreq = this.lowFreq;
  var highFreq = this.highFreq;
  var fMin = 0;
  var fMax = 0.5 * fs;
  
  
  var f = [];
  //var fw = [];
  // Create mel and freq points
  for (var i = 0; i<K; i++){
    f[i] = fMin + i*(fMax - fMin)/K;
    //fw[i] = this.freq2mel(f[i]);
  }
  
  
  // Create cutoff frequencies
  var c = [];
  //var cw = [];
  var mLF = this.freq2mel(lowFreq);
  var mHF = this.freq2mel(highFreq);
  for (var i = 0; i<M+2; i++){
  	c[i] = this.mel2freq(mLF + i*(mHF-mLF)/(M+1)); 
  	//cw[i] = this.freq2mel(c[i]);
  }
  // For GUI
  this.bankFreqs = c;

  // Create filter banks
  for (var i = 0; i < M; i++){
    this.filterBanks[i] = [];//new Array(K);
    // Create triangular filter
    for (var j = 0; j < K; j++){
      this.filterBanks[i][j] = 0;
      // Up-slope
      if (f[j]>=c[i] && f[j]<=c[i+1])
      	this.filterBanks[i][j] = (f[j] - c[i])/(c[i+1] - c[i]);
      // Down-slope
      if (f[j]>=c[i+1] && f[j]<=c[i+2])
        this.filterBanks[i][j] = (c[i+2]-f[j])/(c[i+2] - c[i+1]);
    }
    
  }
  
  
  // PRE EMPHASIS FILTER
  // Create pre-emphasis filter
  for (var i = 0; i < fftSize/2; i++){
    var w = i/(fftSize/2) * Math.PI;
    var real = (1 - this.preEmph)*Math.cos(w);
    var img = this.preEmph*Math.sin(w);
    this.h[i] = Math.sqrt(real*real + img*img);
  }
  
  

}

// Mel to frequency and viceversa
FilterBanks.prototype.freq2mel = function(f){return 1127 * Math.log(1+f/700);}
FilterBanks.prototype.mel2freq = function(m){return 700*(Math.exp(m/1127) - 1);}


// Compute Hz from bank index
FilterBanks.prototype.bankIndex2Hz = function(ind){
	
  
  
  
	return 0;
}

// Computes the energies of the banks given an array (spectogram, spectral shape)
// The spec vector might need some preprocessing (absolute, log) Something like:
//       var invLog = Math.pow(10, spec[j]/20); // Remove last step (20*log10(data))
//      invLog *= fftSize; // Remove division 1/N
//      invLog = (Math.abs(invLog)); // Magnitude spectrum Matlab
// 			Pre-emphasis filter
//      invLog *= this.h[j];
FilterBanks.prototype.compute = function(spec)
{
  // Optimize loop and stop computing for the end of each triangle
  for (var i = 0; i<this.numFilters; i++){
    this.bankEnergies[i] = 0;
    for (var j = 0; j<spec.length; j++){
      // add here the filter;
      // Bank filtere
      if (isNaN(spec[j]))
          spec[j] = -20;
    	this.bankEnergies[i] += this.filterBanks[i][j]*spec[j];
    }
  }
  //console.log(this.filterBanks[0][0] * spec[0], spec.length, this.filterBanks[21].length);
}

FilterBanks.prototype.preemphasisFilter = function(spec){
  for (var i = 0; i<spec.length; i++){
    var mod = Math.pow(10, spec[i]/20);
    mod *= this.fftSize;
    mod = (Math.abs(mod));
  	mod *= this.h[i];
    spec[i] = 20*Math.log10(mod);
  }

}
