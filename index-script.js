// StoryBond Home Page Script


// ==================================================
// SESSION HELPERS
// ==================================================

function getUserId() {

    return (
        localStorage.getItem('userId') ||
        sessionStorage.getItem('userId')
    );
}


function getUserName() {

    return (
        localStorage.getItem('userName') ||
        sessionStorage.getItem('userName')
    );
}


function getAccessToken() {

    return (
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')
    );
}


// ==================================================
// AUTHENTICATED REQUEST HELPER
// ==================================================

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


// ==================================================
// LANGUAGE SWITCHER
// ==================================================

function setupLanguageSwitcher() {

    document
        .querySelectorAll('.lang-btn')
        .forEach((button) => {

            button.addEventListener(
                'click',
                function () {

                    document
                        .querySelectorAll(
                            '.lang-btn'
                        )
                        .forEach(
                            (langButton) => {

                                langButton
                                    .classList
                                    .remove(
                                        'active'
                                    );
                            }
                        );


                    this.classList.add(
                        'active'
                    );
                }
            );
        });
}


// ==================================================
// LOAD CHILDREN
// ==================================================

async function loadChildren() {

    const userId =
        getUserId();

    const accessToken =
        getAccessToken();


    if (
        !userId ||
        !accessToken
    ) {

        window.location.href =
            'login.html';

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/children/parent/${userId}`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        console.log(
            'Children response:',
            response.status,
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                'Unable to load children'
            );
        }


        if (
            data.data.length === 0
        ) {

            return;
        }


        const childrenContainer =
            document.querySelector(
                '.children'
            );


        const addButton =
            childrenContainer
                .querySelector(
                    '.add-child-btn'
                );


        // Clear existing child list
        childrenContainer.innerHTML =
            `<p class="nav-heading" data-i18n="nav_children">${t('nav_children')}</p>`;


        data.data.forEach(
            (child) => {

                const childElement =
                    createChildElement(
                        child
                    );


                childrenContainer
                    .appendChild(
                        childElement
                    );
            }
        );


        // Add Add Child button back underneath
        childrenContainer
            .appendChild(
                addButton
            );


        updateGreeting();


        // Restore highlight on selected child
        const selectedChildId =
            localStorage.getItem(
                'selectedChildId'
            ) ||
            sessionStorage.getItem(
                'selectedChildId'
            );


        if (selectedChildId) {

            document
                .querySelectorAll(
                    '.child-item'
                )
                .forEach(
                    (element) => {

                        if (
                            String(element.dataset.childId) ===
                            String(selectedChildId)
                        ) {

                            element.classList.add(
                                'selected-child'
                            );
                        }
                    }
                );
        }


    } catch (error) {

        console.error(
            'Error loading children:',
            error
        );
    }
}


// ==================================================
// CREATE CHILD SIDEBAR ELEMENT
// ==================================================

function createChildElement(
    child
) {

    const childElement =
        document.createElement(
            'div'
        );


    childElement.className =
        'child-item';


    childElement.dataset.childId =
        child.id;

    childElement.innerHTML = `

    <span class="child-avatar">
        ${child.avatar || '👶'}
    </span>

    <span class="child-name">
        ${child.name}
    </span>

    <button
        class="delete-child-btn"
        type="button"
        aria-label="Delete ${child.name}"
    >
        🗑️
    </button>
`;

    // Delete child
    const deleteButton =
        childElement.querySelector(
            '.delete-child-btn'
        );


    deleteButton.addEventListener(
        'click',
        async (event) => {

            event.stopPropagation();


            const confirmed =
                confirm(
                    `Delete ${child.name} and all their entries?`
                );


            if (!confirmed) {

                return;
            }


            await deleteChild(
                child,
                childElement
            );
        }
    );


    // Select child
    childElement.addEventListener(
        'click',
        () => {

            selectChild(
                child,
                childElement
            );
        }
    );


    return childElement;
}


// ==================================================
// SELECT CHILD
// ==================================================

function selectChild(
    child,
    childElement
) {

    storeSelectedChild(child);


    // Existing clinician-access display
    const selectedChildDisplay =
        document.getElementById(
            'selectedChildForClinician'
        );


    if (selectedChildDisplay) {

        selectedChildDisplay.textContent =
            `Selected child: ${child.name}`;
    }


    // Clear highlight from all children
    document
        .querySelectorAll(
            '.child-item'
        )
        .forEach(
            (element) => {

                element.classList.remove(
                    'selected-child'
                );
            }
        );


    childElement.classList.add(
        'selected-child'
    );


    // Load selected child's journal entries
    loadChildEntries(
        child.id,
        child.name,
        child.avatar || '👶'
    );


    // Load selected child's weekly progress
    loadWeeklySummary(
        child.id,
        child.name,
        child.avatar || '👶'
    );
}


// ==================================================
// DELETE CHILD
// ==================================================

async function deleteChild(
    child,
    childElement
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/children/${child.id}`,
                {
                    method:
                        'DELETE',

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
                'Unable to delete child'
            );
        }


        childElement.remove();


        const selectedChildId =
            localStorage.getItem(
                'selectedChildId'
            ) ||
            sessionStorage.getItem(
                'selectedChildId'
            );


        // If deleted child was selected,
        // remove its stored selection.
        if (
            String(selectedChildId) ===
            String(child.id)
        ) {

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
        }


        const heading =
            document.querySelector(
                '.entries-section .section-heading'
            );


        if (heading) {

            heading.textContent =
                'RECENT ENTRIES';
        }


        const entriesList =
            document.querySelector(
                '.empty-entries-list'
            );


        if (entriesList) {

            entriesList.innerHTML = `

                <div class="empty-entry-item">

                    <div class="empty-entry-content">

                        <p class="empty-entry-title">
                            No entries yet
                        </p>

                        <p class="empty-entry-date">
                            Start tracking your child's activities
                        </p>

                    </div>

                </div>
            `;
        }


        const bannerName =
            document.getElementById(
                'selectedChildBannerName'
            );


        const bannerAvatar =
            document.getElementById(
                'selectedChildBannerAvatar'
            );


        if (bannerName) {

            bannerName.textContent =
                'All children';
        }


        if (bannerAvatar) {

            bannerAvatar.textContent =
                '👶';
        }


        const weeklyChildName =
            document.getElementById(
                'weeklyChildName'
            );


        if (weeklyChildName) {

            weeklyChildName.textContent =
                'Select a child to view progress';
        }


        const summaryGrid =
            document.getElementById(
                'weeklySummaryGrid'
            );


        if (summaryGrid) {

            summaryGrid.innerHTML = `
                <div class="weekly-summary-empty">
                    Select a child from the sidebar.
                </div>
            `;
        }


    } catch (error) {

        console.error(
            'Error deleting child:',
            error
        );


        alert(
            t('error_prefix').replace('{message}', error.message)
        );
    }
}


