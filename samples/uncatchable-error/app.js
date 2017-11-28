async function uncatchableException() {
    try {
        setTimeout(() => {
            throw new Error('error')
        })
    } catch (error) {
        console.log('catch error = ', error);  // never catch
    }
}

function rejectError() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('error');
        })
    })
}

async function catchableException() {
    try {
        let response = await rejectError();
    } catch (error) {
        console.log('catchableException catch error = ', error);    // catch error
        uncatchableException();
    }
}

catchableException();