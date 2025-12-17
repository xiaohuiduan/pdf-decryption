// PDF解密工具 - 基于qpdf-wasm的简化版本

// 全局变量
let isProcessing = false; // 是否正在处理文件
let qpdfModule = null; // qpdf模块实例
let isModuleLoading = false; // 模块是否正在加载
let moduleLoadPromise = null; // 模块加载承诺
let processedFilesCount = 0; // 已处理文件计数

// DOM元素
const themeToggle = document.getElementById('themeToggle');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');

// 初始化应用
function init() {
    console.log('🚀 正在初始化PDF解密工具...');
    
    // 从localStorage加载主题偏好
    loadTheme();
    
    // 添加事件监听器
    themeToggle.addEventListener('click', toggleTheme);
    fileInput.addEventListener('change', handleFileSelect);
    browseBtn.addEventListener('click', () => fileInput.click());
    
    // 添加拖放事件监听器
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 显示欢迎消息
    showNotification('欢迎使用PDF解密工具！点击或拖拽多个PDF文件到上传区域，支持批量处理。', 'info');
}

// 加载qpdf-wasm模块
async function loadQpdfModule() {
    if (qpdfModule) {
        return qpdfModule;
    }
    
    if (moduleLoadPromise) {
        return moduleLoadPromise;
    }
    
    isModuleLoading = true;
    showNotification('正在加载PDF处理引擎...', 'info');
    
    moduleLoadPromise = (async () => {
        try {
            // 使用CDN加载qpdf-wasm
            const scriptUrl = 'https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm@0.0.2/qpdf.js';
            const wasmUrl = 'https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm@0.0.2/qpdf.wasm';
            
            console.log('📥 正在加载qpdf-wasm脚本...');
            
            // 加载qpdf-wasm脚本
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.type = 'text/javascript';
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
            
            console.log('📄 qpdf-wasm脚本加载完成，正在初始化模块...');
            
            // 等待Module可用
            await new Promise(resolve => {
                const checkModule = () => {
                    if (typeof window.Module === 'function') {
                        resolve();
                    } else {
                        setTimeout(checkModule, 100);
                    }
                };
                checkModule();
            });
            
            // 使用locateFile初始化模块
            qpdfModule = await window.Module({
                locateFile: () => wasmUrl
            });
            
            console.log('✅ qpdf-wasm模块初始化成功！');
            showNotification('PDF处理引擎加载成功！', 'success');
            isModuleLoading = false;
            
            return qpdfModule;
        } catch (error) {
            console.error('❌ 加载qpdf-wasm失败:', error);
            showNotification('PDF处理引擎加载失败，请刷新页面重试。', 'error');
            isModuleLoading = false;
            throw error;
        }
    })();
    
    return moduleLoadPromise;
}

// 处理文件选择
async function handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        // 处理所有选中的文件
        await processMultipleFiles(files);
    }
}

// 处理拖放事件
async function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        // 筛选出PDF文件
        const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
        if (pdfFiles.length > 0) {
            await processMultipleFiles(pdfFiles);
        } else {
            showNotification('请上传PDF文件。', 'error');
        }
    } else {
        showNotification('请上传PDF文件。', 'error');
    }
}

// 处理多个PDF文件
async function processMultipleFiles(files) {
    if (isProcessing) {
        showNotification('正在处理文件，请稍候...', 'info');
        return;
    }
    
    // 筛选出PDF文件
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        showNotification('请上传PDF文件。', 'error');
        return;
    }
    
    try {
        isProcessing = true;
        uploadArea.classList.add('loading');
        processedFilesCount = 0;
        
        const totalFiles = pdfFiles.length;
        showNotification(`🚀 开始处理 ${totalFiles} 个PDF文件...`, 'info');
        
        // 加载qpdf模块
        const mod = await loadQpdfModule();
        
        // 逐个处理文件
        for (const file of pdfFiles) {
            console.log(`📁 开始处理文件: ${file.name}`);
            
            // 显示更明显的处理中提示
            showNotification(`⏳ 正在处理文件: ${file.name}`, 'info', 5000);
            
            // 更新上传区域的处理状态文本
            const processingText = document.createElement('div');
            processingText.className = 'processing-text';
            processingText.style.cssText = `
                position: absolute;
                top: 70%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--text-secondary);
                z-index: 10;
                background-color: var(--bg-primary);
                padding: 0.25rem 0.75rem;
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-md);
            `;
            processingText.textContent = `${processedFilesCount + 1}/${totalFiles}`;
            uploadArea.appendChild(processingText);
            
            // 移除密码
            const processedBlob = await removeOwnerPassword(mod, file);
            
            // 下载处理后的文件
            downloadFile(processedBlob, file.name);
            
            processedFilesCount++;
            
            // 移除处理状态文本
            processingText.remove();
            
            console.log(`✅ 文件处理完成: ${file.name}`);
            showNotification(`✅ 文件处理完成: ${file.name}`, 'success', 2000);
        }
        
        showNotification(`✅ 所有 ${totalFiles} 个PDF文件处理完成！`, 'success');
    } catch (error) {
        console.error('处理PDF文件时出错:', error);
        showNotification(`处理PDF文件失败: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        uploadArea.classList.remove('loading');
    }
}

// 处理单个PDF文件
async function processFile(file) {
    if (isProcessing) {
        showNotification('正在处理文件，请稍候...', 'info');
        return;
    }
    
    // 验证文件类型
    if (file.type !== 'application/pdf') {
        showNotification('请上传PDF文件。', 'error');
        return;
    }
    
    try {
        isProcessing = true;
        uploadArea.classList.add('loading');
        
        showNotification(`正在处理文件: ${file.name}`, 'info');
        
        // 加载qpdf模块
        const mod = await loadQpdfModule();
        
        // 使用qpdf-wasm移除密码
        const processedBlob = await removeOwnerPassword(mod, file);
        
        // 下载处理后的文件
        downloadFile(processedBlob, file.name);
        
        showNotification('PDF密码移除成功！', 'success');
    } catch (error) {
        console.error('处理PDF文件时出错:', error);
        showNotification(`处理PDF文件失败: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        uploadArea.classList.remove('loading');
    }
}