// ==================================================
// LOAD CHILD ENTRIES
// ==================================================

async function loadChildEntries(
    childId,
    childName,
    childAvatar
) {

    const accessToken =
        getAccessToken();


    if (
        !childId ||
        !accessToken
    ) {

        return;
    }


    try {

        // Ask backend for ONLY this child's entries
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
                'Unable to load child entries'
            );
        }


        const childEntries =
            data.data || [];


        const entriesList =
            document.querySelector(
                '.empty-entries-list'
            );


        const heading =
            document.querySelector(
                '.entries-section .section-heading'
            );


        if (heading) {

            heading.textContent =
                `${childAvatar || '👶'} ${childName.toUpperCase()}'S ENTRIES`;
        }


        if (!entriesList) {

            return;
        }


        // No journal entries
        if (
            childEntries.length === 0
        ) {

            entriesList.innerHTML = `

                <div class="empty-entry-item">

                    <div class="empty-entry-content">

                        <p class="empty-entry-title">
                            No entries yet for ${childName}
                        </p>

                        <p class="empty-entry-date">
                            Start tracking ${childName}'s activities!
                        </p>

                    </div>


                    <button
                        class="view-btn"
                        onclick="window.location.href='new-entry.html'"
                        style="
                            opacity:1;
                            cursor:pointer;
                        "
                    >
                        Add ›
                    </button>

                </div>
            `;


            return;
        }


        // Clear entries currently displayed
        entriesList.innerHTML =
            '';


        // Display selected child's entries
        childEntries
            .slice(0, 5)
            .forEach(
                (entry) => {

                    const entryElement =
                        createEntryElement(
                            entry
                        );


                    entriesList.appendChild(
                        entryElement
                    );
                }
            );


    } catch (error) {

        console.error(
            'Error loading child entries:',
            error
        );


        const entriesList =
            document.querySelector(
                '.empty-entries-list'
            );


        if (entriesList) {

            entriesList.innerHTML = `

                <div class="empty-entry-item">

                    <div class="empty-entry-content">

                        <p class="empty-entry-title">
                            Unable to load entries
                        </p>

                        <p class="empty-entry-date">
                            Please try again.
                        </p>

                    </div>

                </div>
            `;
        }
    }
}


