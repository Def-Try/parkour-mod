

function logError(error){
    Log.err(
        '[  Ｐａｒｋｏｕｒ　Ｍｏｄ  ]\n\n' + 
        error.message + 
        '\n\n' + 
        error.stack + 
        '\n'
    );
}




exports = { 
    logError : logError
}
