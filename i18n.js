// StoryBond i18n — English / Turkish static text translations
const TRANSLATIONS = {
  en: {
    nav_navigation: 'NAVIGATION',
    nav_home: 'Home',
    nav_journal: 'Journal',
    nav_weekly: 'Weekly recap',
    nav_children: 'CHILDREN',
    add_child: 'Add child',
    no_children: 'No children yet',
    user_name: 'Parent Account',
    user_role: 'Parent',

    // index.html
    hero_title: 'What happened today?',
    new_entry_btn: 'New entry',
    recent_entries: 'RECENT ENTRIES',
    no_entries_title: 'No entries yet',
    no_entries_sub: "Start tracking your child's activities",
    weekly_progress: "THIS WEEK'S PROGRESS",
    weekly_recap_title: 'Weekly recap ⭐',
    weekly_recap_sub: "See your child's progress this week",
    stat_entries: 'entries',
    stat_uploads: 'uploads',
    stat_languages: 'languages',
    view_recap: 'View recap',

    // new-entry.html
    journal_heading: 'New journal entry',
    journal_subheading: "Capture today's moments",
    who_about: 'WHO IS THIS ENTRY ABOUT?',
    add_child_option: '+ Add Child',
    what_happened: 'WHAT HAPPENED?',
    story_placeholder: 'Write your story here...',
    entry_title_placeholder: "Entry title (e.g. Lena's big day)",
    entry_date_placeholder: 'Date: mm/dd/yyyy',
    mood_label: 'MOOD',
    mood_happy: '😊 Happy',
    mood_excited: '🤩 Excited',
    mood_loved: '🥰 Loved',
    mood_tired: '😴 Tired',
    mood_sad: '😢 Sad',
    tags_label: 'TAGS',
    tag_milestone: '# Milestone',
    tag_funny: '# Funny',
    tag_firsttime: '# First Time',
    tag_familytime: '# Family Time',
    add_tag: '+ Add tag',
    add_photos_label: 'ADD PHOTOS / VIDEOS',
    photo_label: 'Photo',
    video_label: 'Video',
    add_label: 'Add',
    cancel_btn: 'Cancel',
    save_entry: 'Save Entry',

    // weekly.html
    weekly_heading: 'This week in review',
    weekly_subheading: "A snapshot of your family's moments",
    journal_entries_stat: 'JOURNAL ENTRIES',
    milestones_stat: 'MILESTONES',
    photos_videos_stat: 'PHOTOS & VIDEOS ADDED',
    no_journal_entries: 'No journal entries yet',
    create_first_entry: 'Create your first entry',
    milestones_reached: 'MILESTONES REACHED',
    no_milestones: 'No milestones recorded yet',
    moods_this_week: 'MOODS THIS WEEK',
    no_moods: 'No moods tracked yet',
    memory_highlight: 'MEMORY HIGHLIGHT',
    no_photos_videos: 'No photos or videos yet',
  },

  tr: {
    nav_navigation: 'GEZİNME',
    nav_home: 'Ana Sayfa',
    nav_journal: 'Günlük',
    nav_weekly: 'Haftalık Özet',
    nav_children: 'ÇOCUKLAR',
    add_child: 'Çocuk Ekle',
    no_children: 'Henüz çocuk yok',
    user_name: 'Ebeveyn Hesabı',
    user_role: 'Ebeveyn',

    // index.html
    hero_title: 'Bugün neler oldu?',
    new_entry_btn: 'Yeni Kayıt',
    recent_entries: 'SON KAYITLAR',
    no_entries_title: 'Henüz kayıt yok',
    no_entries_sub: 'Çocuğunuzun etkinliklerini takip etmeye başlayın',
    weekly_progress: 'BU HAFTANIN İLERLEMESİ',
    weekly_recap_title: 'Haftalık özet ⭐',
    weekly_recap_sub: 'Çocuğunuzun bu haftaki ilerlemesini görün',
    stat_entries: 'kayıt',
    stat_uploads: 'yükleme',
    stat_languages: 'dil',
    view_recap: 'Özeti Görüntüle',

    // new-entry.html
    journal_heading: 'Yeni günlük kaydı',
    journal_subheading: 'Bugünün anlarını kaydedin',
    who_about: 'BU KAYIT KİM HAKKINDA?',
    add_child_option: '+ Çocuk Ekle',
    what_happened: 'NE OLDU?',
    story_placeholder: 'Hikayenizi buraya yazın...',
    entry_title_placeholder: "Başlık (örn. Leyla'nın büyük günü)",
    entry_date_placeholder: 'Tarih: gg/aa/yyyy',
    mood_label: 'RUH HALİ',
    mood_happy: '😊 Mutlu',
    mood_excited: '🤩 Heyecanlı',
    mood_loved: '🥰 Sevgi Dolu',
    mood_tired: '😴 Yorgun',
    mood_sad: '😢 Üzgün',
    tags_label: 'ETİKETLER',
    tag_milestone: '# Dönüm Noktası',
    tag_funny: '# Komik',
    tag_firsttime: '# İlk Kez',
    tag_familytime: '# Aile Zamanı',
    add_tag: '+ Etiket Ekle',
    add_photos_label: 'FOTOĞRAF / VİDEO EKLE',
    photo_label: 'Fotoğraf',
    video_label: 'Video',
    add_label: 'Ekle',
    cancel_btn: 'İptal',
    save_entry: 'Kaydı Kaydet',

    // weekly.html
    weekly_heading: 'Bu haftaya bakış',
    weekly_subheading: 'Ailenizin anlarından bir kesit',
    journal_entries_stat: 'GÜNLÜK KAYITLARI',
    milestones_stat: 'DÖNÜM NOKTALARI',
    photos_videos_stat: 'EKLENEN FOTOĞRAF VE VİDEOLAR',
    no_journal_entries: 'Henüz günlük kaydı yok',
    create_first_entry: 'İlk kaydınızı oluşturun',
    milestones_reached: 'ULAŞILAN DÖNÜM NOKTALARI',
    no_milestones: 'Henüz dönüm noktası kaydedilmedi',
    moods_this_week: 'BU HAFTANIN RUH HALLERİ',
    no_moods: 'Henüz ruh hali takip edilmedi',
    memory_highlight: 'ANI VURGUSU',
    no_photos_videos: 'Henüz fotoğraf veya video yok',
  },
};

function applyLanguage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === lang);
  });

  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('storybondLang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('storybondLang') || 'en';
  applyLanguage(savedLang);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.textContent.trim().toLowerCase();
      applyLanguage(lang);
    });
  });
});