// ==================================================
// LOAD HOME PAGE WEEKLY SUMMARY
// ==================================================

async function loadWeeklySummary(
    childId,
    childName,
    childAvatar
) {

    const summaryGrid =
        document.getElementById(
            'weeklySummaryGrid'
        );


    const weeklyChildName =
        document.getElementById(
            'weeklyChildName'
        );


    const bannerName =
        document.getElementById(
            'selectedChildBannerName'
        );


    const bannerAvatar =
        document.getElementById(
            'selectedChildBannerAvatar'
        );


    if (!childId) {

        return;
    }


    // ----------------------------------------------
    // Update selected-child banner
    // ----------------------------------------------

    if (bannerName) {

        bannerName.textContent =
            childName;
    }


    if (bannerAvatar) {

        bannerAvatar.textContent =
            childAvatar || '👶';
    }


    // ----------------------------------------------
    // Update weekly section child name
    // ----------------------------------------------

    if (weeklyChildName) {

        weeklyChildName.textContent =
            childName;
    }


    // If new HTML isn't present yet,
    // don't break the rest of the home page.
    if (!summaryGrid) {

        return;
    }


    summaryGrid.innerHTML = `

        <div class="weekly-summary-empty">

            Loading ${childName}'s progress...

        </div>
    `;


    try {

        // ------------------------------------------
        // Find Monday of current week
        // ------------------------------------------

        const today =
            new Date();


        const startOfWeek =
            new Date(today);

        startOfWeek.setHours(
            0,
            0,
            0,
            0
        );

        startOfWeek.setDate(
            today.getDate() -
            today.getDay()
        );


        // Use local date parts instead of
        // toISOString() to avoid timezone shifts.
        const weekStart =
            [
                startOfWeek.getFullYear(),

                String(
                    startOfWeek.getMonth() + 1
                ).padStart(
                    2,
                    '0'
                ),

                String(
                    startOfWeek.getDate()
                ).padStart(
                    2,
                    '0'
                )
            ].join('-');


        console.log(
            'Loading weekly progress:',
            childName,
            weekStart
        );


        // ------------------------------------------
        // Fetch this child's current week progress
        // ------------------------------------------

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


        console.log(
            'Weekly progress response:',
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                'Unable to load weekly progress.'
            );
        }


        const progress =
            data.data;


        // ------------------------------------------
        // Nothing recorded for this week
        // ------------------------------------------

        if (!progress) {

            summaryGrid.innerHTML = `

                <div class="weekly-summary-empty">

                    <strong>
                        No weekly progress saved yet for ${childName}.
                    </strong>

                    <span>
                        Add this week's update from Weekly Recap.
                    </span>

                </div>
            `;


            return;
        }


        // ------------------------------------------
        // Render actual progress
        // ------------------------------------------

        summaryGrid.innerHTML = `

            <div class="home-progress-stat">

                <span class="home-progress-icon">
                    😊
                </span>

                <span class="home-progress-label">
                    Mood
                </span>

                <strong>
                    ${formatWeeklyValue(
            progress.overall_mood
        )}
                </strong>

            </div>


            <div class="home-progress-stat">

                <span class="home-progress-icon">
                    💬
                </span>

                <span class="home-progress-label">
                    Communication
                </span>

                <strong>
                    ${formatWeeklyValue(
            progress.communication
        )}
                </strong>

            </div>


            <div class="home-progress-stat">

                <span class="home-progress-icon">
                    📚
                </span>

                <span class="home-progress-label">
                    Reading Interest
                </span>

                <strong>
                    ${formatWeeklyValue(
            progress.reading_interest
        )}
                </strong>

            </div>


            <div class="home-progress-stat">

                <span class="home-progress-icon">
                    🤝
                </span>

                <span class="home-progress-label">
                    Social Interaction
                </span>

                <strong>
                    ${formatWeeklyValue(
            progress.social_interaction
        )}
                </strong>

            </div>
        `;


    } catch (error) {

        console.error(
            'Weekly summary error:',
            error
        );


        summaryGrid.innerHTML = `

            <div class="weekly-summary-empty">

                Unable to load weekly progress.

            </div>
        `;
    }
}


