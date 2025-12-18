// PDF解密工具 - 基于qpdf-wasm的简化版本

// 全局变量
let isProcessing = false; // 是否正在处理文件
let qpdfModule = null; // qpdf模块实例
let isModuleLoading = false; // 模块是否正在加载
let moduleLoadPromise = null; // 模块加载承诺
let processedFilesCount = 0; // 已处理文件计数
let currentLanguage = 'zh-CN'; // 当前语言

// 多语言翻译字典
const translations = {
    // 简体中文
    'zh-CN': {
        app_title: 'PDF解密工具',
        lang_zh_cn: '简体中文',
        lang_zh_tw: '繁体中文',
        lang_en: 'English',
        lang_ja: '日本語',
        lang_fr: 'Français',
        lang_ru: 'Русский',
        hero_title: '移除PDF所有者密码',
        hero_description: '轻松移除PDF文件的所有者密码，所有处理均在您的浏览器本地进行，确保最大的安全性和隐私保护。',
        upload_title: '上传您的PDF文件',
        upload_subtitle: '点击或拖拽PDF文件到此处',
        upload_hint: '支持同时上传多个PDF文件，批量处理',
        browse_btn: '浏览文件',
        features_title: '核心功能',
        feature_security_title: '100% 安全可靠',
        feature_security_description: '所有处理均在浏览器本地完成，文件不会上传到任何服务器，保护您的隐私安全。',
        feature_speed_title: '快速高效处理',
        feature_speed_description: '利用WebAssembly技术，快速处理PDF文件，无需等待服务器响应。',
        feature_offline_title: '支持离线使用',
        feature_offline_description: '一旦加载完成，无需网络连接即可使用，随时随地处理PDF文件。',
        feature_batch_title: '支持批量处理',
        feature_batch_description: '一次上传多个PDF文件，批量移除所有者密码，提高工作效率。',
        footer_text: 'PDF解密工具 - 简单高效 • 安全可靠',
        notification_welcome: '欢迎使用PDF解密工具！点击或拖拽多个PDF文件到上传区域，支持批量处理。',
        notification_loading_engine: '正在加载PDF处理引擎...',
        notification_processing: '🚀 开始处理 {count} 个PDF文件...',
        notification_processing_file: '⏳ 正在处理文件: {name}',
        notification_processed_file: '✅ 文件处理完成: {name}',
        notification_all_processed: '✅ 所有 {count} 个PDF文件处理完成！',
        notification_please_upload_pdf: '请上传PDF文件。',
        notification_file_downloading: '📥 正在准备下载文件: {name}',
        notification_file_downloaded: '✅ 文件下载完成: {name}',
        notification_download_failed: '处理后的文件下载失败，请重试。',
        notification_pdf_engine_failed: 'PDF处理引擎加载失败，请刷新页面重试。',
        notification_password_remove_failed: '移除所有者密码失败',
        notification_pdf_engine_loaded: 'PDF处理引擎加载成功！',
        notification_processing_files: '正在处理文件，请稍候...',
        notification_pdf_processing_failed: '处理PDF文件失败',
        notification_password_remove_success: 'PDF密码移除成功！',
        filename_suffix: '-无密码.pdf'
    },
    
    // 繁体中文
    'zh-TW': {
        app_title: 'PDF解密工具',
        lang_zh_cn: '簡體中文',
        lang_zh_tw: '繁體中文',
        lang_en: 'English',
        lang_ja: '日本語',
        lang_fr: 'Français',
        lang_ru: 'Русский',
        hero_title: '移除PDF所有者密碼',
        hero_description: '輕鬆移除PDF文件的所有者密碼，所有處理均在您的瀏覽器本地進行，確保最大的安全性和隱私保護。',
        upload_title: '上傳您的PDF文件',
        upload_subtitle: '點擊或拖放PDF文件到此處',
        upload_hint: '支援同時上傳多個PDF文件，批量處理',
        browse_btn: '瀏覽文件',
        features_title: '核心功能',
        feature_security_title: '100% 安全可靠',
        feature_security_description: '所有處理均在瀏覽器本地完成，文件不會上傳到任何伺服器，保護您的隱私安全。',
        feature_speed_title: '快速高效處理',
        feature_speed_description: '利用WebAssembly技術，快速處理PDF文件，無需等待伺服器回應。',
        feature_offline_title: '支援離線使用',
        feature_offline_description: '一旦載入完成，無需網路連線即可使用，隨時隨地處理PDF文件。',
        feature_batch_title: '支援批量處理',
        feature_batch_description: '一次上傳多個PDF文件，批量移除所有者密碼，提高工作效率。',
        footer_text: 'PDF解密工具 - 簡單高效 • 安全可靠',
        notification_welcome: '歡迎使用PDF解密工具！點擊或拖放多個PDF文件到上傳區域，支援批量處理。',
        notification_loading_engine: '正在載入PDF處理引擎...',
        notification_processing: '🚀 開始處理 {count} 個PDF文件...',
        notification_processing_file: '⏳ 正在處理文件: {name}',
        notification_processed_file: '✅ 文件處理完成: {name}',
        notification_all_processed: '✅ 所有 {count} 個PDF文件處理完成！',
        notification_please_upload_pdf: '請上傳PDF文件。',
        notification_file_downloading: '📥 正在準備下載文件: {name}',
        notification_file_downloaded: '✅ 文件下載完成: {name}',
        notification_download_failed: '處理後的文件下載失敗，請重試。',
        notification_pdf_engine_failed: 'PDF處理引擎載入失敗，請刷新頁面重試。',
        notification_password_remove_failed: '移除所有者密碼失敗',
        notification_pdf_engine_loaded: 'PDF處理引擎載入成功！',
        notification_processing_files: '正在處理文件，請稍候...',
        notification_pdf_processing_failed: '處理PDF文件失敗',
        notification_password_remove_success: 'PDF密碼移除成功！',
        filename_suffix: '-無密碼.pdf'
    },
    
    // 英语
    'en': {
        app_title: 'PDF Decryption Tool',
        lang_zh_cn: '简体中文',
        lang_zh_tw: '繁体中文',
        lang_en: 'English',
        lang_ja: '日本語',
        lang_fr: 'Français',
        lang_ru: 'Русский',
        hero_title: 'Remove PDF Owner Password',
        hero_description: 'Easily remove owner passwords from PDF files. All processing is done locally in your browser for maximum security and privacy protection.',
        upload_title: 'Upload Your PDF Files',
        upload_subtitle: 'Click or drag PDF files here',
        upload_hint: 'Support multiple PDF files upload, batch processing',
        browse_btn: 'Browse Files',
        features_title: 'Core Features',
        feature_security_title: '100% Secure & Reliable',
        feature_security_description: 'All processing is done locally in your browser. Files are never uploaded to any server, ensuring maximum privacy and security.',
        feature_speed_title: 'Fast & Efficient Processing',
        feature_speed_description: 'Utilizes WebAssembly technology for fast PDF processing without waiting for server responses.',
        feature_offline_title: 'Offline Support',
        feature_offline_description: 'Once loaded, no internet connection is required. Process PDF files anytime, anywhere.',
        feature_batch_title: 'Batch Processing',
        feature_batch_description: 'Upload multiple PDF files at once and remove owner passwords in batch, improving work efficiency.',
        footer_text: 'PDF Decryption Tool - Simple, Efficient & Secure',
        notification_welcome: 'Welcome to the PDF Decryption Tool! Click or drag multiple PDF files to the upload area, support batch processing.',
        notification_loading_engine: 'Loading PDF processing engine...',
        notification_processing: '🚀 Starting to process {count} PDF files...',
        notification_processing_file: '⏳ Processing file: {name}',
        notification_processed_file: '✅ File processed: {name}',
        notification_all_processed: '✅ All {count} PDF files have been processed!',
        notification_please_upload_pdf: 'Please upload PDF files.',
        notification_file_downloading: '📥 Preparing to download file: {name}',
        notification_file_downloaded: '✅ File downloaded: {name}',
        notification_download_failed: 'Failed to download the processed file, please try again.',
        notification_pdf_engine_failed: 'PDF processing engine failed to load, please refresh the page and try again.',
        notification_password_remove_failed: 'Failed to remove owner password',
        notification_pdf_engine_loaded: 'PDF processing engine loaded successfully!',
        notification_processing_files: 'Processing files, please wait...',
        notification_pdf_processing_failed: 'Failed to process PDF file',
        notification_password_remove_success: 'PDF password removed successfully!',
        filename_suffix: '-no-password.pdf'
    },
    
    // 日语
    'ja': {
        app_title: 'PDF復号化ツール',
        lang_zh_cn: '简体中文',
        lang_zh_tw: '繁体中文',
        lang_en: 'English',
        lang_ja: '日本語',
        lang_fr: 'Français',
        lang_ru: 'Русский',
        hero_title: 'PDF所有者パスワードを削除',
        hero_description: 'PDFファイルの所有者パスワードを簡単に削除します。すべての処理はブラウザ内でローカルに行われ、最大のセキュリティとプライバシー保護を確保します。',
        upload_title: 'PDFファイルをアップロード',
        upload_subtitle: 'ここにPDFファイルをクリックまたはドラッグ',
        upload_hint: '複数のPDFファイルを同時にアップロードし、一括処理をサポート',
        browse_btn: 'ファイルを参照',
        features_title: 'コア機能',
        feature_security_title: '100% 安全かつ信頼性',
        feature_security_description: 'すべての処理はブラウザ内でローカルに行われます。ファイルはサーバーにアップロードされず、最大のプライバシーとセキュリティを確保します。',
        feature_speed_title: '高速かつ効率的な処理',
        feature_speed_description: 'WebAssembly技術を活用し、サーバーの応答を待つことなく高速にPDFファイルを処理します。',
        feature_offline_title: 'オフラインサポート',
        feature_offline_description: '一度ロードされると、インターネット接続は必要ありません。いつでもどこでもPDFファイルを処理できます。',
        feature_batch_title: '一括処理',
        feature_batch_description: '一度に複数のPDFファイルをアップロードし、所有者パスワードを一括で削除して作業効率を向上させます。',
        footer_text: 'PDF復号化ツール - シンプル、効率的、安全',
        notification_welcome: 'PDF復号化ツールへようこそ！複数のPDFファイルをクリックまたはドラッグしてアップロードエリアに追加し、一括処理をサポートします。',
        notification_loading_engine: 'PDF処理エンジンをロード中...',
        notification_processing: '🚀 {count}個のPDFファイルの処理を開始します...',
        notification_processing_file: '⏳ ファイル処理: {name}',
        notification_processed_file: '✅ ファイル処理完了: {name}',
        notification_all_processed: '✅ 全ての{count}個のPDFファイルが処理されました！',
        notification_please_upload_pdf: 'PDFファイルをアップロードしてください。',
        notification_file_downloading: '📥 ファイルをダウンロード中: {name}',
        notification_file_downloaded: '✅ ファイルのダウンロードが完了しました: {name}',
        notification_download_failed: '処理済みファイルのダウンロードに失敗しました。もう一度お試しください。',
        notification_pdf_engine_failed: 'PDF処理エンジンのロードに失敗しました。ページを更新してもう一度お試しください。',
        notification_password_remove_failed: '所有者パスワードの削除に失敗しました',
        notification_pdf_engine_loaded: 'PDF処理エンジンが正常にロードされました！',
        notification_processing_files: 'ファイルを処理しています、しばらくお待ちください...',
        notification_pdf_processing_failed: 'PDFファイルの処理に失敗しました',
        notification_password_remove_success: 'PDFパスワードの削除に成功しました！',
        filename_suffix: '-パスワードなし.pdf'
    },
    
    // 法语
    'fr': {
        app_title: 'Outil de Déchiffrement PDF',
        lang_zh_cn: '简体中文',
        lang_zh_tw: '繁体中文',
        lang_en: 'English',
        lang_ja: '日本語',
        lang_fr: 'Français',
        lang_ru: 'Русский',
        hero_title: 'Supprimer le Mot de Passe Propriétaire PDF',
        hero_description: 'Supprimez facilement les mots de passe propriétaires des fichiers PDF. Tous les traitements sont effectués localement dans votre navigateur pour une sécurité et une confidentialité maximales.',
        upload_title: 'Téléchargez Vos Fichiers PDF',
        upload_subtitle: 'Cliquez ou faites glisser les fichiers PDF ici',
        upload_hint: 'Prend en charge le téléchargement multiple de fichiers PDF, traitement par lot',
        browse_btn: 'Parcourir les Fichiers',
        features_title: 'Fonctionnalités Principales',
        feature_security_title: '100% Sécurisé et Fiable',
        feature_security_description: 'Tous les traitements sont effectués localement dans votre navigateur. Les fichiers ne sont jamais téléchargés sur aucun serveur, garantissant une confidentialité et une sécurité maximales.',
        feature_speed_title: 'Traitement Rapide et Efficace',
        feature_speed_description: 'Utilise la technologie WebAssembly pour un traitement rapide des fichiers PDF sans attendre les réponses du serveur.',
        feature_offline_title: 'Support Hors Ligne',
        feature_offline_description: "Une fois chargé, aucune connexion Internet n'est requise. Traitez des fichiers PDF n'importe quand, n'importe où.",
        feature_batch_title: 'Traitement par Lot',
        feature_batch_description: "Téléchargez plusieurs fichiers PDF à la fois et supprimez les mots de passe propriétaires en lot, améliorant l'efficacité du travail.",
        footer_text: 'Outil de Déchiffrement PDF - Simple, Efficace et Sécurisé',
        notification_welcome: "Bienvenue dans l'outil de déchiffrement PDF ! Cliquez ou faites glisser plusieurs fichiers PDF dans la zone de téléchargement, support du traitement par lot.",
        notification_loading_engine: 'Chargement du moteur de traitement PDF...',
        notification_processing: '🚀 Début du traitement de {count} fichiers PDF...',
        notification_processing_file: '⏳ Traitement du fichier : {name}',
        notification_processed_file: '✅ Fichier traité : {name}',
        notification_all_processed: '✅ Tous les {count} fichiers PDF ont été traités !',
        notification_please_upload_pdf: 'Veuillez télécharger des fichiers PDF.',
        notification_file_downloading: '📥 Préparation du téléchargement du fichier : {name}',
        notification_file_downloaded: '✅ Téléchargement du fichier terminé : {name}',
        notification_download_failed: 'Échec du téléchargement du fichier traité, veuillez réessayer.',
        notification_pdf_engine_failed: 'Échec du chargement du moteur de traitement PDF, veuillez actualiser la page et réessayer.',
        notification_password_remove_failed: 'Échec de la suppression du mot de passe propriétaire',
        notification_pdf_engine_loaded: 'Moteur de traitement PDF chargé avec succès !',
        notification_processing_files: 'Traitement des fichiers, veuillez patienter...',
        notification_pdf_processing_failed: 'Échec du traitement du fichier PDF',
        notification_password_remove_success: 'Mot de passe PDF supprimé avec succès !',
        filename_suffix: '-sans-mot-de-passe.pdf'
    },
    
    // 俄语
    'ru': {
        app_title: 'Инструмент для Расшифровки PDF',
        lang_zh_cn: '简体中文',
        lang_zh_tw: '繁体中文',
        lang_en: 'English',
        lang_ja: '日本語',
        lang_fr: 'Français',
        lang_ru: 'Русский',
        hero_title: 'Удалить Пароль Владельца PDF',
        hero_description: 'Легко удаляйте пароли владельцев из файлов PDF. Все обработки выполняются локально в вашем браузере для максимальной безопасности и защиты конфиденциальности.',
        upload_title: 'Загрузите Ваши PDF-Файлы',
        upload_subtitle: 'Нажмите или перетащите PDF-файлы сюда',
        upload_hint: 'Поддержка загрузки нескольких PDF-файлов, пакетная обработка',
        browse_btn: 'Обзор Файлов',
        features_title: 'Основные Функции',
        feature_security_title: '100% Безопасно и Надежно',
        feature_security_description: 'Все обработки выполняются локально в вашем браузере. Файлы никогда не загружаются на сервер, что гарантирует максимальную конфиденциальность и безопасность.',
        feature_speed_title: 'Быстрая и Эффективная Обработка',
        feature_speed_description: 'Использует технологию WebAssembly для быстрой обработки PDF-файлов без ожидания ответов сервера.',
        feature_offline_title: 'Поддержка Офлайн-Модера',
        feature_offline_description: 'После загрузки не требуется подключение к Интернету. Обрабатывайте PDF-файлы в любое время и в любом месте.',
        feature_batch_title: 'Пакетная Обработка',
        feature_batch_description: 'Загружайте несколько PDF-файлов сразу и удаляйте пароли владельцев пакетно, повышая эффективность работы.',
        footer_text: 'Инструмент для Расшифровки PDF - Простой, Эффективный и Безопасный',
        notification_welcome: 'Добро пожаловать в инструмент для расшифровки PDF! Нажмите или перетащите несколько PDF-файлов в область загрузки, поддерживается пакетная обработка.',
        notification_loading_engine: 'Загрузка движка обработки PDF...',
        notification_processing: '🚀 Начало обработки {count} PDF-файлов...',
        notification_processing_file: '⏳ Обработка файла: {name}',
        notification_processed_file: '✅ Обработка файла завершена: {name}',
        notification_all_processed: '✅ Все {count} PDF-файлов обработаны!',
        notification_please_upload_pdf: 'Пожалуйста, загрузите PDF-файлы.',
        notification_file_downloading: '📥 Подготовка к загрузке файла: {name}',
        notification_file_downloaded: '✅ Загрузка файла завершена: {name}',
        notification_download_failed: 'Не удалось загрузить обработанный файл, пожалуйста, попробуйте снова.',
        notification_pdf_engine_failed: 'Не удалось загрузить движок обработки PDF, пожалуйста, обновите страницу и попробуйте снова.',
        notification_password_remove_failed: 'Не удалось удалить пароль владельца',
        notification_pdf_engine_loaded: 'Движок обработки PDF успешно загружен！',
        notification_processing_files: 'Обработка файлов, пожалуйста, подождите...',
        notification_pdf_processing_failed: 'Ошибка обработки PDF-файла',
        notification_password_remove_success: 'Пароль PDF успешно удален！',
        filename_suffix: '-без-пароля.pdf'
    }
};

