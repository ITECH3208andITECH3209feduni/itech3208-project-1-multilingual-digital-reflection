// Journal Entry Script for StoryBond

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://storybond-backend.vercel.app';
    
let selectedMedia = [];
let selectedFiles = [];
const editEntryId = new URLSearchParams(window.location.search).get('edit');

// Load children for selector
async function loadChildrenSelector() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
        const response = await fetch(`${API_URL}/api/children/parent/${userId}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const selectorHTML = `
                <div id="childSelector" style="margin: 15px 0;">
                    <p style="font-weight:600; margin-bottom:8px;">👶 Who is this about?</p>
                    <div id="childButtons" style="display:flex; gap:10px; flex-wrap:wrap;">
                        ${data.data.map(child => `
                            <button 
                                type="button"
                                class="child-select-btn"
                                data-child-id="${child.id}"
                                data-child-name="${child.name}"
                                style="
                                    padding: 10px 16px;
                                    border: 2px solid #E0D0F0;
                                    border-radius: 20px;
                                    background: white;
                                    cursor: pointer;
                                    font-size: 14px;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                "
                            >
                                <span style="font-size:20px;">${child.avatar}</span>
                                <span>${child.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            const form = document.getElementById('journalForm');
            form.insertAdjacentHTML('afterbegin', selectorHTML);
            
            // Add click handlers
            document.querySelectorAll('.child-select-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.child-select-btn').forEach(b => {
                        b.style.border = '2px solid #E0D0F0';
                        b.style.background = 'white';
                    });
                    
                    this.style.border = '2px solid #C77CF9';
                    this.style.background = '#F0E8F5';
                    
                    localStorage.setItem('journalChildId', this.dataset.childId);
                    localStorage.setItem('journalChildName', this.dataset.childName);
                });
            });
            
            // Auto-select first child
            const firstBtn = document.querySelector('.child-select-btn');
            if (firstBtn) {
                firstBtn.click();
            }
        }
    } catch (error) {
        console.error('Error loading children:', error);
    }
}

const JournalEntry = {
    async init() {
        // Load children selector (auto-selects the first child)
        await loadChildrenSelector();

        // Form submission
        const form = document.getElementById('journalForm');
        form.addEventListener('submit', JournalEntry.handleSubmit);
        
        // Date input formatting
        const dateInput = document.getElementById('entryDate');
        dateInput.addEventListener('input', JournalEntry.formatDate);
        
        // Tag buttons
        const tagBtns = document.querySelectorAll('.tag-btn:not(.add-tag-btn)');
        tagBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
        });

        // "+ Add tag" button: prompt for a custom tag and add it as a selectable chip
        const addTagBtn = document.querySelector('.add-tag-btn');
        if (addTagBtn) {
            addTagBtn.addEventListener('click', () => {
                const label = prompt('Enter a new tag:');
                if (!label || !label.trim()) return;

                const tagValue = label.trim().toLowerCase().replace(/\s+/g, '-');

                // Avoid adding a duplicate tag
                const existing = document.querySelector(`.tag-btn[data-tag="${tagValue}"]`);
                if (existing) {
                    existing.classList.add('selected');
                    return;
                }

                const newTagBtn = document.createElement('button');
                newTagBtn.type = 'button';
                newTagBtn.className = 'tag-btn selected';
                newTagBtn.dataset.tag = tagValue;
                newTagBtn.textContent = `# ${label.trim()}`;
                newTagBtn.addEventListener('click', function() {
                    this.classList.toggle('selected');
                });

                addTagBtn.parentNode.insertBefore(newTagBtn, addTagBtn);
            });
        }

        // Mood buttons
        const moodBtns = document.querySelectorAll('.mood-btn');
        moodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                moodBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        // Photo upload
        const photoInput = document.getElementById('photoInput');
        photoInput.addEventListener('change', function(e) {
            JournalEntry.handleFileSelect(e.target.files, 'photo');
        });
        
        // Video upload
        const videoInput = document.getElementById('videoInput');
        videoInput.addEventListener('change', function(e) {
            JournalEntry.handleFileSelect(e.target.files, 'video');
        });

        // If we're editing an existing entry, load its data into the form
        if (editEntryId) {
            await JournalEntry.loadEntryForEdit(editEntryId);
        }
    },

    async loadEntryForEdit(entryId) {
        try {
            const response = await fetch(`${API_URL}/api/entries-new/${entryId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Entry not found');

            const entry = data.data;

            document.getElementById('entryTitle').value = entry.title || '';
            document.getElementById('storyText').value = entry.content || '';

            if (entry.entry_date) {
                const [y, m, d] = entry.entry_date.split('-');
                document.getElementById('entryDate').value = `${d}/${m}/${y}`;
            }

            // Re-select the correct child
            const childBtn = document.querySelector(`.child-select-btn[data-child-id="${entry.child_id}"]`);
            if (childBtn) childBtn.click();

            // Re-select the correct mood
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            const moodBtn = document.querySelector(`.mood-btn[data-mood="${entry.mood}"]`);
            if (moodBtn) moodBtn.classList.add('selected');

            // Re-select the milestone tag (the only tag actually persisted server-side)
            if (entry.is_milestone) {
                const milestoneBtn = document.querySelector('.tag-btn[data-tag="milestone"]');
                if (milestoneBtn) milestoneBtn.classList.add('selected');
            }

            // Show existing photos/videos as a preview (kept as-is; new uploads are added alongside them)
            if (entry.media && entry.media.length > 0) {
                const previewArea = document.getElementById('mediaPreview');
                entry.media.forEach(m => {
                    const item = document.createElement('div');
                    item.className = 'preview-item-journal';
                    item.innerHTML = m.media_type === 'image'
                        ? `<img src="${m.file_url}" alt="Existing photo">`
                        : `<div style="background:#F0E8F5; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:32px;">🎥</div>`;
                    previewArea.appendChild(item);
                });
            }

            // Switch the form's labels into "edit" mode (and re-translate them)
            const heading = document.querySelector('.journal-heading');
            if (heading) heading.setAttribute('data-i18n', 'edit_journal_heading');
            const subheading = document.querySelector('.journal-subheading');
            if (subheading) subheading.setAttribute('data-i18n', 'edit_journal_subheading');
            const submitLabel = document.querySelector('.save-btn-journal span[data-i18n="save_entry"]');
            if (submitLabel) submitLabel.setAttribute('data-i18n', 'update_entry_btn');

            if (typeof applyLanguage === 'function') {
                applyLanguage(localStorage.getItem('storybondLang') || 'en');
            }
        } catch (error) {
            console.error('Error loading entry for edit:', error);
            alert('❌ Could not load this entry for editing.');
        }
    },

    formatDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
        if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5);
        e.target.value = value.slice(0, 10);
    },

    convertDate(dateStr) {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        if (dateStr.includes('-')) return dateStr;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return new Date().toISOString().split('T')[0];
    },
    
    handleFileSelect(files, type) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedMedia.push({
                    type: type,
                    url: e.target.result,
                    name: file.name,
                    file: file
                });
                selectedFiles.push(file);
                JournalEntry.renderMediaPreview();
            };
            reader.readAsDataURL(file);
        });
    },
    
    renderMediaPreview() {
        const previewArea = document.getElementById('mediaPreview');
        previewArea.innerHTML = '';
        
        selectedMedia.forEach((media, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item-journal';
            
            if (media.type === 'photo') {
                previewItem.innerHTML = `
                    <img src="${media.url}" alt="Preview">
                    <button class="remove-media" onclick="JournalEntry.removeMedia(${index})">✕</button>
                `;
            } else {
                previewItem.innerHTML = `
                    <div style="background: #F0E8F5; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                        🎥
                    </div>
                    <button class="remove-media" onclick="JournalEntry.removeMedia(${index})">✕</button>
                `;
            }
            previewArea.appendChild(previewItem);
        });
    },
    
    removeMedia(index) {
        selectedMedia.splice(index, 1);
        selectedFiles.splice(index, 1);
        JournalEntry.renderMediaPreview();
    },
    
    async uploadMedia(entryId) {
        if (selectedFiles.length === 0) return [];
        const userId = localStorage.getItem('userId');
        const uploadedUrls = [];
        
        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('parent_id', userId);
            formData.append('entry_id', entryId);
            
            try {
                const response = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) uploadedUrls.push(data.data.file_url);
            } catch (error) {
                console.error('Upload error:', error);
            }
        }
        return uploadedUrls;
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('entryTitle').value.trim();
        const date = document.getElementById('entryDate').value;
        const story = document.getElementById('storyText').value.trim();
        const userId = localStorage.getItem('userId');
        const childId = localStorage.getItem('journalChildId');
        
        const selectedMood = document.querySelector('.mood-btn.selected');
        const selectedTags = Array.from(document.querySelectorAll('.tag-btn[data-tag].selected'))
            .map(btn => btn.dataset.tag);
        
        if (!title) {
            alert('⚠️ Please enter an entry title');
            return;
        }
        if (!story) {
            alert('⚠️ Please write about what happened');
            return;
        }
        if (!userId) {
            alert('⚠️ Please log in first');
            window.location.href = 'login.html';
            return;
        }
        if (!childId) {
            alert('⚠️ Please select a child first!');
            return;
        }
        
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = editEntryId ? '⏳ Updating...' : '⏳ Saving...';

        try {
            const isEdit = !!editEntryId;
            const url = isEdit ? `${API_URL}/api/entries-new/${editEntryId}` : `${API_URL}/api/entries-new`;

            const entryResponse = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parent_id: userId,
                    child_id: childId,
                    title: title,
                    entry_date: JournalEntry.convertDate(date),
                    content: story,
                    mood: selectedMood ? selectedMood.dataset.mood : 'happy',
                    language: document.querySelector('.lang-btn.active')?.textContent === 'TR' ? 'TR' : 'EN',
                    is_milestone: selectedTags.includes('milestone')
                })
            });

            const entryData = await entryResponse.json();

            if (!entryData.success) throw new Error(entryData.error);

            const savedEntryId = isEdit ? editEntryId : entryData.data.id;
            if (selectedFiles.length > 0) {
                await JournalEntry.uploadMedia(savedEntryId);
            }

            alert(isEdit ? '✅ Journal entry updated successfully!' : '✅ Journal entry saved successfully!');

            document.getElementById('journalForm').reset();
            selectedMedia = [];
            selectedFiles = [];
            JournalEntry.renderMediaPreview();
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
            
        } catch (error) {
            console.error('Error saving entry:', error);
            alert(`❌ Error: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = editEntryId ? '🔄 Update Entry' : '✏️ Save Entry';
        }
    }
};

window.JournalEntry = JournalEntry;

function handleAddMore() {
    document.getElementById('photoInput').click();
}

document.addEventListener('DOMContentLoaded', JournalEntry.init);

// Language Switcher
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});
