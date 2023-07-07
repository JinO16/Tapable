// 该文件是所有类型Hook的父类，所有hook都是基于这个类派生而来的

const CALL_DELETEGATE = function(...args) {
  // 将生成的函数赋值给this.call,再通过this.call(...args)调用最终生成的执行函数
  this.call = this._createCall('sync');
  return this.call(...args);
};

// 核心实例对象
class Hook {
  constructor(args = [], name = undefined) {
    // 保存初始化Hook时传递的参数
    this._args = args;
    this.name = name;
    // 保存通过tap注册的内容
    this.taps = [];
    // 保存拦截器相关内容
    this.interceptors = [];
    // hook的call方法
    this._call = CALL_DELETEGATE;
    this.call = CALL_DELETEGATE;
    // _x存放hook中所有通过tap注册的函数
    this._x = undefined;

    // 动态编译方法
    this.compile = this.compile;
    // 相关注册方法
    this.tap = this.tap
  }
  // 正是编译我们最终生成的执行函数的入口方法，在hook中并不需要实现这个方法
  // 因为不同类型的hook最终编译出的执行函数是不同的形式；所以compile方法以一种抽象类的方式交给子类进行实现。
  compile(options) {
    throw new Error('Abstract: should be overridden');
  }
  // 
  tap (options, fn) {
    // this._tap是一个通用方法
    // 这里我们使用的是同步，所以第一个参数表示类型传入sync
    // 如果是异步同理为sync、promise 同理为promise这样就很好区分了三种注册方式
    this._tap('sync', options, fn);
  }
  /**
   * 
   * @param {*} type 注册的类型 promise sync async
   * @param {*} options 注册时传递的第一个参数对象
   * @param {*} fn 注册时传入监听的事件函数
   */
  _tap(type, options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options.trim()
      }
    } else if (typeof options !== 'object' || options === null) {
      // 如果传入非对象或者null
      throw new Error('Invaild tap options');
    }

    // 其他情况，即options类型仅仅只有Object类型
    if (typeof options.name !== 'string' || options.name === '') {
      throw new Error('Missing name for tap');
    }
    // 合并参数
    options = Object.assign({type, fn}, options);

    this._insert(options);
  }

  _insert(item) {
    // 解决问题：
    // 在第一次调用call方法时。this.call已经被赋值为本次生成的编译方法，并输出本次的tap注册参数；
    // 当第二次进行注册一个新的tap事件时，再次调用call方法，由于call方法已经是上一次生成的编译方法了，并没有拿到新的参数并重新编译。所以仍然输出上一次的结果。
    // this._resetCompilation();
    this.taps.push(item);
  }

  // 编译最终生成的执行函数的方法
  // compile是一个抽象方法 需要在集成Hook类的子类方法中实现
  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type
    })
  }

  // 每次tap注册时都会调用_resetCompilation 重新赋值this.call，也就是说每次tap时都要获取当前最新的数据，重新生成编译方法
  _resetCompilation() {
    this.call = this._call;
  }
}

module.exports = Hook;