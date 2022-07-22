
module.exports = this._Mod || init(this);


function init(global){

    const { log , object } = require('Logger');
    const Interface = require('Interface');
    const Player = require('Player');

    log('Interface:',object(Interface));
    
    
    /*
     *  Gravity
     *  0 : Downwards
     *  1 : Central 
     */

    let mode = 0;
    
    let enabled = false;
    

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

        Interface.updateEnableButton();
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


    const Mod = {
        toggleMode : toggleMode ,
        inParkour : inParkour ,
        onPlanet : onPlanet ,
        parkour : parkour ,
        toggle : toggle ,
        planet : planet
    }
    
    Mod.__defineGetter__('mode',() => mode);
    Mod.__defineGetter__('enabled',() => enabled);
    
    Mod.__defineSetter__('mode',(value) => mode = value);
    Mod.__defineSetter__('enabled',(value) => enabled = value);
    
    
    return global._Mod = Mod;
}
