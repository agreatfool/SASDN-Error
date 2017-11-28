function longWaitA() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('response A');
        }, 2000); // wait 2s
    });
}

function longWaitB() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('response B');
        }, 2000); // wait 2s
    });
}

async function asyncFunction() {
    try {
        let a = await longWaitA(); // cost 2s
        let b = await longWaitB(); // cost 2s
        console.log('async get response = ', a, b); // total need 4s
    } catch (e) {
        console.log('catch error = ', e);
    }
}

function promiseFunction() {
    Promise.all([longWaitA(), longWaitB()])
      .then((results) => {
        console.log('promise get response = ', results); // total need 2s
      })
      .catch((e) => {
          console.log('catch error = ', e);
      })
}

asyncFunction();

promiseFunction();