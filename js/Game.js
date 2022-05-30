Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    this.engine = engine;
    var _this = this;
    _this.actualTime = Date.now();

    this.allSpawnPoints = [
        new BABYLON.Vector3(-20, 5, 0),
        new BABYLON.Vector3(0, 5, 0),
        new BABYLON.Vector3(20, 5, 0),
        new BABYLON.Vector3(-40, 5, 0)
    ]

    this.scene = this._initScene(engine);

    this._rockets = [];
    this._explosionRadius = [];
    this._lasers = []

    var armory = new Armory(this);
    _this.armory = armory;

    var _arena = Arena(_this);
    var _player = new Player(_this, canvas);
    this._PlayerData = _player;

    engine.runRenderLoop(function () {
        _this.fps = Math.round(1000/engine.getDeltaTime());
        _player._checkMove((_this.fps)/60);
        _this.renderRockets();
        _this.renderExplosionRadius();
        _this.renderLasers();
        _this.renderWeapons();
        _this.scene.render();
        if (_player.camera.weapons.launchBullets === true) {
            _player.camera.weapons.launchFire();
        }
    });

    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    }, false);
};

Game.prototype = {
    _initScene : function(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0,0,0);
        scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        scene.collisionsEnabled = true;
        return scene;
    },

    renderRockets : function () {
        for (var i = 0; i < this._rockets.length; i++) {
            var rayRocket = new BABYLON.Ray(this._rockets[i].position, this._rockets[i].direction);
            var meshFound = this._rockets[i].getScene().pickWithRay(rayRocket);
            if (!meshFound || meshFound.distance < 10) {
                if (meshFound.pickedMesh) {
                    var explosionRadius = BABYLON.Mesh.CreateSphere("sphere", 5.0, 20, this.scene);
                    explosionRadius.position = meshFound.pickedPoint;
                    explosionRadius.isPickable = false;
                    explosionRadius.material = new BABYLON.StandardMaterial("textureExplosion", this.scene);
                    explosionRadius.material.diffuseColor = new BABYLON.Color3(1, 0.6, 0);
                    explosionRadius.material.specularColor = new BABYLON.Color3(0, 0, 0);
                    explosionRadius.material.alpha = 0.8;
                    explosionRadius.computeWorldMatrix(true);

                    if (this._PlayerData.isAlive && this._PlayerData.camera.playerBox && explosionRadius.intersectsMesh(this._PlayerData.camera.playerBox)) {
                        console.log('hit');

                        this._PlayerData.getDamage(30);
                    }

                    this._explosionRadius.push(explosionRadius);
                }
                this._rockets[i].dispose();
                this._rockets.splice(i, 1);
            } else {
                let relativeSpeed = 1 / ((this.fps) / 60);
                this._rockets[i].position.addInPlace(this._rockets[i].direction.scale(relativeSpeed*2));
            }
        }
    },

    renderExplosionRadius : function () {
        if (this._explosionRadius.length > 0) {
            for (var i = 0; i < this._explosionRadius.length; i++) {
                this._explosionRadius[i].material.alpha -= 0.02;
                if (this._explosionRadius[i].material.alpha <= 0) {
                    this._explosionRadius[i].dispose();
                    this._explosionRadius.splice(i, 1);
                }
            }
        }
    },

    renderLasers : function () {
        if (this._lasers > 0) {
            for (var i = 0; i < this._lasers.length; i++) {
                this._lasers[i].edgesWidth -= 0.5;
                if (this._lasers[i].edgesWidth <= 0) {
                    this._lasers[i].dispose();
                    this._lasers.splice(i, 1);
                }
            }
        }
    },

    renderWeapons : function () {
        if (this._PlayerData && this._PlayerData.camera.weapons.inventory) {
            var inventoryWeapons = this._PlayerData.camera.weapons.inventory;

            for (var i = 0; i < inventoryWeapons.length; i++) {
                if (inventoryWeapons[i].isActive && inventoryWeapons[i].position.y < 
                    this._PlayerData.camera.weapons.topPositionY) {
                    inventoryWeapons[i].position.y += 0.1;
                } else if (!inventoryWeapons[i].isActive && inventoryWeapons[i].position.y != 
                    this._PlayerData.camera.weapons.bottomPosition.y) {
                    inventoryWeapons[i].position.y -= 0.1;
                }
            } 
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
}, false);