import { Resend } from "resend"
import { createServerClient } from "@/lib/supabase/server"

const FROM = process.env.RESEND_FROM_EMAIL || "hr@eximuni.com"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "placeholder")
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  candidateId?: string
  templateName?: string
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const supabase = createServerClient()
  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to]

  try {
    const { data } = await getResend().emails.send({
      from: `UNI HR <${FROM}>`,
      to: recipients,
      subject: opts.subject,
      html: opts.html,
    })

    await supabase.from("email_logs").insert({
      candidate_id: opts.candidateId || null,
      template_name: opts.templateName || null,
      recipient_email: recipients.join(", "),
      subject: opts.subject,
      status: "Sent",
      provider_message_id: data?.id || null,
      sent_at: new Date().toISOString(),
    })
  } catch (err) {
    await supabase.from("email_logs").insert({
      candidate_id: opts.candidateId || null,
      template_name: opts.templateName || null,
      recipient_email: recipients.join(", "),
      subject: opts.subject,
      status: "Failed",
      error_message: String(err),
      sent_at: new Date().toISOString(),
    })
    throw err
  }
}
