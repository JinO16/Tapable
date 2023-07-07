const { SyncHook } = require('./index');
// 参数后续作为参数传入到动态新建的函数中,传入的参数对应的就是tap监听的参数，也是call传入参数
const hooks = new SyncHook(['arg1', 'arg2', 'arg3']);

hooks.tap('1', (arg1, arg2, arg3) => {
  console.log('tap 1', arg1, arg2, arg3);
})

hooks.tap('2', (arg1, arg2) => {
  console.log('tap 2', arg1, arg2);
})

hooks.call('第一个参数', '第二个参数', '我是新加的');

hooks.tap('3', (arg1, arg2) => {
  console.log('tap 3', arg1, arg2);
})

console.log('------');
hooks.call('3 第三个参数', '3 第四个参数')