// 捕获 error
process.on('uncaughtException',  (error)  =>  {
    console.log('uncaughtException error = ', error);
})
// 捕获 reject   
process.on('unhandledRejection',  (error)  =>  {
    console.log('unhandledRejection error = ', error);
})

async function throwException() {
    try {
        setTimeout(() => {
            throw new Error('error')
        })
    } catch (error) {
        console.log('catch error = ', error);  // never catch
    }
}

async function throwRejection() {
    try {
       setTimeout(() => {
           Promise.reject('reject');
       }) 
    } catch (error) {
        console.log('catch error = ', error);  // never catch
    }
}

throwException();
throwRejection();