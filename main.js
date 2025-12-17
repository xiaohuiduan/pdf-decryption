// PDF Tool - Simplified Version

// Import the qpdf module using Vite's module system
import Module from '@jspawn/qpdf-wasm/qpdf.js';
import WASM_URL from '@jspawn/qpdf-wasm/qpdf.wasm?url';

// Global variables
let qpdfModule = null;
let isProcessing = false;
let isModuleLoading = true;
let moduleLoadError = false;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');

// Initialize the application
function init() {
    console.log('🚀 Initializing PDF Tool application...');
    
    // Load theme preference from localStorage
    loadTheme();
    
    // Add event listeners
    themeToggle.addEventListener('click', toggleTheme);
    fileInput.addEventListener('change', handleFileSelect);
    browseBtn.addEventListener('click', () => fileInput.click());
    
    // Add drag-and-drop event listeners
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Load qpdf WebAssembly module
    loadQpdfModule();
    
    // Show welcome message
    showNotification('Welcome to PDF Tool! Please wait for the processing engine to load, then upload your PDF file.', 'info');
}

// Load qpdf WebAssembly module
async function loadQpdfModule() {
    console.log('🔧 Loading QPDF WebAssembly module...');
    isModuleLoading = true;
    moduleLoadError = false;
    
    try {
        // Initialize the qpdf module using the correct Vite syntax
        qpdfModule = await Module({
            locateFile: () => WASM_URL,
        });
        
        console.log('🎉 QPDF module loaded successfully!');
        console.log('✅ Module has FS:', typeof qpdfModule.FS === 'object');
        console.log('✅ Module has callMain:', typeof qpdfModule.callMain === 'function');
        
        isModuleLoading = false;
        showNotification('PDF processing engine loaded successfully!', 'success');
    } catch (error) {
        console.error('❌ Failed to load QPDF module:', error);
        console.error('Error details:', error.stack);
        moduleLoadError = true;
        isModuleLoading = false;
        showNotification('Failed to load PDF processing engine. Please refresh the page and try again.', 'error');
    }
}

// Handle file selection
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await processFile(file);
    }
}

// Handle drag over event
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave event
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle drop event
async function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        await processFile(file);
    } else {
        showNotification('Please upload a PDF file.', 'error');
    }
}

// Process the PDF file
async function processFile(file) {
    if (isProcessing) {
        showNotification('Already processing a file. Please wait...', 'info');
        return;
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
        showNotification('Please upload a PDF file.', 'error');
        return;
    }
    
    console.log('📁 Processing file:', file.name);
    
    // Check if module is still loading
    if (isModuleLoading) {
        showNotification('PDF processing engine is still loading. Please wait...', 'info');
        return;
    }
    
    // Check if module failed to load
    if (moduleLoadError) {
        showNotification('PDF processing engine failed to load. Please refresh the page and try again.', 'error');
        return;
    }
    
    // Check if module is ready
    if (!qpdfModule) {
        showNotification('PDF processing engine is not ready. Please refresh the page and try again.', 'error');
        return;
    }
    
    try {
        isProcessing = true;
        uploadArea.classList.add('loading');
        
        showNotification('Processing PDF file...', 'info');
        
        // Remove PDF owner password
        const processedBlob = await removeOwnerPassword(file);
        
        // Download the processed file
        downloadFile(processedBlob, file.name);
        
        showNotification('PDF password removed successfully!', 'success');
    } catch (error) {
        console.error('❌ Error processing PDF:', error);
        showNotification('Failed to process PDF. Please try again.', 'error');
    } finally {
        isProcessing = false;
        uploadArea.classList.remove('loading');
        console.log('🔚 Processing complete');
    }
}

// Remove PDF owner password using qpdf
async function removeOwnerPassword(file) {
    console.log('🔑 Starting PDF password removal...');
    
    // Use the already initialized module instance
    const mod = qpdfModule;
    
    try {
        // Create a working directory
        const working = '/working';
        mod.FS.mkdir(working);
        console.log('📁 Created working directory');
        
        // Write the input file
        const input = `${working}/input.pdf`;
        const fileBuffer = await file.arrayBuffer();
        mod.FS.writeFile(input, new Uint8Array(fileBuffer));
        console.log('✅ Input file written successfully');
        
        // Set output path
        const output = '/output.pdf';
        
        // Run qpdf with decrypt command
        console.log('🔧 Running qpdf command: --decrypt', input, output);
        
        const args = ['--decrypt', input, output];
        const result = await mod.callMain(args);
        
        if (result !== 0) {
            throw new Error(`qpdf command failed with exit code ${result}`);
        }
        
        console.log('✅ qpdf command executed successfully');
        
        // Read the output file
        const outputBuffer = mod.FS.readFile(output, { encoding: 'binary' });
        console.log('📖 Output file read successfully:', outputBuffer.length, 'bytes');
        
        // Create a blob from the output buffer
        const resultBlob = new Blob([outputBuffer], { type: 'application/pdf' });
        console.log('🎉 Created result blob:', resultBlob.size, 'bytes');
        
        return resultBlob;
    } catch (error) {
        console.error('❌ Error in removeOwnerPassword:', error);
        throw error;
    }
}

// Download file functionality
function downloadFile(blob, originalFilename) {
    console.log('📥 Starting file download...');
    
    try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Generate filename without password
        const filename = originalFilename.replace(/\.pdf$/i, '-no-password.pdf');
        
        a.href = url;
        a.download = filename;
        
        // Add to document and click
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification(`✅ File downloaded successfully as: ${filename}`, 'success');
        }, 100);
        
    } catch (error) {
        console.error('❌ Error during download:', error);
        showNotification('Failed to download the processed file. Please try again.', 'error');
    }
}

// Theme management
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

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);