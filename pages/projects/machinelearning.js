var canvas = document.querySelector('canvas');

var c = canvas.getContext('2d');
c.canvas.width = window.innerWidth;
c.canvas.height = window.innerHeight;
c.font = "20px Arial";


window.addEventListener('resize', function(event) {
    canvas.width = this.window.innerWidth;
    canvas.height = this.window.innerHeight;
});

dots = [];

function weighted_random(options){
    var maxFitness = 0;
    var bestDot;
    var choices = [];
    options.forEach(element => {
        if (element.fitness > maxFitness) {
            maxFitness = element.fitness;
            bestDot = element;
        }
        for (let i = 0; i < element.fitness; i++) {
            choices.push(element);
        }
    });
    var returnArray = [];
    returnArray.push(bestDot);
    for (let i = 0; i < (options.length-1); i++) {
        returnArray.push(choices[Math.floor(Math.random() * choices.length)]);
    }
    return returnArray;
}


class Dot {
    constructor(x, y) {
        dots.push(this);
        this.identifyer = Math.random();
        this.x = x;
        this.y = y;
        this.xvel = 0;
        this.yvel = 0;
        this.maxvel = 10;
        this.radius = 3;
        this.dead = false;
        this.brain = [];
        for (let i = 0; i < 2000; i++) {
            var temp = [((Math.random()-0.5)*3),((Math.random()-0.5)*3)]
            this.brain.push(temp);
        }
    }
    move(frame) {
        //move
        this.x = this.x + this.xvel;
        this.y = this.y + this.yvel;
        //accelerate
        if (this.brain.length > frame) {
            this.xvel += this.brain[frame][0];
            this.yvel += this.brain[frame][1];
            if (Math.pow(this.xvel,2) + Math.pow(this.yvel,2) > Math.pow(this.maxvel,2)) {
                this.xvel = this.xvel/(Math.pow((Math.pow(this.xvel,2) + Math.pow(this.yvel,2)),0.5)/this.maxvel);
                this.yvel = this.yvel/(Math.pow((Math.pow(this.xvel,2) + Math.pow(this.yvel,2)),0.5)/this.maxvel);
            }
            else {
                this.xvel += .1;
            }
        }
        //check for wall collisions
        if (this.x >= innerWidth) {
            this.x = innerWidth;
            this.dead = true;
            numDeadDots++;
        }
        else if (this.y >= innerHeight) {
            this.y = innerHeight;
            this.dead = true;
            numDeadDots++;
        }
        else if (this.x <= 0) {
            this.x = 0;
            this.dead = true;
            numDeadDots++;
        }
        else if (this.y <= 0) {
            this.y = 0;
            this.dead = true;
            numDeadDots++;
        }
        //check for goal collision
        else if (Math.pow(Math.pow(((this.x - this.radius)-g.x),2)+Math.pow((this.y-g.y),2),0.5) <= g.radius) {
            this.dead = true;
            numDeadDots++;
        }
        //check for obstacle collisions
        else {
            obstacles.forEach(ob => {
                if (this.x+this.radius >= ob.x && this.x-this.radius <= ob.x + ob.width && this.y+this.radius >= ob.y && this.y-this.radius <= ob.y+ob.height) {
                    //TODO: would be nice to snap to the edges of ob
                    this.dead = true;
                    numDeadDots++;
                }
            });
        }
    }

    show() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = "rgba(0,0,255,1)";
        c.fill();
    }

    getFitness(goalX, goalY) {
        this.fitness = 10000/(Math.pow((Math.pow(goalX-this.x,2))+(Math.pow(goalY-this.y,2)),0.5));
    }

    mutate() {
        var mutationRate = 0.05;
        this.brain.forEach(acc => {
            if (Math.random() > (1-mutationRate)) {
                acc[0] = (Math.random()-0.5)*3;
                acc[1] = (Math.random()-0.5)*3;
            }
        });
    }

    baby(x,y) {
        var baby = new Dot(x,y);
        baby.brain = [];
        this.brain.forEach(s => {
            baby.brain.push([...s]);
        });
        return baby;
    }


}

obstacles = [];
class Obstacle {
    constructor(x, y, width, height) {
        obstacles.push(this);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    show() {
        c.fillStyle = "rgba(255, 0, 0, 1)"
        c.fillRect(this.x, this.y, this.width, this.height);
    }
}


function Goal(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.show = function(x,y) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = "rgba(0,255,0,1)";
        c.fill();
    }
}
g = new Goal(420,700)

var numDeadDots = 0;
class Generation {
    constructor(x, y, numDots, number){
        this.x = x;
        this.y = y;
        this.number = number;
        this.dots = [];
        this.numDots = numDots;
        this.frame = 0;
        this.animate = this.animate.bind(this);
    }
    randomize(){
        for (let i = 0; i < this.numDots; i++) {
            this.dots.push(new Dot(this.x, this.y));
        }
    }

    newGen(goalX, goalY) {
        this.dots.forEach(dot => {
            dot.getFitness(goalX, goalY);
        });
        var nextGen = new Generation(this.x, this.y, this.dots.length, this.number+1);
        var tmp = weighted_random(this.dots);
        tmp.forEach(parent => {
            var b = parent.baby(this.x, this.y);
            b.mutate();
            nextGen.dots.push(b);
        });
        return nextGen;
    }

    run() {
        this.animate();
    }

    animate() {
        c.clearRect(0, 0, innerWidth, innerHeight);
        c.fillStyle = "rgba(150,150,150,1)"
        c.fillText(("Generation: "+this.number), 10,30)
        obstacles.forEach(ob => {
            ob.show();
        });
        g.show();
        this.dots.forEach(dot => {
            if (!dot.dead) {dot.move(this.frame);};
            dot.show();
        });
        if (numDeadDots < this.dots.length) {
            //some dots still moving
            requestAnimationFrame(this.animate);
            this.frame++;
        }
        else {
            mainLoop();
        }

    }
}

o = new Obstacle(200, 200, 300, 200);
gen = new Generation(100,100,100,1);
gen.randomize();
gen.run();

function mainLoop(){
    gen = gen.newGen(g.x,g.y);
    numDeadDots = 0;
    gen.run();
    console.log(gen.number);
}