// ==================================================
// FORMAT WEEKLY VALUE
// ==================================================

function formatWeeklyValue(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {

        return '—';
    }


    return String(value)
        .replaceAll(
            '_',
            ' '
        )
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
}


// ==================================================
// LOAD RECENT ENTRIES
// ==================================================

async function loadRecentEntries() {

    const userId =
        getUserId();


    if (!userId) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/entries-new/parent/${userId}`,
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
                'Unable to load entries'
            );
        }


        if (
            data.data.length === 0
        ) {

            return;
        }


        const entriesList =
            document.querySelector(
                '.empty-entries-list'
            );


        if (!entriesList) {

            return;
        }


        entriesList.innerHTML =
            '';


        data.data
            .slice(0, 3)
            .forEach(
                (entry) => {

                    const entryElement =
                        createEntryElement(
                            entry
                        );


                    entriesList.appendChild(
                        entryElement
                    );
                }
            );


    } catch (error) {

        console.error(
            'Error loading entries:',
            error
        );
    }
}


// ==================================================
// CREATE ENTRY ELEMENT
// ==================================================

function createEntryElement(
    entry
) {

    const entryElement =
        document.createElement(
            'div'
        );


    entryElement.className =
        'empty-entry-item';


    entryElement.style.cssText = `
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:12px;
        margin:8px 0;
        background:white;
        border-radius:12px;
        box-shadow:0 2px 8px rgba(0,0,0,0.05);
    `;


    const isMilestone =
        entry.is_milestone === true ||
        entry.is_milestone === 'true';


    const childName =
        entry.children?.name || '';


    const childAvatar =
        entry.children?.avatar || '';


    entryElement.innerHTML = `

        <div
            style="
                flex:1;
                margin-right:10px;
            "
        >

            <p
                style="
                    font-weight:600;
                    margin:0;
                    font-size:14px;
                "
            >
                ${entry.title}
            </p>


            <p
                style="
                    color:#888;
                    margin:4px 0 0;
                    font-size:12px;
                "
            >
                ${entry.entry_date}
                •
                ${childName}
                ${childAvatar}

                ${isMilestone
            ? ' ⭐'
            : ''
        }
            </p>


            <p
                style="
                    color:#666;
                    margin:4px 0 0;
                    font-size:13px;
                "
            >
                ${entry.content.substring(
            0,
            60
        )}...
            </p>

        </div>


        <div
            style="
                display:flex;
                gap:6px;
                flex-shrink:0;
            "
        >

            <button
                class="view-btn"
                type="button"
            >
                View ›
            </button>


            <button
                class="edit-entry-btn"
                type="button"
                style="
                    background:#f0f4ff;
                    border:1px solid #ccd9ff;
                    color:#4a6cf7;
                    cursor:pointer;
                    padding:6px 10px;
                    border-radius:8px;
                    font-size:12px;
                "
            >
                ✏️
            </button>


            <button
                class="delete-entry-btn"
                type="button"
                style="
                    background:#fff0f0;
                    border:1px solid #ffcccc;
                    color:#ff6b6b;
                    cursor:pointer;
                    padding:6px 10px;
                    border-radius:8px;
                    font-size:12px;
                "
            >
                🗑️
            </button>

        </div>
    `;


    // View entry
    entryElement
        .querySelector(
            '.view-btn'
        )
        .addEventListener(
            'click',
            () => {

                viewEntry(
                    entry.id,
                    entry.title,
                    entry.content,
                    entry.entry_date,
                    entry.mood,
                    isMilestone,
                    entry.media || []
                );
            }
        );


    // Edit entry
    entryElement
        .querySelector(
            '.edit-entry-btn'
        )
        .addEventListener(
            'click',
            () => {

                window.location.href =
                    `new-entry.html?edit=${entry.id}`;
            }
        );


    // Delete entry
    entryElement
        .querySelector(
            '.delete-entry-btn'
        )
        .addEventListener(
            'click',
            async () => {

                const confirmed =
                    confirm(
                        `Delete "${entry.title}"?`
                    );


                if (!confirmed) {

                    return;
                }


                await deleteEntry(
                    entry.id,
                    entryElement
                );
            }
        );


    return entryElement;
}


// ==================================================
// DELETE ENTRY
// ==================================================

async function deleteEntry(
    entryId,
    entryElement
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/entries-new/${entryId}`,
                {
                    method:
                        'DELETE',

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
                'Unable to delete entry'
            );
        }


        entryElement.remove();


    } catch (error) {

        console.error(
            'Error deleting entry:',
            error
        );


        alert(
            t('error_prefix').replace('{message}', error.message)
        );
    }
}


