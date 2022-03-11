Log.info("Started loading of parkour mechanics");

Log.info("Loading ui-lib");
const ui = require("ui-lib/library");
ui.addButton("toggleparkour", "host", () => lock = !lock);
Events.run(EventType.ClientLoadEvent, () => Vars.control.input.addLock(() => corruption));

Log.info("Loading variables");
var lock = true;
var jump = false;
var hold = false;
var corruption = false;

var gravity = -.5;
var ograv = gravity;
var jumpvel = 10;
var ojv = jumpvel;

var stamina = 1000;
var unit;
var lastx = 0;
var lasty = 0;

var floorup;
var floordown;
var floor;

Log.info("Loading main content");

var updateHud = () => {
    Vars.ui.showInfoToast("Stamina:" + stamina / 10 + "%", .02);
};

var equalsTop = (block) => floorup != null && floorup.block() == block;
var equalsBot = (block) => floordown != null && floordown.block() == block;
var equals = (block) => floor != null && floor.block() == block;

var update = () => {
    unit = Vars.player.unit();
    if (unit == null) return;

    lastx = unit.tileX();
    lasty = unit.tileY();

    floorup = Vars.world.tile(lastx, lasty + 1);
    floordown = Vars.world.tile(lastx, lasty - 1);
    floor = Vars.world.tile(lastx, lasty);

    if (Core.input.keyDown(KeyCode.controlLeft) && Core.input.keyTap(KeyCode.l)) lock = !lock;
    if (hold == false) {
        if (stamina > 100) {
            unit.vel.add(0, Core.input.keyTap(Binding.pause) && jump ? jumpvel : gravity);
        } else {
            unit.vel.add(0, gravity);
        }
    } else {
        unit.vel.add(0, Core.input.keyTap(Binding.pause) && jump ? jumpvel : 0);
    }
    if (Core.input.keyTap(Binding.pause) && jump && stamina > 100) { jump = false; stamina = stamina - 100; }
    if (!equalsTop(Blocks.air) || !equalsBot(Blocks.air)) {
        try {
            if (floorup.block() == Blocks.titaniumWallLarge || floordown.block() == Blocks.titaniumWallLarge) {
                if (gravity > 0) {
                    unit.vel.add(0, -15);
                } else {
                    unit.vel.add(0, 15);
                }
            } else if (floorup.block() == Blocks.copperWallLarge || floordown.block() == Blocks.copperWallLarge) {
                if (gravity > 0) {
                    jumpvel = -15;
                    ojv = -15;
                } else {
                    jumpvel = 15;
                    ojv = 15;
                }
            } else {
                if (gravity > 0) {
                    jumpvel = -10;
                    ojv = -10;
                } else {
                    jumpvel = 10;
                    ojv = 10;
                }
            }
            jump = true;
            stamina = Math.min(stamina + 50, 1000);
        } catch (e) { Log.info("parkour-mod: " + e) }
    }
    if (floor != null && floor.block()) {
        if (floor.block() == Blocks.conveyor) {
            if (gravity > 0 && (floor = Vars.world.tile(lastx, lasty + 1)) != null && floor.block() != Blocks.air) {
                jumpvel = 10;
                gravity = -.5;
                ograv = gravity;
                ojv = jumpvel;
            } else if (gravity < 0 && (floor = Vars.world.tile(lastx, lasty - 1)) != null && floor.block() != Blocks.air) {
                jumpvel = -10;
                gravity = .5;
                ograv = gravity;
                ojv = jumpvel;
            };
        } else if (floor.block() == Blocks.titaniumConveyor) {
            if (Core.input.keyTap(Binding.pause)) {
                if (gravity > 0 && (floor = Vars.world.tile(lastx, lasty + 1)) != null && floor.block() != Blocks.air) {
                    jumpvel = 10;
                    gravity = -.5;
                    ograv = gravity;
                    ojv = jumpvel;
                } else if (gravity < 0 && (floor = Vars.world.tile(lastx, lasty - 1)) != null && floor.block() != Blocks.air) {
                    jumpvel = -10;
                    gravity = .5;
                    ograv = gravity;
                    ojv = jumpvel;
                };
            }
        } else if (floor.block() == Blocks.plastaniumConveyor) {
            stamina = 1000;
        } else if (floor.block() == Blocks.shockMine) {
            if (gravity != 0) {
                ograv = gravity;
                ojv = jumpvel;
            }
            gravity = 0;
            jumpvel = 0;
        } else if (floor.block() == Blocks.duct) {
            Vars.ui.announce("[blue]Toggled parkour mode");
            lock = !lock;
        } else if (floor.block() == Blocks.conduit) {
            corruption = true;
            if (Core.input.keyDown(KeyCode.a)) {
                unit.vel.add(.5, 0);
            } else if (Core.input.keyDown(KeyCode.d)) {
                unit.vel.add(-.5, 0);
            }
            if (Math.random() * (10 - 0) > 5) {
                unit.vel.add(Math.random() * (1 - -1), 0);
            }
        } else {
            gravity = ograv;
            jumpvel = ojv;
            corruption = false;
        };
    }
    if ((floor = Vars.world.tile(lastx - 1, lasty)) != null && floor.block() != Blocks.air && stamina > 0 && Core.input.keyDown(Binding.pause)) {
        stamina--;
        hold = true;
    } else if ((floor = Vars.world.tile(lastx + 1, lasty)) != null && floor.block() != Blocks.air && stamina > 0 && Core.input.keyDown(Binding.pause)) {
        stamina--;
        hold = true;
    } else {
        hold = false;
    };
    if (stamina == 0) hold = false;
};

Log.info("Running task");
Timer.schedule(() => {
    if (lock) return;
    update();
    updateHud();
}, 0, .02);

Log.info("Done");
