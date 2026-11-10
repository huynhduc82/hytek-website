/* Vietnamese for the SECS-II / HSMS decoder page. Technical tokens (S1F13, SML, W-bit, SType) stay English. */
window.HY_VI = Object.assign(window.HY_VI || {}, {
  'dec.lede': 'Dán các byte của một bản tin HSMS hoặc một item SECS-II dưới dạng hex. Công cụ hiển thị các trường header và phần thân ở dạng SML — dạng chữ mà kỹ sư đọc trong log. Mọi thứ chạy ngay trên trình duyệt của bạn, không gửi dữ liệu đi đâu.',
  'dec.in': 'Byte dạng hex', 'dec.ex': 'Ví dụ',
  'dec.ex1': 'S1F13 · Thiết lập truyền thông', 'dec.ex2': 'S6F11 · Báo cáo sự kiện', 'dec.ex3': 'Linktest.req',
  'dec.prefix': 'Tiền tố độ dài',
  'dec.p.auto': 'Tự động', 'dec.p.yes': 'Có độ dài', 'dec.p.no': 'Bắt đầu bằng header', 'dec.p.item': 'Chỉ một item',
  'dec.h.msg': 'Bản tin', 'dec.h.len': 'Độ dài',
  'dec.r1': 'Một bản tin HSMS gồm 4 byte độ dài, 10 byte header và phần thân SECS-II (có thể không có). Header chứa session ID, stream và function (S1F13 nghĩa là stream 1, function 13), W-bit để yêu cầu trả lời, và system bytes để ghép câu trả lời với câu hỏi.',
  'dec.r2': 'Mỗi item SECS-II bắt đầu bằng một byte định dạng và một đến ba byte độ dài. Với danh sách (L), độ dài là số item; với các định dạng khác, độ dài là số byte. SML viết mỗi item thành &lt;định dạng giá trị&gt;, danh sách được thụt lề.',
  'dec.r3': 'Các bản tin điều khiển như Select và Linktest không có stream, function hay phần thân; loại bản tin nằm ở byte SType.',
  'dec.std': 'Định dạng bản tin: SEMI E5 (SECS-II). Truyền qua TCP/IP: SEMI E37 (HSMS). Các ví dụ dùng giá trị tự đặt.',
  'dec.e.odd': 'Số chữ số hex bị lẻ', 'dec.e.char': 'Có ký tự không phải hex', 'dec.e.trunc': 'Dữ liệu bị thiếu',
  'dec.e.fmt': 'Byte định dạng không hợp lệ', 'dec.e.deep': 'Danh sách lồng nhau quá sâu',
  'dec.e.prefix': 'Tiền tố độ dài không khớp với dữ liệu', 'dec.e.extra': 'Còn byte thừa sau phần thân',
  'dec.e.len': 'Độ dài item không hợp lệ'
});
