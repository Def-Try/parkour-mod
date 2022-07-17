/*
 *  by Deftry, ADI and TheEE
 */

let 
    indev = true ,
    basebuttonw = 150 ,
    basebuttonh = basebuttonw / 2 ;


Log.info('Started loading of parkour mechanics');
Log.info('Loading ui elements');

Events.on(ClientLoadEvent,() => {

    // ebtn
    // cbtn jbtn hbtn
    var table = new Table().bottom().left();
    var tablem = new Table().bottom().left();
    let hbtn = TextButton("Hold");
    let ebtn = TextButton("Enable Parkour Mode");
    tablem.y = basebuttonh
    let cbtn = TextButton("Change Mode");
    
    tablem
    .add(ebtn)
    .size(basebuttonw,basebuttonh)
    .padLeft(6);
    
    ebtn.clicked(() => {
        
        lock = ! lock;
        
        ebtn.setText(lock 
            ? 'Enable Parkour Mod' 
            : 'Disable Parkour Mod');
    });
    
    table
    .add(cbtn)
    .size(basebuttonw,basebuttonh)
    .padLeft(6);
    
    cbtn.clicked(() => {
        if(mode){
            mode = 0;
            Vars.ui.announce('Parkour Mode')
        } else {
            Vars.ui.showCustomConfirm(
                'IN DEVELOPMENT!' ,
                'You trying to select [accent]Planet[] mode, but it is still buggy and in very development.' ,
                'Turn this thing on!' ,
                'Back' ,
                () => {
                    mode = 1;
                    Vars.ui.announce("Planet mode");
                },
                () => {
                    mode = 0;
                    Vars.ui.announce("Parkour mode");
                });
        };
    });

    if(Vars.mobile || indev){
        
        let jbtn = TextButton('Jump');
        
        table
        .add(jbtn)
        .size(basebuttonw,basebuttonh)
        .padLeft(6);
        
        jbtn.clicked(() => {
            if(stamina > 99 && onfloor){ 
                jump(bjumpvel + ajumpvel); 
                stamina -= 100; 
            }
        });
    };

    table
    .add(hbtn)
    .size(basebuttonw,basebuttonh)
    .padLeft(6);
    
    hbtn.clicked(() => holding = ! holding);

    table.visibility = () => ! lock;

    Vars.ui.hudGroup.addChild(tablem);
    Vars.ui.hudGroup.addChild(table);
});


Log.info('Loading variables');

let gravity = .5; // скорость гравитации
let bjumpvel = 15; // скорость прыжка
let ajumpvel = 0; // доп. скорость прыжка
let direction = 0; // 0 - Y, 1 - X
let lock = true; // системная блокировка
let stamina = 10000; // выносливость
let onfloor = false; 
let gravdirect = 3;
let hold = false;
let lastx;
let lasty;
let ltilex;
let ltiley;
let unit;
let mode = 0; // 0 - обычный, 1 - центр тяжести
let holding = false;


Log.info('Loading main content');


let getBlock = (x, y) => {
    var block = Vars.world.tile(x, y);
    if(block != null && block.block() != Blocks.air) {
        return block.block();
    } else {
        return false;
    };
};

let getTile = (x, y) => {
    var block = Vars.world.tile(x, y);
    if(block != null) {
        return block;
    } else { 
        return false;
    };
};

let setGravity = (grav) => {
    gravity = grav; 
    jump = -grav * 10
};

let updateHud = () => {
    Vars.ui.showInfoToast("Stamina:" + stamina / 100 + "%", .04);
};

//region util functions

let getBlockBot = () => {
    switch(gravdirect) {
        case 0: {
            return Vars.world.tile(lastx + 1, lasty).block();
        };

        case 1: {
            return Vars.world.tile(lastx, lasty + 1).block();
        };

        case 2: {
            return Vars.world.tile(lastx - 1, lasty).block();
        };

        case 3: {
            return Vars.world.tile(lastx, lasty - 1).block();
        };
    };
};

let updateFloor = () => { 
    if(gravdirect == 0) {
        if(getBlock(lastx + 1, lasty).solid) { 
            if(stamina < 10000) {
                stamina += 100
            } else {
                stamina=10000
            }; 
            
            onfloor = true; 
            ltilex = lastx; 
            ltiley = lasty;
        } else{ 
            onfloor = false;
        };
    } else { 
        if(gravdirect == 2) {
            if(getBlock(lastx - 1, lasty).solid) { 
                if(stamina < 10000) {
                    stamina += 100;
                } else {
                    stamina = 10000
                }; 
                
                onfloor = true; 
                ltilex = lastx; 
                ltiley = lasty;
            } else {
                onfloor = false;
            };
        } else {
            if(gravdirect == 1) {
                if(getBlock(lastx, lasty + 1).solid) { 
                    if(stamina < 10000) {
                        stamina += 100
                    } else { 
                        stamina=10000
                    }; 
                    
                    onfloor = true; 
                    ltilex = lastx; 
                    ltiley = lasty;
                } else{ 
                    onfloor=false;
                };
            } else {
                if(getBlock(lastx, lasty - 1).solid) { 
                    if(stamina < 10000) {
                        stamina += 100
                    } else { 
                        stamina = 10000;
                    }; 
                    
                    onfloor = true; 
                    ltilex = lastx; 
                    ltiley = lasty;
                } else{
                    onfloor=false;
                };
            };
        };
    };
};

let updateGravity = () => {
    if(gravdirect == 0) {
        unit.vel.add(gravity, 0);
    };

    if(gravdirect == 1) {
        unit.vel.add(0, gravity);
    };

    if(gravdirect == 2) {
        unit.vel.add(-gravity, 0);
    };

    if(gravdirect == 3) {
        unit.vel.add(0, -gravity);
    };
}

