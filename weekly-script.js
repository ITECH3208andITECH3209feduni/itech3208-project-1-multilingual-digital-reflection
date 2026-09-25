// =====================================================
// StoryBond - Weekly Recap
// =====================================================



// =====================================================
// SESSION HELPERS
// =====================================================

function getAccessToken() {

    return (
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')
    );
}


function getSelectedChildId() {

    return (
        localStorage.getItem('selectedChildId') ||
        sessionStorage.getItem('selectedChildId')
    );
}


function getSelectedChildName() {

    return (
        localStorage.getItem('selectedChildName') ||
        sessionStorage.getItem('selectedChildName') ||
        'Child'
    );
}


function getSelectedChildAvatar() {

    return (
        localStorage.getItem('selectedChildAvatar') ||
        sessionStorage.getItem('selectedChildAvatar') ||
        '👶'
    );
}


function getAuthHeaders() {

    const accessToken =
        getAccessToken();


    if (!accessToken) {

        return {};
    }


    return {

        Authorization:
            `Bearer ${accessToken}`
    };
}


// =====================================================
// DATE HELPERS
// =====================================================

function formatLocalDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        );


    return `${year}-${month}-${day}`;
}


function getWeekRange(offset = 0) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const startOfWeek =
        new Date(today);


    startOfWeek.setDate(
        today.getDate() -
        today.getDay() +
        (offset * 7)
    );


    const endOfWeek =
        new Date(startOfWeek);


    endOfWeek.setDate(
        startOfWeek.getDate() + 6
    );


    endOfWeek.setHours(
        23,
        59,
        59,
        999
    );


    return {

        startOfWeek,

        endOfWeek,

        weekStart:
            formatLocalDate(
                startOfWeek
            )
    };
}


// =====================================================
// WEEKLY RECAP OBJECT
// =====================================================

