/*
服务器端变成，前提，海量请求，使一切资源高效循环利用。
5.1 v8的垃圾回收机制与内存限制
在浏览器端开发时，很少人能遇到垃圾回收对应用程序构成性能影响的情况，但是在服务器端，需要
5.1.1 Node与V8
node基于v8
5.1.2 v8的内存限制
在node中使用的js对象是通过v8自己的方式来进行分配和管理的，通过js只能使用部分内存，64位系统下为1.4GB，32位系统下为
0.7GB。
5.1.3 V8的对象分配
在V8中，所有的js对象都是通过堆进行分配的，
使用node   process.memoryUsage()方法来查看内存使用情况
每次为变量分配内存，所申请到的量是有限制的。
5.1.4 V8的垃圾回收机制
1.v8主要的垃圾回收算法
基于分代式的垃圾回收机制
主要内存分为新生代（存活时间最短）和老生代（存活时间较长或者常驻），如果一直申请分配内存，最大能够分配到1.4g和0.7g。 
2.scavenge算法
使用于新生代
有个from区和to区，首先在from区分配，回收时，将from区中的存活对象复制到to区，然后释放from区，from和to区完成
对调。在from复制到to区时，要对from区进行检查，适当的移入老生代空间。
只复制活着的对象
3.mark－sweep和mark－compact
标记清除，活着的进行标记，只清除死亡的对象。
mark－compact标记整理，避免出现将死亡对象清除后，内存分配不连贯的情况。
4.incremental marking
垃圾回收的3种基本算法都需要将应用逻辑暂停下来。
5.1.5 查看垃圾回收日志
5.2 高效使用内存
在v8面前，开发者要具备的责任是如何让垃圾回收机制更高效的工作
5.2。1 作用域
可以通过对对象重新赋值来解除引用。
5.2.3 小结
无法立即回收的内存有，闭包和全局变量，要特别注意
5.3 内存指标
5.3.1 查看内存使用情况
1.查看进程的内存占用
process.memoryUsage()方法
2.查看系统的内存占用
os.totalmem()
os.freemem()
5.3.2 堆外内存
堆中的内存用量总是小于进程的常驻内存用量。将node中的不是通过v8分配的内存称为 堆外内存。
buffer对象不是通过v8分配。
5.3.3 小结
node的内存构成为通过v8分配的部分和node自行分配的部分，受v8的垃圾回收限制的主要是v8的堆内存。
5.4 内存泄漏
造成内存泄漏的原因：
缓存
队列消费不及时
作用域未释放
5.4.1 慎将内存当做缓存
任何试图拿内存当缓存的行为都应当被限制。
目前好的解决方案，使用进程外的缓存，如redis和memcached
5.4.2 关注队列状态
另一个不经意产生的内存泄漏是队列。
5.5 内存泄漏排查
许多工具
5.6 大内存应用
通过stream模块来处理大文件，不受v8内存分配的限制。
*/