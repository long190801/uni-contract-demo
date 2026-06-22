import { createServiceGraphClient } from "./client"

export interface TeamsActivityRecord {
  userPrincipalName: string
  displayName: string
  lastActivityDate: string
  teamChatMessageCount: number
  privateChatMessageCount: number
  callCount: number
  meetingCount: number
  meetingMinutes: number
  hasOtherAction: boolean
  reportingPeriodDays: number
  activeDaysInReportingPeriod: number
}

// Fetches Teams user activity report for the past 30 days
// Requires Reports.Read.All application permission (admin consent needed)
export async function getTeamsActivityReport(): Promise<TeamsActivityRecord[]> {
  const graph = await createServiceGraphClient()
  // Returns a CSV stream
  const response = await graph
    .api("/reports/getTeamsUserActivityUserDetail(period='D30')")
    .responseType("raw" as never)
    .get()

  const text = await (response as Response).text()
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const records: TeamsActivityRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ""
    })
    records.push({
      userPrincipalName: row["User Principal Name"] || "",
      displayName: row["Display Name"] || "",
      lastActivityDate: row["Last Activity Date"] || "",
      teamChatMessageCount: parseInt(row["Team Chat Message Count"] || "0", 10),
      privateChatMessageCount: parseInt(row["Private Chat Message Count"] || "0", 10),
      callCount: parseInt(row["Call Count"] || "0", 10),
      meetingCount: parseInt(row["Meeting Count"] || "0", 10),
      meetingMinutes: parseInt(row["Audio Duration In Seconds"] || "0", 10) / 60,
      hasOtherAction: row["Has Other Action"] === "Yes",
      reportingPeriodDays: 30,
      activeDaysInReportingPeriod: parseInt(row["Active Days In Reporting Period"] || "0", 10),
    })
  }

  return records
}
