
/*
 *  by Deftry, ADI and TheEE
 */

let indev = true ;
let isEnabled = false;

const ButtonStyle = {
    full : 150 ,
    half : 75
}



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
        
        if(!unit || !unit.type.flying){
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


const getBlock = (x,y) => {
    
    const block = Vars.world.tile(x,y);
    
    if(block == null)
        return false;
        
    const type = block.block();
    
    return (type == Blocks.air)
        ? block.block()
        : false ;
}


const getTile = (x,y) => {
    
    const tile = Vars.world.tile(x, y);
    
    return block || false;
}


const setGravity = (value) => {
    gravity = value; 
    jump = -value * 10
}


const updateHud = () => {
    const percent = stamina / 100;
    Vars.ui.showInfoToast('Stamina:' + percent + '%',.04);
}


const getBlockBot = () => {
    switch(gravdirect){
    case 0 : return Vars.world.tile(lastx + 1, lasty).block();
    case 1 : return Vars.world.tile(lastx, lasty + 1).block();
    case 2 : return Vars.world.tile(lastx - 1, lasty).block();
    case 3 : return Vars.world.tile(lastx, lasty - 1).block();
    }
}

const updateFloor = () => {
    switch(gravdirect){
    case 0 :
     
        if(getBlock(lastx + 1,lasty).solid)
            break;
            
        onfloor = false;
        return;
    case 1 :
    
        if(getBlock(lastx - 1,lasty).solid)
            break;
            
        onfloor = false;
        return;
    case 2 :
    
        if(getBlock(lastx,lasty + 1).solid)
            break;
            
        onfloor = false;
        return;
    case 3 :
    
        if(getBlock(lastx,lasty - 1).solid)
            break;
            
        onfloor = false;
        return;
    }
    
    stamina += 100;
    
    if(stamina > 10000)
        stamina = 10000
    
    onfloor = true; 
    ltilex = lastx; 
    ltiley = lasty;
}


const updateGravity = () => {
    switch(gravdirect){
    case 0 : unit.vel.add(+gravity,0); return;
    case 1 : unit.vel.add(0,+gravity); return;
    case 2 : unit.vel.add(-gravity,0); return;
    case 3 : unit.vel.add(0,-gravity); return;
    }
}


const jump = (velocity) => {
    switch(gravdirect){
    case 0 : unit.vel.add(-velocity,0); return;
    case 1 : unit.vel.add(0,-velocity); return;
    case 2 : unit.vel.add(+velocity,0); return;
    case 3 : unit.vel.add(0,+velocity); return;
    }
}


//endregion
//region mechanics

const gravipad = (unit) => {
    
    lastx = unit.tileX();
    lasty = unit.tileY();

    if(getBlock(lastx,lasty) == Blocks.conveyor)
        gravdirect = getTile(lastx,lasty).build.rotation;
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
            if(getBlock(lastx + x,lasty + y) == Blocks.thoriumWall){
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
        
    const vertical =
        gravdirect === 1 ||
        gravdirect === 3 ;
        

    // if(x != 0 && !vertical){
    // 
    //     if(x < 0){
    //         unit.vel.add(-gravity,0); 
    //         gravdirect = 2;
    //     } else {
    //         unit.vel.add(gravity,0);
    //         gravdirect = 0;
    //     }
    // }
    // 
    // if(y != 0 && vertical){
    // 
    //     if(y < 0){
    //         unit.vel.add(0,-gravity); 
    //         gravdirect = 3;
    //     } else {
    //         unit.vel.add(0,+gravity); 
    //         gravdirect = 1;
    //     }
    // }
    
    const position = vertical
        ? y : x ;
        
    if(position === 0)
        return;
    
    unit.vel.add(
        ! vertical * gravity ,
          vertical * gravity
    );
    
    gravdirect = vertical + (position < 0) * 2;
}


//Я ЭТО МЕНЯТЬ НЕ БУДУ, Я УВОЛЬНЯЮСЬ

const gelJump = (unit) => {

    lastx = unit.tileX();
    lasty = unit.tileY();

    if(getBlockBot() != Blocks.titaniumWall){
        ajumpvel = 0;
        return;
    }
    
    const upwards = 
        gravdirect == 0 || 
        gravdirect == 2 ;
    
    
    const isSame = (upwards)
        ? ltilex == lastx
        : ltiley == lasty
    
    if(isSame){
        ajumpvel = 15;
    } else {
        override = upwards;
        ajumpvel = 0;
        jump(bjumpvel + 15);
    }
}


const gelStick = (unit) => {

    lastx = unit.tileX();
    lasty = unit.tileY();
    
    const offsets = [ -1 , 0 , +1 ];
    
    for(let x = 0;x < 2;x++)
        for(let y = 0;y < 2;y++){
            
            const
                offsetX = offsets[x] ,
                offsetY = offsets[y] ;
                
            
            if(getBlock(lastx + offsetX,lasty + offsetY) !== Blocks.plastaniumWall)
                return;
            
            hold = true;
            
            if(Core.input.keyTab(Binding.pause) && stamina > 99)
                unit.vel.add(-offsetX * 15,-velocity * 15);
            
            return;
        }
}


const wallHolding = () => {
    
    if(!holding)
        return;
        
    if(stamina < 100){
        hold = false;
        return;
    }
    
    if(
        getBlock(lastx + 1,lasty) ||
        getBlock(lastx - 1,lasty) ||
        getBlock(lastx,lasty + 1) ||
        getBlock(lastx,lasty - 1)
    ){
        hold = true;
        stamina -= 10;
    }
}


const graviFunnel = (unit) => {

    lastx = unit.tileX();
    lasty = unit.tileY();
    
    const tile = getBlock(lastx,lasty);
    
    
    // грави воронка

    if(tile == Blocks.pulseConduit){ 
        
        hold = true;
        
        switch(tile.build.rotation){
        case 0 : unit.vel.add(+.55,0); return;
        case 1 : unit.vel.add(0,+.55); return;
        case 2 : unit.vel.add(-.55,0); return;
        case 3 : unit.vel.add(0,-.55); return;
        }
    }
}


//не мусор

const antiGravField = (unit) => {
    
    lastx = unit.tileX();
    lasty = unit.tileY();

    if(getBlock(lastx,lasty) == Blocks.shockMine)
        hold = true;
};


//endregion

const update = () => {
    
    unit = Vars.player.unit();
    
    if(!unit)
        return;
        
    if(!unit.type.flying)
        return;
    
    try {
        
        lastx = unit.tileX();
        lasty = unit.tileY();

        if(Core.input.keyTap(Binding.pause) && stamina > 99 && onfloor){
            jump(bjumpvel + ajumpvel);
            stamina -= 100; 
        }

        gravipad(unit);
        gelJump(unit);
        gelStick(unit);
        wallHolding();
        graviFunnel(unit);
        antiGravField(unit);
        
        if(!hold && mode == 0)
            updateGravity();

    } catch(error){
        Log.err('Parkour Mod:' + error + 'Maybe you are in the void?')
    }

    hold = false;
}


Log.info('Running update task');


Timer.schedule(() => {
    
    if(!isEnabled)
        return
        
    unit = Vars.player.unit();
    
    if(!unit)
        return;
        
    if(!unit.type.flying)
        return;

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
