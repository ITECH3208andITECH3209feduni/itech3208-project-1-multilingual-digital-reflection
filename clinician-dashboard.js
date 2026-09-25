
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
    return t('date_not_recorded');
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(
    currentLang() === 'tr' ? 'tr-TR' : 'en-AU',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );
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
      t('unable_load_clinician')
    );
  }

  return data.data;
}

function loadClinicianAccount() {
  const name =
    getClinicianStorageValue(
      'clinicianName'
    ) || t('clinician_fallback');

  const profession =
    getClinicianStorageValue(
      'clinicianProfession'
    ) || t('clinician_fallback');

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
          ${t('no_children_shared')}
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
                child.name || t('child_fallback')
              )}
            </strong>

            <small>
              ${t('shared_profile_label')}
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

// The child currently on screen, so the page can be redrawn in the other
// language without asking the server for everything again.
let activeGrant = null;

async function selectChild(grant) {
  const child = grant.children;

  activeGrant = grant;

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
    child.name || t('child_fallback');

  const title = document.getElementById(
    'dashboardTitle'
  );

  const details = document.getElementById(
    'selectedChildDetails'
  );

  // These two carry the child's own details now, so the page-wide
  // translation pass must stop overwriting them with the generic heading.
  title.removeAttribute('data-i18n');
  details.removeAttribute('data-i18n');

  title.textContent = t('child_storybond_title').replace(
    '{name}',
    child.name || t('child_fallback')
  );

  details.textContent =
    child.date_of_birth
      ? t('born_on').replace(
          '{date}',
          formatDate(child.date_of_birth)
        )
      : t('dob_not_recorded');

  renderPermissionPills(grant);

  document.getElementById(
    'journalEntriesContent'
  ).innerHTML =
    `<div class="content-loading">${t('loading_entries')}</div>`;

  document.getElementById(
    'weeklyProgressContent'
  ).innerHTML =
    `<div class="content-loading">${t('loading_weekly')}</div>`;

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
      `<span class="permission-pill">${t('pill_journal')}</span>`
    );
  }

  if (
    grant.can_view_weekly_progress
  ) {
    pills.push(
      `<span class="permission-pill">${t('pill_weekly')}</span>`
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
        ${t('journal_not_shared')}
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
          ${t('no_journal_entries_yet')}
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
                ? `<span class="milestone-tag">${t('milestone_tag')}</span>`
                : ''
            }

          </div>

          <h4 class="entry-title">
            ${escapeHtml(
              entry.title ||
              t('untitled_entry')
            )}
          </h4>

          <p class="entry-content">
            ${escapeHtml(
              entry.content || ''
            )}
          </p>

          <div class="translate-row"></div>

          <div class="entry-footer">

            <span>
              ${t('mood_prefix')}
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

    // Let the clinician read each entry in the other language. The cards are
    // rebuilt here each time, so the buttons are attached after rendering.
    container
      .querySelectorAll('.journal-entry-card')
      .forEach((card, index) => {

        const entry = entries[index];

        addTranslateButton(
          card.querySelector('.translate-row'),
          [
            {
              element: card.querySelector('.entry-title'),
              original: entry.title || t('untitled_entry')
            },
            {
              element: card.querySelector('.entry-content'),
              original: entry.content || ''
            }
          ]
        );
      });

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
        ${t('weekly_not_shared')}
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
          ${t('no_weekly_yet')}
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
      ${t('no_active_access')}
    </h3>

    <p>
      ${t('no_active_access_sub')}
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
// Redraw in the newly chosen language. The lists and cards below are built
// from data, so the page-wide translation pass cannot relabel them.
document.addEventListener('storybond:languagechange', async () => {
  if (!getClinicianAccessToken()) return;

  loadClinicianAccount();

  await loadSharedChildren();

  if (activeGrant) {
    await selectChild(activeGrant);
  }
});