// DOM元素
const themeToggle = document.getElementById('themeToggle');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const languageSelector = document.getElementById('languageSelector');
const languageBtn = document.getElementById('languageBtn');
const languageDropdown = document.getElementById('languageDropdown');
const currentLanguageEl = document.getElementById('currentLanguage');
const languageOptions = document.querySelectorAll('.language-option');

// 初始化应用
function init() {
    console.log('🚀 正在初始化PDF解密工具...');
    
    // 加载语言
    loadLanguage();
    
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
    
    // 添加语言选择事件监听器
    languageBtn.addEventListener('click', toggleLanguageDropdown);
    languageOptions.forEach(option => {
        option.addEventListener('click', () => switchLanguage(option.dataset.lang));
    });
    
    // 点击外部关闭语言选择器
    document.addEventListener('click', (e) => {
        if (!languageSelector.contains(e.target)) {
            languageSelector.classList.remove('active');
        }
    });
    
    // 添加结构化数据
    addStructuredData();
    
    // 显示欢迎消息
    showNotification(getTranslation('notification_welcome'), 'info');
}

// 语言相关函数
function getTranslation(key, params = {}) {
    let translation = translations[currentLanguage][key] || translations['en'][key] || key;
    
    // 替换参数
    for (const [param, value] of Object.entries(params)) {
        translation = translation.replace(`{${param}}`, value);
    }
    
    return translation;
}

