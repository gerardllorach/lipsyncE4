//@Formant shape extraction
// Find F0
// Find harmonic peaks
// Interpolate

function FormantSpectrum(analyser, opt){
  this.analyser = analyser;
  
  var opt = opt || {};
  
  // F0 correlation
  this.corrInd = [];
  this.lowFreqLim = opt.lowFreqLim || 80;
  this.highFreqLim = opt.highFreqLim || 500;
  // F0 threshold?
  this.threshold = opt.threshold || 0.8;
  // Fundamental frequency
  this.fundFreq = 0;
  this.indFundFreq = 0;
  this.fundFreqConf = 0;
  // Second possible peak
  this.secondPeak = 0;
  this.secPeakInd = 1;
  
  // Harmonics
  this.harmonics = [];
  this.maxHarmFreq = 8000;
  // Spectral shape
  this.specShape = [];
  
}

FormantSpectrum.prototype.init = function(fs){
  // FS
  this.fs = fs;
  
  // FFT buffer
  this.spectrum = new Float32Array(this.analyser.frequencyBinCount);
  // Waveform
  this.wave = new Float32Array(this.analyser.fftSize);
  this.waveNorm = new Float32Array(this.analyser.fftSize);
  
  // Redefine lowFreqLim and highFreqLim
  if (fs/(0.5*this.analyser.fftSize) > this.lowFreqLim){
      console.log("F0 - Minimum possible f0:",(fs/(0.5*this.analyser.fftSize).toFixed(2)), "Hz.");
    	this.lowFreqLim = fs/(0.5*this.analyser.fftSize);
  }
  if (fs/2 < this.highFreqLim){
    console.log("F0 - Maximum possible f0:", fs/2, "Hz.");
  	this.hihgFreqLim = fs/2;
  }
  
  this.fftSize = this.analyser.fftSize;
  
  // Reset harmonics array
  this.harmonics = [];
}

FormantSpectrum.prototype.computeSpectrum = function(){
  
  // FFT and wave data
  if (!this.analyser.spectrum) this.analyser.getFloatFrequencyData(this.spectrum);
  else this.spectrum = this.analyser.spectrum
  if (!this.analyser.wave) this.analyser.getFloatTimeDomainData(this.wave);
  else this.wave = this.analyser.wave;
  
  // FFT not computed yet
  if ((this.spectrum[0]) === -Infinity) 
    return;
  
  // Analyzer properties
  var nfft = this.analyser.frequencyBinCount;
  var fftSize = this.analyser.fftSize;
  var fs = this.fs;//context.sampleRate;
  
  // Compute F0
  this.computeF0();
  
  // Compute Spectral Shape
  this.computeSpectralShape();
  
}


FormantSpectrum.prototype.computeSpectralShape = function(){
  // Set spectral shape to 0?
  if (this.fundFreq == 0){
    return;
  }
  
  // Analyzer properties
  var nfft = this.analyser.frequencyBinCount;
  var fftSize = this.analyser.fftSize;
  var fs = this.fs;//context.sampleRate;
  
  var f0 = this.fundFreq;
  var spec = this.spectrum;
 
  
  // Find harmonics
  /*var maxHarmonic = Math.ceil(this.maxHarmFreq / f0); // TODO: substitute for highFreq from the filterbank?
  for (var i = 0; i<maxHarmonic; i++){
  	var harm = f0 * (i+1);
    var harmInd = nfft * harm / (fs/2);  // check that nfft is half the fft size or spec.length
    var lowInd = Math.floor(harmInd);
    var highInd = Math.ceil(harmInd);
    
  	this.harmonics[i] = spec[highInd] * (harmInd-lowInd) + spec[lowInd] * (highInd - harmInd);
  }*/
  
  // Preemphasis filter
  if (LS.Globals.FilterBanks){
  	LS.Globals.FilterBanks.preemphasisFilter(this.spectrum);
  }
  
  // TODO: if not voiced or fund Freq is higher than 500 should do the average of the spectrum.
  
  // Interpolate
  // specShape should have the same size as spec? or should I make a multiple of f0?
  var count = 0;
  var prevInd = 0;
  for (var i = 0; i<nfft; i++){
    // Harmonic indices
    var harm = f0 * (count+1);
    var harmInd = nfft * harm / (fs/2);  // check that nfft is half the fft size or spec.length
    var lowInd = Math.floor(harmInd);
    var highInd = Math.ceil(harmInd);
    
 
		// Check between the low index from the next harmonic and the high index from the previous harmonic
    var inter = (lowInd-i)/(lowInd-prevInd); // 1 when close to prevInd, 0 when close to lowInd
    this.specShape[i] = spec[lowInd] * (1-inter)  + spec[prevInd] * (inter);
    
   	if (i == lowInd){
      count++;
      prevInd = lowInd;
    }
  }
  
}




