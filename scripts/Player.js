
module.exports = (() => {
    
    const global = this;
    

    if(global.Player)
        return global.Player;
        

    /*
     *  0 : Right
     *  1 : Up
     *  2 : Left
     *  3 : Down
     */

    let direction = 3;


    let strength = .5;


    const Player = {};


    Gravity.__defineGetter__('direction',() => direction);
    Gravity.__defineGetter__('strength',() => strength);

    Gravity.__defineSetter__('direction',(value) => direction = value);
    Gravity.__defineSetter__('strength',(value) => strength = value);


    return global.Player = Player;

})();
