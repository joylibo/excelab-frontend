// 测试脚本来验证不同环境下的行为差异
console.log('=== 环境变量测试 ===');

// 模拟不同环境
const testEnvs = [
  { name: '开发环境 (npm run dev)', env: { DEV: true, MODE: 'development' } },
  { name: '预览环境 (npm run preview)', env: { DEV: false, MODE: 'preview' } },
  { name: '生产环境 (npm run build)', env: { DEV: false, MODE: 'production' } }
];

testEnvs.forEach(({ name, env }) => {
  console.log(`\n--- ${name} ---`);
  
  // 模拟 import.meta.env
  const originalEnv = { ...process.env };
  process.env.NODE_ENV = env.MODE;
  
  // 模拟 API_BASE_URL 逻辑
  let API_BASE_URL;
  if (env.DEV) {
    API_BASE_URL = 'http://127.0.0.1:8000';
    console.log('🚀 开发环境：使用本地API地址 http://127.0.0.1:8000');
  } else if (env.MODE === 'preview') {
    API_BASE_URL = 'https://api.playharder.online';
    console.log('🌐 预览环境：使用生产API地址 https://api.playharder.online');
  } else {
    API_BASE_URL = 'https://api.playharder.online';
    console.log('🌐 生产环境：使用生产API地址 https://api.playharder.online');
  }
  
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('DEV:', env.DEV);
  console.log('MODE:', env.MODE);
  
  // 恢复环境变量
  process.env = originalEnv;
});

console.log('\n=== 问题分析 ===');
console.log('1. 开发环境 (npm run dev): 使用本地API http://127.0.0.1:8000');
console.log('2. 预览环境 (npm run preview): 使用生产API https://api.playharder.online');
console.log('3. 生产环境 (npm run build): 使用生产API https://api.playharder.online');
console.log('\n如果本地没有运行后端服务，开发环境会连接失败，而预览和生产环境会连接远程API，这可能导致应用行为完全不同。');
