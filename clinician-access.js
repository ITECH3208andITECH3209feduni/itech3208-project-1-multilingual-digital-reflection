

function getParentUserId() {

    return (
        localStorage.getItem('userId') ||
        sessionStorage.getItem('userId')
    );
}


function getParentAccessToken() {

    return (
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')
    );
}


function getParentAuthHeaders(
    includeJson = false
) {

    const token =
        getParentAccessToken();


    const headers = {};


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }


    if (includeJson) {

        headers['Content-Type'] =
            'application/json';
    }


    return headers;
}


function escapeHtml(value) {

    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


function formatDate(value) {

    if (!value) {

        return 'Unknown';
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }


    return date.toLocaleDateString(
        'en-AU',
        {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }
    );
}


function setFormMessage(
    message,
    type = ''
) {

    const element =
        document.getElementById(
            'accessFormMessage'
        );


    element.textContent =
        message;


    element.className =
        'form-message';


    if (type) {

        element.classList.add(
            type
        );
    }
}


function ensureParentSession() {

    if (
        !getParentUserId() ||
        !getParentAccessToken()
    ) {

        window.location.href =
            'login.html';

        return false;
    }


    return true;
}


// ==================================================
// LOAD CHILDREN
// ==================================================

async function loadChildren() {

    const select =
        document.getElementById(
            'childSelect'
        );


    try {

        const response =
            await fetch(
                `${API_URL}/api/children/parent/${getParentUserId()}`,
                {
                    headers:
                        getParentAuthHeaders()
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


        const children =
            data.data || [];


        select.innerHTML =
            '';


        if (!children.length) {

            select.innerHTML = `
                <option value="">
                    No children available
                </option>
            `;


            select.disabled =
                true;


            return;
        }


        select.disabled =
            false;


        select.innerHTML = `
            <option value="">
                Select a child
            </option>
        `;


        children.forEach(
            (child) => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    child.id;


                option.textContent =
                    `${child.avatar || '👶'} ${child.name}`;


                select.appendChild(
                    option
                );
            }
        );


    } catch (error) {

        console.error(
            'Load children error:',
            error
        );


        select.innerHTML = `
            <option value="">
                Unable to load children
            </option>
        `;


        setFormMessage(
            error.message,
            'error'
        );
    }
}


// ==================================================
// LOAD EXISTING ACCESS
// ==================================================

async function loadClinicianAccess() {

    const container =
        document.getElementById(
            'accessList'
        );


    container.innerHTML = `
        <div class="loading-state">
            Loading access records...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/clinician-access`,
                {
                    headers:
                        getParentAuthHeaders()
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


        renderAccessList(
            data.data || []
        );


    } catch (error) {

        console.error(
            'Load clinician access error:',
            error
        );


        container.innerHTML = `
            <div class="error-state">
                ${escapeHtml(
                    error.message
                )}
            </div>
        `;
    }
}


// ==================================================
// RENDER ACCESS LIST
// ==================================================

function renderAccessList(
    records
) {

    const container =
        document.getElementById(
            'accessList'
        );


    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    👩‍⚕️
                </div>

                <strong>
                    No clinician access yet
                </strong>

                <p>
                    Grant access using the form on the left.
                </p>

            </div>
        `;


        return;
    }


    container.innerHTML =
        records
            .map(
                (record) => {

                    const child =
                        record.children || {};


                    const activeClass =
                        record.active
                            ? 'active'
                            : 'revoked';


                    const statusText =
                        record.active
                            ? 'Active'
                            : 'Revoked';


                    const permissions =
                        [];


                    if (
                        record.can_view_journal
                    ) {

                        permissions.push(
                            '📖 Journal'
                        );
                    }


                    if (
                        record.can_view_weekly_progress
                    ) {

                        permissions.push(
                            '📊 Weekly Progress'
                        );
                    }


                    return `
                        <article class="access-record ${activeClass}">

                            <div class="access-record-top">

                                <div class="child-summary">

                                    <span class="child-avatar">
                                        ${escapeHtml(
                                            child.avatar ||
                                            '👶'
                                        )}
                                    </span>

                                    <div>

                                        <strong>
                                            ${escapeHtml(
                                                child.name ||
                                                'Child'
                                            )}
                                        </strong>

                                        <small>
                                            Shared child
                                        </small>

                                    </div>

                                </div>


                                <span class="status-badge ${activeClass}">
                                    ${statusText}
                                </span>

                            </div>


                            <div class="clinician-summary">

                                <span class="clinician-icon">
                                    🩺
                                </span>

                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            record.clinician_email
                                        )}
                                    </strong>

                                    <small>
                                        Clinician account
                                    </small>

                                </div>

                            </div>


                            <div class="permissions-row">

                                ${
                                    permissions.length
                                        ? permissions
                                            .map(
                                                (permission) => `
                                                    <span class="permission-chip">
                                                        ${escapeHtml(
                                                            permission
                                                        )}
                                                    </span>
                                                `
                                            )
                                            .join('')
                                        : `
                                            <span class="permission-chip muted">
                                                No view permissions
                                            </span>
                                        `
                                }

                            </div>


                            <div class="access-meta">

                                <span>
                                    Added:
                                    ${escapeHtml(
                                        formatDate(
                                            record.created_at
                                        )
                                    )}
                                </span>

                                <span>
                                    Updated:
                                    ${escapeHtml(
                                        formatDate(
                                            record.updated_at
                                        )
                                    )}
                                </span>

                            </div>


                            <div class="access-actions">

                                ${
                                    record.active
                                        ? `
                                            <button
                                                type="button"
                                                class="edit-access-btn"
                                                data-child-id="${escapeHtml(
                                                    record.child_id
                                                )}"
                                                data-email="${escapeHtml(
                                                    record.clinician_email
                                                )}"
                                                data-journal="${record.can_view_journal}"
                                                data-weekly="${record.can_view_weekly_progress}"
                                            >
                                                Edit permissions
                                            </button>

                                            <button
                                                type="button"
                                                class="revoke-access-btn"
                                                data-access-id="${escapeHtml(
                                                    record.id
                                                )}"
                                            >
                                                Revoke access
                                            </button>
                                        `
                                        : `
                                            <button
                                                type="button"
                                                class="restore-access-btn"
                                                data-child-id="${escapeHtml(
                                                    record.child_id
                                                )}"
                                                data-email="${escapeHtml(
                                                    record.clinician_email
                                                )}"
                                                data-journal="${record.can_view_journal}"
                                                data-weekly="${record.can_view_weekly_progress}"
                                            >
                                                Restore access
                                            </button>
                                        `
                                }

                            </div>

                        </article>
                    `;
                }
            )
            .join('');


    bindAccessListButtons();
}


// ==================================================
// BUTTON EVENTS
// ==================================================

function bindAccessListButtons() {

    document
        .querySelectorAll(
            '.revoke-access-btn'
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    async () => {

                        await revokeAccess(
                            button.dataset.accessId,
                            button
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            '.edit-access-btn, .restore-access-btn'
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        document.getElementById(
                            'childSelect'
                        ).value =
                            button.dataset.childId;


                        document.getElementById(
                            'clinicianEmail'
                        ).value =
                            button.dataset.email;


                        document.getElementById(
                            'canViewJournal'
                        ).checked =
                            button.dataset.journal ===
                            'true';


                        document.getElementById(
                            'canViewWeeklyProgress'
                        ).checked =
                            button.dataset.weekly ===
                            'true';


                        document.getElementById(
                            'grantAccessButton'
                        ).textContent =
                            button.classList.contains(
                                'restore-access-btn'
                            )
                                ? 'Restore access'
                                : 'Update access';


                        document.getElementById(
                            'clinicianAccessForm'
                        ).scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                );
            }
        );
}


// ==================================================
// GRANT / UPDATE
// ==================================================

async function submitClinicianAccess(
    event
) {

    event.preventDefault();


    const childId =
        document.getElementById(
            'childSelect'
        ).value;


    const clinicianEmail =
        document.getElementById(
            'clinicianEmail'
        )
            .value
            .trim()
            .toLowerCase();


    const canViewJournal =
        document.getElementById(
            'canViewJournal'
        ).checked;


    const canViewWeeklyProgress =
        document.getElementById(
            'canViewWeeklyProgress'
        ).checked;


    const submitButton =
        document.getElementById(
            'grantAccessButton'
        );


    setFormMessage('');


    if (!childId) {

        setFormMessage(
            'Please select a child.',
            'error'
        );

        return;
    }


    if (!clinicianEmail) {

        setFormMessage(
            'Please enter the clinician email.',
            'error'
        );

        return;
    }


    if (
        !canViewJournal &&
        !canViewWeeklyProgress
    ) {

        setFormMessage(
            'Select at least one permission.',
            'error'
        );

        return;
    }


    submitButton.disabled =
        true;


    const previousText =
        submitButton.textContent;


    submitButton.textContent =
        'Saving...';


    try {

        const response =
            await fetch(
                `${API_URL}/api/clinician-access`,
                {
                    method: 'POST',

                    headers:
                        getParentAuthHeaders(
                            true
                        ),

                    body:
                        JSON.stringify({
                            child_id:
                                childId,

                            clinician_email:
                                clinicianEmail,

                            can_view_journal:
                                canViewJournal,

                            can_view_weekly_progress:
                                canViewWeeklyProgress
                        })
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
                'Unable to save clinician access.'
            );
        }


        setFormMessage(
            '✓ Clinician access saved successfully.',
            'success'
        );


        document.getElementById(
            'clinicianAccessForm'
        ).reset();


        document.getElementById(
            'canViewJournal'
        ).checked =
            true;


        document.getElementById(
            'canViewWeeklyProgress'
        ).checked =
            true;


        document.getElementById(
            'grantAccessButton'
        ).textContent =
            'Grant access';


        await loadClinicianAccess();


    } catch (error) {

        console.error(
            'Save clinician access error:',
            error
        );


        setFormMessage(
            error.message,
            'error'
        );


    } finally {

        submitButton.disabled =
            false;


        if (
            submitButton.textContent ===
            'Saving...'
        ) {

            submitButton.textContent =
                previousText;
        }
    }
}


// ==================================================
// REVOKE
// ==================================================

async function revokeAccess(
    accessId,
    button
) {

    const confirmed =
        window.confirm(
            'Revoke this clinician access?'
        );


    if (!confirmed) {

        return;
    }


    button.disabled =
        true;


    button.textContent =
        'Revoking...';


    try {

        const response =
            await fetch(
                `${API_URL}/api/clinician-access/${accessId}`,
                {
                    method: 'DELETE',

                    headers:
                        getParentAuthHeaders()
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
                'Unable to revoke access.'
            );
        }


        await loadClinicianAccess();


    } catch (error) {

        console.error(
            'Revoke access error:',
            error
        );


        window.alert(
            error.message
        );


        button.disabled =
            false;


        button.textContent =
            'Revoke access';
    }
}


// ==================================================
// START
// ==================================================

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        if (
            !ensureParentSession()
        ) {

            return;
        }


        document
            .getElementById(
                'clinicianAccessForm'
            )
            .addEventListener(
                'submit',
                submitClinicianAccess
            );


        document
            .getElementById(
                'refreshAccessButton'
            )
            .addEventListener(
                'click',
                loadClinicianAccess
            );


        await Promise.all([
            loadChildren(),
            loadClinicianAccess()
        ]);
    }
);