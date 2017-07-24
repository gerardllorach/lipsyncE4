//@Sample player
// Reads the audio files or microphone
// Updates the acoustic features

// Globals
if (!LS.Globals)
  LS.Globals = {};

// Audio context
if (!LS.Globals.AContext)
	LS.Globals.AContext = new AudioContext();

// Microphone
navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

var context = LS.Globals.AContext;


// Smoothness of the FFT analysis
this.smoothness;
this.createProperty("smoothness", 0.6, {type: "number", widget:"slider", min:0, max:1, step:0.01});

this.fftSize;
this.createProperty("fftSize", 1024, {type: "number",  widget:"combo", values:[256,512,1024,2048,4096]});;

// Number of filter banks
this.numFilterBanks;
this.createProperty("numFilterBanks", 22, {type: "number", widget:"slider", min:6, max:40, step:1});

// Filter bank max frequency
this.maxFilterBankFreq;
this.createProperty("maxFilterBankFreq", 8000, {type: "number", widget:"slider", min:4000, max:12000, step:1});

// Pre-emphasis filter
this.createProperty("preEmphasisFilter", 0.97, {type: "number", widget:"slider", min:0.8, max:0.999, step:0.01});



// Normalize energy
this.normalizeBanks = true;

// Show GUI
this.showGUI = true;

// Extra audio files
this.createProperty( "audioURLs", [], { type: "array", data_type: LS.TYPES.STRING });

// START
this.onStart = function(){
  LS.Globals.SamplePlayer = this;
  
  
  // Audio sources
  this.URL = [];
  
  var path = "https://webglstudio.org/latest/fileserver/files//gerard/audios/";
  this.URL.push(path + "i-have-four-airplanes-f.wav");
  this.URL.push(path + "pm-aeiou.wav");
  this.URL.push(path + "pm-aeiou_16kHz.wav");
  this.URL.push(path + "sp10.wav");
  this.URL.push(path + "sp10_44100Hz.wav");

  this.URL.push(path + "500_700Hz.wav");
  this.URL.push(path + "pm-aeiou.wav");
  this.URL.push(path + "chirp100_4000.wav");
  this.URL.push(path + "150Hz.wav"); 
  this.URL.push(path + "150Hz_minus3dB.wav"); 
  this.URL.push(path + "150Hz_minus12dB.wav");
	this.URL.push(path + "500Hz.wav"); 
  
  this.URL.push(path + "openjaw.wav");
  this.URL.push(path + "hopen.wav");
  this.URL.push(path + "tongue.wav");
  this.URL.push(path + "mana.wav");
  
  this.URL.push(path + "aaaOpen.wav");
  this.URL.push(path + "aaa.wav");
  this.URL.push(path + "eee.wav");
  this.URL.push(path + "iii.wav");
  this.URL.push(path + "ooo.wav");
  this.URL.push(path + "uuu.wav");
  
  this.URL.push(path + "sh_h.wav");
  this.URL.push(path + "s_h.wav");
  this.URL.push(path + "f.wav");
  this.URL.push(path + "ja.wav");
  
  this.URL.push(path + "empty.wav");
  
  this.URL.push(path + "microphone"); //hack for microphone
  
  // Harvard urls
  path = "https://webglstudio.org/latest/fileserver/files//523a1203f99f929789d34b818ac0bd41/speech/";
  for (var i = 1; i<21; i++)
    this.URL.push(path + "hvd_0"+ Math.floor(i/10) + i%10 + "_1.wav");
  
  // High Pass
  this.URL.push(path + "hvd_001_1_1000Hz_6dB_highPass.wav");
  
  // Low-passed Max Sentences
  this.URL.push(path + "chicken_leg_300Hz_6dB.wav");
  this.URL.push(path + "chicken_leg_1000Hz_6dB.wav");
  this.URL.push(path + "lemon_juice_1000Hz_6dB.wav");
  this.URL.push(path + "lemon_juice_300Hz_12dB.wav");
  this.URL.push(path + "birch_canoe_300Hz_6dB.wav");
  this.URL.push(path + "birch_canoe_1000Hz_6dB.wav");
  
  
  // Extra URLs
  for (var i = 0; i < this.audioURLs.length; i++){
    this.URL.push(this.audioURLs[i]);
  }
  
  
  // WEB AUDIO API
  // Sound source
	this._sample = context.createBufferSource();
  // Gain Node
  this._gainNode = context.createGain();
  // Analyser
  this._analyser = context.createAnalyser();
  // FFT smoothing
  this._analyser.smoothingTimeConstant = this.smoothness;
  // FFT size
  this._analyser.fftSize = this.fftSize;
  
  
  // Buffers
  // FFT buffer
  this._spectrum = new Float32Array(this._analyser.frequencyBinCount);
  // Waveform
  this._wave = new Float32Array(this._analyser.fftSize);
  
  
  // ACOUSTIC FEATURES  
  // Formant spectrum
  if (typeof FormantSpectrum === "function"){
		this.FormantSpectrum = new FormantSpectrum(this._analyser);
    LS.Globals.FormantSpectrum = this.FormantSpectrum;
  } else
    console.log("FormantSpectrum class missing");
  
  // Filter banks
  if (typeof FilterBanks === "function"){
    // Could enter here a high frequency limit. This limit should be also in FormantSpectrum to compute harmonics
    this.FilterBanks = new FilterBanks(this._analyser, {numFilters: this.numFilterBanks, highFreq: this.maxFilterBankFreq, preEmph: this.preEmphasisFilter});
    LS.Globals.FilterBanks = this.FilterBanks;
  } else
    console.log("FilterBanks class missing");
  
  // Energy Normalization
  if (typeof EnergyNormalization === "function"){
    this.EnergyNormalization = new EnergyNormalization(this._analyser);
    LS.Globals.EnergyNormalization = this.EnergyNormalization;
  } else
    console.log("EnergyNormalization class missing");
}




