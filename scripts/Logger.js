
(() => {
    
    const Debug = require('Debug');
    
    
    function exception(error){
        Log.err(
            '[  Ｐａｒｋｏｕｒ　Ｍｏｄ  ]\n\n' + 
            error.message + 
            '\n\n' + 
            error.stack + 
            '\n'
        );
    }


    function parse(values){
        
        let value;

        while(!(value = values.pop()))
            continue;

        values.push(value); 
        
        return values.join(' ');
    }

    function debug(a,b,c,d,e,f){
        debugText(parse([ a , b , c , d , e , f ]));
    }

    function log(a,b,c,d,e,f){
        logText(parse([ a , b , c , d , e , f ]));
    }
    
    function debugText(text){
        print('[#dfb317] Parkour  [#DDDDDD]' + text);
    }
    
    function logText(text){
        print('[#1e8cbe] Parkour  [#DDDDDD]' + text);
    }

    function print(text){
        Log.log(Log.LogLevel.none,text);
    }



    function valueToString(key,value,depth){
        
        switch(typeof value){
        default:
            return 'Unknown Type : ' + typeof value;
        case 'undefined':
        case 'string':
        case 'number':
            return key + ' : ' + value;
        case 'object':
            return layer(value,depth - 1);
        case 'array':
            return value.join(' : ');
        case 'function':
            return key + '()';
        }
    }

    function layer(object,depth,string){
        
        string = string || '';
        
        if(depth > 0)
            for(let key in object.prototype)
                string += '\n' + valueToString(key,object[key],depth);
            
        return string;
    }

    function object(object,depth){
        return layer(object,depth || 1);
    }


    exports.exception = exception;
    exports.log = log;
    
    exports.debug = Debug 
        ? debug 
        : () => {};
    
})();
