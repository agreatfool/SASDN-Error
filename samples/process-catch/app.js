// 捕获 error
process.on('uncaughtException',  (error)  =>  {
    console.log('process on uncaughtException error = ', error);
});

// 捕获 reject   
process.on('unhandledRejection',  (error)  =>  {
    console.log('process on unhandledRejection error = ', error);
});

async function throwException() {
    try {
        setTimeout(() => {
            throw new Error('error from function throwException');
        }, 1);
    } catch (error) {
        console.log('caught error in throwException: ', error); // never caught
    }
}

async function throwRejection() {
    try {
       setTimeout(() => {
           return Promise.reject('rejected from function throwRejection');
       }, 1);
    } catch (error) {
        console.log('caught error in throwRejection: ', error);  // never caught
    }
}

throwException().then(_ => _);
throwRejection().then(_ => _);