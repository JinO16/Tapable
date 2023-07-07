// 保存同步基本钩子相关逻辑
const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

class SyncHookCodeFactory extends HookCodeFactory {
  // 
  content({onError, onDone, rethrowIfPossible}) {
    return this.callTapsSeries({
      onError: (i, err) => onError,
      onDone,
      rethrowIfPossible
    })
  }
}

const factory = new SyncHookCodeFactory();

/**
 * 调用栈 this.call => CALL_DELEGATE() => this._createCall() => this.compile() => COMPILE()
 * @param {*} options 
 * @returns 
 */
function COMPILE(options) {
  factory.setup(this, options);
  // 创建最终生成的执行函数并返回这个函数
  return factory.create(options);
} 
const TAP_ASYNC = () => {
  throw new Error("tapAsync is not supported on a SyncHook");
}

const TAP_PROMISE = () => {
  throw new Error("tapPromise is not supported on a SyncHook");
}

function SyncHook (args = [], name = undefined) {
  const hook = new Hook(args, name);
  hook.constructor = SyncHook;
  hook.tapAsync = TAP_ASYNC;
  hook.tapPromise = TAP_PROMISE;
  hook.compile = COMPILE;
  return hook;
} 

SyncHook.prototype = null;

module.exports = SyncHook;