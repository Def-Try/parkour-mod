Log.info("Started loading of parkour mechanics");

Log.info("Loading ui-lib");
const ui = require("ui-lib/library");
ui.addButton("toggleparkour", "host", () => lock = !lock);

Log.info("Loading variables");
var gravity = .5; // скорость гравитации
var bjumpvel = 15; // скорость прыжка
var ajumpvel = 0; // доп. скорость прыжка
var direction = 0; // 0 - Y, 1 - X
var lock = true; // системная блокировка
var stamina = 1000; // выносливость
var onfloor = false; 
var gravdirect = 3;
var hold = false;
var lastx;
var lasty;
var ltilex;
var ltiley;
var unit;
Log.info("Loading main content");
var getBlock = (x, y) => {var block = Vars.world.tile(x, y);if(block != null && block.block() != Blocks.air){return block.block();}else{return false;}}
var getTile = (x, y) => {var block = Vars.world.tile(x, y);if(block != null){return block;}else{return false;}}
var setGravity = (grav) => {gravity = grav; jump = -grav*10}
var updateHud = () => {Vars.ui.showInfoToast("Выносливость:" + stamina / 10 + "%", .04);}

if (Vars.mobile) ui.addButton("mobileJump", "up", () => {
    if(stamina > 99 && onfloor){jump(bjumpvel+ajumpvel); stamina -= 100; }
});

var getBlockBot = () => {
    if(gravdirect==0){return Vars.world.tile(lastx+1, lasty).block()}
    if(gravdirect==1){return Vars.world.tile(lastx, lasty+1).block()}
    if(gravdirect==2){return Vars.world.tile(lastx-1, lasty).block()}
    if(gravdirect==3){return Vars.world.tile(lastx, lasty-1).block()}
}
var updateFloor = () => { 
    if(gravdirect == 0){
        if(getBlock(lastx+1, lasty).solid){ if(stamina<1000){stamina += 100}else{stamina=1000}; onfloor = true; ltilex = lastx; ltiley = lasty;}else{onfloor=false;}
    }else if(gravdirect == 2){
        if(getBlock(lastx-1, lasty).solid){ if(stamina<1000){stamina += 100}else{stamina=1000}; onfloor = true; ltilex = lastx; ltiley = lasty;}else{onfloor=false;}
    }else if(gravdirect == 1){
        if(getBlock(lastx, lasty+1).solid){ if(stamina<1000){stamina += 100}else{stamina=1000}; onfloor = true; ltilex = lastx; ltiley = lasty;}else{onfloor=false;}
    }else{
        if(getBlock(lastx, lasty-1).solid){ if(stamina<1000){stamina += 100}else{stamina=1000}; onfloor = true; ltilex = lastx; ltiley = lasty;}else{onfloor=false;}
    }
}
var updateGravity = () => {
    if(gravdirect==0){unit.vel.add(gravity, 0);}
    if(gravdirect==1){unit.vel.add(0, gravity);}
    if(gravdirect==2){unit.vel.add(-gravity, 0);}
    if(gravdirect==3){unit.vel.add(0, -gravity);}
}
var jump = (vel) => {
    if(gravdirect==0){unit.vel.add(-vel, 0);}
    if(gravdirect==1){unit.vel.add(0, -vel);}
    if(gravdirect==2){unit.vel.add(vel, 0);}
    if(gravdirect==3){unit.vel.add(0, vel);}
}
//ЭТОТ РЕГИОН ДЛЯ ФУНКЦИЙ МЕХАНИК!
var gravipad = (unit) => {
    lastx = unit.tileX();
    lasty = unit.tileY();
    if(getBlock(lastx, lasty)==Blocks.conveyor){ // гравипад
        if(getTile(lastx, lasty).build.rotation==0){ // гравитация вправо
            gravdirect = 0;
        }else if(getTile(lastx, lasty).build.rotation==1){ // гравитация вверх
            gravdirect = 1;
        }else if(getTile(lastx, lasty).build.rotation==2){ // гравитация влево
            gravdirect = 2;
        }else if(getTile(lastx, lasty).build.rotation==3){ // гравитация вниз
            gravdirect = 3;
        }
    } 
}
var gelJump = (unit) => {
    lastx = unit.tileX();
    lasty = unit.tileY();
    if(getBlockBot()==Blocks.titaniumWall){
        if(gravdirect == 0 || gravdirect == 2){
            if(ltilex == lastx){
                ajumpvel = 15;
            }else{
                override = false;
                ajumpvel = 0;
                jump(bjumpvel+15);
            }
        }else{
            if(ltiley == lasty){
                ajumpvel = 15;
            }else{
                ajumpvel = 0;
                jump(bjumpvel+15);
            }
        }
    }else{ajumpvel = 0;}
}
var gelStick = (unit) => {
    lastx = unit.tileX();
    lasty = unit.tileY();
    if(getBlock(lastx+1, lasty)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(-15, 0);}
    }else if(getBlock(lastx-1, lasty)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(15, 0);}
    }else if(getBlock(lastx, lasty+1)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(0, -15);}
    }else if(getBlock(lastx, lasty-1)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(0, 15);}
    }
}
var wallHolding = (unit) => {
    if(Core.input.keyDown(Binding.pause)){
        if(stamina>99){
            if(getBlock(lastx+1, lasty)!=false){
                hold = true;
            }else if(getBlock(lastx-1, lasty)!=false){
                hold = true;
            }else if(getBlock(lastx, lasty+1)!=false){
                hold = true;
            }else if(getBlock(lastx, lasty-1)!=false){
                hold = true;
            }
        }else{
            hold = false;
        }
    }
}
var graviFunnel = (unit) => {
    lastx = unit.tileX();
    lasty = unit.tileY();
    if(getBlock(lastx, lasty)==Blocks.pulseConduit){ // грави воронка
        hold = true;
        if(getTile(lastx, lasty).build.rotation==0){
            unit.vel.add(.05, 0);
        }else if(getTile(lastx, lasty).build.rotation==1){
            unit.vel.add(0, .05);
        }else if(getTile(lastx, lasty).build.rotation==2){
            unit.vel.add(-.05, 0);
        }else if(getTile(lastx, lasty).build.rotation==3){
            unit.vel.add(0, -.05);
        }
    }
}
var antiGravField = (unit) => {
    lastx = unit.tileX();
    lasty = unit.tileY();
    if(getBlock(lastx, lasty)==Blocks.shockMine){
        hold = true;
    } 
}

//конец региона механик
var update = () => { // главный цикл
    unit = Vars.player.unit();
    if (unit == null) return;
    try{
        lastx = unit.tileX();
        lasty = unit.tileY();
        if(Core.input.keyTap(Binding.pause) && stamina > 99 && onfloor){jump(bjumpvel+ajumpvel); stamina -= 100; } // работа прыжка
        gravipad(unit);
        gelJump(unit);
        gelStick(unit);
        wallHolding(unit);
        graviFunnel(unit);
        antiGravField(unit);
        if(!hold) updateGravity();
    }catch(e){
        Log.info("parkour-mod: " + e + ". Maybe you in the void?")
    }
    hold = false;
    

};
Log.info("Running update task");
Timer.schedule(() => {
    if (lock) return;
    update();
    updateHud();
    updateFloor();
}, 0, .02);

Log.info("Done initialisation of parkour-mod.");
