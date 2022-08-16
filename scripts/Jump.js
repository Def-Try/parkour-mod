
(() => {
    
    const { debug } = require('Logger');
    const Gravity = require('Gravity');
    
    
    const offsets = [
        [ -1 ,  0 ] ,
        [  0 , -1 ] ,
        [ +1 ,  0 ] ,
        [  0 , +1 ]
    ]

    function jump(unit,velocity){
        
        debug('Jumped:',velocity);
        
        const offset = offsets[Gravity.direction];
        
        unit.vel.add(
            velocity * offset[0] ,
            velocity * offset[1]
        );
    }
    
    
    exports.jump = jump;

})();
