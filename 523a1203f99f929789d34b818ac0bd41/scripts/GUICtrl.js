//@GUI controls

this.onStart = function(){
	// Get script components
  var scripts = node.getComponents(LS.Components.ScriptFromFile);
	// GUI scripts from audio analysis node
  var guiScripts = this.guiScripts = {};
  var optNames = ["fundFreq", "specShape", "filterBanks", "spectogram", "energies", "gain"];
  var scriptNames = ["F0GUI", "Spectral Shape GUI", "Filter Banks GUI", "Spectrum GUI", "Bank Energies GUI", "Energy Normalization GUI"];
  
  for (var i = 0; i< optNames.length; i++){
  	var name = optNames[i];
    guiScripts[name] = null;
  	
  }
  
  // Find and declare
  for (var i = 0; i<scripts.length; i++){
  	var ss = scripts[i];
    for (var j = 0; j<scriptNames.length; j++){ // could optimize loop
      if (ss.name == scriptNames[j]){
        var varName = optNames[j];
        guiScripts[varName] = ss;
      	this[varName] = ss.enabled;
        if (varName == "energies"){
        	this.hzscale = ss.context.scaleHz;
        }  
      }
    }
  }
  
  // Find lipsyncE4 equalization gui
	this._eqContext = LS.Globals.equalizationGUI;
  if (this._eqContext)
    this.equalization = this._eqContext._showGUI;
  this._lipCtrl = LS.Globals.LSCtrl;
  if (this._lipCtrl)
   this.equalize = this._lipCtrl.equalization;
}



this.onRenderGUI = function(){
  var guiScripts = this.guiScripts;
  if (!this.guiScripts)
    return;
  LS.GUI.Label( [10,10,300,30], "Visualizations" );
  
  var i = 0;
  if (guiScripts.fundFreq){
    guiScripts.fundFreq.enabled = this.fundFreq = LS.GUI.Toggle( [10,40 + i*20,180,20], this.fundFreq, "Fund. freq and signal" );
    i++;
  }
  if (guiScripts.specShape){
    guiScripts.specShape.enabled = this.specShape = LS.GUI.Toggle( [10,40 + i*20,180,20], this.specShape, "Spectral shape" );
    i++;
  }
  if (guiScripts.filterBanks){
    guiScripts.filterBanks.enabled = this.filterBanks = LS.GUI.Toggle( [10,40 + i*20,180,20], this.filterBanks, "Mel filter banks" );
    i++;
  }
  if (guiScripts.spectogram){
    guiScripts.spectogram.enabled = this.spectogram = LS.GUI.Toggle( [10,40 + i*20,180,20], this.spectogram, "Mel spectogram" );
    i++;
  }
  if (guiScripts.energies){
    guiScripts.energies.enabled = this.energies = LS.GUI.Toggle( [10,40 + i*20,180,20], this.energies, "Mel bank energies" );
    i++;
      guiScripts.energies.context.scaleHz = this.hzscale = LS.GUI.Toggle( [40,40 + i*20-2,150,20], this.hzscale, "Mel/Hz scale" );
      i++;
  }
  if (guiScripts.gain){
    guiScripts.gain.enabled = this.gain = LS.GUI.Toggle( [10,40 + i*20,180,20], this.gain, "Gain normalization" );
    i++;
  }
  if (this._eqContext)
  	this._eqContext._showGUI = this.equalization = LS.GUI.Toggle( [10,40 + i*20,180,20], this.equalization, "Equalization" );
  	i++;
  LS.GUI.Label( [10,50+i*20,300,30], "Options" );
  i++;
  if (this._lipCtrl){
  	this._lipCtrl.equalization = this.equalize = LS.GUI.Toggle( [10,60 + i*20,180,20], this.equalize, "Equalize" );
  }
}