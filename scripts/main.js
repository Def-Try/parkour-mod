
const { logError } = require('Logger');


/*
 *  by Deftry, ADI and TheEE
 */

let indev = true ;
let isEnabled = false;

const ButtonStyle = {
    full : 150 ,
    half : 75
}


Log.info(typeof Blocks.titaniumWall)



Log.info('Started loading of parkour mechanics');
Log.info('Loading ui elements');

Events.on(ClientLoadEvent,() => {
    
    const
        height = ButtonStyle.half ,
        width = ButtonStyle.full ;

    const
        menu_a = new Table().bottom().left() ,
        menu_b = new Table().bottom().left() ;
    
    let 
        button_enable = TextButton('Enable Parkour Mode') ,
        button_hold = TextButton('Hold') ;
    
    menu_a.y = height;
    
    let button_mode = TextButton('Change Mode');
    
    menu_a
    .add(button_enable)
    .size(width,height)
    .padLeft(6);
    
    button_enable.clicked(() => {
        
        unit = Vars.player.unit();
        
        if(!unit || unit.type.flying){
            Vars.ui.announce('You cannot use parkour mode outside of a flying unit.');
            return;
        }
        
        isEnabled = ! isEnabled;
        
        button_enable.setText(isEnabled 
            ? 'Disable Parkour Mod'
            : 'Enable Parkour Mod' );
    });
    
    menu_b
    .add(button_mode)
    .size(width,height)
    .padLeft(6);
    
    button_mode.clicked(() => {
        
        if(mode){
            mode = 0;
            Vars.ui.announce('Parkour Mode');
            return;
        }
        
        Vars.ui.showCustomConfirm(
            'IN DEVELOPMENT!' ,
            'You trying to select [accent]Planet[] mode, but it is still buggy and in very development.' ,
            'Turn this thing on!' ,
            'Back' ,
            () => {
                mode = 1;
                Vars.ui.announce('Planet mode');
            },
            () => {
                mode = 0;
                Vars.ui.announce('Parkour mode');
            });
    });

    if(Vars.mobile || indev){
        
        let button_jump = TextButton('Jump');
        
        menu_b
        .add(button_jump)
        .size(width,height)
        .padLeft(6);
        
        button_jump.clicked(() => {
            if(stamina > 99 && onfloor){ 
                jump(bjumpvel + ajumpvel); 
                stamina -= 100; 
            }
        });
    }

    menu_b
    .add(button_hold)
    .size(width,height)
    .padLeft(6);
    
    button_hold.clicked(() => holding = ! holding);

    menu_b.visibility = () => isEnabled;

    const menus = Vars.ui.hudGroup;
    
    menus.addChild(menu_a);
    menus.addChild(menu_b);
});


Log.info('Loading variables');

let gravity = .5; // скорость гравитации
let bjumpvel = 15; // скорость прыжка
let ajumpvel = 0; // доп. скорость прыжка
let direction = 0; // 0 - Y, 1 - X
let stamina = 10000; // выносливость
let onfloor = false; 
let lastx;
let lasty;
let ltilex;
let ltiley;
let unit;
let mode = 0; // 0 - обычный, 1 - центр тяжести
let holding = false;


/*
 *  0 : Right
 *  1 : Up
 *  2 : Left
 *  3 : Down
 */

let gravitation = 3;



let hold = false;


function holdOn(){
    hold = true;
}

function letGo(){
    hold = false;
}


Log.info('Loading main content');


function canParkour(unit){
    return unit && ! unit.type.flying;
}


function tileAt(x,y){
    return Vars.world.tile(x,y) || false;
}

function blockAt(x,y){
    
    const block = tileAt(x,y);

    return (block && block.type != Blocks.air)
        ? block : false ;
}

function tileIs(x,y,type){
    return tileAt(x,y) == type;
}

function unitOn(unit,type){
    return tileIs(unit.tileX(),unit.tileY(),type);
}

function unitNear(unit,type){
    return relativeBlock() == type;
}

const offsets = [
    [ +1 ,  0 ] ,
    [  0 , +1 ] ,
    [ -1 ,  0 ] ,
    [  0 , -1 ]
]

const directToOffset = (direction) =>
    offsets[direction];

function relativeTile(){
    
    const offset = directToOffset(gravitation);
    
    return tileAt(
        lastx + offset[0] ,
        lasty + offset[1]
    );
}

function relativeBlock(){
    
    const tile = relativeTile();
    
    return (tile)
        ? tile.block()
        : false ;
}


function setGravity(value){
    gravity = value; 
    jump = -value * 10
}


function updateHud(){
    
    let percent = stamina / 100;
    
    percent = percent - percent % 1;
    
    Vars.ui.showInfoToast('Stamina:' + percent + '%',.04);
}



function isFloorSolid(){
    
    const block = relativeBlock();
    
    return (block)
        ? block.solid
        : false ;
}

const updateFloor = () => {
    
    onfloor = isFloorSolid();
    
    if(onfloor){
        
        stamina += 100;
        
        if(stamina > 10000)
            stamina = 10000;
        
        ltilex = lastx;
        ltiley = lasty;
        
        const vertical = gravitation % 2;
        
        let
            x = unit.vel.x ,
            y = unit.vel.y ;
        
        if(vertical && (gravitation === 1 ? y > 0 : y < 0))
            y = 0;
        
        if(!vertical && (gravitation === 0 ? x > 0 : x < 0))
            y = 0;
                
        
        unit.vel.set(x,y);
    }
}


