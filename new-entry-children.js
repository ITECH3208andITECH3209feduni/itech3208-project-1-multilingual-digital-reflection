// =====================================================
// StoryBond - New Entry Child Loader
// =====================================================
// Loads children for the New Journal Entry page,
// displays them in the sidebar and journal selector,
// and keeps track of the currently selected child.
// =====================================================


// =====================================================
// GET ACTIVE STORAGE
// =====================================================
// If the user logged in with "Remember Me", their
// access token is in localStorage.
//
// Otherwise the login exists only for this browser tab
// using sessionStorage.
// =====================================================

function getActiveStorage() {

    if (localStorage.getItem('accessToken')) {
        return localStorage;
    }

    return sessionStorage;
}


// =====================================================
// SAVE SELECTED CHILD
// =====================================================

function saveSelectedChild(child) {

    const storage = getActiveStorage();

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

    // Store selected child in the journal form
    const hiddenChildInput =
        document.getElementById(
            'selectedChildId'
        );

    if (hiddenChildInput) {

        hiddenChildInput.value =
            child.id;
    }

    updateSelectedChildUI(
        child.id
    );
}


// =====================================================
// UPDATE SELECTED CHILD UI
// =====================================================
// Highlights the selected child in both:
//
// 1. Sidebar
// 2. Journal child selector
// =====================================================

function updateSelectedChildUI(childId) {

    const childIdString =
        String(childId);


    // -------------------------
    // Sidebar
    // -------------------------

    document
        .querySelectorAll('.child-item')
        .forEach(item => {

            const isSelected =
                item.dataset.childId ===
                childIdString;

            item.classList.toggle(
                'selected-child',
                isSelected
            );
        });


    // -------------------------
    // Journal selector
    // -------------------------

    document
        .querySelectorAll(
            '.journal-child-btn'
        )
        .forEach(button => {

            const isSelected =
                button.dataset.childId ===
                childIdString;

            button.classList.toggle(
                'selected',
                isSelected
            );
        });
}


// =====================================================
// LOAD CHILDREN
// =====================================================

async function loadChildren() {

    const storage =
        getActiveStorage();

    const userId =
        storage.getItem('userId');

    const accessToken =
        storage.getItem('accessToken');


    // User is not authenticated
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


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                'Unable to load children'
            );
        }


        const children =
            data.data || [];


        // =================================================
        // CHECK PREVIOUSLY SELECTED CHILD
        // =================================================

        let selectedChildId =
            storage.getItem(
                'selectedChildId'
            );


        // Make sure selected child still exists
        const selectedChildExists =
            children.some(
                child =>
                    String(child.id) ===
                    String(selectedChildId)
            );


        // If selected child no longer exists,
        // remove old selection
        if (
            selectedChildId &&
            !selectedChildExists
        ) {

            storage.removeItem(
                'selectedChildId'
            );

            storage.removeItem(
                'selectedChildName'
            );

            storage.removeItem(
                'selectedChildAvatar'
            );

            selectedChildId = null;
        }


        // =================================================
        // SIDEBAR CHILDREN
        // =================================================

        const childrenContainer =
            document.querySelector(
                '.children'
            );


        if (childrenContainer) {

            const addBtn =
                childrenContainer.querySelector(
                    '.add-child-btn'
                );


            childrenContainer.innerHTML =
                '<p class="nav-heading">CHILDREN</p>';


            children.forEach(child => {

                const childEl =
                    document.createElement(
                        'div'
                    );


                childEl.className =
                    'child-item';


                childEl.dataset.childId =
                    child.id;


                childEl.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 8px;
                    margin: 4px 0;
                `;


                // -------------------------
                // Avatar
                // -------------------------

                const avatar =
                    document.createElement(
                        'span'
                    );


                avatar.style.fontSize =
                    '24px';


                avatar.textContent =
                    child.avatar || '👶';


                // -------------------------
                // Name
                // -------------------------

                const name =
                    document.createElement(
                        'span'
                    );


                name.style.fontSize =
                    '14px';


                name.style.fontWeight =
                    '500';


                name.textContent =
                    child.name;


                childEl.appendChild(
                    avatar
                );


                childEl.appendChild(
                    name
                );


                childEl.addEventListener(
                    'click',
                    () => {

                        saveSelectedChild(
                            child
                        );
                        
                    }
                );


                childrenContainer.appendChild(
                    childEl
                );
            });


            // Restore Add Child button
            if (addBtn) {

                childrenContainer.appendChild(
                    addBtn
                );
            }
        }


        // =================================================
        // JOURNAL CHILD SELECTOR
        // =================================================

        const journalSelector =
            document.getElementById(
                'journalChildSelector'
            );


        if (journalSelector) {

            const addChildButton =
                journalSelector.querySelector(
                    '.add-child-option'
                );


            journalSelector.innerHTML =
                '';


            children.forEach(child => {

                const childButton =
                    document.createElement(
                        'button'
                    );


                childButton.type =
                    'button';


                childButton.className =
                    'tag-btn journal-child-btn';


                childButton.dataset.childId =
                    child.id;


                const buttonText =
                    document.createElement(
                        'span'
                    );


                buttonText.textContent =
                    `${child.avatar || '👶'} ${child.name}`;


                childButton.appendChild(
                    buttonText
                );


                childButton.addEventListener(
                    'click',
                    () => {

                        saveSelectedChild(
                            child
                        );
                    }
                );


                journalSelector.appendChild(
                    childButton
                );
            });


            // Restore Add Child option
            if (addChildButton) {

                journalSelector.appendChild(
                    addChildButton
                );
            }
        }


        // =================================================
        // RESTORE SELECTED CHILD
        // =================================================

        if (selectedChildId) {

            updateSelectedChildUI(
                selectedChildId
            );

            const hiddenChildInput =
                document.getElementById(
                    'selectedChildId'
                );

            if (hiddenChildInput) {

                hiddenChildInput.value =
                    selectedChildId;
            }
        }


        // =================================================
        // USER GREETING
        // =================================================

        const userName =
            storage.getItem(
                'userName'
            );


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
// HEADER DATE
// =====================================================

function updateHeaderDate() {

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
        new Date().toLocaleDateString(
            'en-AU',
            options
        );
}


// =====================================================
// PAGE STARTUP
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        updateHeaderDate();
    }
);