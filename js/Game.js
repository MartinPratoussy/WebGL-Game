Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    this.engine = engine;
    var _this = this;
    _this.actualTime = Date.now();
    this.scene = this._initScene(engine);

    var _arena = Arena(_this);
    var _player = new Player(_this, canvas);

    engine.runRenderLoop(function () {
        _this.fps = Math.round(1000/engine.getDeltaTime());
        _player._checkMove((_this.fps)/60);
        _this.scene.render();
        if (_player.camera.weapons.launchBullets === true) {
            _player.camera.weapons.laucnhFire();
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
        return scene;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
}, false);