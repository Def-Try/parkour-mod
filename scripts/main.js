"use strict";

var _require = require('Logger'),
    logError = _require.logError;
/*
 *  by Deftry, ADI and TheEE
 */


var indev = true;
var isEnabled = false;
var ButtonStyle = {
  full: 150,
  half: 75
};
Log.info('Started loading of parkour mechanics');
Log.info('Loading ui elements');
Events.on(ClientLoadEvent, function () {
  var height = ButtonStyle.half,
      width = ButtonStyle.full;
  var menu_a = new Table().bottom().left(),
      menu_b = new Table().bottom().left();
  var button_enable = TextButton('Enable Parkour Mode'),
      button_hold = TextButton('Hold');
  menu_a.y = height;
  var button_mode = TextButton('Change Mode');
  menu_a.add(button_enable).size(width, height).padLeft(6);
  button_enable.clicked(function () {
    unit = Vars.player.unit();

    if (!unit || unit.type.flying) {
      Vars.ui.announce('You cannot use parkour mode outside of a flying unit.');
      return;
    }

    isEnabled = !isEnabled;
    button_enable.setText(isEnabled ? 'Disable Parkour Mod' : 'Enable Parkour Mod');
  });
  menu_b.add(button_mode).size(width, height).padLeft(6);
  button_mode.clicked(function () {
    if (mode) {
      mode = 0;
      Vars.ui.announce('Parkour Mode');
      return;
    }

    Vars.ui.showCustomConfirm('IN DEVELOPMENT!', 'You trying to select [accent]Planet[] mode, but it is still buggy and in very development.', 'Turn this thing on!', 'Back', function () {
      mode = 1;
      Vars.ui.announce('Planet mode');
    }, function () {
      mode = 0;
      Vars.ui.announce('Parkour mode');
    });
  });

  if (Vars.mobile || indev) {
    var button_jump = TextButton('Jump');
    menu_b.add(button_jump).size(width, height).padLeft(6);
    button_jump.clicked(function () {
      if (stamina > 99 && onfloor) {
        jump(bjumpvel + ajumpvel);
        stamina -= 100;
      }
    });
  }

  menu_b.add(button_hold).size(width, height).padLeft(6);
  button_hold.clicked(function () {
    return holding = !holding;
  });

  menu_b.visibility = function () {
    return isEnabled;
  };

  var menus = Vars.ui.hudGroup;
  menus.addChild(menu_a);
  menus.addChild(menu_b);
});
Log.info('Loading variables');
var gravity = .5; // скорость гравитации

var bjumpvel = 15; // скорость прыжка

var ajumpvel = 0; // доп. скорость прыжка

var direction = 0; // 0 - Y, 1 - X

var stamina = 10000; // выносливость

var onfloor = false;
var lastx;
var lasty;
var ltilex;
var ltiley;
var unit;
var mode = 0; // 0 - обычный, 1 - центр тяжести

var holding = false;
/*
 *  0 : Right
 *  1 : Up
 *  2 : Left
 *  3 : Down
 */

var gravitation = 3;
var hold = false;

function holdOn() {
  hold = true;
}

function letGo() {
  hold = false;
}

Log.info('Loading main content');

function canParkour(unit) {
  return unit && !unit.type.flying;
}

function tileAt(x, y) {
  return Vars.world.tile(x, y);
}

function blockAt(x, y) {
  var tile = tileAt(x, y);
  if ((tile === null || tile === void 0 ? void 0 : tile.type) == Blocks.air) return false;
  return tile;
}

function tileIs(x, y, type) {
  return tileAt(x, y) == type;
}

function unitOn(unit, type) {
  return tileIs(unit.tileX(), unit.tileY(), type);
}

function unitNear(unit, type) {
  return relativeBlock() == type;
}

var offsets = [[+1, 0], [0, +1], [-1, 0], [0, -1]];

var directToOffset = function directToOffset(direction) {
  return offsets[direction];
};

function relativeTile() {
  var offset = directToOffset(gravitation);
  return tileAt(lastx + offset[0], lasty + offset[1]);
}

function relativeBlock() {
  var tile = relativeTile();
  return tile ? tile.block() : false;
}

function setGravity(value) {
  gravity = value;
  jump = -value * 10;
}

function updateHud() {
  var percent = stamina / 100;
  percent = percent - percent % 1;
  Vars.ui.showInfoToast('Stamina:' + percent + '%', .04);
}

function isFloorSolid() {
  var block = relativeBlock();
  return block ? block.solid : false;
}

