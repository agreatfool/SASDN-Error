# SASDN-Error

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

## 4. Error规范

### 4.1 ErrorCode定义

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


