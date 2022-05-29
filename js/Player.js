Player = function(game, canvas) {

    var _this = this;
    this.game = game;
    this.axisMovement = [false, false, false, false];
    this.angularSensibility = 3600;
    this.speed = 1;
    this.weaponShoot = false;

    window.addEventListener("keyup", function(evt) {
        switch(evt.key) {
            case 'ArrowUp':
                _this.camera.axisMovement[0] = false;
                break;
            case 'ArrowDown':
                _this.camera.axisMovement[1] = false;
                break;
             case 'ArrowLeft':
                _this.camera.axisMovement[2] = false;
                break;
            case 'ArrowRight':
                _this.camera.axisMovement[3] = false;
                break;
        }
    }, false);

    window.addEventListener("keydown", function(evt) {
        switch(evt.key) {
            case 'ArrowUp':
                _this.camera.axisMovement[0] = true;
                break;
            case 'ArrowDown':
                _this.camera.axisMovement[1] = true;
                break;
             case 'ArrowLeft':
                _this.camera.axisMovement[2] = true;
                break;
            case 'ArrowRight':
                _this.camera.axisMovement[3] = true;
                break;
        }
    }, false);

    window.addEventListener("mousemove", function(evt) {
         if (_this.rotEngaged === true) {
            _this.camera.playerBox.rotation.y += evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.playerBox.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
                _this.camera.playerBox.rotation.x += evt.movementY * 0.001 * (_this.angularSensibility / 250);
            }
        }
    }, false);

    this._initCamera(this.scene, canvas);
    this.controlEnabled = false;
    this._initPointerLock();
};

Player.prototype = {
    _initPointerLock : function () {
        var _this = this;

        var canvas = this.game.scene.getEngine().getRenderingCanvas();

        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = 
            canvas.requestPointerLock || 
            canvas.msRequestPointerLock || 
            canvas.mozRequestPointerLock ||
            canvas.webkitRequestPointerLock;

            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);

        var pointerLockChange = function(event) {
            _this.controlEnabled = (
                document.mozRequestPointerLock === canvas || 
                document.webkitRequestPointerLock === canvas ||
                document.msRequestPointerLock === canvas || 
                document.pointerLockElement === canvas
            );

            _this.rotEngaged = _this.controlEnabled;
        };

        document.addEventListener("pointerlockchange", pointerLockChange, false);
        document.addEventListener("mspointerlockchange", pointerLockChange, false);
        document.addEventListener("mozpointerlockchange", pointerLockChange, false);
        document.addEventListener("webkitpointerlockchange", pointerLockChange, false);

        canvas.addEventListener("mousedown", function(evt) {
            if (_this.controlEnabled && !_this.weaponShoot) {
                _this.weaponShoot = true;
                _this.handleUserMouseDown();
            }
        });

        canvas.addEventListener("mouseup", function(evt) {
            if (_this.controlEnabled && _this.weaponShoot) {
                _this.weaponShoot = false;
                _this.handleUserMouseUp();
            }
        });
    },

    _initCamera : function(scene, canvas) {
        let randomPoint = Math.random();
        randomPoint = Math.round(randomPoint * (this.game.allSpawnPoints.length - 1));
        this.spawnPoint = this.game.allSpawnPoints[randomPoint];

        var playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene);
        playerBox.position = this.spawnPoint.clone();
        playerBox.ellipsoid = new BABYLON.Vector3(2, 2, 2);

        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
        this.camera.playerBox = playerBox;
        this.camera.parent = this.camera.playerBox;

        this.camera.playerBox.checkCollisions = true;
        this.camera.playerBox.applyGravity = true;

        this.isAlive = true;
        this.camera.isMain = true;
        this.camera.weapons = new Weapons(this);
        this.camera.axisMovement = [false, false, false, false];

        var hitBoxPlayer = BABYLON.Mesh.CreateBox("hitBoxPlayer", 3, scene);
        hitBoxPlayer.parent = this.camera.playerBox;
        hitBoxPlayer.scaling.y = 2;
        hitBoxPlayer.isPickable = true;
        hitBoxPlayer.isMain = true;

        this.camera.health = 100;
        this.camera.armor = 0;

        this.game.scene.activeCamera = this.camera;
    },

    _checkMove : function(ratioFps) {
        let relativeSpeed = this.speed / ratioFps;
        if (this.camera.axisMovement[0]) {
            forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
                0,
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(forward);
        }

        if (this.camera.axisMovement[1]) {
            backward = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
                0,
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(backward);
        }

        if (this.camera.axisMovement[2]) {
            left = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
                0,
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(left);
        }

        if (this.camera.axisMovement[3]) {
            right = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
                0,
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(right);
        }

        this.camera.playerBox.moveWithCollisions(new BABYLON.Vector3(0, (-1.5) * relativeSpeed, 0));
    },

    handleUserMouseDown : function() {
        if (this.isAlive === true) {
            this.camera.weapons.fire();
        }
    },

    handleUserMouseUp : function() {
        if (this.isAlive === true) {
            this.camera.weapons.stopFire();
        }
    },

    getDamage : function(damage) {
        var damageTaken = damage;
        if (this.camera.armor > Math.round(damageTaken/2)) {
            this.camera.armor -= Math.round(damageTaken/2);
            damageTaken = Math.round(damageTake/2);
        } else {
            damageTaken = damageTaken - this.camera.armor;
            this.camera.armor = 0;
        }

        if (this.camera.health > damageTaken) {
            this.camera.health -= damageTaken;
        } else {
            this.playerDead();
        }
    },

    playerDead : function() {
        this.deadCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3(
            this.camera.playerBox.position.x,
            this.camera.playerBox.position.y,
            this.camera.playerBox.position.z
        ), this.game.scene);
        this.game.scene.activeCamera = this.deadCamera;
        this.deadCamera.attachControl(this.game.scene.getEngine().getRenderingCanvas());

        this.camera.playerBox.dispose();
        this.camera.dispose();
        this.camera.weapons.rocketLauncher.dispose();
        this.isAlive = false;

        var newPlayer = this;
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        setTimeout(function() {
            newPlayer._initCamera(newPlayer.game.scene, canvas);
        }, 4000);
    },
}