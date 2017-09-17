/*
第4章 异步编程
4.1 函数式编程
在js中，函数是一等公民，函数编程是js异步编程的基础。
4.1.1 高阶函数
就是 参数或者返回值为函数的函数
高阶函数有：forEach、map、reduce等
4.1.2 偏函数用法
通过指定部分参数来产生一个新的定制函数的形式就是偏函数
4.2 异步编程的优势和难点
4.2.1 优势
基于事件驱动的非阻塞IO。有主线程和事件池，监听者负责不断的向事件池中添加回调函数，主线程负责不断的拿函数进行执行，例如
fs.read(),执行完之后，主线程就接着执行后面的事件回调了，等到fs.complete触发时，就会往事件池中添加回调函数，然后就可以执行了。
主线程一刻没闲着，即基于事件的非阻塞IO
4.2.2 难点 
1.异常处理
需要将异常传给用户的回调
2.函数嵌套过深
由于下一步的操作依赖于上一步处理的结果，所以，函数会嵌套很深。
3.阻塞代码
？？？
4.多线程编程
利用node进行多线程编程
5.异步转同步
4.3 异步编程解决方案
解决方案有以下3种
事件发布／订阅模式
Promise/Deferred模式
流程控制库
4.3.1 事件发布／订阅模式
node对事件发布订阅的机制做了一些额外的处理。
》如果对一个事件添加了超过10个侦听器，将会得到一些警告
》发射事件的对象对error事件进行了特殊处理
1.继承events模块 例子
在NOde提供的核心模块中，有近半数都继承自EventEmitter。
2.利用事件队列解决雪崩问题
雪崩问题：高访问量、大并发量的情况下，缓存失效，此时大量的请求涌入数据库，数据库无法同时承受如此大的查询请求，从而影响到
网站的响应速度。例子
3.多异步之间的协作方案
应用场景：需要发送多个异步请求，最后的操作要依赖这些异步请求的结果。也就是说，多个异步请求必须全部完成之后，才能执行
下一步的操作。
可以使用事件的发布订阅完成，每完成一个请求，就发射一个done事件，监听done事件的观察者，会保存done的次数和每次请求完成
返回的结果。等到所有依赖的异步请求都done后，就执行下一步的操作，例子。
4.EventProxy的原理
5.EventProxy的异常处理
4.3.2 Promise/Deferred模式
如果是发布订阅的运行机制，那么应该如下写，例子
先执行异步调用，延迟传递处理，例子
1.Promises/A
Promise/Deferred包括2部分，即Promise和Deferred。
PromiseA提议对单个异步操作做出如下抽象定义
＊Promise操作只会处在3种状态的一种，未完成态、完成态度、失败态。
＊状态只能从未完成态到完成态或者失败态转换，不能逆转
＊状态一旦转化，不能逆转
根据以上提议，一个Promise对象只要具备then方法即可，但是对于then方法，有以下简单的要求。
＊接受完成态或者失败态的回调函数，如果状态由未完成态转化为失败态或者完成态，会调用相应的方法
＊可选的支持progress事件回调作为第三个方法
＊then方法只接受function对象，其余对象将被忽略
＊then方法继续返回Promise对象，以实现链式调用。
promiseA的实现，例子
一个Promise对象，一个Deferred对象
Q模块是Promises/A规范的一个实现，
2.Promise中的多异步协作
3.Promise的进阶知识
支持序列执行的promise
将API promise化
研究下q怎么用
4.3.3 流程控制库
事件发布/订阅模式和 promise/Deferred模式，都是种编程模式
1.尾触发和next
尾触发：需要手工调用才能持续执行后续调用的一类方法。常见的关键词是next。尾部触发目前应用最多的地方是Connect的
中间件。
注册中间件就是将中间件代码放入队列中，next方法作用是将队列中的中间件取出并执行。
2 async
最知名的流程控制模块，async，长期占据npm依赖榜的第三名。模块提供了20多个方法用于处理异步的各种协作模式。以下为
几种典型用法。
＊异步的串行执行, 例子 async.series方法
＊异步的并行执行， 例子 async.parallel方法
＊异步调用的依赖处理，例子 async.waterfall
* 自动依赖处理，aync.auto方法，根据依赖关系自动分析，以最佳的顺序执行以上业务。
3.Step
另一个知名的流程控制库是step
4.wind
思路完全不同的异步编程方案 wind
4.4 异步并发控制
用异步实现并发很容易，但是，也要适当控制，防止过于压榨底层系统的性能。
4.4.1 bagpipe的解决方案
对既有的异步API添加过载保护，
4.4.2 aync的解决方案
因为人们总是习惯性的以线性的方式思考，以致异步编程相对较为难以掌握，这个世界以异步运行的本质，不会因为大家线性思维的惯性
而改变。
事件、Promise/Deferred模式，流程控制库
*/
// 利用发布订阅模式来处理业务
var events = require("events");
function stream(){
    events.EventEmitter.call(this);
}
util.inherits(stream, events.EventEmitter);

