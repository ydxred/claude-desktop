'use strict';

// UI string catalog for the app chrome (menus, buttons, status bar, dialogs).
// NOTE: this only translates the app shell — the terminal content is rendered
// by the real `claude` CLI and is not affected by this setting.

const STRINGS = {
  en: {
    session: 'Session', newTab: 'New Tab', newTabFolder: 'New Tab in Folder…',
    restartSession: 'Restart Session', nextTab: 'Next Tab', prevTab: 'Previous Tab',
    closeTab: 'Close Tab', quit: 'Quit',
    edit: 'Edit', copy: 'Copy', paste: 'Paste', selectAll: 'Select All',
    find: 'Find…', clear: 'Clear Terminal',
    view: 'View', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', resetZoom: 'Reset Zoom',
    theme: 'Theme', alwaysOnTop: 'Always on Top',
    fullscreen: 'Toggle Fullscreen', devtools: 'Toggle DevTools',
    help: 'Help', docs: 'Documentation', about: 'About',
    language: 'Language',
    folderButton: 'Folder…', folderTooltip: 'Open a folder and start Claude there',
    newTabTooltip: 'New tab', pickFolderTitle: 'Choose a working directory for Claude',
    findPlaceholder: 'Find in terminal…',
    claudeNotFound: '⚠ claude binary not found',
    exited: 'claude exited with code {code}. Close this tab or press any key to restart.',
  },
  'zh-CN': {
    session: '会话', newTab: '新建标签页', newTabFolder: '在文件夹中新建标签页…',
    restartSession: '重启会话', nextTab: '下一个标签页', prevTab: '上一个标签页',
    closeTab: '关闭标签页', quit: '退出',
    edit: '编辑', copy: '复制', paste: '粘贴', selectAll: '全选',
    find: '查找…', clear: '清空终端',
    view: '视图', zoomIn: '放大', zoomOut: '缩小', resetZoom: '重置缩放',
    theme: '主题', alwaysOnTop: '置顶',
    fullscreen: '切换全屏', devtools: '切换开发者工具',
    help: '帮助', docs: '文档', about: '关于',
    language: '语言',
    folderButton: '文件夹…', folderTooltip: '打开文件夹并在其中启动 Claude',
    newTabTooltip: '新建标签页', pickFolderTitle: '选择 Claude 的工作目录',
    findPlaceholder: '在终端中查找…',
    claudeNotFound: '⚠ 未找到 claude 可执行文件',
    exited: 'claude 已退出（代码 {code}）。关闭此标签页，或按任意键重启。',
  },
  'zh-TW': {
    session: '工作階段', newTab: '新增分頁', newTabFolder: '在資料夾中新增分頁…',
    restartSession: '重新啟動工作階段', nextTab: '下一個分頁', prevTab: '上一個分頁',
    closeTab: '關閉分頁', quit: '結束',
    edit: '編輯', copy: '複製', paste: '貼上', selectAll: '全選',
    find: '尋找…', clear: '清除終端機',
    view: '檢視', zoomIn: '放大', zoomOut: '縮小', resetZoom: '重設縮放',
    theme: '佈景主題', alwaysOnTop: '置頂',
    fullscreen: '切換全螢幕', devtools: '切換開發者工具',
    help: '說明', docs: '文件', about: '關於',
    language: '語言',
    folderButton: '資料夾…', folderTooltip: '開啟資料夾並在其中啟動 Claude',
    newTabTooltip: '新增分頁', pickFolderTitle: '選擇 Claude 的工作目錄',
    findPlaceholder: '在終端機中尋找…',
    claudeNotFound: '⚠ 找不到 claude 執行檔',
    exited: 'claude 已結束（代碼 {code}）。關閉此分頁，或按任意鍵重新啟動。',
  },
  ja: {
    session: 'セッション', newTab: '新しいタブ', newTabFolder: 'フォルダで新しいタブ…',
    restartSession: 'セッションを再起動', nextTab: '次のタブ', prevTab: '前のタブ',
    closeTab: 'タブを閉じる', quit: '終了',
    edit: '編集', copy: 'コピー', paste: '貼り付け', selectAll: 'すべて選択',
    find: '検索…', clear: '端末をクリア',
    view: '表示', zoomIn: '拡大', zoomOut: '縮小', resetZoom: 'ズームをリセット',
    theme: 'テーマ', alwaysOnTop: '常に最前面',
    fullscreen: '全画面表示の切り替え', devtools: '開発者ツールの切り替え',
    help: 'ヘルプ', docs: 'ドキュメント', about: 'バージョン情報',
    language: '言語',
    folderButton: 'フォルダ…', folderTooltip: 'フォルダを開いてそこで Claude を起動',
    newTabTooltip: '新しいタブ', pickFolderTitle: 'Claude の作業ディレクトリを選択',
    findPlaceholder: '端末内を検索…',
    claudeNotFound: '⚠ claude バイナリが見つかりません',
    exited: 'claude が終了しました（コード {code}）。タブを閉じるか、任意のキーで再起動します。',
  },
  ko: {
    session: '세션', newTab: '새 탭', newTabFolder: '폴더에서 새 탭…',
    restartSession: '세션 재시작', nextTab: '다음 탭', prevTab: '이전 탭',
    closeTab: '탭 닫기', quit: '종료',
    edit: '편집', copy: '복사', paste: '붙여넣기', selectAll: '모두 선택',
    find: '찾기…', clear: '터미널 지우기',
    view: '보기', zoomIn: '확대', zoomOut: '축소', resetZoom: '확대/축소 초기화',
    theme: '테마', alwaysOnTop: '항상 위에',
    fullscreen: '전체 화면 전환', devtools: '개발자 도구 전환',
    help: '도움말', docs: '문서', about: '정보',
    language: '언어',
    folderButton: '폴더…', folderTooltip: '폴더를 열고 그 위치에서 Claude 시작',
    newTabTooltip: '새 탭', pickFolderTitle: 'Claude 작업 디렉터리 선택',
    findPlaceholder: '터미널에서 찾기…',
    claudeNotFound: '⚠ claude 실행 파일을 찾을 수 없음',
    exited: 'claude가 코드 {code}(으)로 종료되었습니다. 탭을 닫거나 아무 키나 누르면 다시 시작합니다.',
  },
  es: {
    session: 'Sesión', newTab: 'Nueva pestaña', newTabFolder: 'Nueva pestaña en carpeta…',
    restartSession: 'Reiniciar sesión', nextTab: 'Pestaña siguiente', prevTab: 'Pestaña anterior',
    closeTab: 'Cerrar pestaña', quit: 'Salir',
    edit: 'Editar', copy: 'Copiar', paste: 'Pegar', selectAll: 'Seleccionar todo',
    find: 'Buscar…', clear: 'Limpiar terminal',
    view: 'Ver', zoomIn: 'Acercar', zoomOut: 'Alejar', resetZoom: 'Restablecer zoom',
    theme: 'Tema', alwaysOnTop: 'Siempre visible',
    fullscreen: 'Pantalla completa', devtools: 'Herramientas de desarrollo',
    help: 'Ayuda', docs: 'Documentación', about: 'Acerca de',
    language: 'Idioma',
    folderButton: 'Carpeta…', folderTooltip: 'Abrir una carpeta e iniciar Claude allí',
    newTabTooltip: 'Nueva pestaña', pickFolderTitle: 'Elige un directorio de trabajo para Claude',
    findPlaceholder: 'Buscar en la terminal…',
    claudeNotFound: '⚠ No se encontró el binario de claude',
    exited: 'claude terminó con el código {code}. Cierra esta pestaña o pulsa cualquier tecla para reiniciar.',
  },
  fr: {
    session: 'Session', newTab: 'Nouvel onglet', newTabFolder: 'Nouvel onglet dans un dossier…',
    restartSession: 'Redémarrer la session', nextTab: 'Onglet suivant', prevTab: 'Onglet précédent',
    closeTab: "Fermer l'onglet", quit: 'Quitter',
    edit: 'Édition', copy: 'Copier', paste: 'Coller', selectAll: 'Tout sélectionner',
    find: 'Rechercher…', clear: 'Effacer le terminal',
    view: 'Affichage', zoomIn: 'Zoom avant', zoomOut: 'Zoom arrière', resetZoom: 'Réinitialiser le zoom',
    theme: 'Thème', alwaysOnTop: 'Toujours au premier plan',
    fullscreen: 'Plein écran', devtools: 'Outils de développement',
    help: 'Aide', docs: 'Documentation', about: 'À propos',
    language: 'Langue',
    folderButton: 'Dossier…', folderTooltip: 'Ouvrir un dossier et y démarrer Claude',
    newTabTooltip: 'Nouvel onglet', pickFolderTitle: 'Choisir un répertoire de travail pour Claude',
    findPlaceholder: 'Rechercher dans le terminal…',
    claudeNotFound: '⚠ Binaire claude introuvable',
    exited: "claude s'est arrêté avec le code {code}. Fermez cet onglet ou appuyez sur une touche pour redémarrer.",
  },
  de: {
    session: 'Sitzung', newTab: 'Neuer Tab', newTabFolder: 'Neuer Tab in Ordner…',
    restartSession: 'Sitzung neu starten', nextTab: 'Nächster Tab', prevTab: 'Vorheriger Tab',
    closeTab: 'Tab schließen', quit: 'Beenden',
    edit: 'Bearbeiten', copy: 'Kopieren', paste: 'Einfügen', selectAll: 'Alles auswählen',
    find: 'Suchen…', clear: 'Terminal leeren',
    view: 'Ansicht', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', resetZoom: 'Zoom zurücksetzen',
    theme: 'Design', alwaysOnTop: 'Immer im Vordergrund',
    fullscreen: 'Vollbild umschalten', devtools: 'Entwicklertools umschalten',
    help: 'Hilfe', docs: 'Dokumentation', about: 'Über',
    language: 'Sprache',
    folderButton: 'Ordner…', folderTooltip: 'Ordner öffnen und Claude darin starten',
    newTabTooltip: 'Neuer Tab', pickFolderTitle: 'Arbeitsverzeichnis für Claude auswählen',
    findPlaceholder: 'Im Terminal suchen…',
    claudeNotFound: '⚠ claude-Binärdatei nicht gefunden',
    exited: 'claude wurde mit Code {code} beendet. Schließen Sie diesen Tab oder drücken Sie eine Taste zum Neustart.',
  },
  pt: {
    session: 'Sessão', newTab: 'Nova aba', newTabFolder: 'Nova aba na pasta…',
    restartSession: 'Reiniciar sessão', nextTab: 'Próxima aba', prevTab: 'Aba anterior',
    closeTab: 'Fechar aba', quit: 'Sair',
    edit: 'Editar', copy: 'Copiar', paste: 'Colar', selectAll: 'Selecionar tudo',
    find: 'Localizar…', clear: 'Limpar terminal',
    view: 'Visualizar', zoomIn: 'Ampliar', zoomOut: 'Reduzir', resetZoom: 'Redefinir zoom',
    theme: 'Tema', alwaysOnTop: 'Sempre visível',
    fullscreen: 'Alternar tela cheia', devtools: 'Alternar ferramentas de desenvolvedor',
    help: 'Ajuda', docs: 'Documentação', about: 'Sobre',
    language: 'Idioma',
    folderButton: 'Pasta…', folderTooltip: 'Abrir uma pasta e iniciar o Claude nela',
    newTabTooltip: 'Nova aba', pickFolderTitle: 'Escolha um diretório de trabalho para o Claude',
    findPlaceholder: 'Localizar no terminal…',
    claudeNotFound: '⚠ Binário do claude não encontrado',
    exited: 'O claude saiu com o código {code}. Feche esta aba ou pressione qualquer tecla para reiniciar.',
  },
  ru: {
    session: 'Сеанс', newTab: 'Новая вкладка', newTabFolder: 'Новая вкладка в папке…',
    restartSession: 'Перезапустить сеанс', nextTab: 'Следующая вкладка', prevTab: 'Предыдущая вкладка',
    closeTab: 'Закрыть вкладку', quit: 'Выход',
    edit: 'Правка', copy: 'Копировать', paste: 'Вставить', selectAll: 'Выделить всё',
    find: 'Найти…', clear: 'Очистить терминал',
    view: 'Вид', zoomIn: 'Увеличить', zoomOut: 'Уменьшить', resetZoom: 'Сбросить масштаб',
    theme: 'Тема', alwaysOnTop: 'Поверх всех окон',
    fullscreen: 'Полноэкранный режим', devtools: 'Инструменты разработчика',
    help: 'Справка', docs: 'Документация', about: 'О программе',
    language: 'Язык',
    folderButton: 'Папка…', folderTooltip: 'Открыть папку и запустить Claude в ней',
    newTabTooltip: 'Новая вкладка', pickFolderTitle: 'Выберите рабочий каталог для Claude',
    findPlaceholder: 'Поиск в терминале…',
    claudeNotFound: '⚠ Исполняемый файл claude не найден',
    exited: 'claude завершился с кодом {code}. Закройте вкладку или нажмите любую клавишу для перезапуска.',
  },
  ar: {
    session: 'الجلسة', newTab: 'علامة تبويب جديدة', newTabFolder: 'علامة تبويب جديدة في مجلد…',
    restartSession: 'إعادة تشغيل الجلسة', nextTab: 'علامة التبويب التالية', prevTab: 'علامة التبويب السابقة',
    closeTab: 'إغلاق علامة التبويب', quit: 'خروج',
    edit: 'تحرير', copy: 'نسخ', paste: 'لصق', selectAll: 'تحديد الكل',
    find: 'بحث…', clear: 'مسح الطرفية',
    view: 'عرض', zoomIn: 'تكبير', zoomOut: 'تصغير', resetZoom: 'إعادة تعيين التكبير',
    theme: 'السمة', alwaysOnTop: 'دائمًا في المقدمة',
    fullscreen: 'تبديل ملء الشاشة', devtools: 'تبديل أدوات المطور',
    help: 'مساعدة', docs: 'الوثائق', about: 'حول',
    language: 'اللغة',
    folderButton: 'مجلد…', folderTooltip: 'افتح مجلدًا وابدأ Claude فيه',
    newTabTooltip: 'علامة تبويب جديدة', pickFolderTitle: 'اختر دليل عمل لـ Claude',
    findPlaceholder: 'ابحث في الطرفية…',
    claudeNotFound: '⚠ لم يتم العثور على ملف claude التنفيذي',
    exited: 'تم إنهاء claude بالرمز {code}. أغلق علامة التبويب هذه أو اضغط أي مفتاح لإعادة التشغيل.',
  },
  hi: {
    session: 'सत्र', newTab: 'नया टैब', newTabFolder: 'फ़ोल्डर में नया टैब…',
    restartSession: 'सत्र पुनः आरंभ करें', nextTab: 'अगला टैब', prevTab: 'पिछला टैब',
    closeTab: 'टैब बंद करें', quit: 'बाहर निकलें',
    edit: 'संपादित करें', copy: 'कॉपी करें', paste: 'पेस्ट करें', selectAll: 'सभी चुनें',
    find: 'खोजें…', clear: 'टर्मिनल साफ़ करें',
    view: 'देखें', zoomIn: 'ज़ूम इन', zoomOut: 'ज़ूम आउट', resetZoom: 'ज़ूम रीसेट करें',
    theme: 'थीम', alwaysOnTop: 'हमेशा शीर्ष पर',
    fullscreen: 'फ़ुलस्क्रीन टॉगल करें', devtools: 'डेवलपर टूल टॉगल करें',
    help: 'सहायता', docs: 'दस्तावेज़', about: 'परिचय',
    language: 'भाषा',
    folderButton: 'फ़ोल्डर…', folderTooltip: 'एक फ़ोल्डर खोलें और वहाँ Claude शुरू करें',
    newTabTooltip: 'नया टैब', pickFolderTitle: 'Claude के लिए कार्य निर्देशिका चुनें',
    findPlaceholder: 'टर्मिनल में खोजें…',
    claudeNotFound: '⚠ claude बाइनरी नहीं मिली',
    exited: 'claude कोड {code} के साथ बंद हो गया। यह टैब बंद करें या पुनः आरंभ करने के लिए कोई भी कुंजी दबाएँ।',
  },
};