// ==================================================
// VIEW ENTRY MODAL
// ==================================================

function viewEntry(
    id,
    title,
    content,
    date,
    mood,
    isMilestone,
    media
) {

    const existingModal =
        document.querySelector(
            '.modal-overlay'
        );


    if (existingModal) {

        existingModal.remove();
    }


    const modal =
        document.createElement(
            'div'
        );


    modal.classList.add(
        'modal-overlay'
    );


    modal.style.cssText = `
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:rgba(0,0,0,0.5);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:1000;
    `;


    let mediaHTML =
        '';


    if (
        media &&
        media.length > 0
    ) {

        mediaHTML = `
            <p
                style="
                    font-weight:600;
                    margin-bottom:10px;
                "
            >
                📸 Media
            </p>
        `;


        media.forEach(
            (item) => {

                if (
                    item.media_type ===
                    'image'
                ) {

                    mediaHTML += `

                        <img
                            src="${item.file_url}"
                            alt="Entry photo"
                            style="
                                width:100%;
                                border-radius:12px;
                                margin-bottom:10px;
                                object-fit:cover;
                            "
                        >
                    `;

                } else if (
                    item.media_type ===
                    'video'
                ) {

                    mediaHTML += `

                        <video
                            controls
                            style="
                                width:100%;
                                border-radius:12px;
                                margin-bottom:10px;
                            "
                        >

                            <source
                                src="${item.file_url}"
                            >

                        </video>
                    `;
                }
            }
        );
    }


    modal.innerHTML = `

        <div
            style="
                background:white;
                border-radius:20px;
                padding:30px;
                max-width:550px;
                width:90%;
                max-height:85vh;
                overflow-y:auto;
                position:relative;
            "
        >

            <button
                class="close-entry-modal"
                type="button"
                style="
                    position:absolute;
                    top:15px;
                    right:15px;
                    background:#F0E8F5;
                    border:none;
                    border-radius:50%;
                    width:30px;
                    height:30px;
                    cursor:pointer;
                    font-size:16px;
                "
            >
                ✕
            </button>


            <h2
                style="
                    color:#C77CF9;
                    margin-bottom:8px;
                    padding-right:40px;
                "
            >
                ${title}
            </h2>


            <div
                style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-bottom:12px;
                "
            >

                <span
                    style="
                        background:#F0E8F5;
                        color:#C77CF9;
                        padding:4px 10px;
                        border-radius:20px;
                        font-size:12px;
                    "
                >
                    📅 ${date}
                </span>


                <span
                    style="
                        background:#F0E8F5;
                        color:#C77CF9;
                        padding:4px 10px;
                        border-radius:20px;
                        font-size:12px;
                    "
                >
                    ${getMoodEmoji(
        mood
    )}

                    ${mood}
                </span>


                ${isMilestone
            ? `
                            <span
                                style="
                                    background:#FFF3CD;
                                    color:#856404;
                                    padding:4px 10px;
                                    border-radius:20px;
                                    font-size:12px;
                                "
                            >
                                ⭐ Milestone
                            </span>
                        `
            : ''
        }

            </div>


            <hr
                style="
                    border:1px solid #F0E8F5;
                    margin-bottom:16px;
                "
            >


            <p
                class="entry-modal-content"
                style="
                    line-height:1.6;
                    color:#333;
                    margin-bottom:20px;
                "
            >
                ${content}
            </p>


            <div class="translate-row"></div>


            <div
                style="
                    margin-top:16px;
                "
            >
                ${mediaHTML}
            </div>

        </div>
    `;


    // Offer to translate the parent's own words between English and Turkish.
    // The heading and story are translated together, then swapped back on a
    // second click.
    const translateRow =
        modal.querySelector('.translate-row');

    const modalTitle =
        modal.querySelector('h2');

    const modalContent =
        modal.querySelector('.entry-modal-content');

    if (translateRow && modalTitle && modalContent) {

        addTranslateButton(
            translateRow,
            [
                { element: modalTitle, original: title },
                { element: modalContent, original: content }
            ]
        );
    }


    modal
        .querySelector(
            '.close-entry-modal'
        )
        .addEventListener(
            'click',
            () => {

                modal.remove();
            }
        );


    modal.addEventListener(
        'click',
        (event) => {

            if (
                event.target ===
                modal
            ) {

                modal.remove();
            }
        }
    );


    document.body.appendChild(
        modal
    );
}


