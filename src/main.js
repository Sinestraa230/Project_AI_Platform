import './assets/style.css';

// --- CÁC THÀNH PHẦN GIAO DIỆN (CHẨN ĐOÁN) ---
const uploadZone = document.getElementById('upload-zone');
const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const previewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const loadingOverlay = document.getElementById('loading-overlay');
const progressText = document.getElementById('progress-text');
const resultCard = document.getElementById('result-card');
const btnReuploadContainer = document.getElementById('btn-reupload-container');
const btnReupload = document.getElementById('btn-reupload');
const pageSubtitle = document.getElementById('page-subtitle');

// --- XỬ LÝ UPLOAD ẢNH ---
uploadZone.addEventListener('click', () => imageInput.click());
uploadZone.addEventListener('dragover', (e) => e.preventDefault());
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

imageInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert("Vui lòng tải lên file ảnh hợp lệ.");
    return;
  }

  uploadZone.classList.add('pointer-events-none');

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    uploadPlaceholder.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    resultCard.classList.add('hidden');
    resultCard.classList.remove('opacity-100');
    btnReuploadContainer.classList.add('hidden');
    pageSubtitle.innerText = "ĐANG PHÂN TÍCH...";
    
    startMockAnalysis();
  };
  reader.readAsDataURL(file);
}

function startMockAnalysis() {
  loadingOverlay.classList.remove('hidden');
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) progress = 100;
    
    progressText.innerText = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        resultCard.classList.remove('hidden');
        resultCard.classList.add('flex');
        
        setTimeout(() => {
          resultCard.classList.add('opacity-100');
        }, 50);

        btnReuploadContainer.classList.remove('hidden');
        pageSubtitle.innerText = "ĐÃ CÓ KẾT QUẢ PHÂN TÍCH";
      }, 500);
    }
  }, 200);
}

btnReupload.addEventListener('click', (e) => {
  e.stopPropagation(); 
  imageInput.value = '';
  previewContainer.classList.add('hidden');
  uploadPlaceholder.classList.remove('hidden');
  resultCard.classList.add('hidden');
  resultCard.classList.remove('opacity-100');
  btnReuploadContainer.classList.add('hidden');
  pageSubtitle.innerText = "TẢI ẢNH LÊN ĐỂ PHÂN TÍCH";
  uploadZone.classList.remove('pointer-events-none');
});

// --- LOGIC CHUYỂN TAB (FIX LỖI KHI DỊCH TIẾNG ANH) ---
const navLinks = document.querySelectorAll('#sidebar-nav .nav-link');
const tabContents = document.querySelectorAll('.tab-content');

// Cố định ID của các Tab theo đúng thứ tự trên thanh Menu để không phụ thuộc vào text
const targetIds = ['view-tổng quan', 'view-chẩn đoán', 'view-lịch sử', 'view-thư viện bệnh', 'view-cài đặt'];

navLinks.forEach((link, index) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    navLinks.forEach(nav => {
      nav.className = "nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium";
    });
    
    link.className = "nav-link active flex items-center gap-3 px-4 py-3 rounded-lg bg-green-100 text-green-800 font-bold transition-colors";

    tabContents.forEach(content => content.classList.add('hidden'));

    // Gọi Tab dựa vào index mảng, bất chấp Menu đang là ngôn ngữ gì
    const targetView = document.getElementById(targetIds[index]);
    if (targetView) {
      targetView.classList.remove('hidden');
    }
  });
});

// --- BẢN NÂNG CẤP: CÀI ĐẶT HOẠT ĐỘNG THỰC TẾ ---
const langSelect = document.getElementById('lang-select');
const themeSelect = document.getElementById('theme-select');
const btnClearHistory = document.getElementById('btn-clear-history');

// 1. TÍNH NĂNG XÓA LỊCH SỬ
const historyContainer = document.querySelector('#view-lịch\\ sử .divide-y');
const defaultHistoryHTML = historyContainer ? historyContainer.innerHTML : '';