// Endonyms (each language shown in its own name) and display order.
const NAMES = {
  en: 'English', 'zh-CN': '简体中文', 'zh-TW': '繁體中文', ja: '日本語', ko: '한국어',
  es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', ru: 'Русский',
  ar: 'العربية', hi: 'हिन्दी',
};
const ORDER = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'hi'];
const RTL = new Set(['ar']);

// Map any incoming locale (e.g. "en-US", "zh-Hant-TW", "pt-BR") to a supported one.
function resolve(locale) {
  if (!locale) return 'en';
  if (STRINGS[locale]) return locale;
  const lc = String(locale).toLowerCase();
  if (lc.startsWith('zh')) {
    if (lc.includes('tw') || lc.includes('hk') || lc.includes('mo') || lc.includes('hant')) return 'zh-TW';
    return 'zh-CN';
  }
  const prefix = lc.split(/[-_]/)[0];
  const match = ORDER.find((c) => c.toLowerCase().split('-')[0] === prefix);
  return match || 'en';
}

function strings(locale) {
  return STRINGS[resolve(locale)];
}
function dir(locale) {
  return RTL.has(resolve(locale)) ? 'rtl' : 'ltr';
}
function list() {
  return ORDER.map((code) => ({ code, name: NAMES[code], dir: dir(code) }));
}

module.exports = { resolve, strings, dir, list, NAMES, ORDER };
