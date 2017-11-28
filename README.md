# SASDN-Error

---
Version Control
| Version | Date       | Author      | Change Description |
| ------- | ---------- | ----------- | ------------------ |
| 1.0     | 28/11/2017 | Shen YiQian | Document created   |

---
[TOC]
---

## 1. 文档说明

为了规范和统一今后代码中对于异步错误处理的逻辑以及编写异常输出的格式。故在此文档中进行说明。

## 2. 环境说明

Nodejs > 7.6
Typescript > 1.7

## 3. 异步异常处理

我们这里主要介绍两种方式`Promise`和`async/await`，Node之前使用的`callback`已经逐渐淘汰，故在这里不再进行说明。

### 3.1 Promise(ES6)

ES6原生支持的`Promise`是我们在Node中经常会使用到的链式调用方式，通常我们的错误处理方式看上去是这样的：

```
promiseFunction()
  .then((_) => {
    console.log(_);
  })
  .catch((e) => {
    console.log('catch error = ', e);
  })
```

### 3.2 async/await(ES7)

ES7中支持的`async/await`新特性可以让我们编写异步代码时变得像同步一样，我们在`async/await`中使用`try/catch`来进行错误处理，类似：

```
async function errorCatch {
  try {
    let response = await promiseFunction();
    console.log('get response = ', response);
  } catch(e) {
    console.log('catch error = ', e);
  }
}
```

### 3.3 无法捕获的错误

假设我们已经将`Promise`中的catch也处理了，同时将`async/await`中也用`try/catch`包裹住了，那是否就没有漏网之鱼了呢？我们来看看下面的代码：

```
async function throwException() {
    try {
       setTimeout(() => {
           throw new Error('error')
       }) 
    } catch (error) {
        console.log('catch error = ', error);  // never catch
    }
}

throwException();
```
上面的方法我们是无法catch住这个错误的，由于`try/catch`只能捕获当前调用栈的错误，所以如果抛出一个异步错误，我们用`try/catch`就无法捕获了。那我们如何进行调整呢？

```
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
    }
}
```
这样我们就能抓到这个异常了。由于`async/await`的特性，他将`reject`的错误放在了当前调用栈的末尾，所以肯定能够捕获到错误，所以我们以后的编码中要避免使用在异步中直接`throw Error`的方式，改用`reject`。 详细可以参考`samples/uncatchable-error`中的例子。

### 3.4 第三方包中的雷

我们可以规范自己的代码，但是我们无法保证我们引用的第三方包中是否会有这样的地雷，那么如何进行避免呢？

```
// 捕获 error
process.on('uncaughtException',  (error)  =>  {
    console.log('uncaughtException error = ', error);
})   
// 捕获 reject
process.on('unhandledRejection',  (error)  =>  {
    console.log('unhandledRejection error = ', error);
})
```

我们可以通过调用这两个系统级的监听进行未捕获异常的抓取，我们可以在index.js中监听并进行抓取。详细可以参考`samples/process-catch`中的例子。


## 4. 正确选择

在ES7之后我们大量的使用`async/await`方式处理异步操作，因为这会让我们的代码可读性变得更好，使编程思路更趋向正常思维，看上去十分美好，但是我们也需要深入的理解`async/await`的原理，用简单的话来说，当执行`async`方法时，每次碰到`await`调用，Node都会将方法暂停，等待调用结束再继续后续的操作。所以我们应当知道何时使用`async/await`何时使用`Promise`。

下面用两个例子来说明：

### 4.1 fetch

例如`fetch`方法中获得返回后内部提供的`json()`方法，此方法返回一个promise类型，我们可以通过`.then`链式方式将返回的内容转换成json对象。但是这样我们处理函数看上去就像这样：

```
fetch('gateway.shinezone.com/v1/user/login')
  .then((response) => {
    response.json()
      .then((jsonObject) => {
        //do domething
      })
      .catch((e) => {
        console.log('catch error = ', e);
      })
  })
  .catch((e) => {
    console.log('catch error = ', e);
  })
```

我们可以看到，首先代码可读性很差，其次本可以通用的错误处理在每个链式调用中都需要单独处理。而使用`async/await`的话代码看上去就像这样：

```
async function fetchUrl(url) {
  try {
    let response = await fetch(url);
    let jsonObject = await response.json();
    // do someting
  } catch(e) {
    console.log('catch error = ', e);
  }
}
```

具体可以参考`samples/sample-promise`中的例子。

整个代码看起来简洁明了，对于代码阅读者来说很容易理解。但是是否我们所有应当将所有的异步处理都使用这种方式呢？我们来看下面的例子。

### 4.2 setTimeout

假设我们有两个函数，都需要一个很长的调用周期。例如：

```
function longWaitA() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('long return A');
    }, 3000); // 2s后执行
  });
}

function longWaitB() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('long return B');
    }, 1000); // 2s后执行
  });
}

async function getAll() {
  try {
    let A = await longWaitA();    // need wait 2s
    let B = await longWaitB();    // need wait 2s
    console.log('A = ' + A + ' B = ' + B);  // get all response after 4s!!!
  } catch(e) {
    console.log('catch error = ', e);
  }
}

```

我们总共需要4s才能获取到我们所需要的数据，这在通常意义上来说已经是一个延迟非常高的操作了。但是如果我们改用`Promise`的话会是什么结果呢？

```
function longWaitA() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('long return A');
    }, 3000); // 2s后执行
  });
}

function longWaitB() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('long return B');
    }, 1000); // 2s后执行
  });
}

function getAll() {
  Promise.all([longWaitA(), longWaitB()])
    .then((result) => {
      console.log('get result = ', result);  // get all response after 2s
    })
    .catch((e) => {
      console.log('catch error = ', e);
    })
}
```

使用`Promise.all`之后我们发现两个异步操作同时执行了，总体耗时只需要2秒。

具体可以参考`samples/sample-async`中的例子。

## 5. 总结

经过了上述的例子，如何选择使用`async/await`或者`Promise`思路基本如下：
1. 方法调用之间有着前后需求的关系，比如上一个方法的返回值是下一个方法的入参。使用`async/await`来进行处理。
2. 可以同时进行，互相之间没有任何业务牵扯，最终只需要取得返回值再进行处理的，可以使用`Promise.all`方法进行封装后，再合并入需要的`async/await`中去。

## 6. Error规范

### 6.1 ErrorCode定义

ErrorCode是前后端对于错误的约定。后端处理异常之后通过返回ErrorCode告知前端异常原因，而前端将ErrorCode转译为用户可以识别的提示语或者错误表现告知使用者。所以需要定义一个规范来确保在多人共同维护一张ErrorCode表的时候应该如何进行定义。

为了方便解析，我们使用百万位整形来标识一个ErrorCode

-  百万位表示级别，现有定义为
  > 1= **框架**
  > 2= **微服务**
  > 3= **应用**
  >
  > ...

- 十万、万、千位表示具体微服务或者应用，例如微服务已有以下这些：
  > 001 = MS-User
  > 002 = MS-Game
  > 003 = MS-Auth
  > ...

- 个、十、百位表示具体定义的ErrorCode，假设用户未找到为001，那么对于用户微服务的ErrorCode就为**2001001**

