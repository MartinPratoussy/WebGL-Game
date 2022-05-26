Player = function(game, canvas) {
    this.scene = game.scene;

    this._initCamera(this.scene, canvas);
};

Player.prototype = {
    _initCamera : function(scene, canvas) {
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
        this.camera.setTarget(BABYLON.Vector3.Zero())
        this.camera.attachControl(canvas, true);
    }
}