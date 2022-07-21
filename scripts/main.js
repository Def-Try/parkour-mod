
{
    const { blockAt , tileIs , tileAt } = require('Tile');
    const { exception , log , debug } = require('Logger');
    const { button , table } = require('UI');
    const { delta } = require('Math');
    const { jump } = require('Jump');



    const Gravity = require('Gravity');

    const offsets = [
        [ +1 ,  0 ] ,
        [  0 , +1 ] ,
        [ -1 ,  0 ] ,
        [  0 , -1 ]
    ]

    const directToOffset = (direction) =>
        offsets[direction];

    function relativeTile(){
        
        const offset = directToOffset(Gravity.direction);
        
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
    
    function isFloorSolid(){
        
        const block = relativeBlock();
        
        return (block)
            ? block.solid
            : false ;
    }
    
    


    /*
     *  by Deftry, ADI and TheEE
     */

    let indev = true ;
    let isEnabled = false;


    const needsJumpUI = 
        Vars.mobile || indev;


    let button_enable;


    log('Started loading of parkour mechanics');
    log('Loading ui elements');

    function toggleMod(){

        unit = Vars.player.unit();
        
        if(!unit || unit.type.flying){
            Vars.ui.announce('You cannot use parkour mode outside of a flying unit.');
            return;
        }
        
        isEnabled = ! isEnabled;
        
        button_enable.setText(isEnabled 
            ? 'Disable Parkour Mod'
            : 'Enable Parkour Mod' );
    }

    function toggleMode(){
        
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
    }

    function pressJump(){
        
        debug('Pressed Jump')
        
        if(stamina < 100)
            return;
            
        if(!onfloor)
            return;
        
        jump(unit,bjumpvel + ajumpvel); 

        stamina -= 100; 
    }

    function toggleHold(){
        holding = ! holding;
    }

    function buildHUD(){
        
        buildMainMenu();
        buildSubMenu();
        buildStaminaMenu();
    }

    function buildMainMenu(){
        
        const menu = table();
        menu.y = 75;
        
        button_enable = button({
            menu : menu ,
            name : 'Enable Parkour Mode' ,
            click : toggleMod
        });
    }

    function buildSubMenu(){
        
        const menu = table() ;
        menu.visibility = () => isEnabled;
        
        button({
            menu : menu ,
            name : 'Change Mode' ,
            click : toggleMode
        });

        if(needsJumpUI)
            button({
                menu : menu ,
                name : 'Jump' ,
                click : pressJump
            });
            
        button({
            menu : menu ,
            name : 'Hold' ,
            click : toggleHold
        });
    }

    let label_stamina;

    function buildStaminaMenu(){
        
        log('Builing Stamina Menu')
        
        const menu_stamina = new Table()
            .left()
            .bottom();
            
        menu_stamina.visibility = () => isEnabled;
        menu_stamina.y = 400;
        
        label_stamina = Label('');
        label_stamina.setStyle(Styles.outlineLabel);
        
        menu_stamina.add(label_stamina)
        .size(150,75)
        .padLeft(6);
            
        Vars.ui.hudGroup.addChild(menu_stamina);
    }

    Events.on(ClientLoadEvent,buildHUD);


    log('Loading variables');

    let bjumpvel = 15; // скорость прыжка
    let ajumpvel = 0; // доп. скорость прыжка
    let stamina = 10000; // выносливость
    let lastx;
    let lasty;
    let ltilex;
    let ltiley;
    let unit;

    /*
     *  Gravity
     *  0 : Downwards
     *  1 : Central 
     */

    let mode = 0;

    let 
        holding = false ,
        onfloor = false ; 


    let hold = false;


    function holdOn(){
        hold = true;
    }

    function letGo(){
        hold = false;
    }


    log('Loading main content');


    function canParkour(unit){
        return unit && ! unit.type.flying;
    }




    function unitOn(unit,type){
        return tileIs(unit.tileX(),unit.tileY(),type);
    }

    function unitNear(unit,type){
        return relativeBlock() == type;
    }




    function updateHud(){
        
        if(!canWork())
            return;
        
        let percent = stamina / 100;
        
        percent = percent - percent % 1;
        
        label_stamina.setText('Stamina: ' + percent + '%');
    }



    

    const updateFloor = () => {
        
        onfloor = isFloorSolid();
        
        if(onfloor){
            
            stamina += 100;
            
            if(stamina > 10000)
                stamina = 10000;
            
            ltilex = lastx;
            ltiley = lasty;
            
            const vertical = Gravity.direction % 2;
            
            let
                x = unit.vel.x ,
                y = unit.vel.y ;
            
            if(vertical && (Gravity.direction === 1 ? y > 0 : y < 0))
                y = 0;
            
            if(!vertical && (Gravity.direction === 0 ? x > 0 : x < 0))
                y = 0;
                    
            
            unit.vel.set(x,y);
        }
    }


    function updateGravity(){
        
        const offset = directToOffset(Gravity.direction);
        
        unit.vel.add(
            Gravity.strength * offset[0] ,
            Gravity.strength * offset[1] 
        );
    }





    function gravipad(unit){
        if(unitOn(unit,Blocks.conveyor))
            Gravity.direction = tileAt(lastx,lasty).build.rotation;
    }


    

    


    function gravityCenter(){
        
        if(onfloor || hold)
            return;

        const coordinates = [];
        let nolock = false;

        for(let y = -15;y < 16;y++)
            for(let x = -15;x < 16;x++)
                if(blockAt(lastx + x,lasty + y) == Blocks.thoriumWall){
                    coordinates.push({ x : x , y : y });
                    nolock = true;
                }

        if(!nolock)
            return;
            
        const distances = [];

        for(let c = 0;c < coordinates.length;c++){
            
            const cord = coordinates[c];
            
            const distance = delta(
                cord.x , cord.y ,
                lastx , lasty
            );
            
            distances.push(distance);
        }

        let shortest = 0;
        
        for(let d = 0;d < distances.length;d++)
            if(distances[d] < distances[shortest])
                shortest = d;

        const
            x = coordinates[shortest].x ,
            y = coordinates[shortest].y ;
            
        const vertical = Gravity.direction % 2;
        
        const position = vertical
            ? y : x ;
            
        if(position === 0)
            return;
        
        unit.vel.add(
            ! vertical * Gravity.strength ,
              vertical * Gravity.strength
        );
        
        Gravity.direction = vertical + (position < 0) * 2;
    }


    function gelJump(unit){

        if(!unitNear(unit,Blocks.titaniumWall)){
            ajumpvel = 0;
            return;
        }
        
        const vertical = Gravity.direction % 2;
        
        
        const isSame = (vertical)
            ? ltiley == lasty
            : ltilex == lastx ;
        
        ajumpvel = (isSame)
            ? 15 : 0 ;
            
        if(isSame)
            return;
            
        jump(unit,bjumpvel + 15);
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
                jump(unit,bjumpvel + ajumpvel);
                stamina -= 100;
            }

            checkInteractables(unit);
            
            if(!hold && mode == 0)
                updateGravity();

        } catch(error) { exception(error) }

        letGo();
    }

    function player(){
        return Vars.player.unit()
    }

    function canWork(){
        return isEnabled && canParkour(player());
    }

    function tick(){
        
        if(!canWork())
            return;
            
        unit = player();
            
        update();
        updateFloor();

        if(hold || mode != 1)
            return;

        gravityCenter();
    }


    log('Running update task');


    Timer.schedule(tick,0,.02);

    Timer.schedule(updateHud,0,.1);

    log('Done initialisation of parkour-mod.');

}