// UPDATE
this.onUpdate = function(dt){
  
  if (this._audioReady){
    // Compute fft and wave info
    this._analyser.getFloatFrequencyData(this._spectrum);
    this._analyser.getFloatTimeDomainData(this._wave);
    // Store
    this._analyser.spectrum = this._spectrum;
    this._analyser.wave = this._wave;

    
    
    // Compute formant spectrum and f0
    if (this.FormantSpectrum) this.FormantSpectrum.computeSpectrum();
    // Apply filterbank
    if (this.FilterBanks){
      var spec = [];
      if (this.FormantSpectrum) spec = this.FormantSpectrum.specShape;
      else spec = this._spectrum;
      // Apply filterbank
      this.FilterBanks.compute(spec);
			
      // Compute energy and get dBs to apply to the mel banks
      if (this.EnergyNormalization){
        // Use the periodicity confidence if available
        if (this.FormantSpectrum) this.EnergyNormalization.update(this.FormantSpectrum.fundFreqConf);
        else this.EnergyNormalization.update();
        
        
        // Apply dB to the mel banks
        if (this.normalizeBanks)
          this.EnergyNormalization.normalizeBanks(this.FilterBanks.bankEnergies);
      }
    }
  }
  
  node.scene.refresh();
}

// FINISH
this.onFinish = function(){
  
  this.stopSample();
}



// Initialises acoustic feature computations
// Audio or mic can have different sampling rates
this.initAcousticFeatures = function(fs){
  // Init MFCCs
  if (this.MFCC) this.MFCC.init(fs);
  // Init formant spectrum
  if (this.FormantSpectrum) this.FormantSpectrum.init(fs);
  // Init filter banks
  if (this.FilterBanks) this.FilterBanks.init(fs);
  
  // Initialize Energy normalization
  if (this.EnergyNormalization) this.EnergyNormalization.init();
  // Init lipsync equalization
  if (LS.Globals.LipsyncE4) LS.Globals.LipsyncE4.init();
}








// WEB AUDIO API
this.analyseSample = function(){

  // Sample to analyser
  this._sample.connect (this._analyser);
  // Analyser to Gain
  this._analyser.connect(this._gainNode);  
  // Gain to Hardware
  this._gainNode.connect(context.destination);
  
  console.log("File Sample Rate:", context.sampleRate, "Hz.");
  
  // Init MFCC calculation and create filter banks
  this.initAcousticFeatures(context.sampleRate);
  this._audioReady = true;
  
  // start
  this._sample.start(0);
  this._sample.loop = true;
}

this.startMicrophone = function(){
  
  this.stopSample();
  
  that = this;
  navigator.getUserMedia({audio: true}, function(stream) {
    that._stream = stream;
    that._sample = context.createMediaStreamSource(stream);
    that._sample.connect(that._analyser);
    console.log("Mic Sample Rate:", context.sampleRate, "Hz.");
    that._analyser.disconnect();
    that._gainNode.disconnect();
    // Init MFCC calculation and create filter banks
    that.initAcousticFeatures(context.sampleRate);
    that._audioReady = true;

  }, function(e){console.log("ERROR: get user media: ", e);});
  
}

