// Weekly Recap Script for StoryBond

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://storybond-backend-git-main-oshinbimus-projects.vercel.app';

const WeeklyRecap = {
    currentWeekOffset: 0,
    
    init() {
        // Week navigation buttons
        const prevBtn = document.querySelectorAll('.week-nav-btn')[0];
        const nextBtn = document.querySelectorAll('.week-nav-btn')[1];

        if (prevBtn) {
            prevBtn.addEventListener('click', () => WeeklyRecap.navigateWeek(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => WeeklyRecap.navigateWeek(1));
        }

        // Show today's date in the header
        WeeklyRecap.updateHeaderDate();

        // Load initial week data
        WeeklyRecap.loadWeeklyData();
    },

    updateHeaderDate() {
        const dateEl = document.querySelector('.date');
        if (dateEl) {
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            dateEl.textContent = new Date().toLocaleDateString('en-US', options);
        }
    },

    async loadWeeklyData() {
        const userId = localStorage.getItem('userId') ||
sessionStorage.getItem('userId');
        
        if (!userId) {
            console.log('User not logged in');
            return;
        }
        
        try {
            // Fetch entries for the user
            const response = await fetch(`${API_URL}/api/entries-new/parent/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                WeeklyRecap.updateWeeklyStats(data.data);
            }
        } catch (error) {
            console.error('Error loading weekly data:', error);
        }
    },
    
    updateWeeklyStats(entries) {
        // Calculate this week's entries
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const thisWeekEntries = entries.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            return entryDate >= startOfWeek && entryDate <= today;
        });
        
        // Update stats
        const statBoxes = document.querySelectorAll('.stat-box');
        if (statBoxes.length >= 3) {
            statBoxes[0].querySelector('.stat-number').textContent = thisWeekEntries.length;
            statBoxes[1].querySelector('.stat-number').textContent = thisWeekEntries.filter(e => e.media).length || 0;
            
            // Count unique languages
            const languages = new Set(thisWeekEntries.map(e => e.language));
            statBoxes[2].querySelector('.stat-number').textContent = languages.size;
        }
        
        console.log('Updated weekly stats:', {
            entries: thisWeekEntries.length,
            uploads: thisWeekEntries.filter(e => e.media).length,
            languages: new Set(thisWeekEntries.map(e => e.language)).size
        });
    },
    
    navigateWeek(direction) {
        WeeklyRecap.currentWeekOffset += direction;
        
        // Calculate the new week range
        const today = new Date();
        const offsetDays = WeeklyRecap.currentWeekOffset * 7;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + offsetDays);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        // Format dates
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const startFormatted = startOfWeek.toLocaleDateString('en-US', options);
        const endFormatted = endOfWeek.toLocaleDateString('en-US', options);
        
        // Update the week range display
        const weekRangeEl = document.querySelector('.week-range');
        if (weekRangeEl) {
            weekRangeEl.textContent = `${startFormatted} – ${endFormatted}`;
        }
        
        // Load data for selected week
        WeeklyRecap.loadWeeklyDataForRange(startOfWeek, endOfWeek);
    },
    
    async loadWeeklyDataForRange(startDate, endDate) {
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        
        if (!userId) {
            console.log('User not logged in');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/entries-new/parent/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                const filteredEntries = data.data.filter(entry => {
                    const entryDate = new Date(entry.entry_date);
                    return entryDate >= startDate && entryDate <= endDate;
                });
                
                WeeklyRecap.updateWeeklyStats(filteredEntries);
            }
        } catch (error) {
            console.error('Error loading weekly data:', error);
        }
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', WeeklyRecap.init);

// Language Switcher
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// User Profile Click
const userCard = document.querySelector('.user-card');
if (userCard) {
    userCard.addEventListener('click', function() {
        alert('Opening profile settings...');
    });
}
