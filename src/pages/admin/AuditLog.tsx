import { PageShell } from '../../components/PageShell'
import { StatusDot } from '../../components/StatusDot'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getDatabase } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'

interface AuditEntry {
  id: string
  timestamp: string
  action: string
  user: string
}

export function AuditLog() {
  const { tenantId } = useAuth()
  const [entries, setEntries] = useState<AuditEntry[]>([])

  useEffect(() => {
    if (!tenantId) return
    let unsub: (() => void) | null = null
    getDatabase().then((db: any) => {
      unsub = db.onValue(`tenants/${tenantId}/auditLog`, (snapshot: any) => {
        const data = snapshot.val()
        if (data) {
          setEntries(Object.entries(data).map(([id, entry]: [string, any]) => ({ ...entry, id } as AuditEntry)))
        } else {
          setEntries([])
        }
      })
    })
    return () => { if (unsub) unsub() }
  }, [tenantId])

  if (entries.length === 0) {
    return (
      <PageShell title="Audit Log">
        <div className="p-4 text-text-mid font-body">
          No audit entries recorded.
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Audit Log">
      <div className="bg-surface border border-border-soft rounded-lg divide-y divide-border-soft">
        {[...entries].reverse().map((entry) => (
          <motion.div
            key={entry.id}
            className="flex items-center gap-3 p-4 hover:bg-bg-app transition-colors"
            whileHover={{ x: 4 }}
          >
            <StatusDot status="pulse" size="sm" />
            <span className="font-mono text-text-mid text-sm">{entry.timestamp}</span>
            <span className="text-text-hi font-body">{entry.action}</span>
            <span className="text-text-low font-mono text-xs ml-auto">{entry.user}</span>
          </motion.div>
        ))}
      </div>
    </PageShell>
  )
}