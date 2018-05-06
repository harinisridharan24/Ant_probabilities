var nodes = []
var oldNodes = []
var newNodes = []
var successPath = []
var currentNest= {}

var rows;
var columns;
var canvas, context;
$(document).ready(function() {
  canvas = document.getElementById("grid");
  context = canvas.getContext("2d");
});


function drawGrid(){
    nodes = [];
    currentNest ={};
    successPath = [];
    rows = $('#rows').val()
    columns = $('#columns').val()
    var nest = $('#nest').val()
    var iterations = $('#iterations').val()
    var food = $('#food').val()
    var i = 0;
    var j = 0;


    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    

    var totalRows = 400/rows;
    var totalCols = 400/columns;
    var splitNestVa

    for (x=0;x<=400;x+=totalRows) {
        for (y=0;y<=400;y+=totalCols) {
            context.strokeStyle = "black";
            context.moveTo(x, 0);
            context.lineTo(x, 400);
            context.stroke();
            context.moveTo(0, y);
            context.lineTo(400, y);
            context.stroke();
        }
    }
    for(i=0;i<rows; i++){
      for(j=0;j<columns;j++){
        nodes.push({
        x: i,
        y: j,  
        color: '',
        border: 4,
        isNest: false,
        isFood: false,
        inFoodPath: false,
        updated: false,
        oldProb: 1,
        newProb: 1,
        oldProbFood: 0,
        newProbFood: 0,
        totalProb: 0,
        successNodes: []});
      }
    }
    setNestAndFoodNode(nest,food)
    setSuc();
    updateColor();
    redrawCanvas(totalRows,totalCols);
    var i = 0;
    var timesRun= 0;
    var interval = setInterval(function(){
        timesRun += 1;
        if(timesRun == iterations){
            clearInterval(interval);
        }
        setProbs();
        updateColor();
        redrawCanvas(totalRows,totalCols); 
        $('#iteration-count').text('Iteration: '+timesRun)
    }, 2000);
}

function redrawCanvas(totalRows,totalCols){
  var canvas = document.getElementById("grid");
  // var context = canvas.getContext("2d");
  // context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  
  context.lineWidth = '3';
  var node;

  for (x=0;x<400;x+=totalRows) {
    for (y=0;y<400;y+=totalCols) {
      var a = x/totalRows;
      var b = y/totalCols;
      node = findNode(x/totalRows,y/totalCols)
      context.fillStyle = rgbToHex(node.color);
      if(node.hasOwnProperty('borderColor')){
        context.fillStyle = node.borderColor
      }
      

      context.moveTo(x, 0);
      context.lineTo(x, 400);
      context.stroke();
      context.moveTo(0, y);
      context.lineTo(400, y);
      context.stroke();
 
      //context.fillRect(x - (1), y - (1), totalRows + 2, totalCols+2);
      //context.fillStyle = rgbToHex(node.color);
      context.fillRect(x,y,totalRows,totalCols);
      context.stroke();
       

    }
}
}

function findNodeColor(x,y){
  for(var i = 0;i<nodes.length; i++){
    if(nodes[i].x==x && nodes[i].y == y){
      return nodes[i].color;
    }
  }
}

function setNestAndFoodNode(nest, food){
    var splitNest = nest.split(',')
    if(splitNest.length> 1){
        var foundNestNode = nodes.find(function(node){
          if(node.x == splitNest[0] && node.y == splitNest[1]){
            node.color = 'rgb(255,0,0)';
            node.isNest = true;
            node.inFoodPath = true;
            node.borderColor = '#ff0000';
            return node;
          }
        })
        currentNest = foundNestNode;
        var flist = food.split(';');
        setFoodPath(flist); 
    }
}

function setFoodPath(foodNodeList){
    for(i=0;i<foodNodeList.length; i++){
      var currentFoodNode = foodNodeList[i];
      var splitFoodNode = currentFoodNode.split(',');
      var s = 1;
      var x = splitFoodNode[0]
      var y = splitFoodNode[1];
      for(var nodeList = 0; nodeList < nodes.length; nodeList++){
        if(nodes[nodeList].x == x && nodes[nodeList].y == y){
          nodes[nodeList].color = 'green';
          nodes[nodeList].borderColor = '#00ff00';
          nodes[nodeList].isFood = true;
          while ((x < currentNest.x) || (x > currentNest.x) || (y < currentNest.y) || (y > currentNest.y))
          {
              if (x < currentNest.x)
              {
                  x++;
              }
              else if (x > currentNest.x)
              {
                  x--;
              }
    
              if (y < currentNest.y)
              {
                  y++;
              }
              else if (y > currentNest.y)
              {
                  y--;
              }
              nodes[nodeList].inFoodPath = true;
              nodes[nodeList].steps = s;
          }
        }
      }
    }
}

