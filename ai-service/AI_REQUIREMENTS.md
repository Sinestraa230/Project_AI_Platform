# Checklist & Yêu Cầu Phát Triển Model AI (Nhận Diện Sâu Bệnh)

Tài liệu này liệt kê các bước, công cụ và thành phần cần thiết để xây dựng, huấn luyện và tích hợp mô hình AI vào hệ thống chung của nhóm.

## 1. Dữ liệu (Dataset)
- [ ] **Thu thập dữ liệu:** Tìm kiếm hoặc chuẩn bị tập dữ liệu ảnh lá cây khỏe và bị bệnh.
- [ ] **Gán nhãn & Làm sạch:** Phân loại ảnh vào các thư mục tương ứng với tên nhãn bệnh (Class folders) hoặc file CSV chứa nhãn (`image_path`, `label`).
- [ ] **Chia tập dữ liệu (Split Data):** 
  - Tập huấn luyện (Train): ~70% - 80%
  - Tập kiểm định (Validation): ~15% - 20%
  - Tập kiểm thử (Test): ~10%
- [ ] **Tăng cường dữ liệu (Data Augmentation):** Sử dụng các kỹ thuật như xoay ảnh, lật ngang/dọc, dịch chuyển, điều chỉnh độ sáng (qua thư viện `Albumentations` hoặc `torchvision.transforms`) để chống hiện tượng overfitting.

## 2. Môi trường & Công cụ (Environment & Tools)
- [ ] **Ngôn ngữ:** Python (khuyên dùng phiên bản `3.10` hoặc `3.11`).
- [ ] **Framework Deep Learning:** PyTorch hoặc TensorFlow/Keras.
- [ ] **Thư viện hỗ trợ xử lý ảnh & tính toán:** Pillow, OpenCV, NumPy, Pandas, scikit-learn.
- [ ] **Môi trường tính toán (Computing Resource):** GPU (có thể dùng Google Colab, Kaggle Notebook miễn phí hoặc GPU máy cá nhân có hỗ trợ CUDA) để tăng tốc quá trình train.

## 3. Huấn luyện Mô hình (Model Training Pipeline)
- [ ] **Lựa chọn kiến trúc (Architecture):** 
  - *Base nhẹ (Cho Mobile/Edge/API nhanh):* MobileNetV3, EfficientNet-B0.
  - *Base độ chính xác cao:* ResNet50, ConvNeXt, hoặc Vision Transformer (ViT).
- [ ] **Áp dụng Transfer Learning:** Sử dụng các model đã được train sẵn trên ImageNet thay vì train từ đầu (`train from scratch`).
- [ ] **Thiết lập siêu tham số (Hyperparameters):**
  - Hàm mất mát (`Loss Function`): `CrossEntropyLoss` (hoặc `Focal Loss` nếu dữ liệu bị mất cân bằng trầm trọng).
  - Trình tối ưu hóa (`Optimizer`): `AdamW` hoặc `SGD` với Momentum.
  - Tốc độ học (`Learning Rate`): Thường bắt đầu từ `1e-3` hoặc `1e-4` kết hợp Scheduler (như Cosine Annealing).
- [ ] **Đánh giá mô hình:** Theo dõi các chỉ số `Accuracy`, `Precision`, `Recall`, và `F1-Score` trên tập Validation sau mỗi Epoch để chọn ra file trọng số tốt nhất (`best_model.pt`).

## 4. Đóng gói & Triển khai (Deployment & Integration)
- [ ] **Viết code Inference:** Xử lý ảnh đầu vào từ người dùng, đưa qua model và trả về tên bệnh kèm độ tự tin (Confidence Score).
- [ ] **Xây dựng API Service:** Sử dụng **FastAPI** để viết các endpoint nhận file ảnh (`/predict`).
- [ ] **Đóng gói Docker:** Viết `Dockerfile` và `requirements.txt` để đảm bảo môi trường chạy độc lập, không bị lệch phiên bản thư viện.
- [ ] **Kiểm thử tích hợp:** Test API local bằng Postman hoặc Swagger UI trước khi gửi Merge Request cho team Backend tích hợp vào hệ thống chung.