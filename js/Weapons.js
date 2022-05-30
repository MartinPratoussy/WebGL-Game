Weapons = function (Player) {
    this.Player = Player;
    this.Armory = Player.game.armory;
    this.bottomPosition = new BABYLON.Vector3(0.5, -2.5, 1);
    this.topPositionY = -0.5;
    this.inventory = [];
    var ezekiel = this.newWeapon('Ezekiel');
    this.inventory[0] = ezekiel;
    var ezekiel = this.newWeapon('Armageddon');
    this.inventory[1] = ezekiel;
    var ezekiel = this.newWeapon('Timmy');
    this.inventory[2] = ezekiel;
    var ezekiel = this.newWeapon('Crook');
    this.inventory[3] = ezekiel;

    this.actualWeaponId = this.inventory.length - 1;
    this.inventory[this.actualWeaponId].isActive = true;
    this.fireRate = this.Armory.weapons[this.inventory[this.actualWeaponId].typeWeapon].setup.cadency;
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
    newWeapon : function(typeWeapon) {
        var newWeapon;
        for (var i = 0; i < this.Armory.weapons.length; i++) {
            if (this.Armory.weapons[i].name === typeWeapon) {
                newWeapon = BABYLON.Mesh.CreateBox("rocketLauncher", 0.5, this.Player.game.scene);
                newWeapon.scaling = new BABYLON.Vector3(1,0.7,2);
                newWeapon.parent = this.Player.camera;
                newWeapon.position = this.bottomPosition.clone();
                newWeapon.isPickable = false;

                var materialWeapon = new BABYLON.StandardMaterial('rocketLaucnherMat', this.Player.game.scene);
                materialWeapon.diffuseColor = this.Armory.weapons[i].setup.colorMesh;
                newWeapon.material = materialWeapon;
                newWeapon.typeWeapon = i;
                newWeapon.isActive = false;
                break;
            } else if (i === this.Armory.weapons.length - 1) {
                console.log('Unknown weapon');
            }
        }
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
            var idWeapon = this.inventory[this.actualWeaponId].typeWeapon;
            var renderWidth = this.Player.game.engine.getRenderWidth(true);
            var renderHeight = this.Player.game.engine.getRenderHeight(true);
            var direction = this.Player.game.scene.pick(renderWidth/2, renderHeight/2, function(item) {
                if (item.name == "playerBox" || item.name == "weapon" || item.id == "hitBoxPlayer")
                    return false;
                else
                    return true;
            });

            if (this.Armory.weapons[idWeapon].type === 'ranged') {
                switch (this.Armory.weapons[idWeapon].setup.ammos.type) {
                    case 'rocket':
                        direction = direction.pickedPoint.subtractInPlace(this.Player.camera.playerBox.position);
                        direction = direction.normalize();
                        this.createRocket(this.Player.camera.playerBox, direction);
                        break;
                    case 'bullet':
                        this.shootBullet(direction);
                        break;
                    case 'laser':
                        this.createLaser(direction);
                        break;
                    default:
                        break;
                }
            } else {
                this.hitHand(direction);
            }
            this.canFire = false;
        }
    },

    createRocket : function(playerPosition, direction) {
        var idWeapon = this.inventory[this.actualWeaponId].typeWeapon;
        var setupRocket = this.Armory.weapons[idWeapon].setup;

        var positionValue = this.inventory[this.actualWeaponId].absolutePosition.clone();
        var rotationValue = playerPosition.rotation;
        var newRocket = BABYLON.Mesh.CreateBox("rocket", 1, this.Player.game.scene);

        newRocket.direction = direction;

        newRocket.position = new BABYLON.Vector3(
            positionValue.x + (newRocket.direction.x * 1),
            positionValue.y + (newRocket.direction.y * 1),
            positionValue.z + (newRocket.direction.z * 1)
        );

        newRocket.rotation = new BABYLON.Vector3(rotationValue.x, rotationValue.y, rotationValue.z);
        newRocket.scaling = new BABYLON.Vector3(0.5, 0.5, 1);
        newRocket.isPickable = false;

        newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene);
        newRocket.material.diffuseColor = this.Armory.weapons[idWeapon].setup.colorMesh;
        newRocket.paramsRocket = setupRocket;

        this.Player.game._rockets.push(newRocket);
    },

    shootBullet : function(meshFound) {
        var idWeapon = this.inventory[this.actualWeaponId].typeWeapon;
        var setupWeapon = this.Armory.weapons[idWeapon].setup;

        if (meshFound.hit && meshFound.pickedMesh.isPlayer) {
            // TODO: hit player
        } else {
            console.log('Not hit bullet');
        }
    },

    hitHand : function(meshFound) {
        var idWeapon = this.inventory[this.actualWeaponId].typeWeapon;
        var setupWeapon = this.Armory.weapons[idWeapon].setup;

        if (meshFound.hit && meshFound.distance < setupWeapon.range * 5 && meshFound.pickedMesh.isPlayer) {
            // TODO: hit player
        } else {
            console.log('Not hit Close');
        }
    },

    createLaser : function(meshFound) {
        var idWeapon = this.inventory[this.actualWeaponId].typeWeapon;
        var setupLaser = this.Armory.weapons[idWeapon].setup.ammos;
        var positionValue = this.inventory[this.actualWeaponId].absolutePosition.clone();

        if (meshFound.hit) {
            var laserPosition = positionValue;

            let line = BABYLON.Mesh.CreateLines("lines", [
                laserPosition,
                meshFound.pickedPoint
            ], this.Player.game.scene);

            var colorLine = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            line.color = colorLine;
            line.enableEdgesRendering();
            line.isPickable = false;
            line.edgesWidth = 40.0;
            line.edgesColor = new BABYLON.Color4(colorLine.r, colorLine.g, colorLine.b, 1);

            if (meshFound.pickedMesh.isPlayer) {
                //TODO: hit player
            } else {
                console.log("No hit laser");
            }
            this.Player.game._lasers.push(line);
        }
    },

    nextWeapon : function(way) {
        var armoryWeapons = this.Armory.weapons;
        var nextWeapon = this.inventory[this.actualWeaponId].typeWeapon + way;
        var nextPossibleWeapon = null;

        if (way > 0) {
            for (var i = 0; i < nextWeapon + armoryWeapons.length; i++) {
                var numberWeapon = i % armoryWeapons.length;
                for (var y = 0; y < this.inventory.length; y++) {
                    if (this.inventory[y].typeWeapon === numberWeapon) {
                        nextPossibleWeapon = y;
                        break;
                    }
                }
                if (nextPossibleWeapon != null) {
                    break;
                }
            }
        } else {
            for (var i = nextWeapon; ; i--) {
                if (i < 0) {
                    i = armoryWeapons.length;
                }
                var numberWeapon = i;
                for (var y = 0; y < this.inventory.length; y++) {
                    if (this.inventory[y].typeWeapon === numberWeapon) {
                        nextPossibleWeapon = y;
                        break;
                    }
                }
                if (nextPossibleWeapon != null) {
                    break;
                }
            }
        }

        if (this.actualWeaponId != nextPossibleWeapon) {
            this.inventory[this.actualWeaponId].isActive = false;
            this.actualWeaponId = nextPossibleWeapon;
            this.inventory[this.actualWeaponId].isActive = true;

            this.fireRate = armoryWeapons[this.inventory[this.actualWeaponId].typeWeapon].setup.cadency;
            this._deltaFireRate = this.fireRate;
        }
    },
}