// 移除PDF所有者密码
async function removeOwnerPassword(mod, file) {
    console.log('🔑 开始移除所有者密码...');
    
    const working = '/working';
    
    try {
        // 如果工作目录不存在则创建
        try {
            mod.FS.stat(working);
            console.log('📁 工作目录已存在');
        } catch (e) {
            mod.FS.mkdir(working);
            console.log('📁 创建工作目录');
        }
        
        // 将输入文件写入文件系统
        const input = `${working}/input.pdf`;
        const fileBuffer = await file.arrayBuffer();
        mod.FS.writeFile(input, new Uint8Array(fileBuffer));
        console.log('📄 已写入输入文件:', input);
        
        // 设置输出路径
        const output = '/output.pdf';
        console.log('🎯 输出路径:', output);
        
        // 运行qpdf --decrypt命令
        const args = ['--decrypt', input, output];
        console.log('🔧 运行qpdf命令:', args.join(' '));
        
        const result = await mod.callMain(args);
        console.log('📊 命令执行结果:', result);
        
        if (result !== 0) {
            throw new Error('移除所有者密码失败 (退出码: ' + result + ')');
        }
        
        // 读取输出文件
        console.log('📖 正在读取输出文件...');
        const outputBuffer = mod.FS.readFile(output, { encoding: 'binary' });
        console.log('📦 输出文件大小:', outputBuffer.length, '字节');
        
        // 创建结果Blob
        const resultBlob = new Blob([outputBuffer], { type: 'application/pdf' });
        console.log('✅ 密码移除成功');
        
        return resultBlob;
    } finally {
        // 清理：如果输出文件存在则删除
        try {
            mod.FS.unlink('/output.pdf');
            console.log('🧹 已清理输出文件');
        } catch (e) {
            // 忽略文件不存在的情况
        }
    }
}

// 下载文件功能
function downloadFile(blob, originalFilename) {
    try {
        // 显示下载中提示
        const downloadId = Date.now();
        showNotification(`📥 正在准备下载文件: ${originalFilename}`, 'info', 5000);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // 生成不带密码的文件名
        const filename = originalFilename.replace(/\.pdf$/i, '-无密码.pdf');
        
        a.href = url;
        a.download = filename;
        
        // 添加到文档并点击
        document.body.appendChild(a);
        
        // 创建下载进度元素
        const downloadProgress = document.createElement('div');
        downloadProgress.className = 'download-progress';
        downloadProgress.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        downloadProgress.innerHTML = `
            <div class="spinner" style="
                width: 16px;
                height: 16px;
                border: 2px solid var(--bg-tertiary);
                border-top-color: var(--accent-primary);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            "></div>
            <span>正在下载: ${filename}</span>
        `;
        
        document.body.appendChild(downloadProgress);
        
        // 触发下载
        a.click();
        
        // 下载完成后清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // 更新提示为下载完成
            downloadProgress.innerHTML = `
                <span style="color: #10b981; font-weight: 600;">✅</span>
                <span>下载完成: ${filename}</span>
            `;
            
            // 3秒后移除下载进度提示
            setTimeout(() => {
                downloadProgress.remove();
            }, 3000);
            
            // 显示下载完成通知
            showNotification(`✅ 文件下载完成: ${filename}`, 'success', 4000);
        }, 500);
        
    } catch (error) {
        console.error('❌ 下载文件时出错:', error);
        showNotification('处理后的文件下载失败，请重试。', 'error');
    }
}

// 主题管理
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || getSystemTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// 处理拖入事件
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// 处理拖出事件
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// 通知系统
function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        font-size: 0.95rem;
        z-index: 1000;
        animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    // 根据类型设置背景颜色和图标
    const types = {
        success: { color: '#10b981', icon: '✅' },
        error: { color: '#ef4444', icon: '❌' },
        info: { color: '#3b82f6', icon: 'ℹ️' }
    };
    
    const config = types[type] || types.info;
    notification.style.backgroundColor = config.color;
    notification.innerHTML = `${config.icon} ${message}`;
    
    // 添加到文档
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 100);
    
    // 自动移除
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, duration);
}

// 添加通知动画样式
const style = document.createElement('style');
style.textContent = `
    /* 平滑过渡动画 */
    * {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* 通知滑入动画 */
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    /* 通知滑出动画 */
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* 卡片悬停效果 */
    .feature-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    /* 上传区域动画 */
    .upload-area {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .upload-area.dragover {
        transform: scale(1.02);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    /* 按钮悬停效果 */
    .upload-btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .upload-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    /* 主题切换动画 */
    .theme-toggle {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* 加载动画 */
    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2rem;
        height: 2rem;
        margin: -1rem 0 0 -1rem;
        border: 2px solid var(--border-color);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// 当DOM准备就绪时初始化应用
document.addEventListener('DOMContentLoaded', init);