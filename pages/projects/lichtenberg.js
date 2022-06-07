var canvas = document.querySelector('canvas');


var c = canvas.getContext('2d');
c.canvas.width = window.innerWidth;
c.canvas.height = window.innerHeight;


var mouse = {
    x: 0,
    y: 0
}

var colorArray = [
    '#2C363F',
    '#23B5D3',
    '#A663CC'
]


window.addEventListener('mousemove', function(event) {

    mouse.x = event.x;
    mouse.y = event.y;
})

window.addEventListener('resize', function(event) {
    canvas.width = this.window.innerWidth;
    canvas.height = this.window.innerHeight;

});

segmentArray = [];

function Segment(x, y, width, endx, endy) {
    this.x = x;
    this.y = y;
    this.width =width;
    this.endx = endx;
    this.endy = endy;
    segmentArray.push(this)
    this.draw = function(){
        c.lineWidth = this.width;
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(this.endx, this.endy);
        c.strokeStyle = "blue";
        c.stroke();
    }
}

function segmentsIntersect(a,b,c,d,p,q,r,s) {
    /*
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }*/
    return false;
  };


function addNewSegment(x,y, length) {
    function generateEndpoint(){
        var endx = x + ((mouse.x - x) / (innerWidth/length));
        var endy = y + ((mouse.y - y) / (innerHeight/length));
        endx = endx + ((Math.random()-0.5) * 40);
        endy = endy + ((Math.random()-0.5) * 40);
        var factor = Math.pow(((Math.pow(length, 2))/(Math.pow((endx - x), 2) + Math.pow((endy - y), 2))), 0.5);
        endx = endx + ((endx - x) * factor);
        endy = endy + ((endy - y) * factor);
        return [endx, endy];
    }
    var tries = 10;
    function tryEndpoint() {
        var point = generateEndpoint();
        var endx = point[0];
        var endy = point[1];
        var intersects = false;
        for (var i = 0; i < segmentArray.length; i++) {
            if (segmentsIntersect(x,y,endx,endy,segmentArray[i].x,segmentArray[i].y,segmentArray[i].endx,segmentArray[i].endy) && tries > 0) {
                intersects = true;
                tries--;

            }
            if (intersects && tries > 0) {tryEndpoint;}
        }
        if (!intersects){
            return [endx, endy];
        }
        else {
            return false;
        }

    }
    var end = tryEndpoint();
    if (end) {new Segment(x, y, 2, end[0], end[1]);};
}

function removeLastSegment() {
    if (segmentArray.length > 100) {
        segmentArray.shift();
    }
}

function animate() {
    c.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = 0; i < segmentArray.length; i++) {
        segmentArray[i].draw();
    }

    var index = Math.ceil(Math.random() * Math.ceil(segmentArray.length/2));
    index = segmentArray.length - index;
    var lastSeg = segmentArray[index];
    addNewSegment(lastSeg.endx, lastSeg.endy, 20);
    removeLastSegment();
    requestAnimationFrame(animate);
}

s = new Segment(100, 600, 2, 150, 700);
animate();
