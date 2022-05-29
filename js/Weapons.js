Weapons = function (Player) {
    this.Player = Player;
    this.bottomPosition = new BABYLON.Vector3(0.5, -2.5, 1);
    this.topPositionY = -0.5;
    this.rocketLauncher = this.newWeapon(Player);

    this.fireRate = 800;
    this._deltaFireRate = this.fireRate;
    this.canFire = true;
    this.launchBullets = false;
    
    var _this = this;
    var engine = Player.game.scene.getEngine();

    Player.game.scene.registerBeforeRender(function () {
        if (!_this.canFire) {
            _this._deltaFireRate -= engine.getDeltaTime();
            if (_this._deltaFireRate <= 0 && _this.Player.isAlive) {
                _this.canFire = true;
                _this._deltaFireRate = _this.fireRate;
            }
        }
    });
}

Weapons.prototype = {
    newWeapon : function(Player) {
        var newWeapon;
        newWeapon = BABYLON.Mesh.CreateBox("rocketLauncher", 0.5, Player.game.scene);
        newWeapon.scaling = new BABYLON.Vector3(1,0.7,2);
        newWeapon.parent = Player.camera;

        newWeapon.position = this.bottomPosition.clone();
        newWeapon.position.y = this.topPositionY;

        var materialWeapon = new BABYLON.StandardMaterial('rocketLaucnherMat', Player.game.scene);
        materialWeapon.diffuseColor = new BABYLON.Color3(1,0,0);

        newWeapon.material = materialWeapon;

        return newWeapon;
    },

    fire : function(pickInfo) {
        this.launchBullets = true;
    },

    stopFire : function(pickInfo) {
        this.launchBullets = false;
    },

    launchFire : function() {
        if (this.canFire) {
            var renderWidth = this.Player.game.engine.getRenderWidth(true);
            var renderHeight = this.Player.game.engine.getRenderHeight(true);

            var direction = this.Player.game.scene.pick(renderWidth/2, renderHeight/2);
            direction = direction.pickedPoint.subtractInPlace(this.Player.camera.position);
            direction = direction.normalize();

            this.createRocket(this.Player.camera.playerBox, direction);

            this.canFire = false;
        } else {

        }
    },

    createRocket : function(playerPosition) {
        var positionValue = this.rocketLauncher.absolutePosition.clone();
        var rotationValue = playerPosition.rotation;
        var newRocket = BABYLON.Mesh.CreateBox("rocket", 1, this.Player.game.scene);
        
        newRocket.direction = new BABYLON.Vector3(
            Math.sin(rotationValue.y) * Math.cos(rotationValue.x),
            Math.sin(-rotationValue.x),
            Math.cos(rotationValue.y) * Math.cos(rotationValue.x)
        );

        newRocket.position = new BABYLON.Vector3(
            positionValue.x + (newRocket.direction.x * 1),
            positionValue.y + (newRocket.direction.y * 1),
            positionValue.z + (newRocket.direction.z * 1)
        );

        newRocket.rotation = new BABYLON.Vector3(rotationValue.x, rotationValue.y, rotationValue.z);
        newRocket.scaling = new BABYLON.Vector3(0.5, 0.5, 1);
        newRocket.isPickable = false;

        newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene);
        newRocket.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        this.Player.game._rockets.push(newRocket);
    },
}