function translatePage() {
    // 翻译所有带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = getTranslation(key);
    });
    
    // 更新元数据
    updateMetadata();
}

function updateMetadata() {
    // 更新页面标题
    const titles = {
        'zh-CN': 'PDF解密工具 - 简单高效的PDF密码移除工具',
        'zh-TW': 'PDF解密工具 - 簡單高效的PDF密碼移除工具',
        'en': 'PDF Decryption Tool - Simple and Efficient PDF Password Remover',
        'ja': 'PDF復号化ツール - シンプルで効率的なPDFパスワードリムーバー',
        'fr': 'Outil de Déchiffrement PDF - Simple et Efficace Retrait de Mot de Passe PDF',
        'ru': 'Инструмент для Расшифровки PDF - Простой и Эффективный Удалитель Паролей PDF'
    };
    
    const descriptions = {
        'zh-CN': 'PDF解密工具，在线移除PDF所有者密码，无需上传文件，本地处理更安全，支持批量处理。',
        'zh-TW': 'PDF解密工具，線上移除PDF所有者密碼，無需上傳文件，本地處理更安全，支援批量處理。',
        'en': 'PDF Decryption Tool - Remove PDF owner passwords online, no file uploads, secure local processing, support batch processing.',
        'ja': 'PDF復号化ツール - PDF所有者パスワードをオンラインで削除、ファイルアップロード不要、安全なローカル処理、バッチ処理対応。',
        'fr': 'Outil de Déchiffrement PDF - Supprimez les mots de passe propriétaires PDF en ligne, pas de téléchargement de fichiers, traitement local sécurisé, support du traitement par lot.',
        'ru': 'Инструмент для Расшифровки PDF - Удалите пароли владельцев PDF онлайн, без загрузки файлов, безопасная локальная обработка, поддержка пакетной обработки.'
    };
    
    const keywords = {
        'zh-CN': 'PDF解密, PDF密码移除, 在线PDF解密, 移除PDF密码, PDF所有者密码, 本地PDF处理',
        'zh-TW': 'PDF解密, PDF密碼移除, 線上PDF解密, 移除PDF密碼, PDF所有者密碼, 本地PDF處理',
        'en': 'PDF Decryption, PDF Password Removal, Online PDF Decryption, Remove PDF Password, PDF Owner Password, Local PDF Processing',
        'ja': 'PDF復号化, PDFパスワード削除, オンラインPDF復号化, PDFパスワードを削除, PDF所有者パスワード, ローカルPDF処理',
        'fr': 'Déchiffrement PDF, Retrait de Mot de Passe PDF, Déchiffrement PDF en Ligne, Supprimer Mot de Passe PDF, Mot de Passe Propriétaire PDF, Traitement PDF Local',
        'ru': 'Расшифровка PDF, Удаление Пароля PDF, Онлайн Расшифровка PDF, Удалить Пароль из PDF, Пароль Владельца PDF, Локальная Обработка PDF'
    };
    
    // 更新meta标签
    document.getElementById('meta-title').textContent = titles[currentLanguage] || titles['en'];
    document.getElementById('meta-description').setAttribute('content', descriptions[currentLanguage] || descriptions['en']);
    document.getElementById('meta-keywords').setAttribute('content', keywords[currentLanguage] || keywords['en']);
    
    // 更新HTML语言属性
    document.documentElement.lang = currentLanguage;
}

