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
    switch_account: 'Switch account',
    log_out: 'Log out',

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
    edit_journal_heading: 'Edit journal entry',
    edit_journal_subheading: 'Update the details below',
    update_entry_btn: 'Update Entry',

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

    // login.html
    login_subtitle: "Log in to start your adventure 🚀",
    login_email_label: 'Your Email or Username',
    password_label: 'Password',
    show_password: 'Show password',
    hide_password: 'Hide password',
    remember_me: 'Remember me',
    forgot_password_link: 'Forgot password?',
    login_btn: "🚀 Let's Go!",
    login_footer_text: 'New here?',
    login_footer_link: 'Create an account!',

    // signup.html
    signup_subtitle: 'Create your parent account 🎨',
    signup_email_label: 'Email Address',
    signup_username_label: 'Username',
    signup_confirm_label: 'Retype Password',
    signup_terms_prefix: 'I agree to the',
    signup_terms_link: 'Terms & Conditions',
    signup_btn: '🎉 Create Account',
    signup_footer_text: 'Already have an account?',
    signup_footer_link: 'Back to Login',
    terms_modal_title: '📜 Terms & Conditions',
    terms_intro: 'Welcome to StoryBond! By creating an account, you agree to:',
    terms_item1: "Use StoryBond only to record and share your own family's memories.",
    terms_item2: 'Keep your login details private and secure.',
    terms_item3: 'Respect the privacy of any children whose entries you create.',
    terms_item4: 'Not upload content that is unlawful, harmful, or belongs to someone else.',
    terms_outro: 'We store your journal entries and media so you can access them later. You can request deletion of your account and data at any time.',
    terms_modal_accept: 'Got it 🎉',

    // forgot_password.html / reset_password.html (shared)
    email_address_label: 'Email address',
    remembered_password: 'Remembered your password?',
    back_to_login: 'Back to login',
    forgot_title: 'Forgot your password?',
    forgot_subtitle: "Enter your email address and we'll send you a link to create a new password 🔐",
    forgot_btn: '✉️ Send Reset Link',
    reset_title: 'Reset your password',
    reset_subtitle: 'Choose a new password for your StoryBond account 🔐',
    new_password_label: 'New password',
    confirm_new_password_label: 'Confirm new password',
    reset_btn: '🔐 Update Password',

    // add-child.html
    add_child_heading: 'Add child',
    back_link: 'Back',
    add_child_card_title: 'New child',
    add_child_card_subtitle: 'Add your first child to get started',
    child_name_label: "Child's name",
    child_name_placeholder: 'e.g. Emma',
    birthday_label: 'Birthday',
    color_label: 'Color',
    add_child_empty_state: 'Add a child to start capturing memories',

    // Messages the page scripts show (alerts, empty states, loading text)
    loading: 'Loading...',
    loading_children: 'Loading children...',
    loading_access_records: 'Loading access records...',
    loading_clinician_access: 'Loading clinician access...',
    loading_entries: 'Loading journal entries...',
    select_child_week: 'Select a child to view their week',
    open_checkin: '🌱 Open Progress Check-In',
    close_checkin: '✕ Close Progress Check-In',
    alert_login_first: '⚠️ Please log in first',
    alert_select_child: '⚠️ Please select a child first!',
    alert_entry_title: '⚠️ Please enter an entry title',
    alert_entry_date: '⚠️ Please select a date',
    alert_entry_content: '⚠️ Please write about what happened',
    alert_entry_saved: '✅ Journal entry saved successfully!',
    alert_entry_updated: '✅ Journal entry updated successfully!',
    alert_entry_load_failed: '❌ Could not load this entry for editing.',

    // clinician-login.html
    clinician_portal_eyebrow: 'READ-ONLY PORTAL',
    clinician_signin_title: 'Clinician sign in',
    clinician_signin_sub:
      'Sign in to view child information that a parent has explicitly shared with you.',
    email_label: 'Email',
    remember_device: 'Remember me on this device',
    signin_btn: 'Sign in',
    clinician_security_note:
      '🔒 Access is controlled by the parent and may be revoked at any time.',
    parent_login_link: '← Parent login',
    clinician_access_tagline: 'Clinician Access',

    // clinician-dashboard.html
    clinician_portal: 'Clinician Portal',
    shared_children: 'SHARED CHILDREN',
    readonly_access: 'READ-ONLY ACCESS',
    clinician_dashboard_title: 'Clinician Dashboard',
    clinician_dashboard_sub:
      'Select a child shared with you to review their StoryBond information.',
    read_only_badge: '🔒 Read only',
    no_child_selected: 'No child selected',
    no_child_selected_sub:
      'Choose a child from the left to view journal entries and weekly progress.',
    shared_profile: 'SHARED PROFILE',
    shared_by_parent: 'StoryBond information shared by parent',
    journal_entries_title: 'Journal Entries',
    journal_entries_sub: 'Parent-recorded memories and milestones',
    weekly_progress_title: 'Weekly Progress',
    weekly_progress_sub: 'Parent weekly check-ins',
    select_child_entries: 'Select a child to load entries.',
    select_child_progress: 'Select a child to load progress.',

    // clinician-access.html
    manage_clinician_access: 'Manage Clinician Access',
    back_to_home: '← Back to Home',
    parent_controls: 'PARENT CONTROLS',
    share_child_title: "Share a child's StoryBond",
    share_child_sub:
      'You choose which child a clinician can view and exactly what information they can access.',
    parent_controlled: '🔒 Parent controlled',
    grant_update_access: 'Grant or update access',
    grant_update_sub: 'Select one child and enter the clinician email.',
    child_label: 'Child',
    clinician_email_label: 'Clinician email',
    what_can_view: 'What can they view?',
    perm_journal: 'Journal entries',
    perm_journal_sub: 'Memories, milestones and notes',
    perm_weekly: 'Weekly progress',
    perm_weekly_sub: 'Weekly check-ins and parent notes',
    grant_access_btn: 'Grant access',
    current_access: 'Current clinician access',
    current_access_sub: 'Review active and previously revoked access.',
    refresh_btn: '↻ Refresh',

    // Text the clinician dashboard script draws
    loading_weekly: 'Loading weekly progress...',
    no_children_shared: 'No children are currently shared with you.',
    journal_not_shared: '🔒 Journal access has not been shared by the parent.',
    weekly_not_shared:
      '🔒 Weekly progress access has not been shared by the parent.',
    no_journal_entries_yet: 'No journal entries have been recorded yet.',
    no_weekly_yet: 'No weekly progress checks have been recorded yet.',
    no_active_access: 'No active child access',
    no_active_access_sub:
      'A parent has not currently shared a child profile with this clinician account.',
    unable_load_clinician: 'Unable to load clinician data.',
    child_fallback: 'Child',
    clinician_fallback: 'Clinician',
    child_storybond_title: "{name}'s StoryBond",
    born_on: 'Born {date}',
    dob_not_recorded: 'Date of birth not recorded',
    date_not_recorded: 'Date not recorded',
    shared_profile_label: 'Shared profile',
    pill_journal: '📖 Journal',
    pill_weekly: '📊 Weekly Progress',
    signing_in: 'Signing in...',
    signin_success: '✓ Sign in successful.',
    unable_signin: 'Unable to sign in.',
    session_not_created: 'The clinician session could not be created.',
    error_prefix: '❌ Error: {message}',
    revoke_failed: 'Unable to revoke access: {message}',
    child_added: '✅ {name} has been added successfully!',
    opening_profile: 'Opening profile settings...',

    // Live translation of what parents write
    translate_to_tr: '🌐 Türkçeye çevir',
    translate_to_en: '🌐 Translate to English',
    show_original: '↩ Show original',
    translating: 'Translating...',
    translated_by: 'Machine translation',
    translate_failed: 'Could not translate this text.',
    untitled_entry: 'Untitled entry',
    milestone_tag: '⭐ Milestone',
    mood_prefix: 'Mood:',
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
    switch_account: 'Hesap değiştir',
    log_out: 'Çıkış yap',

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
    edit_journal_heading: 'Günlük kaydını düzenle',
    edit_journal_subheading: 'Aşağıdaki bilgileri güncelleyin',
    update_entry_btn: 'Kaydı Güncelle',

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

    // login.html
    login_subtitle: 'Maceranıza başlamak için giriş yapın 🚀',
    login_email_label: 'E-posta veya Kullanıcı Adınız',
    password_label: 'Şifre',
    show_password: 'Şifreyi göster',
    hide_password: 'Şifreyi gizle',
    remember_me: 'Beni hatırla',
    forgot_password_link: 'Şifremi unuttum?',
    login_btn: '🚀 Hadi Başlayalım!',
    login_footer_text: 'Yeni misiniz?',
    login_footer_link: 'Hesap oluşturun!',

    // signup.html
    signup_subtitle: 'Ebeveyn hesabınızı oluşturun 🎨',
    signup_email_label: 'E-posta Adresi',
    signup_username_label: 'Kullanıcı Adı',
    signup_confirm_label: 'Şifreyi Tekrar Girin',
    signup_terms_prefix: 'Kabul ediyorum:',
    signup_terms_link: 'Kullanım Şartları',
    signup_btn: '🎉 Hesap Oluştur',
    signup_footer_text: 'Zaten bir hesabınız var mı?',
    signup_footer_link: 'Girişe dön',
    terms_modal_title: '📜 Kullanım Şartları',
    terms_intro: 'StoryBond’a hoş geldiniz! Hesap oluşturarak şunları kabul edersiniz:',
    terms_item1: "StoryBond’u yalnızca kendi ailenizin anılarını kaydetmek ve paylaşmak için kullanmak.",
    terms_item2: 'Giriş bilgilerinizi gizli ve güvenli tutmak.',
    terms_item3: 'Kayıt oluşturduğunuz çocukların gizliliğine saygı göstermek.',
    terms_item4: 'Yasa dışı, zararlı veya başkasına ait içerik yüklememek.',
    terms_outro: 'Günlük kayıtlarınızı ve medyanızı daha sonra erişebilmeniz için saklıyoruz. Hesabınızın ve verilerinizin silinmesini istediğiniz zaman talep edebilirsiniz.',
    terms_modal_accept: 'Anladım 🎉',

    // forgot_password.html / reset_password.html (shared)
    email_address_label: 'E-posta adresi',
    remembered_password: 'Şifrenizi hatırladınız mı?',
    back_to_login: 'Girişe dön',
    forgot_title: 'Şifrenizi mi unuttunuz?',
    forgot_subtitle: 'E-posta adresinizi girin, size yeni bir şifre oluşturmanız için bir bağlantı gönderelim 🔐',
    forgot_btn: '✉️ Sıfırlama Bağlantısı Gönder',
    reset_title: 'Şifrenizi sıfırlayın',
    reset_subtitle: 'StoryBond hesabınız için yeni bir şifre seçin 🔐',
    new_password_label: 'Yeni şifre',
    confirm_new_password_label: 'Yeni şifreyi onayla',
    reset_btn: '🔐 Şifreyi Güncelle',

    // add-child.html
    add_child_heading: 'Çocuk ekle',
    back_link: 'Geri',
    add_child_card_title: 'Yeni çocuk',
    add_child_card_subtitle: 'Başlamak için ilk çocuğunuzu ekleyin',
    child_name_label: 'Çocuğun adı',
    child_name_placeholder: 'örn. Elif',
    birthday_label: 'Doğum günü',
    color_label: 'Renk',
    add_child_empty_state: 'Anıları kaydetmeye başlamak için bir çocuk ekleyin',

    // Sayfa betiklerinin gösterdiği mesajlar
    loading: 'Yükleniyor...',
    loading_children: 'Çocuklar yükleniyor...',
    loading_access_records: 'Erişim kayıtları yükleniyor...',
    loading_clinician_access: 'Klinisyen erişimi yükleniyor...',
    loading_entries: 'Günlük kayıtları yükleniyor...',
    select_child_week: 'Haftasını görmek için bir çocuk seçin',
    open_checkin: '🌱 İlerleme Değerlendirmesini Aç',
    close_checkin: '✕ İlerleme Değerlendirmesini Kapat',
    alert_login_first: '⚠️ Lütfen önce giriş yapın',
    alert_select_child: '⚠️ Lütfen önce bir çocuk seçin!',
    alert_entry_title: '⚠️ Lütfen bir başlık girin',
    alert_entry_date: '⚠️ Lütfen bir tarih seçin',
    alert_entry_content: '⚠️ Lütfen neler olduğunu yazın',
    alert_entry_saved: '✅ Günlük kaydı başarıyla kaydedildi!',
    alert_entry_updated: '✅ Günlük kaydı başarıyla güncellendi!',
    alert_entry_load_failed: '❌ Bu kayıt düzenlemek için yüklenemedi.',

    // clinician-login.html
    clinician_portal_eyebrow: 'SALT OKUNUR PORTAL',
    clinician_signin_title: 'Klinisyen girişi',
    clinician_signin_sub:
      'Bir ebeveynin sizinle açıkça paylaştığı çocuk bilgilerini görmek için giriş yapın.',
    email_label: 'E-posta',
    remember_device: 'Bu cihazda beni hatırla',
    signin_btn: 'Giriş yap',
    clinician_security_note:
      '🔒 Erişim ebeveyn tarafından kontrol edilir ve istenildiği zaman kaldırılabilir.',
    parent_login_link: '← Ebeveyn girişi',
    clinician_access_tagline: 'Klinisyen Erişimi',

    // clinician-dashboard.html
    clinician_portal: 'Klinisyen Portalı',
    shared_children: 'PAYLAŞILAN ÇOCUKLAR',
    readonly_access: 'SALT OKUNUR ERİŞİM',
    clinician_dashboard_title: 'Klinisyen Paneli',
    clinician_dashboard_sub:
      'StoryBond bilgilerini incelemek için sizinle paylaşılan bir çocuk seçin.',
    read_only_badge: '🔒 Salt okunur',
    no_child_selected: 'Çocuk seçilmedi',
    no_child_selected_sub:
      'Günlük kayıtlarını ve haftalık ilerlemeyi görmek için soldan bir çocuk seçin.',
    shared_profile: 'PAYLAŞILAN PROFİL',
    shared_by_parent: 'Ebeveyn tarafından paylaşılan StoryBond bilgileri',
    journal_entries_title: 'Günlük Kayıtları',
    journal_entries_sub: 'Ebeveynin kaydettiği anılar ve dönüm noktaları',
    weekly_progress_title: 'Haftalık İlerleme',
    weekly_progress_sub: 'Ebeveynin haftalık değerlendirmeleri',
    select_child_entries: 'Kayıtları yüklemek için bir çocuk seçin.',
    select_child_progress: 'İlerlemeyi yüklemek için bir çocuk seçin.',

    // clinician-access.html
    manage_clinician_access: 'Klinisyen Erişimini Yönet',
    back_to_home: '← Ana Sayfaya Dön',
    parent_controls: 'EBEVEYN KONTROLLERİ',
    share_child_title: "Bir çocuğun StoryBond'unu paylaşın",
    share_child_sub:
      'Bir klinisyenin hangi çocuğu görebileceğine ve tam olarak hangi bilgilere erişebileceğine siz karar verirsiniz.',
    parent_controlled: '🔒 Ebeveyn kontrolünde',
    grant_update_access: 'Erişim ver veya güncelle',
    grant_update_sub: 'Bir çocuk seçin ve klinisyenin e-postasını girin.',
    child_label: 'Çocuk',
    clinician_email_label: 'Klinisyen e-postası',
    what_can_view: 'Neleri görebilirler?',
    perm_journal: 'Günlük kayıtları',
    perm_journal_sub: 'Anılar, dönüm noktaları ve notlar',
    perm_weekly: 'Haftalık ilerleme',
    perm_weekly_sub: 'Haftalık değerlendirmeler ve ebeveyn notları',
    grant_access_btn: 'Erişim ver',
    current_access: 'Mevcut klinisyen erişimi',
    current_access_sub: 'Etkin ve daha önce kaldırılmış erişimleri inceleyin.',
    refresh_btn: '↻ Yenile',

    // Klinisyen panelinin oluşturduğu metinler
    loading_weekly: 'Haftalık ilerleme yükleniyor...',
    no_children_shared: 'Şu anda sizinle paylaşılan bir çocuk yok.',
    journal_not_shared: '🔒 Günlük erişimi ebeveyn tarafından paylaşılmadı.',
    weekly_not_shared:
      '🔒 Haftalık ilerleme erişimi ebeveyn tarafından paylaşılmadı.',
    no_journal_entries_yet: 'Henüz günlük kaydı girilmemiş.',
    no_weekly_yet: 'Henüz haftalık ilerleme değerlendirmesi girilmemiş.',
    no_active_access: 'Etkin çocuk erişimi yok',
    no_active_access_sub:
      'Bir ebeveyn şu anda bu klinisyen hesabıyla çocuk profili paylaşmıyor.',
    unable_load_clinician: 'Klinisyen verileri yüklenemedi.',
    child_fallback: 'Çocuk',
    clinician_fallback: 'Klinisyen',
    child_storybond_title: "{name} adlı çocuğun StoryBond'u",
    born_on: 'Doğum: {date}',
    dob_not_recorded: 'Doğum tarihi kaydedilmemiş',
    date_not_recorded: 'Tarih kaydedilmemiş',
    shared_profile_label: 'Paylaşılan profil',
    pill_journal: '📖 Günlük',
    pill_weekly: '📊 Haftalık İlerleme',
    signing_in: 'Giriş yapılıyor...',
    signin_success: '✓ Giriş başarılı.',
    unable_signin: 'Giriş yapılamadı.',
    session_not_created: 'Klinisyen oturumu oluşturulamadı.',
    error_prefix: '❌ Hata: {message}',
    revoke_failed: 'Erişim kaldırılamadı: {message}',
    child_added: '✅ {name} başarıyla eklendi!',
    opening_profile: 'Profil ayarları açılıyor...',

    // Ebeveynlerin yazdıklarının anlık çevirisi
    translate_to_tr: '🌐 Türkçeye çevir',
    translate_to_en: '🌐 İngilizceye çevir',
    show_original: '↩ Özgün metni göster',
    translating: 'Çevriliyor...',
    translated_by: 'Makine çevirisi',
    translate_failed: 'Bu metin çevrilemedi.',
    untitled_entry: 'Başlıksız kayıt',
    milestone_tag: '⭐ Dönüm noktası',
    mood_prefix: 'Ruh hali:',
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

  // Icon-only buttons (the password eye) carry their wording in aria-label.
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (dict[key] !== undefined) {
      el.setAttribute('aria-label', dict[key]);
      el.setAttribute('title', dict[key]);
    }
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === lang);
  });

  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('storybondLang', lang);

  // Lists and cards drawn by the page scripts cannot be re-labelled by the
  // loops above, so they listen for this and redraw themselves.
  document.dispatchEvent(
    new CustomEvent('storybond:languagechange', { detail: { lang } })
  );
}

// The language the page is showing right now.
function currentLang() {
  return localStorage.getItem('storybondLang') || 'en';
}

// Look up one phrase from the page scripts, e.g. alert(t('select_child_first')).
// Falls back to English, then to the key itself, so a missing translation
// never blanks out the message.
function t(key, fallback) {
  const dict = TRANSLATIONS[currentLang()] || TRANSLATIONS.en;

  if (dict[key] !== undefined) return dict[key];
  if (TRANSLATIONS.en[key] !== undefined) return TRANSLATIONS.en[key];

  return fallback !== undefined ? fallback : key;
}

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang());

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.textContent.trim().toLowerCase();
      applyLanguage(lang);
    });
  });
});
