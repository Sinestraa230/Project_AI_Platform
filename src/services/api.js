// Hàm giả lập gửi ảnh lên server và nhận kết quả
export const analyzeImageAPI = async (imageFile) => {
  return new Promise((resolve) => {
    // Giả lập thời gian chờ AI xử lý là 1.5 giây
    setTimeout(() => {
      resolve({
        status: "success",
        data: {
          disease_name: "Bệnh Đốm Lá (Leaf Spot)",
          confidence: "95.8%",
          treatment: "Cắt bỏ lá bệnh, phun thuốc diệt nấm gốc đồng (Copper-based fungicide) và giữ khoảng cách giữa các cây để tăng độ thông thoáng."
        }
      });
    }, 1500);
  });
};