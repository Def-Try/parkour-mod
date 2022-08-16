
module.exports = (() => {
    
    const { debug } = require('Logger');
    const Jump = require('Jump');


    let
        bjumpvel = 15 ,
        ajumpvel = 0 ,
        holding = false ,
        onfloor = false , 
        stamina = 10000 ;
        
    let x , y ;

        
    function toggleHold(){
        
        debug('Holding:',holding);
        
        holding = ! holding;
    }
    
    function jump(){
        
        debug('Pressed Jump')
        
        if(stamina < 100)
            return;
            
        if(!onfloor)
            return;
        
        Jump.jump(unit(),bjumpvel + ajumpvel); 

        stamina -= 100;
    }
    
    function unit(){
        return Vars.player.unit();
    }
    
    function hasStamina(){
        return stamina > 99;
    }
    
    function updatePosition(){
        
        const player = unit();
        
        x = player.tileX();
        y = player.tileY();
    }

    function canParkour(){

        const player = unit();

        return player && ! player.type.flying;
    }


    const Player = {
        updatePosition : updatePosition ,
        hasStamina : hasStamina ,
        toggleHold : toggleHold ,
        unit : unit ,
        jump : jump ,
        canParkour : canParkour
    }
    
    Player.__defineGetter__('bjumpvel',() => bjumpvel);
    Player.__defineGetter__('ajumpvel',() => ajumpvel);
    Player.__defineGetter__('holding',() => holding);
    Player.__defineGetter__('onfloor',() => onfloor);
    Player.__defineGetter__('stamina',() => stamina);
    
    Player.__defineSetter__('bjumpvel',(value) => bjumpvel = value);
    Player.__defineSetter__('ajumpvel',(value) => ajumpvel = value);
    Player.__defineSetter__('holding',(value) => holding = value);
    Player.__defineSetter__('onfloor',(value) => onfloor = value);
    Player.__defineSetter__('stamina',(value) => stamina = value);
    
    
    return Player;
    
})();
