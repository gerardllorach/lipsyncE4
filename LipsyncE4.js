// mouthOpen, mouthRound, tongueUp, sh, fv


var LipsyncE4 = function(){

	this.lipValues = {mouthOpen: 0, mouthRound: 0, tongueUp: 0, sh: 0, fv: 0};
  this.eqOption = true;
  this.init();
}

LipsyncE4.prototype.init = function(){
  this.highFreqBooster = 0;
  // There needs to be EQ for the frequency bands to compensate for mic effects
  // Each frequency group will have different EQs
  
  // TODO: Energy normalization uses the waveform. It can happen that the lowFreqs are too low?
  // EQs
  this.EQBands = {lowFreq: {max: undefined, maxDef: 24, dB: 0},
                  midLowFreq: {max: undefined, maxDef: 65, dB: 0}, 
    							midFreq: {max: undefined, maxDef: 60, dB: 0}, 
                  midHighFreq: {max: undefined, maxDef: 60, dB: 0}, 
                  highFreq: {max: undefined, maxDef: 100, dB: 0}
                  };
  
  // birch_canoe_300Hz_6dB_lowpass 
  //		-> voicedDBs (-18, 24) vs (-27, 22)
  //		-> midFreqDBs (-140, 14) vs (-94, 56) -- (-178, -4)
  //		-> midLowFreqDBs (-99, 17) vs (-68, 45) -- (-105, 22)
  //		-> midHighFreqDBs (-230, -4) vs (-157, 81) -- (-333,-37)
  //		-> highFreqDBs (-, -178) vs (-, -109)	-- (-827,-221)
  
  // juice_lemon_1000Hz_6dB_lowpass
  //		-> voicedDBs (-19, 24) vs (-34, 32) 
  //		-> midFreqDBs (-127, 44) vs (-107, 70) -- (-202, 8)
  //		-> midHighFreqDBs (-189, 46) vs (-121, 76) -- (-114, 18)
  //		-> midLowFreqDBs (-70, 46) vs (-86, 45) -- (-335, -9)
  //		-> highFreqDBs (-, -164) vs (-,  -109) -- (-804, -221)
}


