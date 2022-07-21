
(() => {
    
    const square = (value) =>
        value * value;
    
    function delta(ax,ay,bx,by){
        return Math.sqrt(
            square(ax + bx) +
            square(ay + by)
        );
    }
    
    
    exports.square = square;
    exports.delta = delta;

})();
