

module.exports = (() => {

    function get(object,getters){
        
        for(let name in getters)
            object.__defineGetter__(name,getters[name]);
    }
    
    function set(object,setters){
    
        for(let name in setters)
            object.__defineSetter__(name,setters[name]);
    }
    
    function access(object,getters,setters){
        get(object,getters);
        set(object,setters);
    }
    
    
    return {
        access : access ,
        get : get ,
        set : set
    };
})();