const WeeklyRecap = {

    currentWeekOffset: 0,


    // =================================================
    // INITIALISE PAGE
    // =================================================

    async init() {

        const accessToken =
            getAccessToken();


        if (!accessToken) {

            window.location.href =
                'login.html';

            return;
        }


        // ---------------------------------------------
        // Week navigation buttons
        // ---------------------------------------------

        const weekButtons =
            document.querySelectorAll(
                '.week-nav-btn'
            );


        const prevBtn =
            weekButtons[0];


        const nextBtn =
            weekButtons[1];


        if (prevBtn) {

            prevBtn.addEventListener(
                'click',
                () => {

                    WeeklyRecap.navigateWeek(
                        -1
                    );
                }
            );
        }


        if (nextBtn) {

            nextBtn.addEventListener(
                'click',
                () => {

                    WeeklyRecap.navigateWeek(
                        1
                    );
                }
            );
        }


        // ---------------------------------------------
        // Weekly progress form toggle
        // ---------------------------------------------

        const toggleProgressFormBtn =
            document.getElementById(
                'toggleProgressFormBtn'
            );


        const progressForm =
            document.getElementById(
                'weeklyProgressForm'
            );


        if (
            toggleProgressFormBtn &&
            progressForm
        ) {

            toggleProgressFormBtn.addEventListener(
                'click',
                () => {

                    progressForm.classList.toggle(
                        'progress-form-open'
                    );


                    const isOpen =
                        progressForm.classList.contains(
                            'progress-form-open'
                        );


                    // Keep the translation key in step with the label, so
                    // switching language while the form is open does not
                    // reset the button to "Open Progress Check-In".
                    toggleProgressFormBtn.setAttribute(
                        'data-i18n',
                        isOpen ? 'close_checkin' : 'open_checkin'
                    );

                    toggleProgressFormBtn.textContent =
                        isOpen
                            ? t('close_checkin')
                            : t('open_checkin');
                }
            );
        }


        // ---------------------------------------------
        // Weekly progress form submit
        // ---------------------------------------------

        if (progressForm) {

            progressForm.addEventListener(
                'submit',
                WeeklyRecap.saveWeeklyProgress
            );
        }


        // ---------------------------------------------
        // Initial page setup
        // ---------------------------------------------

        WeeklyRecap.updateHeaderDate();

        WeeklyRecap.updateSelectedChildDisplay();

        await WeeklyRecap.loadCurrentWeek();
    },


    // =================================================
    // UPDATE PROGRESS SUMMARY
    // =================================================

    updateProgressSummary(progress) {

        const setText = (
            id,
            value,
            fallback = '—'
        ) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value || fallback;
            }
        };


        if (!progress) {

            setText(
                'summaryOverallMood',
                null
            );


            setText(
                'summaryCommunication',
                null
            );


            setText(
                'summaryReadingInterest',
                null
            );


            setText(
                'summarySocialInteraction',
                null
            );


            setText(
                'summaryParentConcern',
                null,
                'Nothing recorded.'
            );


            setText(
                'summaryParentProud',
                null,
                'Nothing recorded.'
            );


            return;
        }


        setText(
            'summaryOverallMood',
            progress.overall_mood
        );


        setText(
            'summaryCommunication',
            progress.communication
        );


        setText(
            'summaryReadingInterest',
            progress.reading_interest
        );


        setText(
            'summarySocialInteraction',
            progress.social_interaction
        );


        setText(
            'summaryParentConcern',
            progress.parent_concern,
            'Nothing recorded.'
        );


        setText(
            'summaryParentProud',
            progress.parent_proud,
            'Nothing recorded.'
        );
    },


    // =================================================
    // HEADER DATE
    // =================================================

    updateHeaderDate() {

        const dateEl =
            document.querySelector(
                '.date'
            );


        if (!dateEl) {

            return;
        }


        const options = {

            weekday: 'long',

            month: 'long',

            day: 'numeric',

            year: 'numeric'
        };


        dateEl.textContent =
            new Date()
                .toLocaleDateString(
                    'en-AU',
                    options
                );
    },


    // =================================================
    // SELECTED CHILD DISPLAY
    // =================================================

    updateSelectedChildDisplay() {

        const childName =
            getSelectedChildName();


        const childAvatar =
            getSelectedChildAvatar();


        const heading =
            document.querySelector(
                '.weekly-heading'
            );


        if (heading) {

            heading.textContent =
                `${childAvatar} ${childName}'s Weekly Recap`;
        }
    },


    // =================================================
    // NAVIGATE WEEK
    // =================================================

    async navigateWeek(direction) {

        WeeklyRecap.currentWeekOffset +=
            direction;


        await WeeklyRecap.loadCurrentWeek();
    },


    // =================================================
    // LOAD CURRENT SELECTED WEEK
    // =================================================

    async loadCurrentWeek() {

        const childId =
            getSelectedChildId();


        if (!childId) {

            WeeklyRecap.showNoChildSelected();

            return;
        }


        const {

            startOfWeek,

            endOfWeek,

            weekStart

        } = getWeekRange(
            WeeklyRecap.currentWeekOffset
        );


        WeeklyRecap.updateWeekRange(
            startOfWeek,
            endOfWeek
        );


        await Promise.all([

            WeeklyRecap.loadJournalStats(
                childId,
                startOfWeek,
                endOfWeek
            ),

            WeeklyRecap.loadSavedWeeklyProgress(
                childId,
                weekStart
            )
        ]);
    },


    // =================================================
    // UPDATE WEEK RANGE
    // =================================================

    updateWeekRange(
        startOfWeek,
        endOfWeek
    ) {

        const weekRangeEl =
            document.querySelector(
                '.week-range'
            );


        if (!weekRangeEl) {

            return;
        }


        const options = {

            day: 'numeric',

            month: 'short',

            year: 'numeric'
        };


        const startFormatted =
            startOfWeek.toLocaleDateString(
                'en-AU',
                options
            );


        const endFormatted =
            endOfWeek.toLocaleDateString(
                'en-AU',
                options
            );


        weekRangeEl.textContent =
            `${startFormatted} – ${endFormatted}`;
    },


    // =================================================
    // LOAD JOURNAL STATS
    // =================================================

    async loadJournalStats(
        childId,
        startDate,
        endDate
    ) {

        try {

            const response =
                await fetch(

                    `${API_URL}/api/entries-new/child/${childId}`,

                    {

                        headers:
                            getAuthHeaders()
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(

                    data.error ||
                    'Unable to load weekly journal entries.'
                );
            }


            const entries =
                data.data || [];


            const weekEntries =
                entries.filter(
                    entry => {

                        const entryDate =
                            new Date(
                                `${entry.entry_date}T00:00:00`
                            );


                        return (

                            entryDate >=
                            startDate &&

                            entryDate <=
                            endDate
                        );
                    }
                );


            WeeklyRecap.updateWeeklyStats(
                weekEntries
            );

            WeeklyRecap.renderWeeklyContent(
                weekEntries
            );


        } catch (error) {

            console.error(
                'Weekly journal load error:',
                error
            );
        }
    },


    // =================================================
    // UPDATE WEEKLY STAT CARDS
    // =================================================

    updateWeeklyStats(entries) {

        const journalCount =
            entries.length;


        const milestoneCount =
            entries.filter(
                entry =>

                    entry.is_milestone === true ||

                    entry.is_milestone ===
                    'true'

            ).length;


        const mediaCount =
            entries.reduce(
                (
                    total,
                    entry
                ) => {

                    if (
                        Array.isArray(
                            entry.media
                        )
                    ) {

                        return (
                            total +
                            entry.media.length
                        );
                    }


                    return total;

                },
                0
            );


        const statCards =
            document.querySelectorAll(
                '.stat-card'
            );


        if (statCards[0]) {

            const number =
                statCards[0]
                    .querySelector(
                        '.stat-number'
                    );


            if (number) {

                number.textContent =
                    journalCount;
            }
        }


        if (statCards[1]) {

            const number =
                statCards[1]
                    .querySelector(
                        '.stat-number'
                    );


            if (number) {

                number.textContent =
                    milestoneCount;
            }
        }


        if (statCards[2]) {

            const number =
                statCards[2]
                    .querySelector(
                        '.stat-number'
                    );


            if (number) {

                number.textContent =
                    mediaCount;
            }
        }


        console.log(
            'Weekly recap:',
            {

                journalEntries:
                    journalCount,

                milestones:
                    milestoneCount,

                photosAndVideos:
                    mediaCount
            }
        );
    },


    // =================================================
    // RENDER WEEKLY RECAP CONTENT
    // =================================================

    renderWeeklyContent(entries) {

        WeeklyRecap.renderRecentEntries(entries);
        WeeklyRecap.renderMilestones(entries);
        WeeklyRecap.renderMoods(entries);
        WeeklyRecap.renderMemoryHighlight(entries);
    },


    // =================================================
    // RECENT ENTRIES
    // =================================================

    renderRecentEntries(entries) {

        const container =
            document.getElementById(
                'recentEntriesContent'
            );

        if (!container) {
            return;
        }

        container.innerHTML = '';

        if (!entries.length) {

            WeeklyRecap.showEmptyRecapState(
                container,
                '📖',
                'No journal entries recorded this week.'
            );

            return;
        }

        const recentEntries =
            [...entries]
                .sort(
                    (a, b) =>
                        new Date(b.entry_date) -
                        new Date(a.entry_date)
                )
                .slice(0, 3);

        const list =
            document.createElement('div');

        list.className =
            'entry-list';

        recentEntries.forEach(
            entry => {

                const item =
                    document.createElement('div');

                item.className =
                    'entry-item';

                const dot =
                    document.createElement('span');

                dot.className =
                    'entry-dot blue-dot';

                const text =
                    document.createElement('span');

                text.className =
                    'entry-text';

                text.textContent =
                    WeeklyRecap.getEntryDisplayText(
                        entry
                    );

                const date =
                    document.createElement('span');

                date.className =
                    'entry-date';

                date.textContent =
                    WeeklyRecap.formatEntryDate(
                        entry.entry_date
                    );

                item.append(
                    dot,
                    text,
                    date
                );

                list.appendChild(
                    item
                );
            }
        );

        container.appendChild(
            list
        );
    },


    // =================================================
    // MILESTONES
    // =================================================

    renderMilestones(entries) {

        const container =
            document.getElementById(
                'milestonesContent'
            );

        if (!container) {
            return;
        }

        container.innerHTML = '';

        const milestones =
            entries.filter(
                entry =>
                    entry.is_milestone === true ||
                    entry.is_milestone === 'true'
            );

        if (!milestones.length) {

            WeeklyRecap.showEmptyRecapState(
                container,
                '⭐',
                'No milestones recorded this week.'
            );

            return;
        }

        const list =
            document.createElement('div');

        list.className =
            'milestone-list';

        milestones.forEach(
            entry => {

                const item =
                    document.createElement('div');

                item.className =
                    'milestone-item';

                const icon =
                    document.createElement('span');

                icon.className =
                    'milestone-icon';

                icon.textContent =
                    '⭐';

                const text =
                    document.createElement('span');

                text.className =
                    'milestone-text';

                text.textContent =
                    WeeklyRecap.getEntryDisplayText(
                        entry
                    );

                item.append(
                    icon,
                    text
                );

                list.appendChild(
                    item
                );
            }
        );

        container.appendChild(
            list
        );
    },


    // =================================================
    // MOODS THIS WEEK
    // =================================================

    renderMoods(entries) {

        const container =
            document.getElementById(
                'moodsContent'
            );

        if (!container) {
            return;
        }

        container.innerHTML = '';

        const moodCounts = {};

        entries.forEach(
            entry => {

                const mood =
                    entry.mood;

                if (!mood) {
                    return;
                }

                const key =
                    String(mood)
                        .trim()
                        .toLowerCase();

                if (!key) {
                    return;
                }

                moodCounts[key] =
                    (moodCounts[key] || 0) + 1;
            }
        );

        const moods =
            Object.entries(
                moodCounts
            );

        if (!moods.length) {

            WeeklyRecap.showEmptyRecapState(
                container,
                '😊',
                'No moods recorded this week.'
            );

            return;
        }

        const tags =
            document.createElement('div');

        tags.className =
            'mood-tags';

        moods.forEach(
            ([mood, count]) => {

                const tag =
                    document.createElement('span');

                tag.className =
                    'mood-tag';

                tag.textContent =
                    `${WeeklyRecap.formatLabel(mood)}${count > 1 ? ` × ${count}` : ''}`;

                tags.appendChild(
                    tag
                );
            }
        );

        container.appendChild(
            tags
        );
    },


    // =================================================
    // MEMORY HIGHLIGHT
    // =================================================

    renderMemoryHighlight(entries) {

        const container =
            document.getElementById(
                'memoryHighlightContent'
            );

        if (!container) {
            return;
        }

        container.innerHTML = '';

        if (!entries.length) {

            WeeklyRecap.showEmptyRecapState(
                container,
                '📸',
                'No memory highlight available this week.'
            );

            return;
        }

        const sortedEntries =
            [...entries].sort(
                (a, b) =>
                    new Date(b.entry_date) -
                    new Date(a.entry_date)
            );

        const highlight =
            sortedEntries.find(
                entry =>
                    Array.isArray(entry.media) &&
                    entry.media.length > 0
            ) ||
            sortedEntries[0];

        const wrapper =
            document.createElement('div');

        wrapper.className =
            'memory-highlight';

        const mediaUrl =
            WeeklyRecap.getFirstMediaUrl(
                highlight
            );

        if (mediaUrl) {

            const media =
                document.createElement('img');

            media.src =
                mediaUrl;

            media.alt =
                'Weekly memory highlight';

            media.loading =
                'lazy';

            media.style.width =
                '100%';

            media.style.maxHeight =
                '240px';

            media.style.objectFit =
                'cover';

            media.style.borderRadius =
                '11px';

            wrapper.appendChild(
                media
            );
        }

        const quote =
            document.createElement('p');

        quote.className =
            'memory-quote';

        quote.textContent =
            WeeklyRecap.getEntryDisplayText(
                highlight
            );

        wrapper.appendChild(
            quote
        );

        container.appendChild(
            wrapper
        );
    },


    getEntryDisplayText(entry) {

        const possibleText =
            entry.title ||
            entry.entry_title ||
            entry.story ||
            entry.content ||
            entry.description;

        if (!possibleText) {
            return 'Journal entry';
        }

        const text =
            String(possibleText).trim();

        return text.length <= 80
            ? text
            : `${text.substring(0, 77)}...`;
    },


    getFirstMediaUrl(entry) {

        if (
            !Array.isArray(entry.media) ||
            entry.media.length === 0
        ) {
            return null;
        }

        const media =
            entry.media[0];

        if (typeof media === 'string') {
            return media;
        }

        return (
            media.url ||
            media.secure_url ||
            media.media_url ||
            null
        );
    },


    formatEntryDate(dateString) {

        if (!dateString) {
            return '';
        }

        const date =
            new Date(
                `${dateString}T00:00:00`
            );

        return date.toLocaleDateString(
            'en-AU',
            {
                day: 'numeric',
                month: 'short'
            }
        );
    },


    formatLabel(value) {

        if (!value) {
            return '';
        }

        return String(value)
            .replace(/_/g, ' ')
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase()
            );
    },


    showEmptyRecapState(
        container,
        icon,
        message
    ) {

        container.innerHTML =
            '';

        const iconElement =
            document.createElement('div');

        iconElement.className =
            'empty-icon';

        iconElement.textContent =
            icon;

        const textElement =
            document.createElement('p');

        textElement.className =
            'empty-text';

        textElement.textContent =
            message;

        container.append(
            iconElement,
            textElement
        );
    },


    // =================================================
    // LOAD SAVED WEEKLY PROGRESS
    // =================================================

    async loadSavedWeeklyProgress(
        childId,
        weekStart
    ) {

        try {

            const response =
                await fetch(

                    `${API_URL}/api/weekly-progress/child/${childId}/week/${weekStart}`,

                    {

                        headers:
                            getAuthHeaders()
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(

                    data.error ||
                    'Unable to load weekly progress.'
                );
            }


            if (!data.data) {

                WeeklyRecap.clearProgressForm();


                WeeklyRecap.updateProgressSummary(
                    null
                );


                WeeklyRecap.showProgressMessage(
                    'No progress check saved for this week yet.',
                    ''
                );


                return;
            }


            const progress =
                data.data;


            WeeklyRecap.updateProgressSummary(
                progress
            );


            WeeklyRecap.setValue(
                'overallMood',
                progress.overall_mood
            );


            WeeklyRecap.setValue(
                'communication',
                progress.communication
            );


            WeeklyRecap.setValue(
                'readingInterest',
                progress.reading_interest
            );


            WeeklyRecap.setValue(
                'socialInteraction',
                progress.social_interaction
            );


            WeeklyRecap.setValue(
                'parentConcern',
                progress.parent_concern || ''
            );


            WeeklyRecap.setValue(
                'parentProud',
                progress.parent_proud || ''
            );


            WeeklyRecap.showProgressMessage(
                '✓ Progress check saved for this week.',
                'success'
            );


        } catch (error) {

            console.error(
                'Weekly progress load error:',
                error
            );


            WeeklyRecap.showProgressMessage(
                error.message,
                'error'
            );
        }
    },


    // =================================================
    // SAVE WEEKLY PROGRESS
    // =================================================

    async saveWeeklyProgress(event) {

        event.preventDefault();


        const childId =
            getSelectedChildId();


        const accessToken =
            getAccessToken();


        if (!accessToken) {

            window.location.href =
                'login.html';

            return;
        }


        if (!childId) {

            WeeklyRecap.showProgressMessage(
                'Please select a child first.',
                'error'
            );


            return;
        }


        const {

            weekStart

        } = getWeekRange(
            WeeklyRecap.currentWeekOffset
        );


        const payload = {

            child_id:
                childId,


            week_start:
                weekStart,


            overall_mood:
                document
                    .getElementById(
                        'overallMood'
                    )
                    ?.value,


            communication:
                document
                    .getElementById(
                        'communication'
                    )
                    ?.value,


            reading_interest:
                document
                    .getElementById(
                        'readingInterest'
                    )
                    ?.value,


            social_interaction:
                document
                    .getElementById(
                        'socialInteraction'
                    )
                    ?.value,


            parent_concern:
                document
                    .getElementById(
                        'parentConcern'
                    )
                    ?.value
                    .trim() || '',


            parent_proud:
                document
                    .getElementById(
                        'parentProud'
                    )
                    ?.value
                    .trim() || ''
        };


        if (
            !payload.overall_mood ||
            !payload.communication ||
            !payload.reading_interest ||
            !payload.social_interaction
        ) {

            WeeklyRecap.showProgressMessage(

                'Please complete all required progress fields.',

                'error'
            );


            return;
        }


        try {

            WeeklyRecap.showProgressMessage(
                'Saving...',
                ''
            );


            const response =
                await fetch(

                    `${API_URL}/api/weekly-progress`,

                    {

                        method:
                            'POST',


                        headers: {

                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${accessToken}`
                        },


                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(

                    data.error ||
                    'Unable to save weekly progress.'
                );
            }


            WeeklyRecap.showProgressMessage(
                '✓ Weekly progress saved successfully.',
                'success'
            );


            // Update the visible summary immediately
            // using the saved values.
            WeeklyRecap.updateProgressSummary(
                data.data || payload
            );


            // Keep the saved values inside the form too.
            const savedProgress =
                data.data || payload;


            WeeklyRecap.setValue(
                'overallMood',
                savedProgress.overall_mood
            );

            WeeklyRecap.setValue(
                'communication',
                savedProgress.communication
            );

            WeeklyRecap.setValue(
                'readingInterest',
                savedProgress.reading_interest
            );

            WeeklyRecap.setValue(
                'socialInteraction',
                savedProgress.social_interaction
            );

            WeeklyRecap.setValue(
                'parentConcern',
                savedProgress.parent_concern || ''
            );

            WeeklyRecap.setValue(
                'parentProud',
                savedProgress.parent_proud || ''
            );


            // Diagnostic information
            console.log(
                'Weekly progress saved:',
                savedProgress
            );


        } catch (error) {

            console.error(
                'Weekly progress save error:',
                error
            );


            WeeklyRecap.showProgressMessage(
                error.message,
                'error'
            );
        }
    },


    // =================================================
    // SET FORM VALUE
    // =================================================

    setValue(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.value =
                value ?? '';
        }
    },


    // =================================================
    // CLEAR PROGRESS FORM
    // =================================================

    clearProgressForm() {

        [

            'overallMood',

            'communication',

            'readingInterest',

            'socialInteraction',

            'parentConcern',

            'parentProud'

        ].forEach(
            id => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.value =
                        '';
                }
            }
        );
    },


    // =================================================
    // SHOW PROGRESS MESSAGE
    // =================================================

    showProgressMessage(
        message,
        type
    ) {

        const messageEl =
            document.getElementById(
                'weeklyProgressMessage'
            );


        if (!messageEl) {

            return;
        }


        messageEl.textContent =
            message;


        messageEl.className =
            `weekly-progress-message ${type}`;
    },


    // =================================================
    // NO CHILD SELECTED
    // =================================================

    showNoChildSelected() {

        const weekRangeEl =
            document.querySelector(
                '.week-range'
            );


        if (weekRangeEl) {

            weekRangeEl.textContent =
                t('select_child_week');
        }


        WeeklyRecap.updateWeeklyStats(
            []
        );

        WeeklyRecap.renderWeeklyContent(
            []
        );


        WeeklyRecap.updateProgressSummary(
            null
        );


        WeeklyRecap.showProgressMessage(

            'Please select a child from the Home page first.',

            'error'
        );
    }
};



// =====================================================
// LOAD CHILDREN INTO WEEKLY SIDEBAR
// =====================================================

async function loadChildrenIntoSidebar() {

    const userId =
        localStorage.getItem('userId') ||
        sessionStorage.getItem('userId');

    const accessToken =
        getAccessToken();

    if (!userId || !accessToken) {

        window.location.href =
            'login.html';

        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/children/parent/${userId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.error ||
                'Unable to load children.'
            );
        }

        const childrenContainer =
            document.querySelector(
                '.children'
            );

        if (!childrenContainer) {
            return;
        }

        const addBtn =
            childrenContainer.querySelector(
                '.add-child-btn'
            );

        childrenContainer.innerHTML =
            `<p class="nav-heading" data-i18n="nav_children">${t('nav_children')}</p>`;

        const children =
            data.data || [];

        if (!children.length) {

            const empty =
                document.createElement('div');

            empty.className =
                'no-children';

            empty.textContent =
                t('no_children');

            childrenContainer.appendChild(
                empty
            );
        }

        children.forEach(
            child => {

                const childEl =
                    document.createElement('div');

                childEl.className =
                    'child-item';

                const selectedChildId =
                    getSelectedChildId();

                if (
                    selectedChildId &&
                    String(selectedChildId) ===
                    String(child.id)
                ) {
                    childEl.classList.add(
                        'selected-child'
                    );
                }

                childEl.style.cssText =
                    `
                    display:flex;
                    align-items:center;
                    gap:8px;
                    padding:8px;
                    cursor:pointer;
                    border-radius:8px;
                    margin:4px 0;
                    `;

                childEl.innerHTML =
                    `
                    <span style="font-size:24px;">
                        ${child.avatar || '👶'}
                    </span>

                    <span
                        style="
                            font-size:14px;
                            font-weight:500;
                        "
                    >
                        ${child.name}
                    </span>
                    `;

                childEl.addEventListener(
                    'click',
                    async () => {

                        // Clear the previous selected child
                        // from both storage locations.
                        localStorage.removeItem(
                            'selectedChildId'
                        );

                        localStorage.removeItem(
                            'selectedChildName'
                        );

                        localStorage.removeItem(
                            'selectedChildAvatar'
                        );

                        sessionStorage.removeItem(
                            'selectedChildId'
                        );

                        sessionStorage.removeItem(
                            'selectedChildName'
                        );

                        sessionStorage.removeItem(
                            'selectedChildAvatar'
                        );


                        // Use the same storage location
                        // as the current login session.
                        const storage =
                            localStorage.getItem(
                                'accessToken'
                            )
                                ? localStorage
                                : sessionStorage;


                        storage.setItem(
                            'selectedChildId',
                            child.id
                        );

                        storage.setItem(
                            'selectedChildName',
                            child.name
                        );

                        storage.setItem(
                            'selectedChildAvatar',
                            child.avatar || '👶'
                        );


                        // Reset back to current week
                        WeeklyRecap.currentWeekOffset = 0;


                        // Update the selected styling
                        document
                            .querySelectorAll(
                                '.child-item'
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        'selected-child'
                                    );
                                }
                            );


                        childEl.classList.add(
                            'selected-child'
                        );


                        // Update the page immediately
                        WeeklyRecap.updateSelectedChildDisplay();

                        await WeeklyRecap.loadCurrentWeek();
                    }
                );

                childrenContainer.appendChild(
                    childEl
                );
            }
        );

        if (addBtn) {
            childrenContainer.appendChild(
                addBtn
            );
        }

        const userName =
            localStorage.getItem('userName') ||
            sessionStorage.getItem('userName');

        if (userName) {

            const greeting =
                document.querySelector(
                    '.greeting'
                );

            if (greeting) {

                greeting.textContent =
                    `Hello, ${userName}! 👋`;
            }
        }

    } catch (error) {

        console.error(
            'Error loading children:',
            error
        );
    }
}


// =====================================================
// PAGE INITIALISATION
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        await loadChildrenIntoSidebar();

        await WeeklyRecap.init();
    }
);


// =====================================================
// LANGUAGE SWITCHER
// =====================================================

document
    .querySelectorAll(
        '.lang-btn'
    )
    .forEach(
        btn => {

            btn.addEventListener(
                'click',
                function () {

                    document
                        .querySelectorAll(
                            '.lang-btn'
                        )
                        .forEach(
                            button => {

                                button
                                    .classList
                                    .remove(
                                        'active'
                                    );
                            }
                        );


                    this
                        .classList
                        .add(
                            'active'
                        );
                }
            );
        }
    );

// =====================================================
// LANGUAGE CHANGE
// =====================================================

// The sidebar child list is drawn from data, so it is rebuilt here rather
// than by the page-wide translation pass.
document.addEventListener('storybond:languagechange', async () => {
    if (!getAccessToken()) return;

    await loadChildrenIntoSidebar();
});
