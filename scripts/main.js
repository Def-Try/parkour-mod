Log.info("Started loading of parkour mechanics");

Log.info("Loading ui-lib");
const ui = require("ui-lib/library");
ui.addButton("toggleparkour", "host", () => lock = !lock);

Log.info("Loading variables");
var lock = true;
var jump = false;
var hold = false;
var corrupt = false;

var gravity = -.5;
var ograv = gravity;
var jumpvel = 10;
var ojv = jumpvel;

var stamina = 1000;
var unit;
var lastx = 0;
var lasty = 0;
var ltilex = 0;
var ltiley = 0;

var floorup;
var floordown;
var floor;

var j;
var lastvel = 0;
var entime = 0;

var checked = {};

Log.info("Loading main content");

var equalsTop = (block) => floorup != null && floorup.block() == block;
var equalsBot = (block) => floordown != null && floordown.block() == block;
var equals = (block) => floor != null && floor.block() == block;

var checkBlocks = (yrange, xoffset) => {
    for (j = 0; j < yrange - 1; j++) {
        floor = Vars.world.tile(unit.tileX() + xoffset, unit.tileY() - 1 + j);
        if (floor != null && floor.block() != Blocks.air) {
            checked[j] = 1;
        } else {
            checked[j] = 0;
        }
    }
    return checked;
};

var checkBlock = (block, yrange, xrange) => {
    if (block != null && block.block() != Blocks.air) {
        return block.block();
    } else {
        return false;
    }
};

var updateHud = () => {
    if (corrupt == false) Vars.ui.showInfoToast("Stamina:" + stamina / 10 + "%", .04);
    if (corrupt) Vars.ui.showInfoToast("[scarlet]Corruption detected!", .04);
};

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
            if (equalsTop(Blocks.titaniumWallLarge) || equalsBot(Blocks.titaniumWallLarge)) {
                if (ltiley == lasty) {
                    if (gravity > 0) {
                        jumpvel = -15;
                        ojv = -15;
                    } else {
                        jumpvel = 15;
                        ojv = 15;
                    }
                } else {
                    if (gravity > 0) {
                        unit.vel.add(0, lasty - ltiley - 15);
                    } else {
                        unit.vel.add(0, ltiley - lasty + 15);
                    }
                }
            } else if (equalsTop(Blocks.phaseWallLarge) || equalsBot(Blocks.phaseWallLarge)) {
                if (Core.input.keyDown(KeyCode.a)) {
                    unit.vel.add(-0.5, 0);
                    lastvel = unit.vel.x
                } else if (Core.input.keyDown(KeyCode.d)) {
                    unit.vel.add(0.5, 0);
                    lastvel = unit.vel.x
                }
            } else {
                if (gravity > 0) {
                    jumpvel = -10;
                    ojv = -10;
                } else {
                    jumpvel = 10;
                    ojv = 10;
                }
                ltilex = unit.tileX();
                ltiley = unit.tileY();
            }
            jump = true;
            stamina = Math.min(stamina + 50, 1000);
        } catch (e) { Log.info("parkour-mod: " + e) }
    }
    if (checkBlock(floor)) {
        if (equals(Blocks.conveyor)) {
            if (gravity > 0 && !equalsTop(Blocks.air)) {
                jumpvel = 10;
                gravity = -.5;
                ograv = gravity;
                ojv = jumpvel;
            } else if (gravity < 0 && !equalsBot(Blocks.air)) {
                jumpvel = -10;
                gravity = .5;
                ograv = gravity;
                ojv = jumpvel;
            };
        } else if (equals(Blocks.titaniumConveyor)) {
            if (Core.input.keyTap(Binding.pause)) {
                if (gravity > 0 && !equalsTop(Blocks.air)) {
                    jumpvel = 10;
                    gravity = -.5;
                    ograv = gravity;
                    ojv = jumpvel;
                } else if (gravity < 0 && !equalsBot(Blocks.air)) {
                    jumpvel = -10;
                    gravity = .5;
                    ograv = gravity;
                    ojv = jumpvel;
                };
            }
        } else if (equals(Blocks.plastaniumConveyor)) {
            stamina = 1000;
        } else if (equals(Blocks.shockMine)) {
            if (gravity != 0) {
                ograv = gravity;
                ojv = jumpvel;
            }
            gravity = 0;
            jumpvel = 0;
        } else if (equals(Blocks.duct)) {
            Vars.ui.announce("[#0099ff]Toggled parkour mode");
            lock = !lock;
        } else if (equals(Blocks.conduit)) {
            if (Core.input.keyDown(KeyCode.a)) {
                unit.vel.add(.5, 0);
            } else if (Core.input.keyDown(KeyCode.d)) {
                unit.vel.add(-.5, 0);
            }
            if (Mathf.chance((Time.time - entime) / 100000)) {
                unit.vel.add(Math.random() * (1 - -1), 0);
            }
            corrupt = true;
            if (entime == 0) entime = Time.time
        } else {
            gravity = ograv;
            jumpvel = ojv;
            corrupt = false;
            entime = 0;
        };
    } else {
        gravity = ograv;
        jumpvel = ojv;
        corrupt = false;
    };
    if ((checkBlocks(3, -1)[0] == 1 || checkBlock(Vars.world.tile(lastx - 1, lasty)) != false) && Core.input.keyDown(Binding.pause) && stamina > 0 && !corrupt) {
        stamina -= 50;
        hold = true;
    } else if ((checkBlocks(3, 1)[0] == 1 || checkBlock(Vars.world.tile(lastx + 1, lasty)) != false) && Core.input.keyDown(Binding.pause) && stamina > 0 && !corrupt) {
        stamina -= 50;
        hold = true;
    } else {
        hold = false;
    }
    if (stamina <= 0) hold = false;
    unit.vel.add(lastvel, 0);
    lastvel = lastvel > 0 ? lastvel - .15 : 0;
};

Log.info("Running update task");
Timer.schedule(() => {
    if (lock) return;
    update();
    updateHud();
}, 0, .02);

Log.info("Done initialisation of parkour-mod.");
