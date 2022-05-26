function Arena(game) {
    this.game = game;
    var scene = game.scene;

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0,1,0), scene);
    var sphere = BABYLON.Mesh.CreateSphere("Sphere1", 16, 2, scene);

    sphere.position.y = 1;

    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
};