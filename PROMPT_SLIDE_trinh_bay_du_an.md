# Prompt tạo slide: Nền tảng chẩn đoán bệnh lá cây bằng AI

Hãy tạo một bộ slide thuyết trình bằng tiếng Việt cho đồ án môn học của một nhóm sinh viên. Toàn bộ nội dung cần dùng nằm trong tài liệu này. Chỉ dùng các số liệu và sự kiện được ghi ở đây, không thêm số liệu, tính năng hay nhận định nào khác.

## 1. Bối cảnh buổi trình bày

- **Người nghe:** giảng viên chấm đồ án, có chuyên môn về phần mềm và học máy. Thầy cô sẽ đọc code trong repo và hỏi vặn những chỗ còn yếu, nên slide cần trung thực về số liệu và nêu rõ hạn chế.
- **Thời lượng:** 5–6 phút nói, sau đó là hỏi đáp.
- **Mục tiêu:** sau buổi trình bày, giảng viên hiểu ba điều: nhóm làm ra sản phẩm gì, vì sao chọn kiến trúc chạy model trên trình duyệt, và nhóm biết rõ sản phẩm còn thiếu gì.
- **Người trình bày** sẽ nói theo ghi chú, nên slide chỉ cần ý chính và hình. Phần lời nói đặt vào ghi chú diễn giả (speaker notes) của từng slide.

## 2. Yêu cầu về hình thức

- 11 slide, tỉ lệ 16:9.
- Mỗi slide một ý chính, tối đa khoảng 30 từ trên mặt slide (không tính bảng và sơ đồ). Tiêu đề slide là một câu khẳng định nêu kết luận, ví dụ "Model chạy ngay trên trình duyệt", không dùng tiêu đề chung chung như "Kiến trúc".
- Ưu tiên sơ đồ, số liệu cỡ lớn và bảng ngắn thay cho gạch đầu dòng.
- Phong cách: sạch, hiện đại, nhiều khoảng trắng, hợp chủ đề nông nghiệp và công nghệ. Dùng bảng màu của chính ứng dụng:
  - Xanh lá đậm `#2b5834` (màu chính), xanh lá vừa `#4f8a55`, xanh lá nhạt `#8fbf86` (nhấn)
  - Nền sáng `#f6f8f4`, nền tối `#0c2412` (dùng cho slide tiêu đề và slide kết)
  - Chữ `#1f2922`
- Phông chữ: Be Vietnam Pro (hoặc phông sans-serif hỗ trợ tốt dấu tiếng Việt).
- Giữ nguyên các thuật ngữ kỹ thuật tiếng Anh: EfficientNetB3, transfer learning, LiteRT.js, WebAssembly, FastAPI, Postgres, CI/CD, macro F1, validation.
- Số thập phân viết kiểu Việt Nam với dấu phẩy: 95,36%, ngưỡng 0,6.
- Chỗ nào cần ảnh chụp màn hình ứng dụng thì để khung trống có nhãn "[Ảnh chụp màn hình: …]" để nhóm tự chèn.

## 3. Nội dung từng slide

### Slide 1 — Tiêu đề
- Tên đề tài: **Nền tảng chẩn đoán bệnh lá cây bằng AI**
- Dòng phụ: Chụp ảnh lá, nhận tên bệnh trong vài giây, ngay trên trình duyệt
- Chỗ trống để điền: [Tên nhóm], [Danh sách thành viên], [Môn học / Giảng viên], [Ngày trình bày]

### Slide 2 — Bài toán và sản phẩm
- Người dùng tải ảnh một chiếc lá, hệ thống trả về tên bệnh kèm độ tin cậy.
- Nhận diện **38 lớp** (bệnh và lá khoẻ) trên **14 loại cây**: táo, việt quất, anh đào, ngô, nho, cam, đào, ớt chuông, khoai tây, mâm xôi, đậu nành, bí, dâu tây, cà chua.
- Ba con số nên hiển thị cỡ lớn: 38 lớp · 14 loại cây · khoảng 1 giây mỗi ảnh trên máy tính.
- Ghi chú diễn giả: "Nhóm em xây nền tảng chẩn đoán bệnh lá cây qua ảnh: 38 lớp bệnh trên 14 loại cây. Người dùng đăng nhập, tải ảnh, nhận tên bệnh, độ tin cậy, top 5 khả năng, xem lại lịch sử, thống kê và tra thư viện bệnh."

