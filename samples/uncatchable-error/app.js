async function uncatchableError() {
    try {
        setTimeout(() => {
            throw new Error('error');
        }, 1);
    } catch (error) {
        console.log('catch error = ', error);  // never catch
    }
}

function rejectError() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('async error in function rejectError'));
        }, 1);
    })
}

async function catchableError() {
    try {
        let response = await rejectError();
    } catch (error) {
        console.log('caught error in function catchableError = ', error);    // catch error
    }
}

catchableError();

async function main() {
    await catchableError();
    console.log('....');
    await uncatchableError();
}

main().then(_ => _);