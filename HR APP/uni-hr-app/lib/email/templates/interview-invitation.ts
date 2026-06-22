export function interviewInvitationEmail(opts: {
  candidateName: string
  position: string
  slot1: string
  slot2: string
  slot3: string
  responseUrl: string
  meetingUrl?: string
}): { subject: string; html: string } {
  return {
    subject: "UNI_Thư mời phỏng vấn trực tiếp",
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <p>Kính gửi ${opts.candidateName},</p>
  <p>Chúng tôi rất ấn tượng với kết quả vòng phỏng vấn trực tuyến vừa qua và trân trọng kính mời bạn tham dự vòng phỏng vấn trực tiếp cùng CEO của UNI.</p>
  <p>Vui lòng chọn một trong các khung giờ bên dưới:</p>
  <ul>
    <li>Lựa chọn 1: <strong>${opts.slot1}</strong></li>
    <li>Lựa chọn 2: <strong>${opts.slot2}</strong></li>
    <li>Lựa chọn 3: <strong>${opts.slot3}</strong></li>
  </ul>
  ${opts.meetingUrl ? `<p>Link phỏng vấn online: <a href="${opts.meetingUrl}">${opts.meetingUrl}</a></p>` : ""}
  <p><a href="${opts.responseUrl}" style="background:#0076D7;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Chọn khung giờ phỏng vấn</a></p>
  <p>Bạn cũng có thể đề xuất thời gian khác hoặc từ chối thông qua link trên.</p>
  <p>Thời gian dự kiến: 30-45 phút. UNI có thể hỗ trợ phiên dịch nếu cần.</p>
  <p>Trân trọng,<br/>Phòng Nhân sự UNI</p>
</div>`,
  }
}

export function interviewConfirmationEmail(opts: {
  candidateName: string
  confirmedTime: string
  meetingUrl?: string
}): { subject: string; html: string } {
  return {
    subject: "UNI_Xác nhận lịch phỏng vấn",
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <p>Kính gửi ${opts.candidateName},</p>
  <p>UNI xác nhận lịch phỏng vấn của bạn vào: <strong>${opts.confirmedTime}</strong></p>
  ${opts.meetingUrl ? `<p>Link phòng họp Teams: <a href="${opts.meetingUrl}">${opts.meetingUrl}</a></p>` : ""}
  <p>Trân trọng,<br/>Phòng Nhân sự UNI</p>
</div>`,
  }
}
