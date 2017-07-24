//@Plot
//defined: component, node, scene, globals
this.onStart = function()
{
  // Example array
  this._myarr = [];
  for (var i = 0; i<300; i++){
    this._myarr[i] = Math.cos(2*Math.PI*i/50);
  }
  this._opts = {numAxis:true};
}

this.onUpdate = function(dt)
{
  
	//node.scene.refresh();
}

this.onRenderGUI = function(){
  plot(this._myarr, this._opts);
}


/*
 * array -- array [] containing data
 * dx -- displacement of the plot on the x axis
 * dy -- displacement of the plot on the y axis
 * ww -- width of the plot
 * scaleH -- scaling of the data
 * color -- string with the color (canvas style)
 * legend -- bool to show the numbers

*/
var plot = function(array, opts){
  
  if (array === undefined)
    return false;
  
  var opts = opts || {};

  gl.start2D();
  
  w = width = gl.viewport_data[2];
  h = height = gl.viewport_data[3];
  var heightScale = 100;
  
  
  var dx = opts.dx*w || w/4;
  var dy = opts.dy*h || h/2;
  var scaleW = opts.scaleW || 0.5;
  var scaleH = opts.scaleH || 1;
  var color = opts.color || "rgba(255, 255, 255, 0.9)";
  var numAxis = opts.numAxis || false;
  
  var ww = scaleW*w;
  
  // Limit width
  if (ww > w-dx)
    ww = w-dx;
  
  gl.translate(dx,dy);
  
  
  // Draw lines
  gl.beginPath();
  gl.moveTo(0,-array[0]*scaleH*heightScale);
  for (var i = 0; i<array.length; i++)
    gl.lineTo(i * ww/array.length, -array[i]*scaleH*heightScale);
  gl.strokeStyle = "rgba(255,255,255,0.9)";
  gl.lineWidth=2;
  gl.stroke();
  
  // Axis
  // X axis
  gl.beginPath();
  gl.moveTo(0,0);
  gl.lineTo(ww, 0);
  gl.lineTo(ww, -scaleH*10);
  gl.lineTo(ww, scaleH*10);
  gl.strokeStyle = "rgba(255,255,255,0.5)";
  gl.lineWidth=1;
  gl.stroke();
  // Y axis
  gl.beginPath();
  gl.moveTo(-scaleH*10, scaleH*heightScale);
  gl.lineTo(0, scaleH*heightScale);
  gl.lineTo(0, -scaleH*heightScale);
  gl.lineTo(-scaleH*10, -scaleH*heightScale);
  gl.strokeStyle = "rgba(255,255,255,0.5)";
  gl.stroke();
  
  // Numbers in the axis
  if (numAxis){
    console.log("hi");
    gl.font = "20px Arial";
  	gl.fillStyle = "rgba(255,255,255,0.8)";
  	gl.textAlign = "center";
    gl.textBaseline = "middle"; 
    // X axis
		gl.fillText(array.length, ww, 30);
    // Y axis
    gl.fillText("1", -30, -scaleH*heightScale);
    gl.fillText("-1", -30, scaleH*heightScale);
    gl.fillText("0", -30, 0);
  }
  
  

  gl.translate(-dx,-dy);
  
  
  
  gl.finish2D();
  
  
}