// Loads and plays the sample once loaded
this.loadSample = this.playSample = function(inURL){
  if (!inURL)
    return console.log("URL not defined in loadSmple.", inURL);
  var URL = LS.RM.getFullURL (inURL);
  var request = new XMLHttpRequest();
	request.open('GET', URL, true);
	request.responseType = 'arraybuffer';
  
  console.log("Loading audio...");
  this.loading = true;
  
  var that = this;
	request.onload = function(){
		context.decodeAudioData(request.response,
			function(buffer){
        that.stopSample();
        that._sample = context.createBufferSource();
				that._sample.buffer = buffer;
        console.log("Audio loaded.", URL);
        console.log(that._sample);
        that.analyseSample();
        that.loading = false;
			}, function(e){ console.error("Failed to load audio", URL); that.loading = false;});
	};
	request.send();
}



this.stopSample = function(){
  // If AudioBufferSourceNode has started
  if(this._sample)
    if(this._sample.buffer){
      this._sample.stop(0);
      this._audioReady = false;
    }
  
  // If microphone input
  if (this._stream){
    this._stream.getTracks()[0].stop();
    console.log(this._stream.getTracks());
    this._audioReady = false;
  }
}


// HTK default parameters for MFCCs
this.defineHTKdefault = function(opts){
  opts.smpFreq = 16000;
  opts.smpPeriod = 625;
  opts.frameSize = 400;
  opts.fShift = 160;
  
  opts.lowFreq = 0;
  opts.highFreq = 8000;
  opts.preEmph = 0.97;
  opts.fBankNum = 20; // 24 in julius, 20 in HTK
  opts.lifter = 22;
  opts.deltaWin = 2;
  opts.rawE = false; // false in Julius, true in HTK
  opts.enormal = false; // false in Julius, true in HTK
  opts.escale = 1; // 1 in Julius, 0.2 in HTK. Not used
  opts.silFloor = 50; 
}



// GUI for playing URL samples
this.onRenderGUI = function(){
  
  if (!this.showGUI) return;
  
  if (!gl.mouse.left_button)
  	this._clicked = false;
  
  width = gl.viewport_data[2];
  height = gl.viewport_data[3];
  
  gl.start2D();
  
  
	// Select audio file
  if (!this.URL)
    return;
  gl.textAlign = "center";
  if (!this.rect)
  	this.rect = {x:0, y:0, w:0, h:20};
  var rect = this.rect;
  var spaceW = 20;
  var lineY = 0;
  for (var i = 0; i<this.URL.length; i++){
    var shortURL = this.URL[i].split("/");
    shortURL = shortURL[shortURL.length-1];
    if (i != 0){ 
      var shortPrevURL = this.URL[i-1].split("/");
    	shortPrevURL = shortPrevURL[shortPrevURL.length-1];    
    }
    // X displacement
    if (i != 0) rect.x += gl.measureText(shortPrevURL).width + spaceW;
    else rect.x = 0;
    // Y displacement and X correction
    if (Math.floor((rect.x + gl.measureText(shortURL).width)/width)>=1){
      lineY++;
      rect.x = 0;
    }
    rect.y = height - (rect.h*1.3)*lineY - rect.h;
		rect.w = gl.measureText(shortURL).width;
    
    if (gl.mouse.x < rect.x + rect.w && gl.mouse.x > rect.x &&
        height-gl.mouse.y < rect.y + rect.h && height-gl.mouse.y > rect.y){
      gl.fillStyle = "rgba(255,255,255,0.5)";

      if (gl.mouse.left_button  && !this._clicked){
        this._clicked = true;
        
        if (this._audioReady && this._selAudioInd == i){
          this.stopSample();
          this._selAudioInd = -1;
        }else{
          // Load sample
          if (shortURL != "microphone")
        		this.loadSample(this.URL[i]);
          // Start microhpone
          else 
            this.startMicrophone();
        	this._selAudioInd = i;
        }
        gl.fillStyle = "rgba(127,255,127,0.8)";
      }
    } else
      gl.fillStyle = "rgba(255,255,255,0.3)";
    
    if (this._selAudioInd == i){
      var sin = (Math.sin(2*Math.PI*LS.GlobalScene.time)+1)*0.5;
      sin = sin*127 + 64;
    	gl.fillStyle = "rgba("+63+","+sin+","+63+","+"0.8)";
    }

    gl.fillRect(rect.x,rect.y,rect.w,rect.h);
    gl.fillStyle = "rgba(255,255,255,0.9)";
    gl.fillText(shortURL, rect.x + (rect.w-spaceW*0.5)/2, rect.y +3*rect.h/4);
  }
  
  gl.finish2D();
}


