Player = function(game, canvas) {

    var _this = this;
    this.game = game;
    this.axisMovement = [false, false, false, false];
    this.angularSensibility = 3600;
    this.speed = 1;

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
            _this.camera.rotation.y += evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
                _this.camera.rotation.x += evt.movementY * 0.001 * (_this.angularSensibility / 250);
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
    },

    _initCamera : function(scene, canvas) {
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -20), scene);
        this.camera.axisMovement = [false, false, false, false];
        this.isAlive = true;
        this.camera.setTarget(BABYLON.Vector3.Zero());
    },

    _checkMove : function(ratioFps) {
        let relativeSpeed = this.speed / ratioFps;
        if (this.camera.axisMovement[0]) {
            this.camera.position = new BABYLON.Vector3(
                this.camera.position.x + Math.sin(this.camera.rotation.y) * relativeSpeed,
                this.camera.position.y,
                this.camera.position.z + Math.cos(this.camera.rotation.y) * relativeSpeed
            );
        }

        if (this.camera.axisMovement[1]) {
            this.camera.position = new BABYLON.Vector3(
                this.camera.position.x + Math.sin(this.camera.rotation.y) * -relativeSpeed,
                this.camera.position.y,
                this.camera.position.z + Math.cos(this.camera.rotation.y) * -relativeSpeed
            );
        }

        if (this.camera.axisMovement[2]) {
            this.camera.position = new BABYLON.Vector3(
                this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * relativeSpeed,
                this.camera.position.y,
                this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * relativeSpeed
            );
        }

        if (this.camera.axisMovement[3]) {
            this.camera.position = new BABYLON.Vector3(
                this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * -relativeSpeed,
                this.camera.position.y,
                this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * -relativeSpeed
            );
        }
    }
}