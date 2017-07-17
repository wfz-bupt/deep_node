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
核心模块分为用c＋＋编写的，和用js编写的2部分。
2.3.1 js核心模块的编译过程
1.转存为c＋＋代码
2.编译js核心模块
不太懂
2.3.2 c＋＋核心模块的编译过程
1.内建模块的组织形式
内建模块的内部结构定义如下：
struct node_module_struct{
    int version;
    void *dso_handle;
    const char *filename;
    void (*register_func)(v8::Handle<v8::Object> target);
    const char*modname;
}
Node的buffer、cryto、evals、fs、os等模块是部分通过c/c++编写的。
好处：被编译进二进制文件，一旦node开始执行，它们就被直接加载进内存中，直接执行。
2.内建模块的导出
在node的所有模块类型中，存在一种依赖层级关系，即文件模块依赖核心模块、核心模块依赖内建模块。内建模块可以将内部变量或者方法导出，
以供外部js核心模块调用。
2.3.3 核心模块的引入流程
2.3.4 编写核心模块
2.4 c/c＋＋扩展模块
js的一个典型的弱点是位运算，js中只有double类型的数据类型，在进行位运算时，需要将double转换为int
本节分析c／c＋＋拓展模块的编写、编译、加载、导出的过程。
2.4.1 前提条件
2.4.2 c／c＋＋扩展模块的编写
2.5 模块调用栈
文件模块、核心模块、内建模块、c／c＋＋拓展模块阐述之后，调用关系为：
c／c＋＋内建模块属于最底层的模块，属于核心模块，主要提供api给js核心模块和第三方文件模块，js核心模块主要功能：1，作为c／c＋＋
内建模块的封装层和乔阶层，供文件模块调用。2，纯粹的功能模块，不需要跟底层打交道。
2.6 包与npm
包和npm是将模块联系起来的一种机制。
commonjs的包规范的定义，由包结构和包描述文件2个部分组成。
2.6.1 包结构
完全符合commonjs规范的包目录应该包含如下文件：
package.json: 包描述文件
bin:用于存放可执行二进制文件的目录
lib：用于存放js的目录
doc：用于存放文档的目录
test：用于存放单元测试用例的代码
2.6.2 包描述文件与npm
npm的所有行为都与包文件描述文件的字段息息相关。commonjs为package.json定义了如下一些必需的字段。
i）name，包名，
i）description: 包简介
i）version：版本号
i）keywords：关键词
i）maintainers： 包维护者列表
i）contributors：贡献者列表
i）bugs
i）licenses：许可证列表
i）repositories：托管源代码的位置列表
i）dependencies：使用当前包需要依赖的包列表
除了必选字段外，还定义了一些可选字段
i）homepage，当前包的网站地址
i）os，操作系统支持列表
i）cpu，cpu架构的支持列表
i）engine：支持的js引擎列表
i）builtin：当前包是否内建在底层系统的标准组件
i）directories：包目录说明
i）implements：实现规范的列表，标志当前包实现了commonjs的哪些规范
i）scripts：脚本说明文件，被包管理器用来安装、编译、测试和卸载包。
在包描述文件的规范中，npm实际需要的字段主要有，name、version、description、keywords、repositories、author、bin、main
scripts、engines、dependencies、devDependencies
多了
i）author：
i）bin：一些包作者希望包可以作为命令行工具使用，配置好bin字段后，通过npm install，可以将脚本添加到执行路径中。
i）main：包的入口
i）devDependencies：只在开发时需要的依赖
2.6.3 npm常用功能
commonjs规范是理论，npm是其中的一种实践，借助npm，node与第三方模块之间形成一个
很好的生态系统。npm还有一些巧妙的用法
1.查看帮助
npm
2.安装依赖包
npm install packagename
i）如果包中含有命令行工具，需要执行npm install packagename －g，－g是将一个包安装为全局可用的可执行命令，根据包描述文件的
bin字段配置，将实际脚本链接到node可执行文件相同的路径下。其实，通过全局安装的包放在一个统一的路径下，通过软连接的方式链接到
node的可执行目录下。
i）从本地安装
i）从非官方源安装
如果不能通过官方源安装，可以通过镜像源安装。在执行命令时，添加--registry=http://registry.url
3.npm 钩子命令
package.json中的scripts字段是让包在安装或者卸载过程中提供钩子机制：
"scripts":{
    "preinstall": "preinstall.js"
    "install":"install.js"
}
在执行npm install命令时，preinstall将会被首先执行
4.发布包
i）编写包
i）注册包仓库账号
i）上传包 npm publish
i）管理包权限：通常，一个包只有一个人拥有权限发布，可以使用npm owner添加、删除包的拥有者
i）分析包：npm ls，为你分析出当前路径下能够通过模块路径找到的所有包，并生成依赖树。
2.6.4 局域npm
为了保护代码的隐私性，企业可以搭建自己的npm仓库。
2.6.5 npm 潜在问题
i）包的质量良莠不齐 i）node代码可以运行在服务器端，需要考虑安全问题
npm模块首页，上的依赖榜，可以说明模块的质量和可靠性。还有，npm大多数包是通过github托管的，模块项目的观察者数量和分支数量
也能从侧面反映这个模块的可靠性。还有，包的测试和文档，一个没有单元测试的包基本上是无法被信任的，没有文档的包也不行。
》具备良好的测试
》具备良好的文档，README、API
》具备良好的测试覆盖率
》具备良好的编码规范
》更多条件
2.7 前后端共用模块
2.7.1 模块的侧重点
前后端js分别运行在http的两端，浏览器端的js从一个服务器奋发到多个客户端执行，而服务器端的js需要多次执行，前者瓶颈在带宽，
后者的瓶颈在cpu和内存等资源。前者通过网络加载代码，后者从磁盘加载。
纵观node模块的引入过程，几乎都是同步的，尽管与node强调异步的行为有些相反。但它是合理的。但是放到浏览器端，就不行，因为网络
的原因，太慢了，于是就出现了AMD规范，全称：Asynchronous Module Definition,异步模块定义。
详见：https://github.com/amdjs/amdjs-api/wiki/AMD
2.7.2 AMD规范
amd规范是commonjs规范的一个延伸，模块定义如下：
define(id?,dependencies?,factory); //factory的内容是实际代码的内容。例子
2.7.3 CMD规范
AMD需要在声明模块的时候指定所有的依赖，通过形参传递到模块内容中。例子
不太懂？？
2.7.4 兼容多种模块规范
为了让同一个模块可以运行在前后端，在写作过程中，需要考虑兼容前端也实现了模块规范的环境，例子，将hello方法定义到不同的运行环境
中，它能够兼容node、amd、cmd以及常见的浏览器环境中。例子
*/
// 简单的符合amd规范的模块
define(function(){
    var exports = {};
    exports.sayHello = function(){
        console.log("hello from module:" + module.id);
    };
    return exports;
})

(function(name, definition){
    //检测上下文环境是否是amd或者cmd
    var hasDefine = typeof define === "function",
    //检查上下文环境是否为node
        hasExports = typeof module !== 'undefined' && module.exports;
    if(hasDefine){
        define(definition);
    }else if(hasExports){
        //node模块
        module.exports = definition();
    }else{
        //将模块的执行结果挂在window变量中，在浏览器中this指向window对象
        this[name] = definition();
    }
})('hello',function(){
    var hello = function(){};
    return hello;
});