// ==================================================
// MOOD EMOJIS
// ==================================================

function getMoodEmoji(
    mood
) {

    const moods = {

        happy:
            '😊',

        excited:
            '🤩',

        sad:
            '😢',

        tired:
            '😴',

        proud:
            '🌟',

        silly:
            '😜',

        loved:
            '🥰'
    };


    return (
        moods[mood] ||
        '😊'
    );
}


// ==================================================
// UPDATE USER GREETING
// ==================================================

function updateGreeting() {

    const userName =
        getUserName();


    if (!userName) {

        return;
    }


    const greeting =
        document.querySelector(
            '.greeting'
        );


    if (greeting) {

        greeting.textContent =
            `Hello, ${userName}! 👋`;
    }
}


// ==================================================
// UPDATE HEADER DATE
// ==================================================

function updateHeaderDate() {

    const dateElement =
        document.querySelector(
            '.date'
        );


    if (!dateElement) {

        return;
    }


    const options = {

        weekday:
            'long',

        month:
            'long',

        day:
            'numeric',

        year:
            'numeric'
    };


    dateElement.textContent =
        new Date()
            .toLocaleDateString(
                'en-US',
                options
            );
}


// ==================================================
// CLINICIAN ACCESS FORM
// ==================================================

function setupClinicianAccessForm() {

    const form =
        document.getElementById(
            'clinicianAccessForm'
        );


    if (!form) {

        return;
    }


    const message =
        document.getElementById(
            'clinicianAccessMessage'
        );


    form.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();


            const childId =
                localStorage.getItem(
                    'selectedChildId'
                ) ||
                sessionStorage.getItem(
                    'selectedChildId'
                );


            const clinicianEmail =
                document.getElementById(
                    'clinicianEmail'
                ).value.trim();


            const canViewJournal =
                document.getElementById(
                    'shareJournal'
                ).checked;


            const canViewWeeklyProgress =
                document.getElementById(
                    'shareWeeklyProgress'
                ).checked;


            if (!childId) {

                message.textContent =
                    'Please select a child first.';

                return;
            }


            try {

                message.textContent =
                    'Sharing access...';


                const response =
                    await fetch(
                        `${API_URL}/api/clinician-access`,
                        {
                            method:
                                'POST',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                ...getAuthHeaders()
                            },

                            body:
                                JSON.stringify(
                                    {
                                        child_id:
                                            childId,

                                        clinician_email:
                                            clinicianEmail,

                                        can_view_journal:
                                            canViewJournal,

                                        can_view_weekly_progress:
                                            canViewWeeklyProgress
                                    }
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
                        'Unable to share clinician access.'
                    );
                }


                message.textContent =
                    '✓ Clinician access shared successfully.';


                await loadClinicianAccessList();


            } catch (error) {

                console.error(
                    'Clinician access error:',
                    error
                );


                message.textContent =
                    error.message;
            }
        }
    );
}


// ==================================================
// LOAD CURRENT CLINICIAN ACCESS
// ==================================================

