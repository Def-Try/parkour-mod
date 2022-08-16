
module.exports = (() => {

    /*
     *  0 : Right
     *  1 : Up
     *  2 : Left
     *  3 : Down
     */

    let direction = 3;


    let strength = .5;


    const Gravity = {};


    Gravity.__defineGetter__('direction',() => direction);
    Gravity.__defineGetter__('strength',() => strength);

    Gravity.__defineSetter__('direction',(value) => direction = value);
    Gravity.__defineSetter__('strength',(value) => strength = value);
    
    
    return Gravity;
    
})();
