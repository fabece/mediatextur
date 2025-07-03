'use strict';

/**
 * Content Factory Application
 * Main JavaScript file for handling all interactions
 */

// ===========================
// Global State & Configuration
// ===========================

const APP_CONFIG = {
    API_BASE_URL: '/api/v1',
    NOTIFICATION_DURATION: 3000,
    LOCAL_STORAGE_KEYS: {
        THEME: 'contentFactory_theme',
    },
};

const APP_STATE = {
    currentContent: '',
    systemPrompt: '',
    promptTemplates: [],
    toneValues: [],
    isGenerating: false,
    currentRequestController: null,
};

// ===========================
// DOM Elements Cache
// ===========================

const DOM = {
    // Theme
    themeToggle: document.getElementById('themeToggle'),

    // Form elements
    contentForm: document.getElementById('contentForm'),
    formSection: document.getElementById('formSection'),
    titleInput: document.getElementById('title'),
    promptSelect: document.getElementById('promptSelect'),
    topicInput: document.getElementById('topic'),
    keywordsInput: document.getElementById('keywords'),
    targetAudienceInput: document.getElementById('targetAudience'),
    toneSelect: document.getElementById('tone'),
    additionalContextTextarea: document.getElementById('additionalContext'),
    generateBtn: document.querySelector('.btn--primary'),

    // Result elements
    formContainer: document.getElementById('formContainer'),
    resultContainer: document.getElementById('resultContainer'),
    resultContent: document.getElementById('resultContent'),
    resultDate: document.getElementById('resultDate'),
    saveToNotionBtn: document.getElementById('saveToNotion'),
    regenerateBtn: document.getElementById('regenerateContent'),
    cancelEditBtn: document.getElementById('cancelEdit'),

    // Sidebar elements
    moreBtn: document.getElementById('moreBtn'),
    sidebar: document.getElementById('sidebar'),
    closeSidebarBtn: document.getElementById('closeSidebar'),
    overlay: document.getElementById('overlay'),
    dropdownEditor: document.getElementById('dropdownEditor'),
    addDropdownItemBtn: document.getElementById('addDropdownItem'),
    saveSettingsBtn: document.getElementById('saveSettings'),
    settingsLoader: document.getElementById('settingsLoader'),
    sidebarContent: document.getElementById('sidebarContent'),
    templateEditor: document.getElementById('templateEditor'),
    addTemplateBtn: document.getElementById('addTemplateBtn'),
    systemPromptTextarea: document.getElementById('systemPrompt'),

    // Notification
    notification: document.getElementById('notification'),
};

// ===========================
// Theme Management
// ===========================

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.THEME) || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        DOM.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.THEME, theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
}

// ===========================
// Notification System
// ===========================

class NotificationManager {
    static show(message, type = 'success') {
        // Remove existing classes
        DOM.notification.className = 'notification';

        // Set new content and classes
        DOM.notification.textContent = message;
        DOM.notification.classList.add(`notification--${type}`, 'show');

        // Auto-hide after duration
        setTimeout(() => {
            DOM.notification.classList.remove('show');
        }, APP_CONFIG.NOTIFICATION_DURATION);
    }
}

// ===========================
// API Service
// ===========================

class APIService {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    static async generateContent(data) {
        // Cancel any existing request
        if (APP_STATE.currentRequestController) {
            APP_STATE.currentRequestController.abort();
        }

        // Create new abort controller
        APP_STATE.currentRequestController = new AbortController();

        return this.request('/content/generate', {
            method: 'POST',
            body: JSON.stringify(data),
            signal: APP_STATE.currentRequestController.signal,
        });
    }

