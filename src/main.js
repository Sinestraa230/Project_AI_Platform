import './assets/style.css';

// Các thành phần giao diện
const uploadZone = document.getElementById('upload-zone');
const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const previewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const loadingOverlay = document.getElementById('loading-overlay');
const progressText = document.getElementById('progress-text');
const resultCard = document.getElementById('result-card');

// Xử lý kéo thả và click chọn file
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

  // Đọc ảnh và hiển thị lên khung
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    uploadPlaceholder.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    resultCard.classList.add('hidden');
    
    // Bắt đầu quá trình "phân tích" ảo
    startMockAnalysis();
  };
  reader.readAsDataURL(file);
}

function startMockAnalysis() {
  loadingOverlay.classList.remove('hidden');
  let progress = 0;
  
  // Hiệu ứng tăng % tiến trình
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5; // Tăng ngẫu nhiên 5-20%
    if (progress >= 85) progress = 85; // Dừng mô phỏng ở 85% giống ảnh mẫu
    
    progressText.innerText = `${progress}%`;

    if (progress === 85) {
      clearInterval(interval);
      
      // Chờ thêm 1 chút rồi hiện kết quả
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        resultCard.classList.remove('hidden');
        resultCard.classList.add('flex'); // Kích hoạt flexbox cho card
      }, 500);
    }
  }, 200);
}