//事件队列解决雪崩问题
var proxy = new events.EventEmitter();
var status = "ready";
var select = function (callback) {
    proxy.once("selected", callback);
    if(status === "ready") {
        status = "pending";
        db.select("SQL", function (results) {
            proxy.emit("selected", results);
            status = "ready";
        })
    }
}

// 多个异步请求，promise的fail success，具体是什么？？？，其实是监听事件？？？
//promise就是异步函数的包装，用来处理异步请求，处理异步请求，不就是监听事件吗。
var after = function (times, callback) {
    var count = 0, results = {};
    return function (key, value) {
        results[key] = value;
        count++;
        if(conut == times) {
            callback(results);
        }
    }
};
var emitter = new events.Emitter();
var done = after(times, render);
emitter.on("done", done);
fs.readFile(template_path, "utf-8", function (err, template) {
    emitter.on("done", "template", template);
});
db.query(sql, function (err, data) {
    emitter.on("done", "data", data);
});

//如果是发布订阅的运行机制，那么应该如下写，例子
$.get('/api', {
    success: onSuccess,
    error: onError,
    complete: onComplete
});
// 先执行异步调用，延迟传递处理，例子
$.get("/api")
    .success(onSuccess)
    .error(onError)
    .complete(onComplete);
// 在原始的api中，一个事件只能处理一个回调，而通过Deffered对象，可以对事件加入任意的业务处理逻辑
$.get("/api")
    .success(onSuccess1)
    .success(onSuccess2);

// promiseA的实现，例子
var promisify = function (res) {
    var deferred = new Deferred();
    var result = " ";
    res.on('data', function (chunk) {
        result += chunk;
        deferred.progress(chunk);
    });
    res.on('end', function () {
        deferred.resolve(result);
    });
    res.on('error', function () {
        deferred.reject(err);
    });
    return deferred.promise;
}

var Deferred = function () {
    this.state = 'unfulfilled';
    this.promise = new Promise();
}
Deferred.prototype.resolve = function (obj) {
    this.state = 'fulfilled';
    this.promise.emit('success', obj);
}
Deferred.prototype.reject = function (err) {
    this.state = 'failed';
    this.promise.emit('error', err);
}
Deferred.prototype.progress = function (data) {
    this.promise.emit('progress', data);
}

var Promise = function () {
    EventEmitter.call (this);
};
util.inherits(Promise, EventEmitter);
Promise.prototype.then = function (fulfilledHandler, errorHandler, progressHandler) {
    if (typeof fulfilledHandler == "function") {
        this.once('success', fulfilledHandler);
    }
    if (typeof errorHandler == "function") {
        this.once('error', errorHandler);
    }
    if (typeof progressHandler == "function") {
        this.once('progress', progressHandler);
    }
}

