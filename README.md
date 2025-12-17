# PDF解密工具

一个简单高效的PDF密码移除工具，基于qpdf-wasm实现，所有处理均在浏览器本地进行，确保最大的安全性和隐私保护。

## 功能特性

- 🚀 **快速高效**：利用WebAssembly技术，快速处理PDF文件
- 🔒 **安全可靠**：所有处理均在浏览器本地进行，无需上传文件
- 📁 **批量处理**：支持一次上传多个PDF文件，批量移除所有者密码
- 🌓 **深色模式**：支持深色/浅色主题切换
- 💻 **离线使用**：一旦加载完成，无需网络连接即可使用
- 📱 **响应式设计**：适配各种屏幕尺寸

## 技术栈

- HTML5
- CSS3 (Tailwind CSS风格)
- JavaScript (ES modules)
- qpdf-wasm (PDF处理引擎)

## 如何使用

### 本地开发

1. 克隆项目：
   ```bash
   git clone https://github.com/your-repo/pdf-decrypt-tool.git
   cd pdf-decrypt-tool
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中打开：
   ```
   http://localhost:5173
   ```

### 直接使用

直接在浏览器中打开 `index.html` 文件即可使用。

## 支持的功能

- 移除PDF所有者密码（使用qpdf --decrypt命令）
- 支持多文件同时处理
- 支持拖放文件上传
- 自动下载处理后的文件
- 友好的用户界面和动画效果

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## SEO优化

- 页面标题和描述已优化
- 添加了相关关键词
- 支持中文搜索优化
- 适配百度搜索

## 项目结构

```
pdf-decrypt-tool/
├── index.html          # 主页面
├── script.js           # 主要JavaScript逻辑
├── styles.css          # 样式文件
├── package.json        # 项目配置
├── vite.config.js      # Vite配置
└── README.md           # 项目说明
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
