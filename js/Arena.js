Arena = function(game) {
    // Appel des variables nécéssaires
    this.game = game;
    var scene = game.scene;

    // Création de notre lumière principale
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    var light3 = new BABYLON.PointLight("Spot0", new BABYLON.Vector3(-40, 10, -100), scene);
    
    light2.specular = new BABYLON.Color3(0, 0, 0);
    light3.specular = new BABYLON.Color3(0, 0, 0);

    light1.intensity = 0.2;
    light2.intensity = 0.2;
    light3.intensity = 0.6;

    var shadowGenerator1 = new BABYLON.ShadowGenerator(2048, light3);
    shadowGenerator1.usePoissonSampling = true;
    shadowGenerator1.bias = 0.0005;

    // Material pour le sol
    var materialGround = new BABYLON.StandardMaterial("groundTexture", scene);
    materialGround.diffuseTexture = new BABYLON.Texture("assets/images/tile.jpg", scene);
    materialGround.diffuseTexture.uScale = 8.0;
    materialGround.diffuseTexture.vScale = 8.0;

    // Material pour les objets
    var materialWall = new BABYLON.StandardMaterial("wallTexture", scene);
    materialWall.diffuseTexture = new BABYLON.Texture("assets/images/brick.jpg", scene);

    var boxArena = BABYLON.Mesh.CreateBox("box1", 100, scene, false, BABYLON.Mesh.BACKSIDE);
    boxArena.material = materialGround;
    boxArena.position.y = 50 * 0.3;
    boxArena.scaling.y = 0.3;
    boxArena.scaling.z = 0.8;
    boxArena.scaling.x = 3.5;
    boxArena.checkCollisions = true;
    boxArena.receiveShadows = true;

    var columns = [];
    var numberColumn = 6;
    var sizeArena = 100*boxArena.scaling.x -50;
    var ratio = ((100/numberColumn)/100) * sizeArena;
    for (var i = 0; i <= 1; i++) {
        if(numberColumn>0){
            columns[i] = [];
            let mainCylinder = BABYLON.Mesh.CreateCylinder("cyl0-"+i, 30, 5, 5, 20, 4, scene);
            mainCylinder.position = new BABYLON.Vector3(-sizeArena/2,30/2,-20 + (40 * i));
            mainCylinder.material = materialWall;
            mainCylinder.checkCollisions = true;

            mainCylinder.maxSimultaneousLights = 10;
            shadowGenerator1.getShadowMap().renderList.push(mainCylinder);
            mainCylinder.receiveShadow = true;

            columns[i].push(mainCylinder);

            if(numberColumn>1){
                for (let y = 1; y <= numberColumn - 1; y++) {
                    let newCylinder = columns[i][0].clone("cyl"+y+"-"+i);
                    newCylinder.position = new BABYLON.Vector3(-(sizeArena/2) + (ratio*y),30/2,columns[i][0].position.z);
                    newCylinder.maxSimultaneousLights = 10;
                    shadowGenerator1.getShadowMap().renderList.push(newCylinder);
                    newCylinder.receiveShadow = true;
                    columns[i].push(newCylinder);
                }
            }
        }
    }
};