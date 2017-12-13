function longWaitA() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('response A');
        }, 2000); // wait 2s
    });
}

function longWaitB() {
    return new Promise((resolve) => {
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
        console.log('caught error in function asyncFunction = ', e);
    }
}

function promiseFunction() {
    Promise.all([longWaitA(), longWaitB()])
      .then((results) => {
        console.log('promise get response = ', results); // total need 2s
      })
      .catch((e) => {
          console.log('caught error in function promiseFunction = ', e);
      });
}

console.log('Sample to show: Your logic would stop to wait when you use keyword "await"');
asyncFunction().then(_ => _);
promiseFunction();