function toggleLanguageDropdown() {
    languageSelector.classList.toggle('active');
}

function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // 更新当前语言显示
    currentLanguageEl.textContent = getTranslation(`lang_${lang.replace('-', '_').toLowerCase()}`);
    
    // 翻译页面
    translatePage();
    
    // 更新语言选项的active状态
    languageOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.lang === lang);
    });
    
    // 关闭语言选择器
    languageSelector.classList.remove('active');
    
    console.log(`🌐 语言已切换到: ${lang}`);
}

function detectBrowserLanguage() {
    // 从URL参数获取语言
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && translations[urlLang]) {
        return urlLang;
    }
    
    // 从localStorage获取偏好语言
    const preferredLang = localStorage.getItem('preferredLanguage');
    if (preferredLang && translations[preferredLang]) {
        return preferredLang;
    }
    
    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    const supportedLangs = Object.keys(translations);
    
    // 尝试匹配完整语言代码（如zh-CN）
    if (supportedLangs.includes(browserLang)) {
        return browserLang;
    }
    
    // 尝试匹配语言前缀（如zh）
    const langPrefix = browserLang.split('-')[0];
    const matchedLang = supportedLangs.find(lang => lang.startsWith(langPrefix));
    if (matchedLang) {
        return matchedLang;
    }
    
    // 默认使用英语
    return 'en';
}