function setTotalProb()
{
    totalProb= newProbFood + newProb;
}

function setSuc()
{
    for(i=0; i< nodes.length; i++){
      var n = {...nodes[i]};
      setSuccs(nodes[i], rows, columns);
    }
}

function setSuccs(node,rows, cols)
{
    var x = 0;
    var y = 0;
    for (dx = (x > 0 ? -1 : 0); dx <= (x < (rows - 1) ? 1 : 0); ++dx)
    {
        for (dy = (y > 0 ? -1 : 0); dy <= (y < (cols - 1) ? 1 : 0); ++dy)
        {
            if (dx != 0 || dy != 0)
            {
              
              var foundNode = findNode(x+dx, y+dy)
              if(foundNode){
                node.successNodes.push(foundNode);
              }
            }
        }
    }
}

function findNode(x, y){
  var foundNode = nodes.find(function(node){
    return node.x == x && node.y == y
  })
  return foundNode;
}

function updateColor()
{
    var bgColor = 255;
    var pert;
    var colorSet;
    var n;
	  for(i=0;i<nodes.length; i++){
		  n = nodes[i];
		  pert = calculateProb(n.totalProb)
		  colorSet = bgColor - pert;
		  n.color = Math.ceil(colorSet);
    }
}

function sumProb(){
	float sum = 0;
	for(i=0; i<nodes.length; i++){
		n = nodes[i];
		sum += n.totalProb;
	}
	return sum;
}

function normalise(){
	float sumnorm = sumProb();
	for(i=0; i<nodes.length; i++){
		n = nodes[i];
		n.totalProb = n.totalProb/sumnorm;
	}
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(color) {
  return "#" + componentToHex(color) + componentToHex(color) + componentToHex(color);
}

function calculateProb(totalProb){
  if(totalProb>0.9){
    return totalProb * 10;
  }
  else if(totalProb> 0.85 && totalProb<=0.9){
    return totalProb *50;
  }
  else if(totalProb> 0.80 && totalProb<=0.85){
    return totalProb *100;
  }
  else if(totalProb> 0.75 && totalProb<=0.8){
    return totalProb *150;
  }
  else if(totalProb> 0.70 && totalProb<=0.75){
    return totalProb *200;
  }
  else if(totalProb> 0.65 && totalProb<=0.70){
    return totalProb *250;
  }
  else if(totalProb> 0.60 && totalProb<=0.65){
    return totalProb *300;
  }
  else if(totalProb> 0.55 && totalProb<=0.60){
    return totalProb *350;
  }
  else if(totalProb> 0.50 && totalProb<=0.55){
    return totalProb *400;
  }
  else if(totalProb> 0.45 && totalProb<=0.50){
    return totalProb *425;
  }
  else if(totalProb> 0.40 && totalProb<=0.45){
    return totalProb *450;
  }
  else {
    return totalProb*500
  }


}

function setProbs(){

  for(i=0;i<nodes.length; i++){
    var n = nodes[i];
    n.oldProb = n.newProb;
    n.newProb = 0;
    n.oldProbFood = n.newProbFood;
    n.newProbFood = 0;
    for(j = 0; j<n.successNodes.length; j++){
      var n1 = n.successNodes[j];
      if (n.inFoodPath){
        if (n1.isFood){
          n1.oldProbFood = n1.oldProb;
          n1.newProbFood = n1.newProb;

        }
        if (n1.isFood || n1.inFoodPath){
          if (n1.steps < n.steps){        
              if(n1.updated)
                n.newProbFood = n1.oldProbFood;
              else
                n.newProbFood = n1.newProbFood;

              if (n.isNest){
                n.newProb += n.newProbFood;
                n.newProbFood = 0;
              }
          }
            
        }
          
      }

      if (!n1.isFood)
      {
        if(n1.updated)
          n.newProb += (n1.oldProb / n1.successNodes.length);
        else
          n.newProb += (n1.newProb / n1.successNodes.length);

      }   
    };
    n.totalProb = n.newProbFood + n.newProb;
    n.updated = true;
  };
  resetUpdated();
}

function resetUpdated()
{
    for(i=0;i<nodes.length;i++){
    
      nodes[i].updated = false;
    }
}