function updateGravity(){
    
    const offset = directToOffset(gravitation);
    
    unit.vel.add(
        gravity * offset[0] ,
        gravity * offset[1] 
    );
}


const jumpOffset = [
    [ -1 ,  0 ] ,
    [  0 , -1 ] ,
    [ +1 ,  0 ] ,
    [  0 , +1 ]
]

function jump(velocity){
    
    const offset = jumpOffset[gravitation];
    
    unit.vel.add(
        velocity * offset[0] ,
        velocity * offset[1]
    );
}


function gravipad(unit){
    if(unitOn(unit,Blocks.conveyor))
        gravitation = tileAt(lastx,lasty).build.rotation;
}


const gravityCenter = (unit) => {
    
    let 
        coordinates = [] ;
        distances = [] ,
        nolock = false ;

    if(onfloor)
        return;
        
    if(hold)
        return

    for(let y = -15;y < 16;y++)
        for(let x = -15;x < 16;x++)
            if(blockAt(lastx + x,lasty + y) == Blocks.thoriumWall){
                coordinates.push({ x : x , y : y });
                nolock = true;
            }

    if(!nolock)
        return;

    for(let c = 0;c < coordinates.length;c++){
        
        const distance = Math.sqrt(
            ((lastx + coordinates[c].x - lastx) ^ 2) + 
            ((lasty + coordinates[c].y - lasty) ^ 2) );
        
        distances.push(distance);
    }

    let shortest = 0;
    
    for(let d = 0;d < distances.length;d++)
        if(distances[d] < distances[shortest])
            shortest = d;

    const
        x = coordinates[shortest].x ,
        y = coordinates[shortest].y ;
        
    const vertical = gravitation % 2;
    
    const position = vertical
        ? y : x ;
        
    if(position === 0)
        return;
    
    unit.vel.add(
        ! vertical * gravity ,
          vertical * gravity
    );
    
    gravitation = vertical + (position < 0) * 2;
}


function gelJump(unit){

    if(unitNear(unit,Blocks.titaniumWall)){
        ajumpvel = 0;
        return;
    }
    
    const vertical = gravitation % 2;
    
    
    const isSame = (vertical)
        ? ltiley == lasty
        : ltilex == lastx ;
    
    ajumpvel = (isSame)
        ? 15 : 0 ;
        
    if(isSame)
        return;
        
    jump(bjumpvel + 15);
}


function gelStick(unit){

    const offsets = [ -1 , 0 , +1 ];
    
    for(let x = 0;x < 2;x++)
        for(let y = 0;y < 2;y++){
    
            const
                offsetX = offsets[x] ,
                offsetY = offsets[y] ;
    
            if(blockAt(lastx + offsetX,lasty + offsetY) !== Blocks.plastaniumWall)
                return;
    
            holdOn();
    
            if(Core.input.keyTab(Binding.pause) && stamina > 99)
                unit.vel.add(
                    - offsetX * 15 ,
                    - offsetY * 15
                );
    
            return;
        }
}


function nextToAnyBlock(){
    return blockAt(lastx,lasty + 1)
        || blockAt(lastx,lasty - 1)
        || blockAt(lastx + 1,lasty)
        || blockAt(lastx - 1,lasty) ;
}

function wallHolding(){
    
    if(!holding)
        return;
        
    if(stamina < 100)
        return letGo();
    
    if(nextToAnyBlock()){
        holdOn();
        stamina -= 10;
    }
}


function graviFunnel(unit){
    
    const block = blockAt(lastx,lasty);

    if(block != Blocks.pulseConduit)
        return;
        
    holdOn();
    
    const offset = directToOffset(block.build.rotation);
    
    unit.vel.add(
        -.55 * offset[0] ,
        -.55 * offset[1] 
    );
}


function antiGravField(unit){
    
    if(unitOn(unit,Blocks.shockMine))
        holdOn();
}



function checkInteractables(unit){
    
    gravipad(unit);
    gelJump(unit);
    gelStick(unit);
    wallHolding();
    graviFunnel(unit);
    antiGravField(unit);
}


function update(){
    
    unit = Vars.player.unit();
    
    if(!canParkour(unit))
        return;
    
    try {
        
        lastx = unit.tileX();
        lasty = unit.tileY();

        if(Core.input.keyTap(Binding.pause) && stamina > 99 && onfloor){
            jump(bjumpvel + ajumpvel);
            stamina -= 100;
        }

        checkInteractables(unit);
        
        if(!hold && mode == 0)
            updateGravity();

    } catch(error) { logError(error) }

    letGo();
}


Log.info('Running update task');


Timer.schedule(() => {
    
    if(!isEnabled)
        return
        
    unit = Vars.player.unit();
    
    if(!canParkour(unit))
        return;

    update();
    updateHud();
    updateFloor();

    if(hold || mode != 1)
        return;

    gravityCenter(unit);
    
},0,.02);


Log.info('Done initialisation of parkour-mod.');
