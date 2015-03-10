var FRICTION = 0.95;

var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height };
    console.log('canvas size', gameSize);

    this.player = new Ninja();
    this.bats = [];
    for (var i=0; i < 8; i++) {
        this.bats.push(new Bat( { x: i*100, y: i*50} ));
    }

    document.addEventListener('keydown', function(event) {Key.onKeydown(event)} );
    document.addEventListener('keyup', function(event) {Key.onKeyup(event)} );
    
    var self = this;
    var tick = function() {
        self.update(gameSize);
        self.draw(screen, gameSize);
        requestAnimationFrame(tick);
    };

    tick();
};

Game.prototype = {
    // update all bodies in the game at once
    update: function (screenSize) {
        for (var i =0; i < this.bats.length; i++) {
            this.bats[i].update(screenSize);
        };

        if (this.player != null){
            this.player.update(screenSize);
            // check for collisions
            var stars = this.player.stars;
            var notShot = function(b1) {
            return stars.filter(function(b2) { return colliding(b1, b2) }).length == 0;
            };

            this.bats = this.bats.filter(notShot);

            var player = this.player;
            if (this.bats.filter(function(b2) { return colliding(player, b2) }).length > 0) {
                console.log("GAME OVER");
                this.player = null;
            };
        };



    },

    // draw the current state of the bodies in the system
    draw: function(screen, screenSize) {
        screen.clearRect(0, 0, screenSize.x, screenSize.y);
        if (this.player == null){
            screen.font = '48px sans-serif';
            screen.fillText('GAME OVER', screenSize.x/2, screenSize.y/2);
        } else {
            this.player.draw(screen);
        }
        for (var i =0; i < this.bats.length; i++) {
            this.bats[i].draw(screen);
        };
    },

    keypress: function(event) {
        console.log('player', event.keyCode);
        switch (event.keyCode) {
            case KEYS.LEFT:
                this.player.turn(-1);
                break;
            case KEYS.RIGHT:
                this.player.turn(1);
                break;
            case KEYS.SPACE:
                this.player.shoot();
                break;
            case KEYS.UP:
                this.player.thrust();   
        };
    }
};

var Ninja = function() {
    this.vel = [1, 0];
    this.angle = 0;
    this.angle_vel = 0;
    this.angle_dir = 1; //1 for clockwise, -1 counter-clockwise
    this.pos = { x: 100, y: 300 };
    this.size = { x: 60, y: 60 };
    this.img = new Image();
    this.img.src = 'images/player.png';
    this.stars = [];
};

Ninja.prototype = {
    draw: function(screen) {
        screen.save()
        screen.translate(this.pos.x, this.pos.y); 
        // console.log('drawing', this.angle);
        screen.rotate(radians(this.angle));
        screen.drawImage(this.img, -this.size.x/2, -this.size.y/2,
                         this.size.x, this.size.y);
        screen.restore();

        for (var i=0; i < this.stars.length; i++) {
            this.stars[i].draw(screen);
        }
    },

    update: function(screenSize) {
        // advance player by a tick
        if (Key.isDown(Key.LEFT)) {
            this.turn(-1);
        };
        if (Key.isDown(Key.RIGHT)) {
            this.turn(1);
        };
        if (Key.isDown(Key.UP)) {
            this.thrust();
        };
        if (Key.isDown(Key.SPACE)) {
            this.shoot();
        };
        // move forward one step according to current velocity
        // console.log('moving', this.pos, this.vel, screenSize)
        this.angle = this.angle + (this.angle_dir*2*this.angle_vel);
        this.pos = advance(this.pos, this.vel, screenSize);
        // update velocity
        this.vel = [this.vel[0]*FRICTION, this.vel[1]*FRICTION];
        this.angle_vel = this.angle_vel*FRICTION;

        // update all the star this ninja has thrown
        var i = 0;
        while (i < this.stars.length) {
            this.stars[i].update(screenSize);
            if (this.stars[i].pos == null){
                // remove if off-screen
                this.stars.splice(i, 1);
            } else {
                i++;
            };
        };
    },

    turn: function(direction) {
        this.angle_dir = direction;
        this.angle_vel = 1;
    },

    shoot: function() {
        this.stars.push(new Star(this.pos, this.angle));
    },

    thrust: function() {
        var vec = angle_to_vector(this.angle);
        var speed = 2;
        this.vel = [vec[0]*speed, vec[1]*speed];
    }
};

var Star = function(pos, angle) {
    this.pos = pos;
    var vec = angle_to_vector(angle);
    var speed = 4;
    this.vel = [vec[0]*speed, vec[1]*speed];
    this.size = { x: 2, y: 2 };
};

Star.prototype = {
    draw: function(screen) {
        screen.fillText('*', this.pos.x, this.pos.y);
    },

    update: function(screenSize) {
        newx = this.pos.x + this.vel[0];
        newy = this.pos.y + this.vel[1];
        if (newx < 0 || newx > screenSize.x || newy < 0 || newy > screenSize.y) {
            this.pos = null;
        } else {
            this.pos.x = newx;
            this.pos.y = newy;
        };

    }
};

var Bat = function(pos) {
    this.pos = pos;
    this.vel = [rando(0, 2), rando(0, 2)];
    this.img = new Image();
    this.img.src = 'images/bat.png';
    this.size = { x: 30, y: 30 };
};

Bat.prototype  = {
    draw: function(screen) {
        screen.drawImage(this.img, this.pos.x - this.size.x/2, 
                         this.pos.y - this.size.y/2,
                         this.size.x, this.size.y);
    },

    update: function(screenSize) {
        this.pos = advance(this.pos, this.vel, screenSize);
    }
};

var Key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    SPACE: 32,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    }
};

function advance(pos, velocity, screenSize) {
    // wrap objects around screen when they run off
    // 0,0 is top left
    newx = (pos.x + velocity[0]) % screenSize.x;
    if (newx < 0) {
        newx = screenSize.x - newx;
    };
    newy = (pos.y + velocity[1]) % screenSize.y;
    if (newy < 0) {
        newy = screenSize.y - newy;
    };
    return { x: newx, y: newy };
};

function angle_to_vector(degrees) {
    return [Math.cos(radians(degrees)), Math.sin(radians(degrees))];
}

function radians(degrees) {
    return degrees * Math.PI / 180;
}

function colliding(b1, b2) {
return !(b1 === b2 || 
  b1.pos.x + b1.size.x/2 < b2.pos.x - b2.size.x/2 ||
  b1.pos.y + b1.size.y/2 < b2.pos.y - b2.size.y/2 ||
  b1.pos.x - b1.size.x/2 > b2.pos.x + b2.size.x/2 ||
  b1.pos.y - b1.size.y/2 > b2.pos.y + b2.size.y/2);
};

function rando(min, max) {
  return Math.random() * (max - min) + min;
}

window.onload = function() {
    new Game("screen");
};