function loadHistory() {
  if (!historyContainer) return;
  const savedHistory = localStorage.getItem('plant_history');
  
  if (savedHistory === 'cleared') {
    historyContainer.innerHTML = `
      <div class="p-10 flex flex-col items-center justify-center text-gray-400">
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        <p class="font-medium text-lg">Chưa có dữ liệu lịch sử nào.</p>
      </div>
    `;
  } else {
    historyContainer.innerHTML = defaultHistoryHTML;
  }
}
loadHistory(); 

if (btnClearHistory) {
  btnClearHistory.addEventListener('click', () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chẩn đoán? (F5 lại trang vẫn sẽ mất)")) {
      localStorage.setItem('plant_history', 'cleared');
      loadHistory();
    }
  });
}
// 2. TÍNH NĂNG DARK MODE (Đã Fix lỗi màu sắc Cài đặt)
const darkModeStyle = document.createElement('style');
darkModeStyle.innerHTML = `
  /* Đổi nền chính (Ghi đè màu xanh lá) */
  body.dark-theme #main-content { background-color: #121212 !important; }
  
  /* Đổi nền các khối Card trắng thành xám đen */
  body.dark-theme aside, body.dark-theme header, body.dark-theme .bg-white { background-color: #1e1e1e !important; border-color: #333 !important; color: #e0e0e0 !important; }
  
  /* Chỉnh màu chữ cho dễ đọc */
  body.dark-theme .text-gray-900, body.dark-theme .text-gray-800 { color: #ffffff !important; }
  body.dark-theme .text-gray-700 { color: #dddddd !important; } 
  body.dark-theme .text-gray-600, body.dark-theme .text-gray-500 { color: #aaaaaa !important; }
  
  /* Fix ô Input và các nền xám nhạt (bg-gray-50) */
  body.dark-theme input, body.dark-theme select, body.dark-theme .bg-gray-50 { background-color: #2a2a2a !important; color: #ffffff !important; border-color: #444 !important; }
  
  /* Nền các khối đặc thù khác */
  body.dark-theme .bg-\\[\\#F8FAF8\\], body.dark-theme .bg-\\[\\#F4F9F4\\] { background-color: #242424 !important; }
  
  /* Chỉnh lại các màu xanh điểm nhấn cho hài hòa */
  body.dark-theme .bg-green-100, body.dark-theme .bg-green-50 { background-color: #1b4332 !important; color: #a3e635 !important; }
  body.dark-theme .text-green-800 { color: #a3e635 !important; }
  body.dark-theme .border-green-50 { border-color: #333 !important; }
  
  /* Đường viền chung */
  body.dark-theme .border-gray-100, body.dark-theme .border-gray-200, body.dark-theme .border-gray-300 { border-color: #444 !important; }
`;
document.head.appendChild(darkModeStyle);

function applyTheme(theme) {
  if (theme === 'dark') document.body.classList.add('dark-theme');
  else document.body.classList.remove('dark-theme');
  
  if(themeSelect) themeSelect.value = theme;
  localStorage.setItem('plant_theme', theme);
}

const savedTheme = localStorage.getItem('plant_theme') || 'light';
applyTheme(savedTheme);

