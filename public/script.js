'use strict';

// Global variables
let currentContent = '';
let promptTemplates = [];
let systemPromptText = 'Du bist ein professioneller Content-Ersteller für Mediatextur, spezialisiert auf SEO, SEA und Webentwicklung.';
let dropdownValues = ['Professionell', 'Freundlich', 'Informativ', 'Überzeugend'];

// Toggle sidebar
document.getElementById('moreBtn').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    this.classList.toggle('active');
});

// Close sidebar
document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
document.getElementById('overlay').addEventListener('click', closeSidebar);

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('moreBtn').classList.remove('active');
}

// Load settings from Notion (simulated)
async function loadSettingsFromNotion() {
    try {
        // Simulate API call to Notion
        const response = await fetch('/api/settings/notion');
        const data = await response.json();
        
        // Update system prompt
        if (data.systemPrompt) {
            systemPromptText = data.systemPrompt;
            document.getElementById('systemPrompt').value = systemPromptText;
        }
        
        // Update dropdown values
        if (data.dropdownValues) {
            dropdownValues = data.dropdownValues;
            updateDropdownEditor();
            updateToneSelect();
        }
    } catch (error) {
        console.log('Using default settings');
    }
}

// Update dropdown editor display
function updateDropdownEditor() {
    const editor = document.getElementById('dropdownEditor');
    editor.innerHTML = dropdownValues.map(value => `
        <div class="dropdown-item">
            <input type="text" value="${value}" readonly>
            <button onclick="removeDropdownItem(this)">×</button>
        </div>
    `).join('');
}

// Update tone select options
function updateToneSelect() {
    const toneSelect = document.getElementById('tone');
    toneSelect.innerHTML = '<option value="">Standard</option>';
    dropdownValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value.toLowerCase();
        option.textContent = value;
        toneSelect.appendChild(option);
    });
}

// Add dropdown item
function addDropdownItem() {
    const value = prompt('Neuen Wert eingeben:');
    if (value && value.trim()) {
        dropdownValues.push(value.trim());
        updateDropdownEditor();
        updateToneSelect();
    }
}

// Remove dropdown item
function removeDropdownItem(button) {
    const item = button.parentElement;
    const value = item.querySelector('input').value;
    dropdownValues = dropdownValues.filter(v => v !== value);
    updateDropdownEditor();
    updateToneSelect();
}

// Save settings
async function saveSettings() {
    systemPromptText = document.getElementById('systemPrompt').value;
    
    try {
        // Save to Notion (simulated)
        await fetch('/api/settings/notion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt: systemPromptText,
                dropdownValues: dropdownValues
            })
        });
        
        showNotification('Einstellungen gespeichert!');
        closeSidebar();
    } catch (error) {
        showNotification('Fehler beim Speichern', 'error');
    }
}

// Load prompt templates
async function loadPromptTemplates() {
    try {
        const response = await fetch('/api/content/prompts');
        promptTemplates = await response.json();
        
        const select = document.getElementById('promptSelect');
        select.innerHTML = '<option value="">Wählen Sie eine Vorlage...</option>';
        
        promptTemplates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading prompts:', error);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Handle form submission
document.getElementById('contentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const selectedPromptId = formData.get('promptSelect');
    const selectedPrompt = promptTemplates.find(p => p.id === selectedPromptId);
    
    if (!selectedPrompt) {
        showNotification('Bitte wählen Sie eine Prompt-Vorlage aus', 'error');
        return;
    }
    
    const data = {
        title: formData.get('title'),
        prompt: selectedPrompt.template,
        topic: formData.get('topic'),
        keywords: formData.get('keywords'),
        targetAudience: formData.get('targetAudience'),
        tone: formData.get('tone'),
        additionalContext: formData.get('additionalContext'),
        systemPrompt: systemPromptText
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const formSection = document.getElementById('formSection');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    formSection.classList.add('loading');
    
    try {
        const response = await fetch('/api/content/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentContent = result.content;
            document.getElementById('resultContent').textContent = result.content;
            document.getElementById('result').style.display = 'block';
            document.getElementById('contentForm').style.display = 'none';
            showNotification('Content erfolgreich generiert!');
        } else {
            showNotification(result.message || 'Fehler beim Generieren des Contents', 'error');
        }
    } catch (error) {
        showNotification('Netzwerkfehler. Bitte versuchen Sie es erneut.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        formSection.classList.remove('loading');
    }
});

// Handle save to Notion
document.getElementById('saveToNotion').addEventListener('click', async () => {
    const editedContent = document.getElementById('resultContent').innerText;
    const title = document.getElementById('title').value;
    
    try {
        const response = await fetch('/api/content/save-to-notion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                content: editedContent
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Content wurde an Notion gesendet!');
            setTimeout(() => {
                resetForm();
            }, 2000);
        } else {
            showNotification('Fehler beim Speichern', 'error');
        }
    } catch (error) {
        showNotification('Netzwerkfehler', 'error');
    }
});

// Handle cancel
document.getElementById('cancelEdit').addEventListener('click', () => {
    if (confirm('Möchten Sie wirklich abbrechen? Alle Änderungen gehen verloren.')) {
        resetForm();
    }
});

// Reset form
function resetForm() {
    document.getElementById('contentForm').reset();
    document.getElementById('contentForm').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    currentContent = '';
}

// Initialize
loadPromptTemplates();
loadSettingsFromNotion();
updateToneSelect();