LipsyncE4.prototype.update = function(melBanks, bankPeaks){
  
  this.bankPeaks = bankPeaks;
  this.melBanks = melBanks;
  var numBanks = melBanks.length;
  
  // Low freq dBs on the 80-300 hz freq range
  var voicedDBs = this.computeDBs(this.getBankHighIndex(80), this.getBankHighIndex(300));
	// Mid low freqs dBs
  var midLowFreqDBs = this.computeDBs(this.getBankHighIndex(300), this.getBankHighIndex(1300));
	
  // High freq dBs
  var highFreqDBs = this.computeDBs(this.getBankHighIndex(4000), this.getBankHighIndex(8000));
  
  // Equalize
  voicedDBs += this.computeMaxAndDB("lowFreq", voicedDBs);
  midLowFreqDBs += this.computeMaxAndDB("midLowFreq", midLowFreqDBs);
  highFreqDBs += this.computeMaxAndDB("highFreq", highFreqDBs);
	
  // Voiced dBs are dBs higher than highFreq dBs
  if (voicedDBs > highFreqDBs + 100 && (voicedDBs > -20 || midLowFreqDBs > -20)){ // TODO: check dBs for /f/ in high freq

   	
    var midFreqDBs = this.computeDBs(this.getBankHighIndex(600), this.getBankHighIndex(2500));
    var midHighFreqDBs = this.computeDBs(this.getBankHighIndex(1500), this.getBankHighIndex(3500));
    
    // Equalize
    midFreqDBs += this.computeMaxAndDB("midFreq", midFreqDBs);
    midHighFreqDBs += this.computeMaxAndDB("midHighFreq", midHighFreqDBs);
    
    // dBs for voiced consonants /m/ as low limit
    var voicedConsDB = -0;
    var voicedTopDB = 20;
    //console.log(voicedDBs, midLowFreqDBs, midLowFreqDBs > voicedDBs);
    this.lipValues.mouthOpen = this.normalizeAndLimit(voicedConsDB, voicedTopDB, voicedDBs); // TODO: check dBs for /m/, check dBs for /a/; // TODO: does the dBs go down when comparing /a/ to /i/ to /u/?
		//this.lipValues.mouthOpen = this.normalizeAndLimit(highFreqDBs+100,highFreqDBs+200 , voicedDBs);
    // /a/ when low energy in low freqs but high energy in midlow freqs
    if (midLowFreqDBs > voicedDBs)
      this.lipValues.mouthOpen = this.normalizeAndLimit(voicedConsDB, voicedTopDB, midLowFreqDBs);

			//this.lipValues.mouthOpen = this.normalizeAndLimit(voicedDBs, voicedDBs + 20, midLowFreqDBs);
    
//console.log(voicedDBs, midLowFreqDBs);
    // Round mouth (it can be affected by the /i/)
    // less rounding for higher mid range energy
    var uMidFreqdB = -20;
    var aMidFreqdB = 60;
    
    // Mid ranged frequencies
    
    // TODO: check relationship between voicedDBs and midFreqsDBs (interesting to differentiate /u/ from /m/. /u/ has usually less voicedDBs energy)
    // /m/ does also not have mid range frequencies; but it shouldnt be rounded
    // subtract a voicing coefficient so that the rounding is less for /m/
		this.lipValues.mouthRound = 1-this.normalizeAndLimit(uMidFreqdB, aMidFreqdB, midFreqDBs);
    
    // Correct rounding if energies on midHigh are higher than midLow
    var value = 1- this.normalizeAndLimit(midLowFreqDBs-20, midLowFreqDBs + 20, midHighFreqDBs);
    this.lipValues.mouthRound *= value;
    
    // Tongue up for /i/ and /e/
    this.lipValues.tongueUp = this.normalizeAndLimit(voicedDBs-20, voicedDBs+200, midHighFreqDBs); // TODO: check midhihgfreq dBs range
  
  } else  {
    // Reduce rounding if not voiced
  	this.lipValues.mouthOpen *= 0.85;
    this.lipValues.mouthRound *= 0.85;
  }
  
  // TODO: do voiced fricatives like /v/ fall under this condition?
  // TODO: plosive burst may look like faint fricatives 

  // Fricatives /s/ /sh/
  var shHighFreqdB = 200; // TODO: check dBs for /sh/ and /s/
  this.lipValues.sh = this.normalizeAndLimit(voicedDBs, voicedDBs+shHighFreqdB, highFreqDBs);

  // Fricative /f/
  var fDiffVoicedDB = 20; // TODO: check dBs for /f/ and how to solve it. Comput differences?
  this.lipValues.f =  this.normalizeAndLimit(voicedDBs - 40, voicedDBs + 40, highFreqDBs);
  if (this.lipValues.f >= 1)
    this.lipValues.f =  1 - this.normalizeAndLimit(voicedDBs + 40, voicedDBs + 80, highFreqDBs);
  
  
  // Error check
  this.errorCheck = 0;
  
  
	return [this.lipValues.mouthOpen, this.lipValues.mouthRound, this.lipValues.tongueUp, this.lipValues.sh, this.lipValues.f];
	
}


LipsyncE4.prototype.getBankHighIndex = function(freq){

    // Get bank peaks
    var bankPeaks = this.bankPeaks;
    // Return lower index
    for (var i = 0; i < bankPeaks.length; i++){
        if (freq < bankPeaks[i])
            return i;

    }

    return bankPeaks.length-2;
}

LipsyncE4.prototype.computeDBs = function(lowInd, highInd){
  var melBanks = this.melBanks;
  var e = 0;
	
  if (lowInd == highInd)
    return melBanks[lowInd];
  
  for (var i = lowInd; i<highInd; i++){
    e += Math.pow(10, melBanks[i]/20);
  }
  return 20*Math.log10(e/(highInd-lowInd));
}


LipsyncE4.prototype.normalizeAndLimit = function (lowDB, highDB, dBs){

  var out = (dBs - lowDB)/(highDB - lowDB);
  out = Math.max(0,Math.min(1, out));
  return out;
}



// Max calculation for equalization (EQ) of bands
LipsyncE4.prototype.computeMaxAndDB = function(EQBand, value){
  
  var eqBand = this.EQBands[EQBand];
  
  if (value === Infinity || value === -Infinity || value === undefined || isNaN(value))
    return;
  
  // Initialize values
  if (eqBand.max === undefined){
  	eqBand.max = value;
    return 0;
  }
  // Define new max
  if (value > eqBand.max){
  	eqBand.max = value;
    return 0;
  }
  
  // Return equalizing dBs and reduce slowly max
  eqBand.dB = eqBand.maxDef - eqBand.max;
  eqBand.max *= 0.999;

  if (this.eqOption)
  	return eqBand.dB;
  else
    return 0;
  

}