if (themeSelect) {
  themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
}
// 3. TÍNH NĂNG ĐỔI NGÔN NGỮ (FIX LỖI CHỌN PHẦN TỬ)
const dict = {
  vi: {
    nav: ["Tổng quan", "Chẩn đoán", "Lịch sử", "Thư viện bệnh", "Cài đặt"],
    slogan: "Vì một nền nông nghiệp bền vững",
    titles: ["Chẩn đoán", "Lịch sử chẩn đoán", "Thư viện bệnh cây", "Cài đặt hệ thống"],
    diagSub: "TẢI ẢNH LÊN ĐỂ PHÂN TÍCH",
    dropText: "Kéo thả ảnh vào đây",
    setLang: "Ngôn ngữ", setLangDesc: "Chọn ngôn ngữ hiển thị trên nền tảng",
    setTheme: "Giao diện (Theme)", setThemeDesc: "Lựa chọn chế độ Sáng hoặc Tối",
    setThemeOps: ["Chế độ Sáng (Mặc định)", "Chế độ Tối (Dark mode)"],
    setData: "Quản lý dữ liệu", setDataDesc: "Xóa toàn bộ lịch sử chẩn đoán và thông tin bộ nhớ tạm",
    btnClear: "Xóa lịch sử"
  },
  en: {
    nav: ["Overview", "Diagnose", "History", "Library", "Settings"],
    slogan: "For sustainable agriculture",
    titles: ["Diagnosis", "Diagnosis History", "Plant Disease Library", "System Settings"],
    diagSub: "UPLOAD IMAGE TO ANALYZE",
    dropText: "Drag & drop image here",
    setLang: "Language", setLangDesc: "Select platform display language",
    setTheme: "Theme", setThemeDesc: "Choose Light or Dark mode",
    setThemeOps: ["Light Mode (Default)", "Dark Mode"],
    setData: "Data Management", setDataDesc: "Clear all diagnosis history and cache",
    btnClear: "Clear History"
  }
};

function applyLanguage(lang) {
  const t = dict[lang];
  
  const navLinksList = document.querySelectorAll('#sidebar-nav .nav-link');
  navLinksList.forEach((link, idx) => {
    if (t.nav[idx]) link.lastChild.textContent = " " + t.nav[idx];
  });
  const slogan = document.querySelector('aside p.text-xs');
  if (slogan) slogan.innerText = t.slogan;

  // Sử dụng getElementById an toàn thay cho querySelector để xử lý ID chứa dấu cách
  const viewDiagnose = document.getElementById('view-chẩn đoán');
  if (viewDiagnose) {
    const h1 = viewDiagnose.querySelector('h1');
    if (h1) h1.innerText = t.titles[0];
  }

  const viewHistory = document.getElementById('view-lịch sử');
  if (viewHistory) {
    const h2 = viewHistory.querySelector('h2');
    if (h2) h2.innerText = t.titles[1];
  }

  const viewLib = document.getElementById('view-thư viện bệnh');
  if (viewLib) {
    const h2 = viewLib.querySelector('h2');
    if (h2) h2.innerText = t.titles[2];
  }

  const viewSettings = document.getElementById('view-cài đặt');
  if (viewSettings) {
    const h2 = viewSettings.querySelector('h2');
    if (h2) h2.innerText = t.titles[3];
  }

  const subDiagnose = document.getElementById('page-subtitle');
  if (subDiagnose) subDiagnose.innerText = t.diagSub;
  const dropText = document.querySelector('#upload-placeholder p.font-bold');
  if (dropText) dropText.innerText = t.dropText;

  if (langSelect) {
    const langDiv = langSelect.parentElement;
    langDiv.querySelector('h3').innerText = t.setLang;
    langDiv.querySelector('p').innerText = t.setLangDesc;
  }
  if (themeSelect) {
    const themeDiv = themeSelect.parentElement;
    themeDiv.querySelector('h3').innerText = t.setTheme;
    themeDiv.querySelector('p').innerText = t.setThemeDesc;
    themeSelect.options[0].text = t.setThemeOps[0];
    themeSelect.options[1].text = t.setThemeOps[1];
  }
  if (btnClearHistory) {
    const dataDiv = btnClearHistory.parentElement;
    dataDiv.querySelector('h3').innerText = t.setData;
    dataDiv.querySelector('p').innerText = t.setDataDesc;
    btnClearHistory.innerText = t.btnClear;
  }

  if (langSelect) langSelect.value = lang;
  localStorage.setItem('plant_lang', lang);
}

const savedLang = localStorage.getItem('plant_lang') || 'vi';
applyLanguage(savedLang);

if (langSelect) {
  langSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
}