const ui = require("ui-lib/library");
Log.info("Started loading of parkour mechanics")
var lock = true;
var jump = false;
var stamina = 1000;
var hold = false;
var gravity = -.5;
var jumpvel = 10;
var ograv = gravity;
var ojv = jumpvel;
var tilex = 0;
var tiley = 0;

var stam = () => {
    Vars.ui.showInfoToast("Stamina:" + stamina / 10 + "%", 0.1);
};

ui.addButton("toggleparkour", "edit", () => lock = !lock);

var update = () => {
    if (lock) return;
    var u = Vars.player.unit();
    tilex = u.tileX();
    tiley = u.tileY();
    var floorup = Vars.world.tile(tilex, tiley + 1);
    var floordown = Vars.world.tile(tilex, tiley - 1);
    var floor = Vars.world.tile(tilex, tiley);
    if (Core.input.keyDown(KeyCode.controlLeft) && Core.input.keyTap(KeyCode.l)) lock = !lock;
    if (lock || u == null) return;
    if (hold == false){
        if (stamina > 100) {
            u.vel.add(0, Core.input.keyTap(Binding.pause) && jump ? jumpvel : gravity);
        }else{
            u.vel.add(0, gravity);
        }
    }else{
        u.vel.add(0, Core.input.keyTap(Binding.pause) && jump ? jumpvel : 0);
    }
    if (Core.input.keyTap(Binding.pause) && jump && stamina > 100) {jump = false; stamina = stamina - 100;}
    if ( (floorup != null && floorup.block() != Blocks.air) || (floordown != null && floordown.block() != Blocks.air) ) {

        if (floorup.block() == Blocks.titaniumWallLarge || floordown.block() == Blocks.titaniumWallLarge) {
            if (gravity>0){
                u.vel.add(0, -15);
            }else{
                u.vel.add(0, 15);
            }
        }else if (floorup.block() == Blocks.copperWallLarge || floordown.block() == Blocks.copperWallLarge) {
            if (gravity>0){
                jumpvel = -15;
                ojv = -15;
            }else{
                jumpvel = 15;
                ojv = 15;
            }
        }else {
            if (gravity>0){
                jumpvel = -10;
                ojv = -10;
            }else{
                jumpvel = 10;
                ojv = 10;
            }
        }
        jump = true;
        if (stamina < 1000) {
            stamina++;
        }
    }
    if (floor != null && floor.block()) {
        if (floor.block() == Blocks.conveyor) {
            if (gravity > 0 && (floor = Vars.world.tile(tilex, tiley + 1)) != null && floor.block() != Blocks.air) {
                jumpvel = 10; 
                gravity = -.5;
                ograv = gravity;
                ojv = jumpvel;
            }else if (gravity < 0 && (floor = Vars.world.tile(tilex, tiley - 1)) != null && floor.block() != Blocks.air){ 
                jumpvel = -10; 
                gravity = .5;
                ograv = gravity;
                ojv = jumpvel;
            };
        }else if (floor.block() == Blocks.titaniumConveyor) {
            if (Core.input.keyTap(Binding.pause)) {
                if (gravity > 0 && (floor = Vars.world.tile(tilex, tiley + 1)) != null && floor.block() != Blocks.air) {
                    jumpvel = 10; 
                    gravity = -.5;
                    ograv = gravity;
                    ojv = jumpvel;
                }else if (gravity < 0 && (floor = Vars.world.tile(tilex, tiley - 1)) != null && floor.block() != Blocks.air){ 
                    jumpvel = -10; 
                    gravity = .5;
                    ograv = gravity;
                    ojv = jumpvel;
                };
            }
        }else if (floor.block() == Blocks.shockMine){
            if (gravity != 0){
                ograv = gravity;
                ojv = jumpvel;
            }
            gravity = 0;
            jumpvel = 0;
        }else if (floor.block() == Blocks.duct) {
            Vars.ui.announce("[scarlet]YOU DIED...\n[red]idiot");
            u.kill();
            loop.cancel();
        }else {
            gravity = ograv;
            jumpvel = ojv;
        };
    }
    if ((floor = Vars.world.tile(tilex - 1, tiley)) != null && floor.block() != Blocks.air && stamina > 0 && Core.input.keyDown(Binding.pause)) {
        stamina--;
        hold = true;
    }else if ((floor = Vars.world.tile(tilex + 1, tiley)) != null && floor.block() != Blocks.air && stamina > 0 && Core.input.keyDown(Binding.pause)) {
        stamina--;
        hold = true;
    }else{
        hold = false;
    };
    if (stamina==0) hold = false;
    stam();
};

var loop = Timer.schedule(() => update(), 0, 0.02);
Log.info("Done.")
