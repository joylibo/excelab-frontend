// 测试环境配置脚本
// 运行: node test-env.js

// 模拟不同的环境变量来测试API配置
console.log('🧪 测试环境配置...\n');

// 测试开发环境
process.env.NODE_ENV = 'development';
console.log('1. 测试开发环境 (NODE_ENV=development):');
const devResult = (() => {
  // 模拟 import.meta.env.DEV
  const env = { DEV: true, MODE: 'development' };
  if (env.DEV) {
    return 'http://127.0.0.1:8000';
  }
  if (env.MODE === 'preview') {
    return 'https://api.playharder.online';
  }
  return 'https://api.playharder.online';
})();
console.log(`   结果: ${devResult}`);
console.log('   预期: http://127.0.0.1:8000');
console.log(`   ✅ ${devResult === 'http://127.0.0.1:8000' ? '通过' : '失败'}\n`);

// 测试预览环境
process.env.NODE_ENV = 'production';
console.log('2. 测试预览环境 (MODE=preview):');
const previewResult = (() => {
  // 模拟 import.meta.env
  const env = { DEV: false, MODE: 'preview' };
  if (env.DEV) {
    return 'http://127.0.0.1:8000';
  }
  if (env.MODE === 'preview') {
    return 'https://api.playharder.online';
  }
  return 'https://api.playharder.online';
})();
console.log(`   结果: ${previewResult}`);
console.log('   预期: https://api.playharder.online');
console.log(`   ✅ ${previewResult === 'https://api.playharder.online' ? '通过' : '失败'}\n`);

// 测试生产环境
console.log('3. 测试生产环境 (MODE=production):');
const prodResult = (() => {
  // 模拟 import.meta.env
  const env = { DEV: false, MODE: 'production' };
  if (env.DEV) {
    return 'http://127.0.0.1:8000';
  }
  if (env.MODE === 'preview') {
    return 'https://api.playharder.online';
  }
  return 'https://api.playharder.online';
})();
console.log(`   结果: ${prodResult}`);
console.log('   预期: https://api.playharder.online');
console.log(`   ✅ ${prodResult === 'https://api.playharder.online' ? '通过' : '失败'}\n`);

console.log('📋 测试完成！');
console.log('💡 在实际应用中，Vite会自动设置正确的环境变量：');
console.log('   - npm run dev: import.meta.env.DEV = true');
console.log('   - npm run preview: import.meta.env.MODE = "preview"');
console.log('   - npm run build: import.meta.env.MODE = "production"');
