/*
第二章 模块机制
社区为js制定了相应的规范，其中，commonjs规范的提出算是最为重要的里程碑。
2.1 commonjs规范
commonjs为js制定了一个美好的愿景，希望js能够在任何地方运行。
2.1.1 commonjs的出发点
前端js有很多规范，但是后端js规范很落后。对于js自身而言，它的规范有以下缺陷
i）没有模块系统
i）标准库较少，没有文件系统、io流等常见api
i）没有标准接口：没有定义过web服务器或者数据库之类的标准统一接口
i）缺乏包管理系统
CommonJS规范的提出，主要是为了弥补当前js没有标准的缺陷，以达到像python、ruby和java具备开发大型应用的基础能力
而不是停留在小脚本程序的阶段，他们期望那些用commonjs api写出的应用可以具备跨宿主环境执行的能力，这样不仅可以利用js
开发富客户端应用，还可以编写以下应用：
i）服务器端js应用程序
i）命令行工具
i）桌面图形界面应用程序
i）混合应用
规范涵盖了模块、二进制、Buffer、字符集编码、IO流、进程环境、文件系统、套接字、单元测试、web服务器网关接口、
包管理等。
node和commonjs规范相互促进。
2.1.2 commonjs的模块规范
commonjs对模块的定义：i）模块引用 i）模块定义 i）模块标示
i）模块引用
var math = require("math")
i) 模块定义
exports.add = function(){
    
}
将方法挂载在exports对象上
i）模块标识
每个模块有独立的空间，它们互不干扰。
2.2 node的模块实现
node在实现中并非完全按照规范实现，而是对模块规范进行了一定的取舍，同时也增加了少许自身需要的特性。在node中引入
模块需要经历如下3个步骤：
i）路径分析
i）文件定位
i）编译执行
核心模块部分在源代码的编译过程中，编译进了二进制执行文件。在node进程启动时，部分核心模块就被直接加载进内存中，所以，
这部分核心模块在引入时，文件定位和编译执行这两个步骤可以省略掉，并且在路径分析中优先判断，所以，它的加载速度是最快
的
文件模块则是在运行时动态加载，需要完整的路径分析、文件定位和编译执行过程，速度比核心模块慢。
2.2.1 优先从缓存加载
node对引入的模块都会进行缓存，以减少二次引用时的开销，不同点在于，浏览器仅仅缓存文件，node缓存编译执行后的对象，
require方法优先从缓存中加载模块。
2.2.2 路径分析和文件定位
1）模块标识符分析
模块标识符分为以下几类
ii）核心模块：如http、fs、path等
ii）.或者..开始的相对路径文件模块
ii）以/开始的绝对路径文件模块
ii）非路径形式的文件模块，如自定义的connect模块
》核心模块
核心模块的优先级仅次于缓存加载，在node的源代码编译中，已经编译为二进制代码，加载过程最快。
》路径形式的文件模块
以. .. /开头的标识符，都被当做文件模块来处理，在分析文件模块时，requier方法会将路径转为真实路径，并以真实路径
作为索引，将编译执行后的结果放入缓存中，以使得二次加载时更快。加载速度慢于核心模块。
》自定义模块
不懂》》》
模块路径的生成规则？？？文件的路径越深、模块查找耗时就越多。
2）文件定位
从缓存加载的优化策略使得二次引入时不需要路径分析、文件定位和编译执行的过程。
》文件拓展名分析
require在分析标识符的过程中，会出现标识符中不包含文件拓展名的情况，node会按照.js、.json、.node的次序依次补足
拓展名。依次尝试，所以，如果是node或者json的拓展名，在传递给require时带上拓展名，会加快速度。
》目录分析和包
2.2.3 模块编译
在node中，每个文件模块都是一个对象，定义如下：
function Module(id, parent){
    this.id = id;
    this.exports = {};
    this.parent = parent;
    if(parent && parent.children){
        parent.children.push(this);
    }
    this.filename = null;
    this.loaded = false;
    this.children = [];
}
定位到具体的文件后，就要根据路径载入并编译，对于不同的文件拓展名，载入方法也有所不同
i）js文件：通过fs模块，同步读取文件后编译执行
ii）node文件：用c/c++编写的拓展文件，通过dlopen方法加载最后编译生成的文件
iii）json文件，通过fs模块同步读取文件后，用JSON.parse解析返回结果
其余拓展名文件，按照js文件载入
载入之后，就要编译了
i）js模块的编译，每个模块文件中存在require、exports、module这3个变量，怎么来的呢，编译过程中，node对获取的js文件
内容进行头尾包装，一个正常的js文件包裹成如下
(function (exports, require, module, __filename, __dirname){
    var math = require('math');
    exports.area = function(radius){
        return Math.PI * radius * radius;
    }
});
这样每个模块文件之间都进行了作用域隔离。包装之后的代码通过vm原生模块的runInThisContext方法执行，返回一个具体
的function对象，
存在两个exports对象，一个exports一个module.exports为啥没看懂
i）c＋＋模块的编译
不用编译，因为node文件是c＋＋编译生成的，所以只有加载和执行的过程，
i）json文件
利用fs模块同步读取json文件，然后调用JSON.parse得到对象，然后将它赋值给模块对象的exports
2.3 核心模块
2.3.1 js核心模块的编译过程

*/