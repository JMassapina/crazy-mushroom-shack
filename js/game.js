/*jslint browser:true */
/*global Crafty, $ */

'use strict';

(function () {

    var Game, gamestate;

    gamestate = {
        position: 0,

        rooms: []
    };

    gamestate.loadRightRoom = function () {
        console.log("load right room");
    };

    gamestate.loadLeftRoom = function () {
        console.log("load left room");
    };

    gamestate.rooms[0] = 'entrance';
    gamestate.rooms[1] = 'room1';
    gamestate.rooms[2] = 'room2';

    //
    // Components
    //

    // a renderable entity
    Crafty.c('Renderable', {
        init: function () {
            // we're using DOM Spirtes
            this.requires('2D, DOM');
        },
        // set which sprite to use -- should match up with a call to Crafty.sprite()
        spriteName: function (name) {
            this.requires(name);
            return this; // so we can chain calls to setup functions
        }
    });

    // Platform component
    Crafty.c('Platform', {
        init: function () {
            this.requires('Renderable, Collision, Color')
                .color('green');
        }
    });

    // Limit movement to within the viewport
    Crafty.c('RoomControls', {
        init: function () {
            this.requires('2D');
        },
        // this must be called when the element is moved event callback
        checkOutOfBounds: function (oldPosition) {
            if (!this.within(0, 0, Crafty.viewport.width, Crafty.viewport.height)) {

                if (this.x >= Crafty.viewport.width - 100) {
                    // load the screen to the right
                    gamestate.position += 1;
                    if (gamestate.position >= gamestate.rooms.length) {
                        gamestate.position = gamestate.rooms.length - 1;
                        this.attr({
                            x: oldPosition.x,
                            y: oldPosition.y
                        });
                    } else {
                        Crafty.scene(gamestate.rooms[gamestate.position]);
                        this.attr({
                            x: 100,
                            y: oldPosition.y
                        });
                    }
                } else if (this.x < 0) {
                    // load the screen to the left
                    gamestate.position -= 1;
                    if (gamestate.position < 0) {
                        gamestate.position = 0;
                        this.attr({
                            x: oldPosition.x,
                            y: oldPosition.y
                        });
                    } else {
                        Crafty.scene(gamestate.rooms[gamestate.position]);
                        this.attr({
                            x: (Crafty.viewport.width - 200),
                            y: oldPosition.y
                        });
                    }
                } else {
                    this.attr({
                        x: oldPosition.x,
                        y: oldPosition.y
                    });
                }

            }
        }
    });

    // Player component    
    Crafty.c('Player', {
        init: function () {
            this.requires('Persist, Renderable, RoomControls, Collision, PlatformerGravity, PlatformerControls')
                // set sprite
                .spriteName('man')
                // set starting position
                .attr({ x: 100, y: 200 })
                // set platform-style controller up with walk + jump speeds
                .platformerControls(5, 8)
                // enable gravity, stop when we hit 'Platform' components
                .platformerGravity('Platform')
                // enable collision (not used by platformer gravity/controls but would be useful for other things)
                .collision();

            // bind our movement handler to keep us within the Viewport
            this.bind('Moved', function (oldPosition) {
                this.checkOutOfBounds(oldPosition);
            });

            // we need to flip the sprite for each direction we are travelling in
            this.bind('NewDirection', function (direction) {
                if (direction.x > 0) {
                    this.flip();
                } else if (direction.x < 0) {
                    this.unflip();
                }
            });
        }
    });


    //
    // Game loading and initialisation
    //    
    Game = function () {
        Crafty.scene('loading', this.loadingScene);
        Crafty.scene('entrance', this.entrance);
        Crafty.scene('room1', this.room1);
        Crafty.scene('room2', this.room2);
    };

    Game.prototype.initCrafty = function () {
        console.log("page ready, starting CraftyJS");
        Crafty.init(1000, 600);
        Crafty.canvas.init();

        Crafty.modules({
            'crafty-debug-bar': 'release'
        }, function () {
            if (Crafty.debugBar) {
                Crafty.debugBar.show();
            }
        });
    };

    // A loading scene -- pull in all the slow things here and create sprites
    Game.prototype.loadingScene = function () {
        var loading = Crafty.e('2D, Canvas, Text, Delay');
        loading.attr({
            x: 512,
            y: 200,
            w: 100,
            h: 20
        });
        loading.text('loading...');

        function onLoaded() {
            // set up sprites
            Crafty.sprite('img/man.png', {
                man: [0, 0, 50, 100]
            });

            // jump to the main scene in half a second
            loading.delay(function () {
                Crafty.e('Player');
                Crafty.scene('entrance');
            }, 500);
        }

        function onProgress(progress) {
            loading.text('loading... ' + progress.percent + '% complete');
        }

        function onError() {
            loading.text('could not load assets');
        }

        // list of images to load
        Crafty.load(
            ['img/man.png'],
            onLoaded,
            onProgress,
            onError
        );

    };

    //
    // The main game scene
    //

    Game.prototype.entrance = function () {

        //This is the floor
        Crafty.e('Platform').attr({x: 0, y: 584, w: 1000, h: 16});

        //These are the platforms
        Crafty.e('Platform').attr({x: 300, y: 450, w: 100, h: 16});
        Crafty.e('Platform').attr({x: 700, y: 450, w: 100, h: 16});
    };


    Game.prototype.room1 = function () {

        //This is the floor
        Crafty.e('Platform').attr({x: 0, y: 584, w: 1000, h: 16});

        //These are the platforms
        Crafty.e('Platform').attr({x: 700, y: 450, w: 100, h: 16});
    };


    Game.prototype.room2 = function () {

        //This is the floor
        Crafty.e('Platform').attr({x: 0, y: 584, w: 1000, h: 16});

        //These are the platforms
    };




    // kick off the game when the web page is ready
    $(document).ready(function () {
        var game = new Game();
        game.initCrafty();

        // start loading things
        Crafty.scene('loading');

    });

}());
