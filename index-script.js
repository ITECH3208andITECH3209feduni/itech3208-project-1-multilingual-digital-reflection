// StoryBond Home Page Script


// ==================================================
// CONFIGURATION
// ==================================================

const API_URL =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://storybond-backend.vercel.app';


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
    const accessToken = getAccessToken();

    if (!accessToken) {
        return {};
    }

    return {
        Authorization: `Bearer ${accessToken}`
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
                        .querySelectorAll('.lang-btn')
                        .forEach((langButton) => {

                            langButton.classList.remove(
                                'active'
                            );

                        });

                    this.classList.add('active');
                }
            );

        });
}


// ==================================================
// LOAD CHILDREN
// ==================================================

async function loadChildren() {

    const userId = getUserId();
    const accessToken = getAccessToken();


    if (!userId || !accessToken) {

        window.location.href =
            'login.html';

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/children/parent/${userId}`,
            {
                headers: getAuthHeaders()
            }
        );


        const data =
            await response.json();


        console.log(
            'Children response:',
            response.status,
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                'Unable to load children'
            );

        }


        if (data.data.length === 0) {
            return;
        }


        const childrenContainer =
            document.querySelector(
                '.children'
            );


        const addButton =
            childrenContainer.querySelector(
                '.add-child-btn'
            );


        // Clear existing child list
        childrenContainer.innerHTML =
            '<p class="nav-heading">CHILDREN</p>';


        data.data.forEach((child) => {

            const childElement =
                createChildElement(child);


            childrenContainer.appendChild(
                childElement
            );

        });


        // Add the Add Child button back underneath
        childrenContainer.appendChild(
            addButton
        );


        updateGreeting();


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

function createChildElement(child) {

    const childElement =
        document.createElement('div');


    childElement.className =
        'child-item';


    childElement.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        cursor: pointer;
        border-radius: 8px;
        margin: 4px 0;
        transition: background 0.2s;
        position: relative;
    `;


    childElement.innerHTML = `

        <span style="font-size:24px;">
            ${child.avatar}
        </span>

        <span
            style="
                font-size:14px;
                font-weight:500;
                flex:1;
            "
        >
            ${child.name}
        </span>

        <button
            class="delete-child-btn"
            type="button"
            style="
                background:none;
                border:none;
                color:#ff6b6b;
                cursor:pointer;
                font-size:14px;
                padding:2px 6px;
                border-radius:50%;
                display:none;
                flex-shrink:0;
            "
        >
            🗑️
        </button>
    `;


    // Hover effect
    childElement.addEventListener(
        'mouseover',
        () => {

            childElement.style.background =
                '#F0E8F5';


            const deleteButton =
                childElement.querySelector(
                    '.delete-child-btn'
                );


            deleteButton.style.display =
                'block';

        }
    );


    childElement.addEventListener(
        'mouseout',
        () => {

            const selectedChildId =
                localStorage.getItem(
                    'selectedChildId'
                );


            if (
                selectedChildId !==
                String(child.id)
            ) {

                childElement.style.background =
                    'transparent';

            }


            const deleteButton =
                childElement.querySelector(
                    '.delete-child-btn'
                );


            deleteButton.style.display =
                'none';

        }
    );


    // Delete child
    const deleteButton =
        childElement.querySelector(
            '.delete-child-btn'
        );


    deleteButton.addEventListener(
        'click',
        async (event) => {

            event.stopPropagation();


            const confirmed = confirm(
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

    localStorage.setItem(
        'selectedChildId',
        child.id
    );


    localStorage.setItem(
        'selectedChildName',
        child.name
    );


    localStorage.setItem(
        'selectedChildAvatar',
        child.avatar
    );


    document
        .querySelectorAll('.child-item')
        .forEach((element) => {

            element.style.background =
                'transparent';

        });


    childElement.style.background =
        '#F0E8F5';


    loadChildEntries(
        child.id,
        child.name,
        child.avatar
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

        const response = await fetch(
            `${API_URL}/api/children/${child.id}`,
            {
                method: 'DELETE',

                headers: getAuthHeaders()
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                'Unable to delete child'
            );

        }


        childElement.remove();


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


    } catch (error) {

        console.error(
            'Error deleting child:',
            error
        );


        alert(
            `❌ Error: ${error.message}`
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

    const userId =
        getUserId();


    if (!userId) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/entries-new/parent/${userId}`,
            {
                headers: getAuthHeaders()
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                'Unable to load entries'
            );

        }


        const childEntries =
            data.data.filter(
                (entry) =>
                    String(entry.child_id) ===
                    String(childId)
            );


        const entriesList =
            document.querySelector(
                '.empty-entries-list'
            );


        const heading =
            document.querySelector(
                '.entries-section .section-heading'
            );


        heading.textContent =
            `${childAvatar} ${childName.toUpperCase()}'S ENTRIES`;


        if (childEntries.length === 0) {

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


        entriesList.innerHTML = '';


        childEntries
            .slice(0, 5)
            .forEach((entry) => {

                const entryElement =
                    createEntryElement(entry);


                entriesList.appendChild(
                    entryElement
                );

            });


    } catch (error) {

        console.error(
            'Error loading child entries:',
            error
        );

    }
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

        const response = await fetch(
            `${API_URL}/api/entries-new/parent/${userId}`,
            {
                headers: getAuthHeaders()
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                'Unable to load entries'
            );

        }


        if (data.data.length === 0) {
            return;
        }


        const entriesList =
            document.querySelector(
                '.empty-entries-list'
            );


        entriesList.innerHTML = '';


        data.data
            .slice(0, 3)
            .forEach((entry) => {

                const entryElement =
                    createEntryElement(entry);


                entriesList.appendChild(
                    entryElement
                );

            });


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

function createEntryElement(entry) {

    const entryElement =
        document.createElement('div');


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

                ${isMilestone ? ' ⭐' : ''}
            </p>

            <p
                style="
                    color:#666;
                    margin:4px 0 0;
                    font-size:13px;
                "
            >
                ${entry.content.substring(0, 60)}...
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
        .querySelector('.view-btn')
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
        .querySelector('.edit-entry-btn')
        .addEventListener(
            'click',
            () => {

                window.location.href =
                    `new-entry.html?edit=${entry.id}`;

            }
        );


    // Delete entry
    entryElement
        .querySelector('.delete-entry-btn')
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

        const response = await fetch(
            `${API_URL}/api/entries-new/${entryId}`,
            {
                method: 'DELETE',

                headers: getAuthHeaders()
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

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
            `❌ Error: ${error.message}`
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
        document.createElement('div');


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


    let mediaHTML = '';


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


        media.forEach((item) => {

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

        });

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
                    ${getMoodEmoji(mood)}
                    ${mood}
                </span>


                ${
                    isMilestone
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
                style="
                    line-height:1.6;
                    color:#333;
                    margin-bottom:20px;
                "
            >
                ${content}
            </p>


            <div
                style="
                    margin-top:16px;
                "
            >
                ${mediaHTML}
            </div>

        </div>
    `;


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

            if (event.target === modal) {

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

function getMoodEmoji(mood) {

    const moods = {
        happy: '😊',
        excited: '🤩',
        sad: '😢',
        tired: '😴',
        proud: '🌟',
        silly: '😜',
        loved: '🥰'
    };


    return moods[mood] || '😊';
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
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    };


    dateElement.textContent =
        new Date().toLocaleDateString(
            'en-US',
            options
        );
}


// ==================================================
// PAGE INITIALISATION
// ==================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        setupLanguageSwitcher();

        updateGreeting();

        updateHeaderDate();

        loadChildren();

        loadRecentEntries();

    }
);