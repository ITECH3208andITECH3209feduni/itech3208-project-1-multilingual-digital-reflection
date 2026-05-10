// Journal Entry Script for StoryBond

let selectedMedia = [];

const JournalEntry = {
    init() {
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
    },
    
    formatDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length >= 5) {
            value = value.slice(0, 5) + '/' + value.slice(5);
        }
        
        e.target.value = value.slice(0, 10);
    },
    
    handleFileSelect(files, type) {
        const previewArea = document.getElementById('mediaPreview');
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const mediaItem = {
                    type: type,
                    url: e.target.result,
                    name: file.name
                };
                
                selectedMedia.push(mediaItem);
                JournalEntry.renderMediaPreview();
            };
            
            if (type === 'photo') {
                reader.readAsDataURL(file);
            } else {
                // For videos, create a thumbnail
                reader.readAsDataURL(file);
            }
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
        JournalEntry.renderMediaPreview();
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('entryTitle').value.trim();
        const date = document.getElementById('entryDate').value;
        const story = document.getElementById('storyText').value.trim();
        
        const selectedWho = document.querySelector('.tag-btn[data-who].selected');
        const selectedMood = document.querySelector('.mood-btn.selected');
        const selectedTags = Array.from(document.querySelectorAll('.tag-btn[data-tag].selected'))
            .map(btn => btn.dataset.tag);
        
        // Basic validation
        if (!title) {
            alert('⚠️ Please enter an entry title');
            return;
        }
        
        if (!story) {
            alert('⚠️ Please write about what happened');
            return;
        }
        
        // Collect form data
        const entryData = {
            title,
            date,
            who: selectedWho ? selectedWho.dataset.who : null,
            story,
            mood: selectedMood ? selectedMood.dataset.mood : 'happy',
            tags: selectedTags,
            media: selectedMedia
        };
        
        console.log('Journal Entry:', entryData);
        
        // Success message
        alert('✅ Journal entry saved successfully!');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
};

// Make removeMedia globally accessible
window.JournalEntry = JournalEntry;

// Handle "Add More" button
function handleAddMore() {
    const photoInput = document.getElementById('photoInput');
    photoInput.click();
}

// Initialize
document.addEventListener('DOMContentLoaded', JournalEntry.init);

// Language Switcher
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});
