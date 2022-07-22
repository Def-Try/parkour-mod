
(() => {
    
    function table(){
        
        const table = new Table()
            .bottom()
            .left();
            
        Vars.ui.hudGroup.addChild(table);
        
        return table;
    }

    function button(options){
        
        const { menu , name , click } = options;
        
        const button = TextButton(name);
        
        menu
        .add(button)
        .size(150,75)
        .padLeft(6);
        
        button.clicked(click);
        
        return button;
    }


    exports.button = button;
    exports.table = table;
    
})();