### Slide 3 — Các chức năng chính
Trình bày dạng 5 ô, mỗi ô ứng với một trang của ứng dụng, kèm khung ảnh chụp màn hình:
- **Tổng quan:** thống kê số lượt chẩn đoán, các bệnh gặp nhiều, lượt gần đây
- **Chẩn đoán:** tải ảnh, xem tên bệnh, độ tin cậy và top 5 khả năng
- **Lịch sử:** xem lại, lọc và xoá các lượt chẩn đoán kèm ảnh
- **Thư viện bệnh:** 38 lớp kèm triệu chứng và cách phòng ngừa
- **Tài khoản:** đăng ký, đăng nhập, cài đặt, giao diện sáng/tối

### Slide 4 — Kiến trúc: model chạy ngay trên trình duyệt
Vẽ sơ đồ luồng dữ liệu:

```
Trình duyệt (React + Vite)
  ├─ chạy model .tflite bằng LiteRT.js (WebAssembly) → kết quả chẩn đoán
  └─ POST /api/detections (kết quả + ảnh thu nhỏ)
        → Backend FastAPI (đăng nhập, lịch sử, thống kê, thư viện bệnh)
              → Postgres trên Neon (dữ liệu + ảnh)
Hugging Face: nơi lưu file model theo từng phiên bản
```

- Model `.tflite` nặng khoảng 43 MB, tải một lần rồi trình duyệt lưu cache.
- Backend không cần TensorFlow.
- Ghi chú diễn giả: "Điểm khác biệt là model chạy trên trình duyệt bằng LiteRT.js. Frontend React + Vite, backend FastAPI, database Postgres trên Neon."

### Slide 5 — Vì sao chọn kiến trúc này: được và mất
- Lý do: nhóm triển khai hoàn toàn trên gói miễn phí. Vercel Function không chứa nổi TensorFlow và giới hạn dữ liệu gửi lên ở 4,5 MB.
- Bảng hai cột:

| Được | Mất |
|---|---|
| Không tốn máy chủ suy luận | Lần đầu phải tải 43 MB |
| Ảnh gốc không rời máy người dùng | Máy yếu chạy chậm hơn |
| Triển khai miễn phí toàn bộ | Máy chủ không kiểm chứng được kết quả trình duyệt gửi lên |

### Slide 6 — Model: EfficientNetB3 với transfer learning
- Dữ liệu: khoảng 87 nghìn ảnh PlantVillage, huấn luyện trên Kaggle, ảnh đầu vào 300×300.
- Vẽ dòng thời gian hai giai đoạn:
  1. **Huấn luyện phần head:** 5 epoch, backbone đóng băng, learning rate 1e-3
  2. **Fine-tune:** 8 epoch, 100 layer đầu vẫn đóng băng, learning rate 1e-5
- Augmentation: lật, xoay, zoom, đổi tương phản. Có EarlyStopping và giảm learning rate khi val_loss chững.
- Ghi chú diễn giả: "EfficientNetB3 transfer learning từ ImageNet, train trên Kaggle với khoảng 87 nghìn ảnh PlantVillage, hai giai đoạn head rồi fine-tune."

### Slide 7 — Kết quả: 95,36% trên tập validation
- Số cỡ lớn: **Accuracy 95,36%** · **Macro F1 95,27%** · đo trên **17.572 ảnh validation**
- Dòng lưu ý phải nằm ngay trên slide, không giấu trong ghi chú: "Đây là kết quả trên tập validation (cũng là tập dùng để chọn checkpoint), ảnh chụp trong phòng thí nghiệm. Chưa đo trên tập test độc lập và ảnh thực địa."
- Các lớp yếu nhất, đều thuộc nhóm bệnh cà chua: Late blight, Target Spot, Early blight.
- Ghi chú diễn giả: "Em nhấn mạnh là validation, không phải test độc lập, và ảnh là ảnh phòng thí nghiệm. Nhóm báo cáo thêm macro F1 vì nó coi các lớp ngang nhau, lộ ra lớp yếu mà accuracy che mất."

### Slide 8 — Ngưỡng tin cậy 0,6 được chọn từ số đo
- Dưới ngưỡng 0,6, ứng dụng báo "không nhận diện được" thay vì đoán bừa.
- Vẽ biểu đồ hoặc bảng từ dữ liệu sau, làm nổi bật dòng 0,6:

| Ngưỡng | Tỉ lệ ảnh được giữ lại | Độ chính xác trên phần giữ lại | Tỉ lệ dự đoán sai bị loại |
|---|---|---|---|
| 0,5 | 98,3% | 96,3% | 21,2% |
| **0,6** | **96,5%** | **97,1%** | **39,1%** |
| 0,7 | 94,4% | 97,8% | 54,7% |
| 0,8 | 91,7% | 98,5% | 69,5% |
| 0,9 | 87,5% | 99,1% | 82,2% |

- Ghi chú diễn giả: "Ngưỡng 0,6 được chọn từ bảng đo coverage và accuracy, không phải chọn cảm tính. Ngưỡng chỉ loại được 39% dự đoán sai, nên nó không thay được một lớp 'không phải lá'."

### Slide 9 — Backend và bảo mật
Bốn ý, mỗi ý kèm một biểu tượng:
- **Mật khẩu:** băm bằng scrypt có salt
- **Phiên đăng nhập:** token ngẫu nhiên 256 bit, cơ sở dữ liệu chỉ lưu SHA-256 của token, hết hạn sau 7 ngày, đăng xuất là thu hồi ngay
- **Ảnh:** nén lại thành JPEG, bỏ EXIF/GPS, giới hạn 4 MB
- **Lưu trữ:** ảnh nằm trong cơ sở dữ liệu vì ổ đĩa của Vercel chỉ đọc
- Ghi chú diễn giả: "Nhóm dùng token ngẫu nhiên thay cho JWT để đăng xuất là thu hồi được ngay, và lộ cơ sở dữ liệu cũng không dùng được token."

### Slide 10 — Vận hành và triển khai
- **Một nguồn quyết định phiên bản model:** file `model_info.json` trùng với tag trên Hugging Face, nên frontend và backend luôn cùng phiên bản.
- **Chạy ở máy cá nhân:** một lệnh `docker compose up`.
- **CI trên mỗi pull request:** pytest cho backend (33 hàm test), lint và build cho frontend.
- **Triển khai:** Vercel tự build lại khi nhánh `main` thay đổi. Bảng nhỏ:

| Phần | Dịch vụ (gói miễn phí) |
|---|---|
| Frontend + model AI | Vercel |
| Backend FastAPI | Vercel Function |
| Cơ sở dữ liệu + ảnh | Neon Postgres (0,5 GB) |
| Kho model | Hugging Face |

### Slide 11 — Hạn chế và hướng phát triển
Bảng hai cột, bốn dòng. Đây là slide kết, trình bày thẳng thắn, không nói giảm:

| Hạn chế hiện tại | Hướng sửa |
|---|---|
| Lịch sử chưa tách theo người dùng, API lịch sử chưa yêu cầu token | Thêm `user_id`, bắt buộc xác thực và lọc theo người dùng |
| Độ chính xác chưa đo trên tập test độc lập và ảnh thực địa | Đánh giá lại trên tập test riêng và ảnh chụp ngoài đồng ruộng |
| Chưa có lớp "không phải lá" | Bổ sung lớp này vào dữ liệu huấn luyện |
| Migration SQL và workflow tích hợp/deploy chưa đồng bộ với kiến trúc hiện tại | Thống nhất schema về một nguồn (ví dụ Alembic), cập nhật workflow |

- Dòng cuối slide: "Cảm ơn thầy cô đã lắng nghe. Nhóm em xin nhận câu hỏi."
- Ghi chú diễn giả: "Có bốn hạn chế nhóm em biết rõ. Hướng tiếp theo là sửa đúng bốn điểm này."

## 4. Những điều không làm

- Không viết 95,36% là "độ chính xác thực tế" hay "trên tập test". Luôn ghi rõ là trên tập validation.
- Không thêm tính năng ứng dụng chưa có: ứng dụng di động, gợi ý thuốc điều trị, chatbot, nhận diện theo thời gian thực qua camera.
- Không nói hệ thống "bảo mật tuyệt đối" hay "sẵn sàng cho sản xuất".
- Không thêm slide mục lục, slide "Giới thiệu nhóm" riêng hay slide "Hỏi đáp" riêng. Tổng cộng đúng 11 slide.
- Không dùng ảnh minh hoạ có hình người hoặc hình robot. Hình minh hoạ nên là lá cây, sơ đồ và biểu đồ.

## 5. Kết quả mong muốn

Một bộ 11 slide hoàn chỉnh theo đúng thứ tự trên, mỗi slide có tiêu đề, nội dung hiển thị và ghi chú diễn giả. Nếu công cụ cho phép, xuất được ra PowerPoint (.pptx) hoặc PDF.