function loadLanguage() {
    currentLanguage = detectBrowserLanguage();
    
    // 更新当前语言显示
    currentLanguageEl.textContent = getTranslation(`lang_${currentLanguage.replace('-', '_').toLowerCase()}`);
    
    // 更新语言选项的active状态
    languageOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.lang === currentLanguage);
    });
    
    // 翻译页面
    translatePage();
    
    console.log(`🌐 加载语言: ${currentLanguage}`);
}

function addStructuredData() {
    // 添加JSON-LD结构化数据
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': getTranslation('app_title'),
        'description': getTranslation('hero_description'),
        'url': 'https://pdf.weno.info',
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'Any',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'CNY'
        }
    };
    
    // 检查是否已存在结构化数据
    let scriptEl = document.getElementById('structured-data');
    if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'structured-data';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
    }
    
    scriptEl.textContent = JSON.stringify(structuredData);
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
    showNotification(getTranslation('notification_loading_engine'), 'info');
    
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
            showNotification(getTranslation('notification_pdf_engine_loaded'), 'success');
            isModuleLoading = false;
            
            return qpdfModule;
        } catch (error) {
            console.error('❌ 加载qpdf-wasm失败:', error);
            showNotification(getTranslation('notification_pdf_engine_failed'), 'error');
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
            showNotification(getTranslation('notification_please_upload_pdf'), 'error');
        }
    } else {
        showNotification(getTranslation('notification_please_upload_pdf'), 'error');
    }
}

