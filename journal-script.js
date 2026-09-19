// Journal Entry Script for StoryBond



let selectedMedia = [];
let selectedFiles = [];


const editEntryId =
    new URLSearchParams(
        window.location.search
    ).get('edit');


const JournalEntry = {

    async init() {

        // =============================================
        // LOAD CHILDREN
        // =============================================

        await loadChildren();


        // =============================================
        // FORM SUBMISSION
        // =============================================

        const form =
            document.getElementById(
                'journalForm'
            );

        form.addEventListener(
            'submit',
            JournalEntry.handleSubmit
        );


        // =============================================
        // DEFAULT DATE FOR NEW ENTRY
        // =============================================

        const today =
            new Date();


        const todayString = [

            today.getFullYear(),

            String(
                today.getMonth() + 1
            ).padStart(
                2,
                '0'
            ),

            String(
                today.getDate()
            ).padStart(
                2,
                '0'
            )

        ].join('-');


        // Only set today's date
        // when creating a brand-new entry.
        if (!editEntryId) {

            const dateInput =
                document.getElementById(
                    'entryDate'
                );

            if (dateInput) {

                dateInput.value =
                    todayString;
            }
        }


        // =============================================
        // TAG BUTTONS
        // =============================================

        const tagBtns =
            document.querySelectorAll(
                '.tag-btn[data-tag]'
            );


        tagBtns.forEach(
            (btn) => {

                btn.addEventListener(
                    'click',
                    function () {

                        this.classList.toggle(
                            'selected'
                        );
                    }
                );
            }
        );


        // =============================================
        // ADD CUSTOM TAG
        // =============================================

        const addTagBtn =
            document.querySelector(
                '.add-tag-btn'
            );


        if (addTagBtn) {

            addTagBtn.addEventListener(
                'click',
                () => {

                    const label =
                        prompt(
                            'Enter a new tag:'
                        );


                    if (
                        !label ||
                        !label.trim()
                    ) {

                        return;
                    }


                    const tagValue =
                        label
                            .trim()
                            .toLowerCase()
                            .replace(
                                /\s+/g,
                                '-'
                            );


                    // Avoid duplicate tags
                    const existing =
                        document.querySelector(
                            `.tag-btn[data-tag="${tagValue}"]`
                        );


                    if (existing) {

                        existing
                            .classList
                            .add(
                                'selected'
                            );

                        return;
                    }


                    const newTagBtn =
                        document.createElement(
                            'button'
                        );


                    newTagBtn.type =
                        'button';


                    newTagBtn.className =
                        'tag-btn selected';


                    newTagBtn.dataset.tag =
                        tagValue;


                    newTagBtn.textContent =
                        `# ${label.trim()}`;


                    newTagBtn.addEventListener(
                        'click',
                        function () {

                            this.classList.toggle(
                                'selected'
                            );
                        }
                    );


                    addTagBtn
                        .parentNode
                        .insertBefore(
                            newTagBtn,
                            addTagBtn
                        );
                }
            );
        }


        // =============================================
        // MOOD BUTTONS
        // =============================================

        const moodBtns =
            document.querySelectorAll(
                '.mood-btn'
            );


        moodBtns.forEach(
            (btn) => {

                btn.addEventListener(
                    'click',
                    function () {

                        moodBtns.forEach(
                            (button) => {

                                button
                                    .classList
                                    .remove(
                                        'selected'
                                    );
                            }
                        );


                        this
                            .classList
                            .add(
                                'selected'
                            );
                    }
                );
            }
        );


        // =============================================
        // PHOTO UPLOAD
        // =============================================

        const photoInput =
            document.getElementById(
                'photoInput'
            );


        if (photoInput) {

            photoInput.addEventListener(
                'change',
                function (e) {

                    JournalEntry
                        .handleFileSelect(
                            e.target.files,
                            'photo'
                        );
                }
            );
        }


        // =============================================
        // VIDEO UPLOAD
        // =============================================

        const videoInput =
            document.getElementById(
                'videoInput'
            );


        if (videoInput) {

            videoInput.addEventListener(
                'change',
                function (e) {

                    JournalEntry
                        .handleFileSelect(
                            e.target.files,
                            'video'
                        );
                }
            );
        }


        // =============================================
        // EDIT EXISTING ENTRY
        // =============================================

        if (editEntryId) {

            await JournalEntry
                .loadEntryForEdit(
                    editEntryId
                );
        }
    },


    // =============================================
    // LOAD ENTRY FOR EDIT
    // =============================================

    async loadEntryForEdit(
        entryId
    ) {

        try {

            const accessToken =
                localStorage.getItem(
                    'accessToken'
                ) ||
                sessionStorage.getItem(
                    'accessToken'
                );


            const response =
                await fetch(
                    `${API_URL}/api/entries-new/${entryId}`,
                    {
                        headers: {

                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!data.success) {

                throw new Error(
                    data.error ||
                    'Entry not found'
                );
            }


            const entry =
                data.data;


            document
                .getElementById(
                    'entryTitle'
                )
                .value =
                entry.title || '';


            document
                .getElementById(
                    'storyText'
                )
                .value =
                entry.content || '';


            // Date input type="date"
            // accepts YYYY-MM-DD directly.
            if (entry.entry_date) {

                document
                    .getElementById(
                        'entryDate'
                    )
                    .value =
                    entry.entry_date;
            }


            // =========================================
            // RE-SELECT CORRECT CHILD
            // =========================================

            const childBtn =
                document.querySelector(
                    `.journal-child-btn[data-child-id="${entry.child_id}"]`
                );


            if (childBtn) {

                childBtn.click();
            }


            // =========================================
            // RE-SELECT MOOD
            // =========================================

            document
                .querySelectorAll(
                    '.mood-btn'
                )
                .forEach(
                    (button) => {

                        button
                            .classList
                            .remove(
                                'selected'
                            );
                    }
                );


            const moodBtn =
                document.querySelector(
                    `.mood-btn[data-mood="${entry.mood}"]`
                );


            if (moodBtn) {

                moodBtn
                    .classList
                    .add(
                        'selected'
                    );
            }


            // =========================================
            // RE-SELECT MILESTONE
            // =========================================

            if (entry.is_milestone) {

                const milestoneBtn =
                    document.querySelector(
                        '.tag-btn[data-tag="milestone"]'
                    );


                if (milestoneBtn) {

                    milestoneBtn
                        .classList
                        .add(
                            'selected'
                        );
                }
            }


            // =========================================
            // EXISTING MEDIA PREVIEW
            // =========================================

            if (
                entry.media &&
                entry.media.length > 0
            ) {

                const previewArea =
                    document.getElementById(
                        'mediaPreview'
                    );


                entry.media.forEach(
                    (media) => {

                        const item =
                            document.createElement(
                                'div'
                            );


                        item.className =
                            'preview-item-journal';


                        item.innerHTML =
                            media.media_type ===
                                'image'

                                ? `
                                    <img
                                        src="${media.file_url}"
                                        alt="Existing photo"
                                    >
                                `

                                : `
                                    <div
                                        style="
                                            background:#F0E8F5;
                                            width:100%;
                                            height:100%;
                                            display:flex;
                                            align-items:center;
                                            justify-content:center;
                                            font-size:32px;
                                        "
                                    >
                                        🎥
                                    </div>
                                `;


                        previewArea.appendChild(
                            item
                        );
                    }
                );
            }


            // =========================================
            // SWITCH FORM TO EDIT MODE
            // =========================================

            const heading =
                document.querySelector(
                    '.journal-heading'
                );


            if (heading) {

                heading.setAttribute(
                    'data-i18n',
                    'edit_journal_heading'
                );
            }


            const subheading =
                document.querySelector(
                    '.journal-subheading'
                );


            if (subheading) {

                subheading.setAttribute(
                    'data-i18n',
                    'edit_journal_subheading'
                );
            }


            const submitLabel =
                document.querySelector(
                    '.save-btn-journal span[data-i18n="save_entry"]'
                );


            if (submitLabel) {

                submitLabel.setAttribute(
                    'data-i18n',
                    'update_entry_btn'
                );
            }


            if (
                typeof applyLanguage ===
                'function'
            ) {

                applyLanguage(
                    localStorage.getItem(
                        'storybondLang'
                    ) ||
                    'en'
                );
            }


        } catch (error) {

            console.error(
                'Error loading entry for edit:',
                error
            );


            alert(
                '❌ Could not load this entry for editing.'
            );
        }
    },


    // =============================================
    // HANDLE FILE SELECTION
    // =============================================

    handleFileSelect(
        files,
        type
    ) {

        Array
            .from(files)
            .forEach(
                (file) => {

                    const reader =
                        new FileReader();


                    reader.onload =
                        function (e) {

                            selectedMedia.push(
                                {
                                    type:
                                        type,

                                    url:
                                        e.target.result,

                                    name:
                                        file.name,

                                    file:
                                        file
                                }
                            );


                            selectedFiles.push(
                                file
                            );


                            JournalEntry
                                .renderMediaPreview();
                        };


                    reader.readAsDataURL(
                        file
                    );
                }
            );
    },


    // =============================================
    // RENDER MEDIA PREVIEW
    // =============================================

    renderMediaPreview() {

        const previewArea =
            document.getElementById(
                'mediaPreview'
            );


        if (!previewArea) {

            return;
        }


        previewArea.innerHTML =
            '';


        selectedMedia.forEach(
            (media, index) => {

                const previewItem =
                    document.createElement(
                        'div'
                    );


                previewItem.className =
                    'preview-item-journal';


                if (
                    media.type ===
                    'photo'
                ) {

                    previewItem.innerHTML = `

                        <img
                            src="${media.url}"
                            alt="Preview"
                        >

                        <button
                            class="remove-media"
                            type="button"
                            onclick="JournalEntry.removeMedia(${index})"
                        >
                            ✕
                        </button>
                    `;


                } else {

                    previewItem.innerHTML = `

                        <div
                            style="
                                background:#F0E8F5;
                                width:100%;
                                height:100%;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:32px;
                            "
                        >
                            🎥
                        </div>

                        <button
                            class="remove-media"
                            type="button"
                            onclick="JournalEntry.removeMedia(${index})"
                        >
                            ✕
                        </button>
                    `;
                }


                previewArea.appendChild(
                    previewItem
                );
            }
        );
    },


    // =============================================
    // REMOVE MEDIA
    // =============================================

    removeMedia(
        index
    ) {

        selectedMedia.splice(
            index,
            1
        );


        selectedFiles.splice(
            index,
            1
        );


        JournalEntry
            .renderMediaPreview();
    },


    // =============================================
    // UPLOAD MEDIA
    // =============================================

    async uploadMedia(
        entryId
    ) {

        if (
            selectedFiles.length ===
            0
        ) {

            return [];
        }


        const userId =
            localStorage.getItem(
                'userId'
            ) ||
            sessionStorage.getItem(
                'userId'
            );


        const uploadedUrls =
            [];


        for (
            const file
            of selectedFiles
        ) {

            const formData =
                new FormData();


            formData.append(
                'file',
                file
            );


            formData.append(
                'parent_id',
                userId
            );


            formData.append(
                'entry_id',
                entryId
            );


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/upload`,
                        {
                            method:
                                'POST',

                            body:
                                formData
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    uploadedUrls.push(
                        data.data.file_url
                    );
                }


            } catch (error) {

                console.error(
                    'Upload error:',
                    error
                );
            }
        }


        return uploadedUrls;
    },


    // =============================================
    // SAVE / UPDATE JOURNAL ENTRY
    // =============================================

    async handleSubmit(
        e
    ) {

        e.preventDefault();


        const title =
            document
                .getElementById(
                    'entryTitle'
                )
                .value
                .trim();


        const date =
            document
                .getElementById(
                    'entryDate'
                )
                .value;


        const story =
            document
                .getElementById(
                    'storyText'
                )
                .value
                .trim();


        const userId =
            localStorage.getItem(
                'userId'
            ) ||
            sessionStorage.getItem(
                'userId'
            );


        const childId =
            document
                .getElementById(
                    'selectedChildId'
                )
                ?.value;


        const accessToken =
            localStorage.getItem(
                'accessToken'
            ) ||
            sessionStorage.getItem(
                'accessToken'
            );


        const selectedMood =
            document.querySelector(
                '.mood-btn.selected'
            );


        const selectedTags =
            Array
                .from(
                    document.querySelectorAll(
                        '.tag-btn[data-tag].selected'
                    )
                )
                .map(
                    (btn) =>
                        btn.dataset.tag
                );


        // =========================================
        // VALIDATION
        // =========================================

        if (!title) {

            alert(
                '⚠️ Please enter an entry title'
            );

            return;
        }


        if (!date) {

            alert(
                '⚠️ Please select a date'
            );

            return;
        }


        if (!story) {

            alert(
                '⚠️ Please write about what happened'
            );

            return;
        }


        if (!userId) {

            alert(
                '⚠️ Please log in first'
            );


            window.location.href =
                'login.html';

            return;
        }


        if (!childId) {

            alert(
                '⚠️ Please select a child first!'
            );

            return;
        }


        // =========================================
        // DISABLE SUBMIT BUTTON
        // =========================================

        const submitBtn =
            document.querySelector(
                'button[type="submit"]'
            );


        submitBtn.disabled =
            true;


        submitBtn.textContent =
            editEntryId
                ? '⏳ Updating...'
                : '⏳ Saving...';


        try {

            const isEdit =
                !!editEntryId;


            const url =
                isEdit

                    ? `${API_URL}/api/entries-new/${editEntryId}`

                    : `${API_URL}/api/entries-new`;


            // =====================================
            // SAVE ENTRY
            // =====================================

            const entryResponse =
                await fetch(
                    url,
                    {
                        method:
                            isEdit
                                ? 'PUT'
                                : 'POST',

                        headers: {

                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${accessToken}`
                        },

                        body:
                            JSON.stringify(
                                {
                                    parent_id:
                                        userId,

                                    child_id:
                                        childId,

                                    title:
                                        title,

                                    entry_date:
                                        date,

                                    content:
                                        story,

                                    mood:
                                        selectedMood
                                            ? selectedMood.dataset.mood
                                            : 'happy',

                                    language:
                                        document
                                            .querySelector(
                                                '.lang-btn.active'
                                            )
                                            ?.textContent ===
                                            'TR'

                                            ? 'TR'
                                            : 'EN',

                                    is_milestone:
                                        selectedTags.includes(
                                            'milestone'
                                        )
                                }
                            )
                    }
                );


            const entryData =
                await entryResponse.json();


            if (!entryData.success) {

                throw new Error(
                    entryData.error ||
                    'Unable to save journal entry'
                );
            }


            // =====================================
            // ENTRY ID
            // =====================================

            const savedEntryId =
                isEdit
                    ? editEntryId
                    : entryData.data.id;


            // =====================================
            // MEDIA UPLOAD
            // =====================================

            if (
                selectedFiles.length >
                0
            ) {

                await JournalEntry
                    .uploadMedia(
                        savedEntryId
                    );
            }


            // =====================================
            // SUCCESS
            // =====================================

            alert(
                isEdit
                    ? '✅ Journal entry updated successfully!'
                    : '✅ Journal entry saved successfully!'
            );


            document
                .getElementById(
                    'journalForm'
                )
                .reset();


            selectedMedia =
                [];


            selectedFiles =
                [];


            JournalEntry
                .renderMediaPreview();


            setTimeout(
                () => {

                    window.location.href =
                        'index.html';
                },
                500
            );


        } catch (error) {

            console.error(
                'Error saving entry:',
                error
            );


            alert(
                `❌ Error: ${error.message}`
            );


            submitBtn.disabled =
                false;


            submitBtn.textContent =
                editEntryId
                    ? '🔄 Update Entry'
                    : '✏️ Save Entry';
        }
    }
};


// =============================================
// MAKE JOURNAL ENTRY AVAILABLE GLOBALLY
// =============================================

window.JournalEntry =
    JournalEntry;


// =============================================
// ADD MORE PHOTOS
// =============================================

function handleAddMore() {

    const photoInput =
        document.getElementById(
            'photoInput'
        );


    if (photoInput) {

        photoInput.click();
    }
}


// =============================================
// PAGE STARTUP
// =============================================

document.addEventListener(
    'DOMContentLoaded',
    JournalEntry.init
);


// =============================================
// LANGUAGE SWITCHER
// =============================================

document
    .querySelectorAll(
        '.lang-btn'
    )
    .forEach(
        (btn) => {

            btn.addEventListener(
                'click',
                function () {

                    document
                        .querySelectorAll(
                            '.lang-btn'
                        )
                        .forEach(
                            (button) => {

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