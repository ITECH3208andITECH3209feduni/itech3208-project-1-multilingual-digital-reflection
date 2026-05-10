// Weekly Recap Script for StoryBond

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
        
        // In a real app, this would fetch new data for the selected week
        console.log('Navigated to week:', startFormatted, '-', endFormatted);
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