var updateFloor = function updateFloor() {
  onfloor = isFloorSolid();

  if (onfloor) {
    stamina += 100;
    if (stamina > 10000) stamina = 10000;
    ltilex = lastx;
    ltiley = lasty;
    var vertical = gravitation % 2;
    var x = unit.vel.x,
        y = unit.vel.y;
    if (vertical && (gravitation === 1 ? y > 0 : y < 0)) y = 0;
    if (!vertical && (gravitation === 0 ? x > 0 : x < 0)) y = 0;
    unit.vel.set(x, y);
  }
};

function updateGravity() {
  var offset = directToOffset(gravitation);
  unit.vel.add(gravity * offset[0], gravity * offset[1]);
}

var jumpOffset = [[-1, 0], [0, -1], [+1, 0], [0, +1]];

function jump(velocity) {
  var offset = jumpOffset[gravitation];
  unit.vel.add(velocity * offset[0], velocity * offset[1]);
}

function gravipad(unit) {
  if (unitOn(unit, Blocks.conveyor)) gravitation = tileAt(lastx, lasty).build.rotation;
}

var gravityCenter = function gravityCenter(unit) {
  var coordinates = [];
  distances = [], nolock = false;
  if (onfloor) return;
  if (hold) return;

  for (var _y = -15; _y < 16; _y++) {
    for (var _x = -15; _x < 16; _x++) {
      if (blockAt(lastx + _x, lasty + _y) == Blocks.thoriumWall) {
        coordinates.push({
          x: _x,
          y: _y
        });
        nolock = true;
      }
    }
  }

  if (!nolock) return;

  for (var c = 0; c < coordinates.length; c++) {
    var distance = Math.sqrt((lastx + coordinates[c].x - lastx ^ 2) + (lasty + coordinates[c].y - lasty ^ 2));
    distances.push(distance);
  }

  var shortest = 0;

  for (var d = 0; d < distances.length; d++) {
    if (distances[d] < distances[shortest]) shortest = d;
  }

  var x = coordinates[shortest].x,
      y = coordinates[shortest].y;
  var vertical = gravitation % 2;
  var position = vertical ? y : x;
  if (position === 0) return;
  unit.vel.add(!vertical * gravity, vertical * gravity);
  gravitation = vertical + (position < 0) * 2;
};

function gelJump(unit) {
  if (unitNear(unit, Blocks.titaniumWall)) {
    ajumpvel = 0;
    return;
  }

  var vertical = gravitation % 2;
  var isSame = vertical ? ltiley == lasty : ltilex == lastx;
  ajumpvel = isSame ? 15 : 0;
  if (isSame) return;
  jump(bjumpvel + 15);
}

function gelStick(unit) {
  var offsets = [-1, 0, +1];

  for (var x = 0; x < 2; x++) {
    for (var y = 0; y < 2; y++) {
      var offsetX = offsets[x],
          offsetY = offsets[y];
      if (blockAt(lastx + offsetX, lasty + offsetY) !== Blocks.plastaniumWall) return;
      holdOn();
      if (Core.input.keyTab(Binding.pause) && stamina > 99) unit.vel.add(-offsetX * 15, -offsetY * 15);
      return;
    }
  }
}

function nextToAnyBlock() {
  return blockAt(lastx, lasty + 1) || blockAt(lastx, lasty - 1) || blockAt(lastx + 1, lasty) || blockAt(lastx - 1, lasty);
}

function wallHolding() {
  if (!holding) return;
  if (stamina < 100) return letGo();

  if (nextToAnyBlock()) {
    holdOn();
    stamina -= 10;
  }
}

function graviFunnel(unit) {
  var block = blockAt(lastx, lasty);
  if (block != Blocks.pulseConduit) return;
  holdOn();
  var offset = directToOffset(block.build.rotation);
  unit.vel.add(-.55 * offset[0], -.55 * offset[1]);
}

function antiGravField(unit) {
  if (unitOn(unit, Blocks.shockMine)) holdOn();
}

function checkInteractables(unit) {
  gravipad(unit);
  gelJump(unit);
  gelStick(unit);
  wallHolding();
  graviFunnel(unit);
  antiGravField(unit);
}

function update() {
  unit = Vars.player.unit();
  if (!canParkour(unit)) return;

  try {
    lastx = unit.tileX();
    lasty = unit.tileY();

    if (Core.input.keyTap(Binding.pause) && stamina > 99 && onfloor) {
      jump(bjumpvel + ajumpvel);
      stamina -= 100;
    }

    checkInteractables(unit);
    if (!hold && mode == 0) updateGravity();
  } catch (error) {
    logError(error);
  }

  letGo();
}

Log.info('Running update task');
Timer.schedule(function () {
  if (!isEnabled) return;
  unit = Vars.player.unit();
  if (!canParkour(unit)) return;
  update();
  updateHud();
  updateFloor();
  if (hold || mode != 1) return;
  gravityCenter(unit);
}, 0, .02);
Log.info('Done initialisation of parkour-mod.');