import { getDatabase } from '../firebase/config'

export async function logAudit(tenantId: string | null, action: string, user: string | null | undefined) {
  if (!tenantId) return
  try {
    const db = await getDatabase()
    const timestamp = new Date().toISOString()
    const id = `audit-${Date.now()}`
    await (db as any).set(`tenants/${tenantId}/auditLog/${id}`, {
      timestamp,
      action,
      user
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
