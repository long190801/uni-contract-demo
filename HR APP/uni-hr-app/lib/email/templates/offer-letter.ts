export function offerLetterEmail(opts: {
  candidateName: string
  position: string
  office: string
  startDate: string
  salary: string
  responseUrl: string
}): { subject: string; html: string } {
  return {
    subject: "UNI_Thư mời nhận việc",
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <p>Kính gửi ${opts.candidateName},</p>
  <p>Thay mặt Ban Giám đốc UNI, chúng tôi trân trọng gửi đến bạn Thư mời nhận việc cho vị trí:</p>
  <ul>
    <li><strong>Vị trí:</strong> ${opts.position}</li>
    <li><strong>Văn phòng:</strong> ${opts.office}</li>
    <li><strong>Ngày bắt đầu dự kiến:</strong> ${opts.startDate}</li>
    <li><strong>Mức lương thử việc:</strong> ${opts.salary}</li>
  </ul>
  <p>Vui lòng xác nhận hoặc từ chối offer qua link bên dưới:</p>
  <p style="text-align:center">
    <a href="${opts.responseUrl}?action=accept" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;margin-right:10px">Chấp nhận</a>
    <a href="${opts.responseUrl}?action=decline" style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Từ chối</a>
  </p>
  <p>Trân trọng,<br/>Phòng Nhân sự UNI</p>
</div>`,
  }
}