FormantSpectrum.prototype.computeF0 = function(){
  
  // Analyzer properties
  var nfft = this.analyser.frequencyBinCount;
  var fftSize = this.analyser.fftSize;
  var fs = this.fs;//context.sampleRate;
  
  // Find f0
  var lfDelayLim = Math.floor(fs / this.lowFreqLim);
  var hfDelayLim = Math.floor(fs / this.highFreqLim);
  //console.log(lfDelayLim, hfDelayLim, this.lowFreqLim, this.highFreqLim);
  // First peak
  var maxCorr = 1;
  var indMaxCorr = 0;
  // Second peak
  var maxCorr2 = 0;
  var indMaxCorr2 = 0;
  
  
  // Normalize wave
  var absMax = 0;
  for (var i = 0; i<this.wave.length; i++){
    if (Math.abs(this.wave[i]) > absMax) absMax = Math.abs(this.wave[i]);
  }
  for (var i = 0; i<this.wave.length; i++) this.waveNorm[i] = this.wave[i]/absMax;

  
  // Correlation
  for (var i = 0; i<this.waveNorm.length; i++){
    for (var j = hfDelayLim; j<lfDelayLim; j++){
      // Comparison out of bounds
      if (i+j>= this.waveNorm.length) break;
      
      // First iteration
      if (i == 0) this.corrInd[j- hfDelayLim] = 0; // Reinitialize
      //if (j<hfDelayLim) continue;
      //if (j>lfDelayLim) continue;
      // Correlation for periodicity
      this.corrInd[j- hfDelayLim] += Math.pow(this.waveNorm[i] + this.waveNorm[i+j],2) / Math.max(Math.pow(this.waveNorm[i] - this.waveNorm[i+j],2), 0.0001);
    }
  }
  
  // Normalize weights by the number of samples computed?
  
  // Maximum peak frequency and confidence
  var sum = 0;
  for (var i = hfDelayLim; i<lfDelayLim; i++){
    if (this.corrInd[i- hfDelayLim]> maxCorr){
      // TODO:
      // The interesting peak is the higher and comes first
      // The second peak has to be much bigger or precise in order to be chosen over the first
      
      // Store the second highest peak
      if ((indMaxCorr-indMaxCorr2) > (lfDelayLim - hfDelayLim)*1){
      	maxCorr2 = maxCorr;
        indMaxCorr2 = i;
      }
      
      maxCorr = this.corrInd[i- hfDelayLim];
    	indMaxCorr = i;
    }
    
    sum += this.corrInd[i- hfDelayLim];
  }
  

  this.fundFreq = fs/indMaxCorr;
  this.indFundFreq = indMaxCorr;
  //console.log(indMaxCorr2);
  this.secondPeak = fs/indMaxCorr2;
  this.secPeakInd = indMaxCorr2;
  
  this.fundFreqConf = this.corrInd[indMaxCorr- hfDelayLim] / (sum/(lfDelayLim-hfDelayLim));
  

}