let jump = (vel) => {
    if(gravdirect == 0) {
        unit.vel.add(-vel, 0);
    };
    
    if(gravdirect == 1) {
        unit.vel.add(0, -vel);
    };

    if(gravdirect == 2) {
        unit.vel.add(vel, 0);
    };

    if(gravdirect == 3) {
        unit.vel.add(0, vel);
    };
};

//endregion
//region mechanics
let gravipad = (unit) => {
    lastx = unit.tileX();
    lasty = unit.tileY();

    if(getBlock(lastx, lasty) == Blocks.conveyor) { // гравипад
        //может gravdirect = getTile(lastx, lasty).build.rotation;
        if(getTile(lastx, lasty).build.rotation == 0) { // гравитация вправо
            gravdirect = 0;
        } else {
            if(getTile(lastx, lasty).build.rotation == 1) { // гравитация вверх
                gravdirect = 1;
            } else {
                if(getTile(lastx, lasty).build.rotation == 2) { // гравитация влево
                    gravdirect = 2;
                } else {
                    if(getTile(lastx, lasty).build.rotation == 3) { // гравитация вниз
                        gravdirect = 3;
                    };
                };
            };
        };
    };
};

let gravityCenter = (unit) => {
    let coordinates = [];
    let distances = [];
    let nolock = false;

    if(!onfloor && !hold){
        for(let y = -15; y < 16; y++) {
            for(let i = -15; i < 16; i++) {
                if(getBlock(lastx+i, lasty + y) == Blocks.thoriumWall) {
                    coordinates.push({
                        x: i, 
                        y: y
                    });

                    nolock = true;
                };
            };
        };

        if(nolock) {
            for(let j = 0; j < coordinates.length; j++) {
                var dist = Math.sqrt(((lastx + coordinates[j].x - lastx) ^ 2) + ((lasty + coordinates[j].y - lasty) ^ 2));
                distances.push( dist );
            };

            let mini = 0;
            for(let j = 0; j < distances.length; j++){
                if(distances[j] < distances[mini]) {
                    mini = j;
                };
            };

            if (coordinates[mini].x < 0 && gravdirect != 3 && gravdirect != 1) { 
                unit.vel.add(-gravity, 0); 
                gravdirect = 2;
            };

            if (coordinates[mini].x > 0 && gravdirect != 3 && gravdirect != 1) { 
                unit.vel.add(gravity, 0); 
                gravdirect = 0;
            };
            
            if (coordinates[mini].y < 0 && gravdirect != 2 && gravdirect != 0) { 
                unit.vel.add(0, -gravity); 
                gravdirect = 3;
            };

            if (coordinates[mini].y > 0 && gravdirect != 2 && gravdirect != 0) { 
                unit.vel.add(0, gravity); 
                gravdirect = 1;
            };
        };
    };
};

//Я ЭТО МЕНЯТЬ НЕ БУДУ, Я УВОЛЬНЯЮСЬ
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
    }else if(getBlock(lastx-1, lasty-1)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(15, 15);}
    }else if(getBlock(lastx+1, lasty-1)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(-15, 15);}
    }else if(getBlock(lastx+1, lasty+1)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(-15, -15);}
    }else if(getBlock(lastx-1, lasty+1)==Blocks.plastaniumWall){
        hold = true;
        if(Core.input.keyTap(Binding.pause) && stamina > 99){unit.vel.add(15, -15);}
    }
}
var wallHolding = () => {
    if (holding) {
        if(stamina>99){
            if(getBlock(lastx+1, lasty)!=false){
                hold = true;
                stamina -= 10;
            }else if(getBlock(lastx-1, lasty)!=false){
                hold = true;
                stamina -= 10;
            }else if(getBlock(lastx, lasty+1)!=false){
                hold = true;
                stamina -= 10;
            }else if(getBlock(lastx, lasty-1)!=false){
                hold = true;
                stamina -= 10;
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
            unit.vel.add(.55, 0);
        }else if(getTile(lastx, lasty).build.rotation==1){
            unit.vel.add(0, .55);
        }else if(getTile(lastx, lasty).build.rotation==2){
            unit.vel.add(-.55, 0);
        }else if(getTile(lastx, lasty).build.rotation==3){
            unit.vel.add(0, -.55);
        };
    };
};

//не мусор
var antiGravField = (unit) => {
    lastx = unit.tileX();
    lasty = unit.tileY();

    if(getBlock(lastx, lasty) == Blocks.shockMine){
        hold = true;
    };
};

//endregion
var update = () => { // главный цикл
    unit = Vars.player.unit();
    if (unit == null) return;
    try {
        lastx = unit.tileX();
        lasty = unit.tileY();

        if(Core.input.keyTap(Binding.pause) && stamina > 99 && onfloor) {
            jump(bjumpvel + ajumpvel); 
            stamina -= 100; 
        }; // работа прыжка

        gravipad(unit);
        gelJump(unit);
        gelStick(unit);
        wallHolding();
        graviFunnel(unit);
        antiGravField(unit);
        
        if(!hold && mode==0) { 
            updateGravity();
        };
    } catch(e){
        Log.err("parkour-mod: " + e + ". Maybe you in the void?")
    };

    hold = false;
};


Log.info('Running update task');


Timer.schedule(() => {
    
    if(lock)
        return

    update();
    updateHud();
    updateFloor();

    if(hold)
        return;
        
    if(mode != 1)
        return;

    gravityCenter(unit);
},0,.02);


Log.info('Done initialisation of parkour-mod.');
