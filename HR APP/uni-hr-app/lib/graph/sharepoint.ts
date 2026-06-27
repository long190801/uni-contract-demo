// Upload files to a SharePoint folder using a user's delegated Graph token.
// Used by the NDA generator to save documents straight into the Legal7 site's
// "NDA" folder instead of Supabase Storage.
//
// Config (.env.local):
//   SHAREPOINT_SITE_URL  e.g. https://uniconsulting079.sharepoint.com/sites/Legal7
//   SHAREPOINT_FOLDER    e.g. NDA   (folder inside the site's document library; auto-created)

const GRAPH = "https://graph.microsoft.com/v1.0"

async function graphFetch(accessToken: string, url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers || {}) },
  })
}

async function errMsg(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}))
  return data?.error?.message || `HTTP ${res.status}`
}

export interface SharePointTarget {
  driveId: string
  folderPath: string // "" = library root, otherwise the folder name (single level)
}

// Resolve a site URL + folder name into the drive id + folder path used for upload.
// Creates the folder if it does not exist yet.
export async function resolveSiteFolder(
  accessToken: string,
  siteUrl: string,
  folderName?: string
): Promise<SharePointTarget> {
  const u = new URL(siteUrl)
  // GET /sites/{hostname}:{/sites/Legal7}
  const siteRes = await graphFetch(accessToken, `${GRAPH}/sites/${u.hostname}:${u.pathname}`)
  if (!siteRes.ok) throw new Error(`Không tìm thấy site SharePoint: ${await errMsg(siteRes)}`)
  const siteId = (await siteRes.json()).id

  const driveRes = await graphFetch(accessToken, `${GRAPH}/sites/${siteId}/drive`)
  if (!driveRes.ok) throw new Error(`Không truy cập được thư viện tài liệu: ${await errMsg(driveRes)}`)
  const driveId = (await driveRes.json()).id

  const folder = (folderName || "").trim()
  if (folder) {
    const check = await graphFetch(accessToken, `${GRAPH}/drives/${driveId}/root:/${encodeURIComponent(folder)}`)
    if (check.status === 404) {
      const create = await graphFetch(accessToken, `${GRAPH}/drives/${driveId}/root/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folder, folder: {}, "@microsoft.graph.conflictBehavior": "fail" }),
      })
      // 409 = đã tồn tại (race) — bỏ qua.
      if (!create.ok && create.status !== 409) throw new Error(`Không tạo được thư mục "${folder}": ${await errMsg(create)}`)
    } else if (!check.ok) {
      throw new Error(`Không truy cập được thư mục "${folder}": ${await errMsg(check)}`)
    }
  }
  return { driveId, folderPath: folder }
}

export interface UploadedFile {
  id: string
  webUrl: string
  name: string
}

// Upload a small file (<4MB — NDA .docx is a few KB) into the resolved folder.
// On name collision SharePoint auto-renames (NDA 1.docx, …) so nothing is overwritten.
export async function uploadFileToFolder(
  accessToken: string,
  target: SharePointTarget,
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<UploadedFile> {
  const itemPath = target.folderPath
    ? `${encodeURIComponent(target.folderPath)}/${encodeURIComponent(fileName)}`
    : encodeURIComponent(fileName)
  const url = `${GRAPH}/drives/${target.driveId}/root:/${itemPath}:/content?@microsoft.graph.conflictBehavior=rename`
  const res = await graphFetch(accessToken, url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(buffer),
  })
  if (!res.ok) throw new Error(`Tải file lên SharePoint thất bại: ${await errMsg(res)}`)
  const data = await res.json()
  return { id: data.id, webUrl: data.webUrl, name: data.name }
}
