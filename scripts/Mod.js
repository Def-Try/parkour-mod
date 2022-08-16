
module.exports = (() => {
    
    const { log , object } = require('Logger');
    const Player = require('Player');


    /*
     *  Gravity
     *  0 : Downwards
     *  1 : Central 
     */

    let mode = 0;
    
    let enabled = false;
    const listeners_onToggle = new Set;
    

    function inParkour(){
        return mode === 0;
    }
    
    function onPlanet(){
        return mode === 1;
    }
    
    function toggle(){

        const unit = Player.unit();
        
        if(!unit || unit.type.flying){
            Vars.ui.announce('You cannot use parkour mode inside of a flying unit.');
            return;
        }
        
        enabled = ! enabled;

        listeners_onToggle.forEach((listener) => listener());
    }
    
    function toggleMode(){
        
        if(onPlanet())
            return parkour();
        
        Vars.ui.showCustomConfirm(
            'IN DEVELOPMENT!' ,
            'You trying to select [accent]Planet[] mode, but it is still buggy and in very development.' ,
            'Turn this thing on!' ,
            'Back' ,
            planet,
            () => {}
        );
    }
    
    function parkour(){
        mode = 0;
        Vars.ui.announce('Parkour Mode');
    }
    
    function planet(){
        mode = 1;
        Vars.ui.announce('Planet mode');
    }
    
    
    function onToggle(listener){
        listeners_onToggle.add(listener);
    }
    
    function downwardGravity(){
        return mode === 0;
    }


    const Mod = {
        toggleMode : toggleMode ,
        inParkour : inParkour ,
        onPlanet : onPlanet ,
        parkour : parkour ,
        toggle : toggle ,
        planet : planet ,
        onToggle : onToggle ,
        downwardGravity : downwardGravity
    }
    
    Mod.__defineGetter__('mode',() => mode);
    Mod.__defineGetter__('enabled',() => enabled);
    
    Mod.__defineSetter__('mode',(value) => mode = value);
    Mod.__defineSetter__('enabled',(value) => enabled = value);
    
    return Mod;
    
})();
