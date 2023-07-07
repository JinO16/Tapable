// 编译生成最终需要执行的函数的文件
// 是一个基础类 tapable将不同种类Hook编译生成最终方法相同逻辑都抽离到了这个基础类中
class HookCodeFactory {
  constructor(config) {
    this.config = config;
    this.options = undefined;
    this._args = undefined;
  }

  // 初始化当前事件组成的集合
  /**
   * 
   * @param {*} instance COMPILE中的this 也是我们通过new Hook时生成的hook实例对象
   * @param {*} options 调用COMPILE方法时Hook类上_createCall传递的options对象。
   */
  setup(instance, options) {
      instance._x = options.taps.map(i => i.fn);
  }

  // 编译最终需要生成的函数
  // 其实本质上是通过this.header方法和this.contentWithInterceptors方法返回的字符串拼接为函数内容
  // 再调用new Function构造函数对象
  create(options) {
    // 初始化相关属性
    this.init(options);
    // 最终编译生成的方法 fn
    let fn;
    // 匹配不同类型的Hook进行相关编译处理
    switch(this.options.type) {
      case 'sync':
        console.log('this.args()===>', this.args());
        fn = new Function(
          this.args(),
          '"use strict";\n' + 
          this.header() +
          this.contentWithInterceptors ({
            onError: (err) => `throw ${err};\n`,
            onResult: (res) => `return ${res} \n`,
            onDone: () => '',
            rethrowIfPossible: true
          })
        );
        // console.log('fn====>', fn.toString())
        break;
        default:
          break;
    }
    // 编译完成结果赋值给fn后，需要解除相关参数的赋值。
    this.deinit();
    console.log('fn----->', fn.toString());
    return fn;
  }
  // 将保存在类中的this._args数字转化成为字符串从而传递给对应的new Function语句
  args({before, after} = {}) {
    let allArgs = this._args;
    if (before) allArgs = [before].concat(allArgs);
    if (after) allArgs = allArgs.concat(after);
    if (allArgs.length === 0) {
      return ''
    } else {
      return allArgs.join(',');
    }
  }

  contentWithInterceptors(options) {
    // 如果存在拦截器
    if (this.options.interceptors.length > 0) {

    } else {
      return this.content(options);
    }
  }

  // 遍历所有注册的taps 编译成为对应的最终需要执行的函数
  callTapsSeries({ onDone }) {
    let code = '';
    let current = onDone;
    // 没有注册的事件则直接返回
    if (this.options.taps.length === 0) return onDone();
    // 遍历tap注册的函数编译生成需要执行的函数
    for (let i = this.options.taps.length - 1; i >= 0; i--) {
      const done = current;
      // 一个个创建对应的函数调用
      const content = this.callTap(i, {
        onDone: done
      });
      current = () => content;
    }
    code += current();
    return code;
  }
  // 根据单个tap类型生成对应的函数调用语句 进行返回
  callTap(tapIndex, {onDone}) {
    let code = '';
    // 无论什么类型的都要通过下标先获得内容
    // 这一步生成：var _fn[1] = this.x[1];
    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
    // 不同类型的调用方式不同
    // 生成调用代码fn1(arg1, arg2, ...)
    const tap = this.options.taps[tapIndex];
    switch(tap.type) {
      case 'sync':
        code += `_fn${tapIndex}(${this.args()});\n`;
        break;
      default:
        break;
    }
    if (onDone) {
      code += onDone();
    }
    return code;
  } 

  // 从ths._x中获取函数内容 this._x[index]
  getTapFn(idx) {
    return `_x[${idx}]`;
  }

  header() {
    let code = '';
    code += 'var _context;\n';
    code += 'var _x = this._x;\n';
    return code;
  }

  init(options) {
    this.options = options;
    // 保存初始化Hook时的参数
    this._args = options.args.slice();
  }

  deinit() {
    this.options = undefined;
    this._args = undefined;
  }
}

module.exports = HookCodeFactory;