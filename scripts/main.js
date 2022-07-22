/*
 *  Original code had been written by Deftry, ADI and TheEE
 */

(() => {

    const { blockAt , tileIs , tileAt } = require('Tile');
    const { exception , log , debug } = require('Logger');
    const Interface = require('Interface');
    const { delta } = require('Math');
    const { jump } = require('Jump');
    const Gravity = require('Gravity');
    const Player = require('Player');
    const Debug = require('Debug');
    const Mod = require('Mod');


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
    
    function unitNear(unit,type){
        return relativeBlock() == type;
    }
    


    Events.on(ClientLoadEvent,Interface.build);


    log('Loading variables');

    
    let lastx;
    let lasty;
    let ltilex;
    let ltiley;
    let unit;


    let hold = false;


    function holdOn(){
        hold = true;
    }

    function letGo(){
        hold = false;
    }


    log('Loading main content');




    function unitOn(unit,type){
        return tileIs(unit.tileX(),unit.tileY(),type);
    }

    



    function updateHud(){
        
        if(!canWork())
            return;
        
        Interface.updateStamina();
    }


    const updateFloor = () => {
        
        Player.onfloor = isFloorSolid();
        
        if(Player.onfloor){
            
            Player.stamina += 100;
            
            if(Player.stamina > 10000)
                Player.stamina = 10000;
            
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
        
        if(Player.onfloor || hold)
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
            Player.ajumpvel = 0;
            return;
        }
        
        const vertical = Gravity.direction % 2;
        
        
        const isSame = (vertical)
            ? ltiley == lasty
            : ltilex == lastx ;
        
        Player.ajumpvel = (isSame)
            ? 15 : 0 ;
            
        if(isSame)
            return;
            
        jump(unit,Player.bjumpvel + 15);
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
        
                if(!Core.input.keyTab(Binding.pause))
                    continue;
                
                if(!Player.hasStamina())
                    continue;
                
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
        
        if(!Player.holding)
            return;
            
        if(!Player.hasStamina()){
            letGo();
            return;
        }
        
        if(nextToAnyBlock()){
            holdOn();
            Player.stamina -= 10;
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
        
        unit = Player.unit();
        
        if(!Player.canParkour())
            return;
            
        try {
            
            Player.updatePosition();
            
            lastx = unit.tileX();
            lasty = unit.tileY();

            if(Core.input.keyTap(Binding.pause) && Player.hasStamina() && Player.onfloor){
                jump(unit,Player.bjumpvel + Player.ajumpvel);
                Player.stamina -= 100;
            }

            checkInteractables(unit);
            
            if(!hold && Mod.downwardGravity())
                updateGravity();

        } catch(error) { exception(error) }

        letGo();
    }

    function canWork(){
        return Mod.enabled && Player.canParkour();
    }

    function tick(){
        
        if(!canWork())
            return;
            
        unit = Player.unit();
            
        update();
        updateFloor();

        if(hold || Mod.downwardGravity())
            return;

        gravityCenter();
    }


    log('Starting schedulers');

    Timer.schedule(tick,0,.02);

    Timer.schedule(updateHud,0,.1);

    log('Finished setup');

})();
