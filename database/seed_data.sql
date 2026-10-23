INSERT INTO categories (name,description,metadata) VALUES
('Bệnh đạo ôn (Lúa)', 'Bệnh do nấm Pyricularia oryzae gây ra, làm lá có đốm hình mắt én.', '{"type": "Nấm", "treatment": "Phun thuốc Tricyclazole"}'),
('Bệnh rỉ sắt (Cà phê)', 'Bệnh do nấm Hemileia vastatrix gây ra, lá có đốm bột màu vàng cam.', '{"type": "Nấm", "treatment": "Cắt tỉa cành, phun thuốc gốc Đồng"}'),
('Rệp sáp', 'Côn trùng hút nhựa cây, có lớp phấn trắng bên ngoài.', '{"type": "Côn trùng", "treatment": "Dùng xà phòng hữu cơ hoặc dầu Neem"}'),
('Bệnh thán thư', 'Làm thối quả, đốm lá đen trên nhiều loại cây ăn quả.', '{"type": "Nấm", "treatment": "Phun Mancozeb"}');

INSERT INTO users (username) VALUES
('nongdan_01'),
('kysu_nongnghiep');

INSERT INTO prediction_logs(user_id,image_url,category_id,confidence_score) VALUES
(1, 'https://dummyimage.com/daoon1.jpg', 1, 95.50),
(1, 'https://dummyimage.com/daoon2.jpg', 1, 88.20),
(2, 'https://dummyimage.com/repsap.jpg', 3, 99.10),
(2, 'https://dummyimage.com/thanthu.jpg', 4, 75.00);