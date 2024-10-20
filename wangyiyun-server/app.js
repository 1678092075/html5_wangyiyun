#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const tmpPath = require('os').tmpdir();
const express = require('express');
const cors = require('cors');
const app = express();

// 使用 CORS 中间件
app.use(cors());

// 引入 qq-music-api 的 app 模块
const qqMusicApiApp = require(path.join(__dirname, './qq-music-api/app'));

// 确保 qqMusicApiApp 是一个中间件函数
if (typeof qqMusicApiApp === 'function') {
  // 将 qq-music-api 的所有路由挂载到 "/api/music" 下
  app.use('/api/music', qqMusicApiApp);
} else {
  console.error('Error: qqMusicApiApp is not a middleware function.');
}

// 定义一个异步的启动函数，用于处理原有的逻辑
async function start() {
  // 检测是否存在 anonymous_token 文件,没有则生成
  if (!fs.existsSync(path.resolve(tmpPath, 'anonymous_token'))) {
    fs.writeFileSync(path.resolve(tmpPath, 'anonymous_token'), '', 'utf-8');
  }

  // 启动时更新 anonymous_token
  const generateConfig = require('./generateConfig');
  await generateConfig();

  // 使用 require('./server') 中的 serveNcmApi 来提供 API
  const ncmApi = require('./server').serveNcmApi({
    checkVersion: true,
  });

  // 确保 ncmApi 是一个中间件函数
  if (typeof ncmApi === 'function') {
    // 将 NCM API 的所有路由挂载到 "/api/ncm" 下
    app.use('/api/ncm', ncmApi);
  } else {
    console.error('Error: ncmApi is not a middleware function.');
  }

  // 启动主后端服务
  const PORT = process.env.PORT || 5000; // 可以选择任何你喜欢的端口
  app.listen(PORT, () => {
    console.log(`Main server running at http://localhost:${PORT}`);
  });
}

// 调用 start 函数来启动服务器
start();