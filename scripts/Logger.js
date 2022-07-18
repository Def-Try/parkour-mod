

function logError(error){
    Log.err(
        '[  Ｐａｒｋｏｕｒ　Ｍｏｄ  ]\n\n' + 
        error.message + 
        '\n\n' + 
        error.stack + 
        '\n'
    );
}


function info(values){
    Log.info(values.join('\n'));
}



exports.logError = logError;
exports.info = info;
