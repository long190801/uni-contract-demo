import { createGraphClient } from "./client"

// Send a direct message to a Teams user (requires delegated ChatMessage.Send permission)
export async function sendTeamsDM(
  recipientUserId: string,
  messageHtml: string,
  accessToken: string
): Promise<void> {
  const graph = createGraphClient(accessToken)

  // Find or create 1:1 chat
  const chatsResponse = await graph.api("/me/chats").filter("chatType eq 'oneOnOne'").get()
  let chatId: string | undefined

  for (const chat of chatsResponse.value || []) {
    const members = await graph.api(`/chats/${chat.id}/members`).get()
    const hasRecipient = members.value?.some(
      (m: { userId?: string }) => m.userId === recipientUserId
    )
    if (hasRecipient) {
      chatId = chat.id
      break
    }
  }

  if (!chatId) {
    const newChat = await graph.api("/chats").post({
      chatType: "oneOnOne",
      members: [
        {
          "@odata.type": "#microsoft.graph.aadUserConversationMember",
          roles: ["owner"],
          "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${recipientUserId}`,
        },
      ],
    })
    chatId = newChat.id
  }

  await graph.api(`/chats/${chatId}/messages`).post({
    body: { contentType: "html", content: messageHtml },
  })
}

// Post message to a Teams channel
export async function sendTeamsChannelMessage(
  teamId: string,
  channelId: string,
  messageHtml: string,
  accessToken: string
): Promise<void> {
  const graph = createGraphClient(accessToken)
  await graph.api(`/teams/${teamId}/channels/${channelId}/messages`).post({
    body: { contentType: "html", content: messageHtml },
  })
}
