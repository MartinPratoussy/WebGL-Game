Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    var _this = this;

    this.scene = this._initScene(engine);

    var _arena = Arena(_this);
    var _player = new Player(_this, canvas);

    engine.runRenderLoop(function () {
        _this.scene.render();
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