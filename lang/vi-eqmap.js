/* Vietnamese for the equipment ↔ software map (keys from eq-map-data.js). */
window.HY_VI = Object.assign(window.HY_VI || {}, {
  'eq.load-port.name': 'Load port', 'eq.load-port.does': 'Nơi hộp chứa wafer được đặt vào. Nó kiểm tra hộp đã nằm đúng chỗ, mở hộp và báo cho máy biết khe nào có wafer.', 'eq.load-port.ex': 'Hộp wafer đã đặt và kẹp chặt',
  'eq.loadlock.name': 'Loadlock', 'eq.loadlock.does': 'Buồng nhỏ được hút chân không và xả khí để wafer đi giữa môi trường không khí và chân không mà không phải xả khí cả máy.', 'eq.loadlock.ex': 'Loadlock đạt áp suất chuyển wafer',
  'eq.wafer-robot.name': 'Robot chuyển wafer', 'eq.wafer-robot.does': 'Chuyển wafer giữa loadlock và các buồng công nghệ bên trong môi trường chân không, mỗi lần một vị trí.', 'eq.wafer-robot.ex': 'Đã lấy wafer từ loadlock A',
  'eq.transfer-chamber.name': 'Buồng trung chuyển', 'eq.transfer-chamber.does': 'Trung tâm chân không ở giữa cluster tool. Van khe ở mỗi cạnh chỉ mở khi an toàn.', 'eq.transfer-chamber.ex': 'Van khe đã đóng trước khi xoay',
  'eq.process-chamber.name': 'Buồng công nghệ', 'eq.process-chamber.does': 'Nơi wafer được xử lý: phủ màng hoặc khắc, chạy từng bước theo recipe.', 'eq.process-chamber.ex': 'Hoàn tất bước 3 của recipe',
  'eq.vacuum-pump.name': 'Bơm chân không', 'eq.vacuum-pump.does': 'Bơm sơ cấp và bơm chân không cao đưa buồng từ áp suất khí quyển xuống áp suất làm việc.', 'eq.vacuum-pump.ex': 'Bơm chân không cao đạt tốc độ',
  'eq.gate-valve.name': 'Van cổng và van khe', 'eq.gate-valve.does': 'Mở và đóng đường nối giữa các buồng hoặc tới bơm. Khóa liên động quyết định khi nào van được phép chuyển động.', 'eq.gate-valve.ex': 'Quá thời gian mở van',
  'eq.gas-mfc.name': 'Tủ khí và bộ điều khiển lưu lượng (MFC)', 'eq.gas-mfc.does': 'Cấp khí công nghệ vào buồng theo lưu lượng đặt và báo về lưu lượng thực tế.', 'eq.gas-mfc.ex': 'Lưu lượng khí ngoài dung sai',
  'eq.rf-generator.name': 'Nguồn RF / DC', 'eq.rf-generator.does': 'Cấp năng lượng để tạo và duy trì plasma, báo về công suất thuận và công suất phản xạ.', 'eq.rf-generator.ex': 'Công suất phản xạ cao',
  'eq.pressure-gauge.name': 'Cảm biến áp suất', 'eq.pressure-gauge.does': 'Đo áp suất buồng trên nhiều bậc độ lớn, từ áp suất khí quyển đến chân không cao.', 'eq.pressure-gauge.ex': 'Đạt áp suất nền',
  'eq.host-link.name': 'Kết nối host nhà máy', 'eq.host-link.does': 'Nối máy với host của nhà máy: trạng thái, sự kiện, cảnh báo, recipe và lệnh điều khiển từ xa.', 'eq.host-link.ex': 'Đã gửi báo cáo sự kiện lên host',
  'eq.sig.digital': 'I/O số', 'eq.sig.analog': 'I/O tương tự', 'eq.sig.serial': 'Nối tiếp', 'eq.sig.network': 'Mạng',
  'eq.layer.driver': 'Driver thiết bị', 'eq.layer.sequence': 'Điều khiển trình tự', 'eq.layer.interlock': 'Khóa liên động và an toàn', 'eq.layer.gem': 'GEM / tích hợp host',
  'eq.lbl.signals': 'Tín hiệu', 'eq.lbl.protocols': 'Giao thức thường dùng', 'eq.lbl.layer': 'Tầng phần mềm', 'eq.lbl.example': 'Ví dụ sự kiện',
  'eq.lbl.parts': 'Bộ phận', 'eq.lbl.map': 'Bản đồ thiết bị', 'eq.lbl.pause': 'Tạm dừng hoạt cảnh', 'eq.lbl.play': 'Phát hoạt cảnh', 'eq.lbl.pick': 'Chọn một bộ phận', 'eq.lbl.wait': 'Đang tải mô hình 3D…', 'eq.all': 'Tất cả', 'eq.all.name': 'Toàn bộ cluster tool', 'eq.all.does': 'Xem tất cả bộ phận cùng lúc. Chọn một bộ phận để xem nó làm gì, giao tiếp bằng gì và tầng phần mềm nào điều khiển nó.', 'eq.lbl.more': 'Đọc thêm',
  'eq.note': 'Góc nhìn khái niệm về một cluster tool điển hình. Các ví dụ là tự đặt.'
});
