

module.exports = this._Interface || init(this);


function init(global){

    const { button , table } = require('UI');
    const { log , object } = require('Logger');
    
    const Player = require('Player');
    const Debug = require('Debug');
    const Mod = require('Mod');
    
    
    const onMobile = 
        Vars.mobile || Debug;
        
    let 
        button_enable ,
        label_stamina ;
    
    
    function build(){

        log('Building UI');

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
            click : Mod.toggle
        });
    }

    function buildSubMenu(){
        
        const menu = table();
        menu.visibility = () => Mod.enabled;
        
        button({
            menu : menu ,
            name : 'Change Mode' ,
            click : Mod.toggleMode
        });

        if(onMobile)
            button({
                menu : menu ,
                name : 'Jump' ,
                click : Player.jump
            });
            
        button({
            menu : menu ,
            name : 'Hold' ,
            click : Player.toggleHold
        });
    }


    function buildStaminaMenu(){
        
        log('Builing Stamina Menu')
        
        const menu_stamina = new Table()
            .left()
            .bottom();
            
        menu_stamina.visibility = () => Mod.enabled;
        menu_stamina.y = 400;
        
        label_stamina = Label('');
        label_stamina.setStyle(Styles.outlineLabel);
        
        menu_stamina.add(label_stamina)
        .size(150,75)
        .padLeft(6);
            
        Vars.ui.hudGroup.addChild(menu_stamina);
    }
    
    
    function updateEnableButton(){
        
        const action = (Mod.enabled)
            ? 'Disable' 
            : 'Enable' ;
        
        button_enable.setText(action + 'Parkour Mode');
    }
    
    function updateStamina(){
        
        const percent = Math.round(Player.stamina / 100);
        
        label_stamina.setText('Stamina: ' + percent + '%');
    }


    const Interface = {
        updateEnableButton : updateEnableButton ,
        updateStamina : updateStamina ,
        build : build ,
        test : 1
    }

    log('Int',object(Interface));

    return global._Interface = Interface;
}