// 处理多个PDF文件
async function processMultipleFiles(files) {
    if (isProcessing) {
        showNotification(getTranslation('notification_processing_files'), 'info');
        return;
    }
    
    // 筛选出PDF文件
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        showNotification(getTranslation('notification_please_upload_pdf'), 'error');
        return;
    }
    
    try {
        isProcessing = true;
        uploadArea.classList.add('loading');
        processedFilesCount = 0;
        
        const totalFiles = pdfFiles.length;
        showNotification(getTranslation('notification_processing', { count: totalFiles }), 'info');
        
        // 加载qpdf模块
        const mod = await loadQpdfModule();
        
        // 逐个处理文件
        for (const file of pdfFiles) {
            console.log(`📁 开始处理文件: ${file.name}`);
            
            // 显示更明显的处理中提示
            showNotification(getTranslation('notification_processing_file', { name: file.name }), 'info', 5000);
            
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
            showNotification(getTranslation('notification_processed_file', { name: file.name }), 'success', 2000);
        }
        
        showNotification(getTranslation('notification_all_processed', { count: totalFiles }), 'success');
    } catch (error) {
        console.error('处理PDF文件时出错:', error);
        showNotification(`${getTranslation('notification_pdf_processing_failed')}: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        uploadArea.classList.remove('loading');
    }
}

// 处理单个PDF文件
async function processFile(file) {
    if (isProcessing) {
        showNotification(getTranslation('notification_processing_files'), 'info');
        return;
    }
    
    // 验证文件类型
    if (file.type !== 'application/pdf') {
        showNotification(getTranslation('notification_please_upload_pdf'), 'error');
        return;
    }
    
    try {
        isProcessing = true;
        uploadArea.classList.add('loading');
        
        showNotification(getTranslation('notification_processing_file', { name: file.name }), 'info');
        
        // 加载qpdf模块
        const mod = await loadQpdfModule();
        
        // 使用qpdf-wasm移除密码
        const processedBlob = await removeOwnerPassword(mod, file);
        
        // 下载处理后的文件
        downloadFile(processedBlob, file.name);
        
        showNotification(getTranslation('notification_password_remove_success'), 'success');
    } catch (error) {
        console.error('处理PDF文件时出错:', error);
        showNotification(`${getTranslation('notification_pdf_processing_failed')}: ${error.message}`, 'error');
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
            throw new Error(getTranslation('notification_password_remove_failed') + ' (退出码: ' + result + ')');
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
        showNotification(getTranslation('notification_file_downloading', { name: originalFilename }), 'info', 5000);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // 生成不带密码的文件名
        const filename = originalFilename.replace(/\.pdf$/i, getTranslation('filename_suffix'));
        
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
            <span>${getTranslation('notification_file_downloading', { name: filename })}</span>
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
                <span>${getTranslation('notification_file_downloaded', { name: filename })}</span>
            `;
            
            // 3秒后移除下载进度提示
            setTimeout(() => {
                downloadProgress.remove();
            }, 3000);
            
            // 显示下载完成通知
            showNotification(getTranslation('notification_file_downloaded', { name: filename }), 'success', 4000);
        }, 500);
        
    } catch (error) {
        console.error('❌ 下载文件时出错:', error);
        showNotification(getTranslation('notification_download_failed'), 'error');
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