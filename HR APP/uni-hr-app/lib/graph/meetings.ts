import { createGraphClient } from "./client"

export async function createTeamsMeeting(
  subject: string,
  startDateTime: string,
  endDateTime: string,
  accessToken: string
): Promise<string> {
  const graph = createGraphClient(accessToken)
  const meeting = await graph.api("/me/onlineMeetings").post({
    subject,
    startDateTime,
    endDateTime,
  })
  return meeting.joinWebUrl as string
}
