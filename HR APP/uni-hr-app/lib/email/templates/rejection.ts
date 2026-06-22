// Template 1: Từ chối sau phỏng vấn online
export function rejectionAfterOnlineEmail(candidateName: string): { subject: string; html: string } {
  return {
    subject: "UNI_Kết quả phỏng vấn Online",
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <p>Kính gửi ${candidateName},</p>
  <p>Cảm ơn bạn đã dành thời gian tham gia buổi phỏng vấn trực tuyến với UNI. Chúng tôi đánh giá cao sự quan tâm và nỗ lực của bạn trong quá trình ứng tuyển.</p>
  <p>Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng lần này chúng tôi không thể tiến hành hợp tác với bạn. Quyết định này không phản ánh năng lực của bạn, mà xuất phát từ một số yếu tố khách quan nằm ngoài khả năng kiểm soát của chúng tôi.</p>
  <p>Chúng tôi chân thành chúc bạn thành công trong sự nghiệp và hy vọng sẽ có cơ hội hợp tác với bạn trong tương lai.</p>
  <p>Trân trọng,<br/>Phòng Nhân sự UNI</p>
</div>`,
  }
}

// Template 3: Từ chối sau phỏng vấn trực tiếp
export function rejectionAfterInPersonEmail(candidateName: string): { subject: string; html: string } {
  return {
    subject: "UNI_Thông báo kết quả phỏng vấn trực tiếp",
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <p>Kính gửi ${candidateName},</p>
  <p>Cảm ơn bạn đã dành thời gian tham gia cả hai vòng phỏng vấn cùng đội ngũ UNI. Chúng tôi trân trọng tiềm năng và sự quan tâm của bạn đối với công ty.</p>
  <p>Sau khi thảo luận kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng vào thời điểm này, chúng tôi chưa thể tiến hành hợp tác do quy mô hiện tại của công ty. Thời gian phỏng vấn ngắn chưa phản ánh đầy đủ năng lực của bạn, và quyết định này hoàn toàn không phản ánh sự thiếu sót từ phía bạn.</p>
  <p>Chúng tôi xem đây là nguồn cảm hứng để UNI phát triển hơn nữa. Chúc bạn luôn thành công và gặp nhiều may mắn trong con đường sự nghiệp phía trước.</p>
  <p>Trân trọng,<br/>Phòng Nhân sự UNI</p>
</div>`,
  }
}
