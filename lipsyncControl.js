//@Lipsync control
// This script should be added to the virtual character node

// Globals
if (!LS.Globals)
  LS.Globals = {};


// Blend shape names
this.createProperty( "_blendShapeNames", ["MouthOpen_m0", "Kiss_m0", "CurlUp_Out_tg_m0", "SH_CH_m0", "FV_m0"], { type: "array", data_type: LS.TYPES.STRING });
this._blendIndices = [];

// Mouth open, kiss, tongue, sh, fv
this._weights = [0, 0, 0, 0];
this._factors = [1, 1.0, 1, 1];
this._EMAFactor = 0.2;

this.Equalization = false;

this.onStart = function()
{
  LS.Globals.LSCtrl = this;
  
  // Get morph targets
  this._maxMorphPerNode = 0; //GUI
  var morphTargets = this.findMorphTargets();
  if (morphTargets.length != 0){
    this._morphTargets = morphTargets;
   	this._mtN = this._morphTargets.length;
    // Find indices for blend names
    this.findMorphIndices(this._blendIndices, this._morphTargets, this._blendShapeNames);
    console.log(this._blendIndices);
  } else
    console.warn("Morph targets not found in children");
  
  
  
  // Initialize lip component
  if (typeof LipsyncE4 === "function"){
		this.LipsyncE4 = new LipsyncE4();
    LS.Globals.LipsyncE4 = this.LipsyncE4;
  } else
    console.log("LipsyncE4 class missing"); 
}

this.onUpdate = function(dt)
{
  // Sample player exists
  if (LS.Globals.SamplePlayer){
    
    if(LS.Globals.SamplePlayer._audioReady){
      
      // Update lipsync with bank energies
      if (LS.Globals.FilterBanks && this.LipsyncE4){
        this.LipsyncE4.eqOption = this.Equalization;
        this._weights = this.LipsyncE4.update(LS.Globals.FilterBanks.bankEnergies, LS.Globals.FilterBanks.bankFreqs);
      }
    }
    
    //console.log(this._weights);
    // Apply weights
    for (var i = 0; i<this._blendIndices.length; i++){
      var ii = this._blendIndices[i];
      var mt = this._morphTargets[ii];
      
      var weight = this._weights[i] || 0;
      if (this._factors[i] === undefined) this._factors[i] = 1;
      weight *= this._factors[i];
      
      weight = weight* (1-this._EMAFactor) + mt.weight*this._EMAFactor;
      
      mt.weight = weight;
      // Linked morph target
      if (mt.linked)
        this._morphTargets[mt.linked].weight = weight;//this._weights[i] * this._factors[i];
    }
    
  }
  
  
	node.scene.refresh();
}













// MORPH TARGETS
// FIND MORPH TARGETS
// Multiple meshes with morph targets
this.findMorphTargets = function(){
  // Find morph targets
  var morphTargetsAgent = [];
  if (node.childNodes) {
  	for (var i = 0; i<node.childNodes.length; i++){
    	// Suppose that the object with morph targets is a child
      var morphComp = node.childNodes[i].getComponent(LS.Components.MorphDeformer)
      if (morphComp !== null){
        var morphTargetsNode = morphComp.morph_targets;
        // Check maximum per node for GUI representation
        if (this._maxMorphPerNode<morphTargetsNode.length) this._maxMorphPerNode = morphTargetsNode.length;
        // Find names
        this.findMorphNames(morphTargetsNode, node.childNodes[i].name);
        // Sort by name
        morphTargetsNode.sort(function(a, b){if (a.name < b.name) return -1; else return 1;});
        // Add to morph targets array
        morphTargetsAgent = morphTargetsAgent.concat(morphTargetsNode);
      }
  	}
  }
  
  // Link morph targets from different meshes (i.e. teeth-head meshes)
  this.linkMorphTargets(morphTargetsAgent);
  
  
  return morphTargetsAgent;
}

// Find common start string of all morph targets
this.findMorphNames = function(morphTargets, nodeName){
  if (morphTargets.length > 1){
    var stringSize = morphTargets[0].mesh.length;
    for (var i = 1; i<morphTargets.length; i++){
      var n1 = morphTargets[i-1].mesh;
      var n2 = morphTargets[i].mesh;

      while(n1.substr(0,stringSize) != n2.substr(0,stringSize)){
        stringSize-= 1;
        if (stringSize <= 0){
        	break;
        }
      }
    }
    // Now we have the common string to all morph targets. Name them.
    for (var i = 0; i<morphTargets.length; i++){
      morphTargets[i].name = morphTargets[i].mesh.substr(stringSize, morphTargets[i].mesh.length);
      morphTargets[i].node = nodeName;
    }
    
  } else if (morphTargets.length == 1) 
   morphTargets[0].name = morphTargets[0].mesh;
  else
    console.error("Something wrong in findMorphNames", morphTargets);
}

// If several meshes with morph targets, link the ones with the same name
this.linkMorphTargets = function(mt){
  // Find different nodes in morphTargets(mt)
  for (var i = 0; i<mt.length; i++){
    for (var j = 0; j < mt.length; j++){
    	if (i == j) continue;
      if (mt[i].name.includes(mt[j].name) && mt[i].node != mt[j].node){
      	// Link
        mt[i].linked = j;
        mt[j].linked = i;
      } 
    }
  }
}


// Find indices of blend shape names
this.findMorphIndices = function(out, morphtargets, blendnames){
  
  for (var i = 0; i< morphtargets.length; i++){
    for (var j = 0; j<blendnames.length; j++){
    	if (blendnames[j] == morphtargets[i].name)
        out[j] = i;
    } 
  } 
}

