
function getClinicianStorageValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function getClinicianAccessToken() {
  return getClinicianStorageValue('clinicianAccessToken');
}

function getClinicianAuthHeaders() {
  const token = getClinicianAccessToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

function clearClinicianSession() {
  [
    'clinicianId',
    'clinicianName',
    'clinicianEmail',
    'clinicianProfession',
    'clinicianOrganisation',
    'clinicianAccessToken',
    'clinicianRefreshToken'
  ].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Date not recorded';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function makeInitials(name) {
  return String(name || 'Clinician')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatProgressValue(value) {
  if (!value) {
    return '—';
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

async function clinicianFetch(path) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      headers: getClinicianAuthHeaders()
    }
  );

  const data = await response.json();

  if (response.status === 401) {
    clearClinicianSession();

    window.location.href =
      'clinician-login.html';

    throw new Error(
      'Clinician session expired.'
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
      'Unable to load clinician data.'
    );
  }

  return data.data;
}

function loadClinicianAccount() {
  const name =
    getClinicianStorageValue(
      'clinicianName'
    ) || 'Clinician';

  const profession =
    getClinicianStorageValue(
      'clinicianProfession'
    ) || 'Clinician';

  const organisation =
    getClinicianStorageValue(
      'clinicianOrganisation'
    );

  document.getElementById(
    'clinicianName'
  ).textContent = name;

  document.getElementById(
    'clinicianProfession'
  ).textContent =
    organisation
      ? `${profession} · ${organisation}`
      : profession;

  document.getElementById(
    'clinicianInitials'
  ).textContent =
    makeInitials(name);
}

async function loadSharedChildren() {
  const container =
    document.getElementById(
      'sharedChildrenList'
    );

  try {
    const grants =
      await clinicianFetch(
        '/api/clinician/children'
      );

    if (!grants.length) {
      container.innerHTML = `
        <div class="sidebar-empty">
          No children are currently shared with you.
        </div>
      `;

      showNoAccessState();
      return;
    }

    container.innerHTML = '';

    grants.forEach(
      (grant, index) => {

        const child =
          grant.children;

        if (!child) {
          return;
        }

        const button =
          document.createElement(
            'button'
          );

        button.type = 'button';

        button.className =
          'shared-child-button';

        button.innerHTML = `
          <span class="shared-child-avatar">
            ${escapeHtml(
              child.avatar || '👶'
            )}
          </span>

          <span class="shared-child-text">
            <strong>
              ${escapeHtml(
                child.name || 'Child'
              )}
            </strong>

            <small>
              Shared profile
            </small>
          </span>
        `;

        button.addEventListener(
          'click',
          () => {

            document
              .querySelectorAll(
                '.shared-child-button'
              )
              .forEach(
                (item) =>
                  item.classList.remove(
                    'active'
                  )
              );

            button.classList.add(
              'active'
            );

            selectChild(grant);
          }
        );

        container.appendChild(
          button
        );

        if (index === 0) {
          button.classList.add(
            'active'
          );

          selectChild(grant);
        }
      }
    );

  } catch (error) {

    console.error(
      'Shared child load error:',
      error
    );

    container.innerHTML = `
      <div class="sidebar-empty error-text">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}

async function selectChild(grant) {
  const child = grant.children;

  document.getElementById(
    'noChildState'
  ).hidden = true;

  document.getElementById(
    'childContent'
  ).hidden = false;

  document.getElementById(
    'selectedChildAvatar'
  ).textContent =
    child.avatar || '👶';

  document.getElementById(
    'selectedChildName'
  ).textContent =
    child.name || 'Child';

  document.getElementById(
    'dashboardTitle'
  ).textContent =
    `${child.name || 'Child'}'s StoryBond`;

  document.getElementById(
    'selectedChildDetails'
  ).textContent =
    child.date_of_birth
      ? `Born ${formatDate(
          child.date_of_birth
        )}`
      : 'Date of birth not recorded';

  renderPermissionPills(grant);

  document.getElementById(
    'journalEntriesContent'
  ).innerHTML =
    '<div class="content-loading">Loading journal entries...</div>';

  document.getElementById(
    'weeklyProgressContent'
  ).innerHTML =
    '<div class="content-loading">Loading weekly progress...</div>';

  await Promise.all([
    loadJournalEntries(
      child.id,
      grant.can_view_journal
    ),

    loadWeeklyProgress(
      child.id,
      grant.can_view_weekly_progress
    )
  ]);
}

function renderPermissionPills(grant) {
  const pills = [];

  if (grant.can_view_journal) {
    pills.push(
      '<span class="permission-pill">📖 Journal</span>'
    );
  }

  if (
    grant.can_view_weekly_progress
  ) {
    pills.push(
      '<span class="permission-pill">📊 Weekly Progress</span>'
    );
  }

  document.getElementById(
    'permissionPills'
  ).innerHTML =
    pills.join('');
}

async function loadJournalEntries(
  childId,
  allowed
) {
  const container =
    document.getElementById(
      'journalEntriesContent'
    );

  const count =
    document.getElementById(
      'journalCount'
    );

  if (!allowed) {
    count.textContent = '—';

    container.innerHTML = `
      <div class="permission-denied-card">
        🔒 Journal access has not been shared by the parent.
      </div>
    `;

    return;
  }

  try {
    const entries =
      await clinicianFetch(
        `/api/clinician/child/${childId}/entries`
      );

    count.textContent =
      entries.length;

    if (!entries.length) {
      container.innerHTML = `
        <div class="content-empty">
          No journal entries have been recorded yet.
        </div>
      `;

      return;
    }

    container.innerHTML =
      entries
        .map(
          (entry) => `
        <article class="journal-entry-card">

          <div class="entry-meta">

            <span>
              ${escapeHtml(
                formatDate(
                  entry.entry_date
                )
              )}
            </span>

            ${
              entry.is_milestone
                ? '<span class="milestone-tag">⭐ Milestone</span>'
                : ''
            }

          </div>

          <h4>
            ${escapeHtml(
              entry.title ||
              'Untitled entry'
            )}
          </h4>

          <p class="entry-content">
            ${escapeHtml(
              entry.content || ''
            )}
          </p>

          <div class="entry-footer">

            <span>
              Mood:
              ${escapeHtml(
                formatProgressValue(
                  entry.mood
                )
              )}
            </span>

            <span>
              ${escapeHtml(
                entry.language || ''
              )}
            </span>

          </div>

        </article>
      `
        )
        .join('');

  } catch (error) {

    count.textContent = '—';

    container.innerHTML = `
      <div class="content-error">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}

async function loadWeeklyProgress(
  childId,
  allowed
) {
  const container =
    document.getElementById(
      'weeklyProgressContent'
    );

  const count =
    document.getElementById(
      'progressCount'
    );

  if (!allowed) {
    count.textContent = '—';

    container.innerHTML = `
      <div class="permission-denied-card">
        🔒 Weekly progress access has not been shared by the parent.
      </div>
    `;

    return;
  }

  try {

    const records =
      await clinicianFetch(
        `/api/clinician/child/${childId}/weekly-progress`
      );

    count.textContent =
      records.length;

    if (!records.length) {

      container.innerHTML = `
        <div class="content-empty">
          No weekly progress checks have been recorded yet.
        </div>
      `;

      return;
    }

    container.innerHTML =
      records
        .map(
          (progress) => `
        <article class="weekly-progress-card">

          <div class="weekly-progress-header">

            <span class="eyebrow">
              WEEK STARTING
            </span>

            <h4>
              ${escapeHtml(
                formatDate(
                  progress.week_start
                )
              )}
            </h4>

          </div>

          <div class="progress-stat-grid">

            ${progressStat(
              'Mood',
              progress.overall_mood
            )}

            ${progressStat(
              'Communication',
              progress.communication
            )}

            ${progressStat(
              'Reading Interest',
              progress.reading_interest
            )}

            ${progressStat(
              'Social Interaction',
              progress.social_interaction
            )}

          </div>

          <div class="progress-notes">

            <div>
              <strong>
                Parent concern
              </strong>

              <p>
                ${escapeHtml(
                  progress.parent_concern ||
                  'Nothing recorded.'
                )}
              </p>
            </div>

            <div>
              <strong>
                Parent proud of
              </strong>

              <p>
                ${escapeHtml(
                  progress.parent_proud ||
                  'Nothing recorded.'
                )}
              </p>
            </div>

          </div>

        </article>
      `
        )
        .join('');

  } catch (error) {

    count.textContent = '—';

    container.innerHTML = `
      <div class="content-error">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}

function progressStat(
  label,
  value
) {
  return `
    <div class="progress-stat">

      <span>
        ${escapeHtml(label)}
      </span>

      <strong>
        ${escapeHtml(
          formatProgressValue(value)
        )}
      </strong>

    </div>
  `;
}

function showNoAccessState() {
  const noChildState =
    document.getElementById(
      'noChildState'
    );

  noChildState.hidden = false;

  noChildState.innerHTML = `
    <div class="empty-state-icon">
      🔒
    </div>

    <h3>
      No active child access
    </h3>

    <p>
      A parent has not currently shared a child profile
      with this clinician account.
    </p>
  `;

  document.getElementById(
    'childContent'
  ).hidden = true;
}

function logoutClinician() {
  clearClinicianSession();

  window.location.href =
    'clinician-login.html';
}

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    if (
      !getClinicianAccessToken()
    ) {

      window.location.href =
        'clinician-login.html';

      return;
    }

    loadClinicianAccount();

    document
      .getElementById(
        'clinicianLogoutButton'
      )
      .addEventListener(
        'click',
        logoutClinician
      );

    await loadSharedChildren();
  }
);