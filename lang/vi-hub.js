/* Vietnamese for the shared hub shell: menu, footer, templates, page names. */
window.HY_VI = Object.assign(window.HY_VI || {}, {
  'ui.menu': 'Menu', 'ui.close': 'Đóng',
  'ui.home': 'Trang chủ HYTEK', 'ui.copy': 'Sao chép email', 'ui.copied': 'Đã sao chép', 'ui.back': 'Quay lại',
  'hub.t.contact': 'Liên hệ | HYTEK', 'hub.ds.contact': 'Hãy cho chúng tôi biết về thiết bị, kiến trúc phần mềm hoặc nhu cầu kỹ thuật của bạn.', 'ui.lang': 'Ngôn ngữ', 'ui.crumb': 'Đường dẫn', 'ui.pause': 'Tạm dừng mô phỏng', 'ui.play': 'Tiếp tục mô phỏng',
  'ui.gl.wait': 'Đang tải mô hình 3D…', 'ui.gl.fail': 'Không tải được mô hình 3D. Kiểm tra kết nối mạng hoặc thử trình duyệt khác.',
  'aria.seq': 'Trao đổi bản tin giữa host nhà máy và thiết bị: thiết lập truyền thông, lệnh từ host, sự kiện bắt đầu quy trình, báo cáo cảnh báo, sự kiện hoàn tất quy trình.',
  'hub.nav.equipment': 'Thiết bị', 'hub.nav.protocols': 'Giao thức', 'hub.nav.tools': 'Công cụ',
  'hub.nav.learn': 'Học', 'hub.nav.contact': 'Liên hệ',
  'brand.tag': 'Phát triển phần mềm cho hệ thống màng mỏng tiên tiến',
  'hub.soon': 'Đang cập nhật',
  'hub.pg.home': 'HYTEK',

  /* section index pages */
  'hub.sec.equipment.p': 'Thiết bị bán dẫn từ góc nhìn phần mềm: từng bộ phận làm gì, giao tiếp bằng gì và tầng phần mềm nào điều khiển nó.',
  'hub.sec.protocols.p': 'Các giao thức và cổng giao tiếp kết nối phần mềm với thiết bị — từ cổng nối tiếp đến tự động hóa nhà máy.',
  'hub.sec.tools.p': 'Công cụ miễn phí chạy ngay trên trình duyệt, theo các tiêu chuẩn công khai.',
  'hub.sec.learn.p': 'Học phần mềm thiết bị bán dẫn qua mô phỏng, lộ trình và thử thách.',

  /* page names */
  'hub.pg.cluster-tool': 'Cluster tool (hệ đa buồng)', 'hub.pg.loadlock': 'Loadlock', 'hub.pg.wafer-robot': 'Robot vận chuyển wafer',
  'hub.pg.process-chambers': 'Buồng công nghệ: IBE, IBD, PVD, RIE', 'hub.pg.vacuum-gas': 'Bơm, van và cấp khí',
  'hub.pg.rs-232': 'Cổng nối tiếp RS-232 / COM', 'hub.pg.devicenet': 'DeviceNet', 'hub.pg.tcp-socket': 'Socket TCP/IP (ASCII / raw)',
  'hub.pg.modbus': 'Modbus TCP · RTU · ASCII', 'hub.pg.opc-da': 'OPC DA', 'hub.pg.secs-gem': 'SECS/GEM · HSMS',
  'hub.pg.secs-decoder': 'Bộ giải mã SECS-II / HSMS', 'hub.pg.modbus-frame': 'Tạo khung Modbus',
  'hub.pg.unit-converter': 'Đổi đơn vị áp suất chân không & lưu lượng', 'hub.pg.pumpdown': 'Ước lượng thời gian hút chân không',
  'hub.pg.cheat-sheets': 'Bảng tra nhanh', 'hub.pg.wafer-journey': 'Hành trình wafer 3D', 'hub.pg.path': 'Lộ trình học',
  'hub.pg.challenge': 'Thử thách', 'hub.pg.ask': 'Hỏi kỹ sư', 'hub.pg.glossary': 'Thuật ngữ A–Z',

  /* template slot headings */
  'hub.s.definition': 'Khái niệm', 'hub.s.in-equipment': 'Nằm ở đâu trong thiết bị', 'hub.s.simulation': 'Thử ngay',
  'hub.s.anatomy': 'Cấu trúc bản tin', 'hub.s.terms': 'Thuật ngữ chính', 'hub.s.pitfalls': 'Lỗi thường gặp',
  'hub.s.tools': 'Công cụ liên quan', 'hub.s.used-by': 'Bộ phận sử dụng',
  'hub.s.what': 'Chức năng', 'hub.s.view': 'Xem 3D', 'hub.s.signals': 'Tín hiệu, giao thức và tầng phần mềm',
  'hub.s.events': 'Ví dụ sự kiện', 'hub.s.protocols': 'Giao thức liên quan',
  'hub.s.tool': 'Công cụ', 'hub.s.reading': 'Cách đọc kết quả', 'hub.s.standard': 'Tiêu chuẩn', 'hub.s.related': 'Trang liên quan',
  'hub.s.content': 'Nội dung',
  'hub.g.en': 'Tiếng Anh', 'hub.g.vi': 'Tiếng Việt', 'hub.g.def': 'Định nghĩa',

  /* end-of-page email block */
  'hub.mail.h': 'Có câu hỏi về chủ đề này? Hỏi kỹ sư của chúng tôi.',
  'hub.mail.btn': 'Gửi email cho Dat Do'
});
/* page titles and descriptions follow the names: hub.t.<id> = "<name> | HYTEK", hub.ds.<id> = one line */
(function (V) {
  for (const k of Object.keys(V)) {
    const m = k.match(/^hub\.(pg|nav)\.(.+)$/); if (!m || k === 'hub.pg.home' || m[2] === 'contact' || m[2] === 'about') continue;
    V['hub.t.' + m[2]] = V[k] + ' | HYTEK';
    V['hub.ds.' + m[2]] = 'Kho kiến thức HYTEK: ' + V[k] + '.';
  }
})(window.HY_VI);