    static async saveToNotion(data) {
        return this.request('/notion/save', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async loadSettingsFromNotion() {
        return this.request('/notion/settings', {
            method: 'GET',
        });
    }

    static async saveSettingsToNotion(data) {
        return this.request('/notion/settings', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

// ===========================
// Form Manager
// ===========================

class FormManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
    }

    setupEventListeners() {
        DOM.contentForm.addEventListener('submit', (e) => this.handleSubmit(e));
        DOM.moreBtn.addEventListener('click', () => this.toggleSidebar());
        DOM.closeSidebarBtn.addEventListener('click', () => this.closeSidebar());
        DOM.overlay.addEventListener('click', () => this.closeSidebar());
        DOM.addDropdownItemBtn.addEventListener('click', () => this.addToneItem());
        DOM.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        DOM.saveToNotionBtn.addEventListener('click', () => this.saveToNotion());
        DOM.regenerateBtn.addEventListener('click', () => this.regenerateContent());
        DOM.cancelEditBtn.addEventListener('click', () => this.cancelEdit());

        DOM.addTemplateBtn.addEventListener('click', () => this.addTemplatesItem());
    }

    async loadSettings() {
        this.showSettingsLoading(true);

        try {
            // Try to load from Notion
            const settings = await APIService.loadSettingsFromNotion();

            APP_STATE.systemPrompt = settings.systemPrompt;
            APP_STATE.promptTemplates = settings.promptTemplates;
            APP_STATE.toneValues = settings.toneValues;

            // Update UI
            this.updateToneSelect();
            this.updateToneEditor();
            this.updateTemplatesSelect();
            this.updatePromptSelect();

            this.showSettingsLoading(false);
        } catch (error) {
            NotificationManager.show(error.message || 'Error loading settings from Notion', 'error');
        }
    }

    showSettingsLoading(isLoading) {
        if (isLoading) {
            DOM.settingsLoader.style.display = 'block';
            DOM.sidebarContent.style.display = 'none';
        } else {
            DOM.settingsLoader.style.display = 'none';
            DOM.sidebarContent.style.display = 'block';
        }
    }

    // Templates
    updateTemplatesSelect() {
        DOM.templateEditor.innerHTML = '';

        APP_STATE.promptTemplates.forEach((template, index) => {
            const item = document.createElement('div');
            item.className = 'template-item';
    
            item.innerHTML = `
                <div class="template-item__header">
                    <input type="text" class="template-item__name" value="${template.name}" data-index="${index}" />
                    <button class="template-item__remove" data-index="${index}" aria-label="Remove Template">×</button>
                </div>
                <textarea class="template-item__textarea" data-index="${index}" rows="4">${template.content}</textarea>
            `;
    
            DOM.templateEditor.appendChild(item);
        });

        DOM.templateEditor.querySelectorAll('.template-item__name').forEach((input) => {
            input.addEventListener('input', (e) => {
                const i = parseInt(e.target.dataset.index);
                APP_STATE.promptTemplates[i].name = e.target.value;
                this.updatePromptSelect();
            });
        });

        DOM.templateEditor.querySelectorAll('.template-item__textarea').forEach((area) => {
            area.addEventListener('input', (e) => {
                const i = parseInt(e.target.dataset.index);
                APP_STATE.promptTemplates[i].template = e.target.value;
            });
        });

        DOM.templateEditor.querySelectorAll('.template-item__remove').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const i = parseInt(e.target.dataset.index);
                APP_STATE.promptTemplates.splice(i, 1);
                this.updatePromptSelect();
                this.updateTemplatesSelect();
            });
        });
    }

    addTemplatesItem() {
        APP_STATE.promptTemplates.push({
            name: 'Empty',
            content: 'Empty...',
        });
        this.updatePromptSelect();
        this.updateTemplatesSelect();
    }

    updatePromptSelect() {
        DOM.promptSelect.innerHTML = '<option value="">Select a template...</option>';

        APP_STATE.promptTemplates.forEach((value) => {
            const option = document.createElement('option');
            option.value = value.content;
            option.textContent = value.name;
            DOM.promptSelect.appendChild(option);
        });
    }

    // Tone
    updateToneSelect() {
        DOM.toneSelect.innerHTML = '<option value="">Default</option>';

        APP_STATE.toneValues.forEach((value) => {
            const option = document.createElement('option');
            option.value = value.toLowerCase();
            option.textContent = value;
            DOM.toneSelect.appendChild(option);
        });
    }

    addToneItem() {
        const value = prompt('Enter new tone option:');
        if (value && value.trim()) {
            APP_STATE.toneValues.push(value.trim());
            this.updateToneEditor();
            this.updateToneSelect();
        }
    }

    removeToneItem(index) {
        APP_STATE.toneValues.splice(index, 1);
        this.updateToneEditor();
        this.updateToneSelect();
    }

    updateToneEditor() {
        DOM.dropdownEditor.innerHTML = APP_STATE.toneValues
            .map(
                (value, index) => `
                    <div class="dropdown-item">
                        <input type="text" class="dropdown-item__input" value="${value}" readonly>
                        <button class="dropdown-item__remove" data-index="${index}" aria-label="Remove ${value}">×</button>
                    </div>
                `
            )
            .join('');

        // Add event listeners to remove buttons
        DOM.dropdownEditor.querySelectorAll('.dropdown-item__remove').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeToneItem(index);
            });
        });
    }

    // Sidebar
    toggleSidebar() {
        DOM.sidebar.classList.toggle('active');
        DOM.overlay.classList.toggle('active');
        DOM.moreBtn.classList.toggle('active');
    }

    closeSidebar() {
        DOM.sidebar.classList.remove('active');
        DOM.overlay.classList.remove('active');
        DOM.moreBtn.classList.remove('active');
    }

    // Save
    async saveSettings() {
        APP_STATE.systemPrompt = DOM.systemPromptTextarea.value;

        try {
            // Try to save to Notion
            const response = await APIService.saveSettingsToNotion({
                systemPrompt: APP_STATE.systemPrompt,
                promptTemplates: APP_STATE.promptTemplates,
                toneValues: APP_STATE.toneValues,
            });

            NotificationManager.show(response.message || 'Settings saved successfully!');
        } catch (error) {
            NotificationManager.show(error.message || 'Settings not saved', 'error');
        }

        this.closeSidebar();
    }

    // Generate content
    async handleSubmit(e) {
        e.preventDefault();

        if (APP_STATE.isGenerating) return;

        const formData = new FormData(e.target);

        // Prepare data
        const data = {
            systemPrompt: APP_STATE.systemPrompt,
            title: formData.get('title'),
            promptSelect: formData.get('promptSelect'),
            topic: formData.get('topic'),
            keywords: formData.get('keywords'),
            targetAudience: formData.get('targetAudience'),
            tone: formData.get('tone'),
            additionalContext: formData.get('additionalContext'),
        };

        // Update UI
        this.setGeneratingState(true);

        try {
            const result = await APIService.generateContent(data);

            APP_STATE.currentContent = result.content;

            this.setGeneratingState(false);
            this.showResult(result.content);

            NotificationManager.show(result.message || 'Content generated successfully!');

        } catch (error) {
            if (error.name !== 'AbortError') {
                NotificationManager.show(error.message || 'Error generating content', 'error');
            }
        }
    }

    setGeneratingState(isGenerating) {
        APP_STATE.isGenerating = isGenerating;

        DOM.generateBtn.classList.toggle('loading', isGenerating);
        DOM.generateBtn.disabled = isGenerating;

        DOM.formSection.style.opacity = isGenerating ? '0.6' : '1';
        DOM.formSection.style.pointerEvents = isGenerating ? 'none' : 'auto';
    }

    showResult(content) {
        DOM.resultContent.textContent = content;
        DOM.resultDate.textContent = new Date().toLocaleString();
        DOM.formContainer.style.display = 'none';
        DOM.resultContainer.style.display = 'block';
        DOM.resultContainer.classList.add('fade-in');
    }

    async saveToNotion() {
        const editedContent = DOM.resultContent.innerText;

        const formData = new FormData(DOM.contentForm);
        const metadata = {
            systemPrompt: APP_STATE.systemPrompt,
            title: formData.get('title'),
            promptSelect: formData.get('promptSelect'),
            topic: formData.get('topic'),
            keywords: formData.get('keywords'),
            targetAudience: formData.get('targetAudience'),
            tone: formData.get('tone'),
            additionalContext: formData.get('additionalContext'),
        };

        try {
            const result = await APIService.saveToNotion({
                content: editedContent,
                metadata: metadata,
            });

            NotificationManager.show(result.message || 'Content saved to Notion successfully!');
            this.resetForm();
        } catch (error) {
            NotificationManager.show(error.message || 'Error saving to Notion', 'error');
        }
    }

    async regenerateContent() {
        if (confirm('Regenerate content? Current edits will be lost.')) {
            DOM.formContainer.style.display = 'block';
            DOM.resultContainer.style.display = 'none';
            DOM.contentForm.dispatchEvent(new Event('submit'));
        }
    }

    cancelEdit() {
        if (confirm('Cancel editing? All changes will be lost.')) {
            this.resetForm();
        }
    }

    resetForm() {
        DOM.contentForm.reset();
        DOM.formContainer.style.display = 'block';
        DOM.resultContainer.style.display = 'none';
        APP_STATE.currentContent = '';
        APP_STATE.currentRequestController = null;
    }
}

// ===========================
// Application Initialization
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    new ThemeManager();

    // Initialize form manager
    new FormManager();

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
