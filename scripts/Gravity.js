
module.exports = (() => {
    
    const { access } = require('JS');
    

    /*
     *  0 : →
     *  1 : ←
     *  2 : ↑
     *  3 : ↓
     */

    let 
        direction = 3 ,
        strength = .5 ;


    const Gravity = {};

    access(Gravity,{
        direction : () => direction ,
        strength : () => strength
    },{
        direction : (value) => direction = value,
        strength : (value) => strength = value
    });
    
    return Gravity;
    
})();
