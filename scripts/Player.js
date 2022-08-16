
module.exports = (() => {
    
    const { access } = require('JS');
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
        canParkour : canParkour ,
        unit : unit ,
        jump : jump
    }
    
    access(Player,{
        bjumpvel : () => bjumpvel ,
        ajumpvel : () => ajumpvel ,
        holding : () => holding ,
        onfloor : () => onfloor ,
        stamina : () => stamina
    },{
        bjumpvel : (value) => bjumpvel = value ,
        ajumpvel : (value) => ajumpvel = value ,
        holding : (value) => holding = value ,
        onfloor : (value) => onfloor = value ,
        stamina : (value) => stamina = value
    })
    
    
    return Player;
    
})();
