import Anthropic from "@anthropic-ai/sdk"

export interface ParsedCV {
  full_name: string
  years_experience: number
  companies_count: number
  university: string
  english_score: string
  summary: string
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function parseCVFromBase64(pdfBase64: string): Promise<ParsedCV> {
  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          } as never,
          {
            type: "text",
            text: `Đọc CV này và trả về JSON với các trường sau (không có text nào khác):
{
  "full_name": "họ và tên đầy đủ",
  "years_experience": <tổng số năm kinh nghiệm làm việc, kiểu number>,
  "companies_count": <số công ty/tổ chức đã làm việc, kiểu number>,
  "university": "tên trường đại học",
  "english_score": "điểm IELTS/TOEIC hoặc trình độ tiếng Anh",
  "summary": "tóm tắt ngắn gọn profile ứng viên trong 2-3 câu"
}
Nếu không tìm thấy thông tin nào, để giá trị mặc định: string rỗng hoặc 0.`,
          },
        ],
      },
    ],
  })

  const text = (message.content[0] as { type: string; text: string }).text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("Claude did not return valid JSON")
  return JSON.parse(jsonMatch[0]) as ParsedCV
}