async function loadClinicianAccessList() {

    const container =
        document.getElementById(
            'clinicianAccessList'
        );


    if (!container) {

        return;
    }


    try {

        container.innerHTML =
            `<p class="clinician-access-empty">${t('loading_clinician_access')}</p>`;


        const response =
            await fetch(
                `${API_URL}/api/clinician-access`,
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
                'Unable to load clinician access.'
            );
        }


        const accessRecords =
            data.data || [];


        const activeRecords =
            accessRecords.filter(
                (record) =>
                    record.active !== false
            );


        if (
            activeRecords.length === 0
        ) {

            container.innerHTML = `
                <p class="clinician-access-empty">
                    No active clinician access.
                </p>
            `;

            return;
        }


        container.innerHTML =
            '';


        activeRecords.forEach(
            (record) => {

                const card =
                    document.createElement(
                        'div'
                    );


                card.className =
                    'clinician-access-card';


                const childName =
                    record.children?.name ||
                    'Child';


                const childAvatar =
                    record.children?.avatar ||
                    '👶';


                card.innerHTML = `

                    <div class="clinician-access-details">

                        <div class="clinician-access-child">

                            ${childAvatar}

                            <strong>
                                ${childName}
                            </strong>

                        </div>


                        <div class="clinician-access-email">

                            ${record.clinician_email}

                        </div>


                        <div class="clinician-permissions">

                            <span>

                                ${record.can_view_journal
                        ? '📖 Journal'
                        : '🔒 Journal'
                    }

                            </span>


                            <span>

                                ${record.can_view_weekly_progress
                        ? '📊 Weekly Progress'
                        : '🔒 Weekly Progress'
                    }

                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="revoke-clinician-btn"
                    >
                        Revoke Access
                    </button>
                `;


                const revokeButton =
                    card.querySelector(
                        '.revoke-clinician-btn'
                    );


                revokeButton.addEventListener(
                    'click',
                    async () => {

                        const confirmed =
                            confirm(
                                `Revoke clinician access for ${childName}?`
                            );


                        if (!confirmed) {

                            return;
                        }


                        await revokeClinicianAccess(
                            record.id
                        );
                    }
                );


                container.appendChild(
                    card
                );
            }
        );


    } catch (error) {

        console.error(
            'Clinician access list error:',
            error
        );


        container.innerHTML = `

            <p class="clinician-access-empty">

                ${error.message}

            </p>
        `;
    }
}


// ==================================================
// REVOKE CLINICIAN ACCESS
// ==================================================

async function revokeClinicianAccess(
    accessId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/clinician-access/${accessId}`,
                {
                    method:
                        'DELETE',

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
                'Unable to revoke clinician access.'
            );
        }


        await loadClinicianAccessList();


    } catch (error) {

        console.error(
            'Clinician access revoke error:',
            error
        );


        alert(
            t('revoke_failed').replace('{message}', error.message)
        );
    }
}


// ==================================================
// PAGE INITIALISATION
// ==================================================

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        setupLanguageSwitcher();

        setupClinicianAccessForm();

        await loadClinicianAccessList();

        updateGreeting();

        updateHeaderDate();

        await loadChildren();


        const selectedChildId =
            localStorage.getItem(
                'selectedChildId'
            ) ||
            sessionStorage.getItem(
                'selectedChildId'
            );


        const selectedChildName =
            localStorage.getItem(
                'selectedChildName'
            ) ||
            sessionStorage.getItem(
                'selectedChildName'
            );


        const selectedChildAvatar =
            localStorage.getItem(
                'selectedChildAvatar'
            ) ||
            sessionStorage.getItem(
                'selectedChildAvatar'
            );


        if (
            selectedChildId &&
            selectedChildName
        ) {

            await loadChildEntries(
                selectedChildId,
                selectedChildName,
                selectedChildAvatar || '👶'
            );


            await loadWeeklySummary(
                selectedChildId,
                selectedChildName,
                selectedChildAvatar || '👶'
            );


            const selectedChildDisplay =
                document.getElementById(
                    'selectedChildForClinician'
                );


            if (selectedChildDisplay) {

                selectedChildDisplay.textContent =
                    `Selected child: ${selectedChildName}`;
            }


        } else {

            await loadRecentEntries();
        }
    }
);


// ==================================================
// LANGUAGE CHANGE
// ==================================================

// Cards and lists here are built from data, so the page-wide translation
// pass cannot relabel them. Draw them again in the chosen language.
document.addEventListener('storybond:languagechange', async () => {
    if (!getUserId() || !getAccessToken()) return;

    updateGreeting();

    updateHeaderDate();

    await loadChildren();

    await loadRecentEntries();

    await loadClinicianAccessList();
});
