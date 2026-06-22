// Teams Incoming Webhook — for automated system notifications (no auth required)
// HR configures webhook URLs in Teams channel → Connectors → Incoming Webhook

export type WebhookChannel = "recruitment" | "equipment"

function getWebhookUrl(channel: WebhookChannel): string {
  if (channel === "recruitment") return process.env.TEAMS_RECRUITMENT_WEBHOOK_URL!
  return process.env.TEAMS_EQUIPMENT_WEBHOOK_URL!
}

export async function sendWebhookNotification(
  channel: WebhookChannel,
  title: string,
  text: string,
  facts?: Array<{ name: string; value: string }>,
  actionUrl?: string,
  actionLabel?: string
): Promise<void> {
  const webhookUrl = getWebhookUrl(channel)
  if (!webhookUrl) return

  const card: Record<string, unknown> = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: "0076D7",
    summary: title,
    sections: [
      {
        activityTitle: title,
        activityText: text,
        facts: facts || [],
      },
    ],
  }

  if (actionUrl) {
    card.potentialAction = [
      {
        "@type": "OpenUri",
        name: actionLabel || "Xem chi tiết",
        targets: [{ os: "default", uri: actionUrl }],
      },
    ]
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  })
}
