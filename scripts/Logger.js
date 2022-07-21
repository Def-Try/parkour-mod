
(() => {
    
    function exception(error){
        Log.err(
            '[  Ｐａｒｋｏｕｒ　Ｍｏｄ  ]\n\n' + 
            error.message + 
            '\n\n' + 
            error.stack + 
            '\n'
        );
    }


    function log(a,b,c,d,e,f){

        const values = [ a , b , c , d , e , f ];

        let value;

        while(!(value = values.pop()))
            continue;

        values.push(value);    

        info(values);
    }

    function info(values){
        Log.log(Log.LogLevel.none,'[#1e8cbe] Parkour  [#DDDDDD]' + values.join(' '));
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
    exports.info = info;
    exports.log = log;
    
})();
