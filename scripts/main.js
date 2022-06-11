//parkour mod
//by Deftry, ADI and TheEE

let indev = true; // сделать true для доступа ко всяким штучкам девелоперов

Log.info("Started loading of parkour mechanics");
Log.info("Loading ui elements");

Events.on(ClientLoadEvent, () => {

    let basebuttonw = 150; // ширина кнопок
    let basebuttonh = basebuttonw / 2; // высота кнопок
    var table = new Table().bottom().left(); // таблица с кнопками
    let hbtn = TextButton("Hold");
    hbtn.visibility = () => {return !lock;};
    let ebtn = TextButton("Enable Parkour Mode");
    tablem.y = basebuttonh
    let cbtn = TextButton("Change Mode");
    cbtn.visibility = () => {return !lock;};
    
    table.add(ebtn).size(basebuttonw, basebuttonh).padLeft(6);
    ebtn.clicked(() => {
        lock = !lock;
        ebtn.setText(!lock ? "Disable Parkour mod" : "Enable parkour mod");
        ebtn.y = !lock ? 0 : basebuttonh;
    });
    table.add(cbtn).size(basebuttonw, basebuttonh).padLeft(6);
    cbtn.clicked(() => {if(mode) {mode=0; Vars.ui.announce("Parkour mode")} else {Vars.ui.showCustomConfirm("IN DEVELOPMENT!", "You trying to select [accent]Planet[] mode, but it is still buggy and in very development.", "Turn this thing on!", "Back", () => {mode=1; Vars.ui.announce("Planet mode");}, () => {mode=0; Vars.ui.announce("Parkour mode");});};});
    // ^^^ код не изменится пока не будет готов планет режим
    if (Vars.mobile || indev) { 
        let jbtn = TextButton("Jump");
        jbtn.visibility = () => {return !lock;};
        table.add(jbtn).size(basebuttonw, basebuttonh).padLeft(6);
        
        jbtn.clicked(() => {
            if((stamina > 99) && onfloor) { 
                jump(bjumpvel + ajumpvel); 
                stamina -= 100; 
            };
        });
    };

    table.add(hbtn).size(basebuttonw, basebuttonh).padLeft(6);
    hbtn.clicked(() => { holding = !holding;});

    Vars.ui.hudGroup.addChild(tablem);
    Vars.ui.hudGroup.addChild(table);
});

Log.info("Loading variables");

let gravity = .5; // скорость гравитации
let bjumpvel = 15; // скорость прыжка
let ajumpvel = 0; // доп. скорость прыжка
let direction = 0; // 0 - Y, 1 - X
let lock = true; // системная блокировка
let stamina = 10000; // выносливость
let onfloor = false; // для предотвращения постоянного вызова проверки
let gravdirect = 3; // направление гравитации
let hold = false; // для липучего геля и держания на стенах - просто отключает гравитацию
let lastx; // последняя координата x игрока
let lasty; // тоже самое, но для y
let ltilex; // последняя координата твёрдого блока по x
let ltiley; // тоже самое, но для y
let unit; // переменная для хранения юнита
let mode = 0; // 0 - обычный, 1 - режим планеты
let holding = false; // держится ли юнит на стене

Log.info("Loading main content");

let getBlock = (x, y) => { // получить блок по координатам - возвращает блок по координатам, либо false если там его нету
    var block = Vars.world.tile(x, y);
    if(block != null && block.block() != Blocks.air) {
        return block.block();
    } else {
        return false;
    };
};

let getTile = (x, y) => { // получить тайл по координатам - возвращает тайл по координатам, либо true если такой координаты нет на карте
    var block = Vars.world.tile(x, y);
    if(block != null) {
        return block;
    } else { 
        return false;
    };
};

let setGravity = (grav) => {gravity = grav; jump = -grav * 10}; // по сути бесполезная фигня, устанавливает прыжок и гравитацию

let updateHud = () => { //апдейтит худ
    Vars.ui.showInfoToast("Stamina:" + stamina / 100 + "%", .03);
};

//region util functions

let getBlockBot = () => { // получает блок под юнитом(относительно гравитации). спасибо TheEE145 за чистку этого метода
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

let updateFloor = () => { // проверяет на наличие юнита на полу относительно гравитации
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

let updateGravity = () => { // тянет юнита вниз по направлению гравитации
    switch(gravdirect) {
        case 0: {unit.vel.add(gravity, 0);}
        case 1: {unit.vel.add(0, gravity);}
        case 2: {unit.vel.add(-gravity, 0);}
        case 3: {unit.vel.add(0, -gravity);}
    }
}

let jump = (vel) => { // тянет юнита вверх по направлению гравитации
        switch(gravdirect) {
        case 0: {unit.vel.add(-vel, 0);}
        case 1: {unit.vel.add(0, -vel);}
        case 2: {unit.vel.add(vel, 0);}
        case 3: {unit.vel.add(0, vel);}
    }
};

//endregion
//region mechanics
let gravipad = (unit) => {  // гравипад, спасибо за упрощение кода TheEE145
    lastx = unit.tileX();
    lasty = unit.tileY();
    if(getBlock(lastx, lasty) == Blocks.conveyor) {
        gravdirect = getTile(lastx, lasty).build.rotation;
    };
};

let gravityCenter = (unit) => { // режим планеты - тянет игрока к ближайшему ториевому блоку
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


var gelJump = (unit) => { // гель прыжка - при прыжке на нём юнит взлетает выше, при падении на него отталкивает.
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
var gelStick = (unit) => { // гель липучка - по сути выключает гравитацию пока юнит рядом с ним. при прыжке отталкивает в противоположном направлении
    lastx = unit.tileX();
    lasty = unit.tileY();
    // хоть я это и писал, но у меня рябит в глазах
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
var wallHolding = () => { // механика держания на стенах
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
var graviFunnel = (unit) => { //грави воронка(вот точно механики не спижжены из Portal 2 или Tag)
    lastx = unit.tileX();
    lasty = unit.tileY();
    if(getBlock(lastx, lasty)==Blocks.pulseConduit){
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


var antiGravField = (unit) => { // антигравитационное поле
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
        Log.err("parkour-mod: " + e)
        Vars.ui.announce("Неизвестная ошибка была поймана")
        lock = true
    };

    hold = false;
};

Log.info("Running update task");
Timer.schedule(() => {
    if (lock) { 
        return
    };

    update();
    updateHud();
    updateFloor();

    if(!hold && mode == 1) {
        gravityCenter(unit);
    };
}, 0, .02);


Log.info("Done initialisation of parkour-mod.");
