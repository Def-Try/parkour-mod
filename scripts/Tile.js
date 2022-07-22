

(() => {
    
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


    exports.blockAt = blockAt;
    exports.tileAt = tileAt;
    exports.tileIs = tileIs;
    
})();
