import { PageShell } from '../../components/PageShell'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Mail, Phone, Building2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { hrToast } from '../../components/HRCToast'
import { getDatabase } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { logAudit } from '../../utils/auditLogger'

interface Client {
  id: string
  name: string
  avatar: string
  title: string
  email: string
  phone: string
  status: string
  description: string
}

export function Clients() {
  const { tenantId, user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    status: 'Active',
    description: '',
  })

  useEffect(() => {
    if (!tenantId) return
    let unsub: (() => void) | null = null
    getDatabase().then((db: any) => {
      unsub = db.onValue(`tenants/${tenantId}/clients`, (snapshot: any) => {
        const data = snapshot.val() as Record<string, Omit<Client, 'id'>> | undefined
        if (data) {
          setClients(Object.entries(data).map(([id, c]) => ({ ...c, id } as Client)))
        } else {
          setClients([])
        }
      })
    })
    return () => { if (unsub) unsub() }
  }, [tenantId])

  const filteredClients = clients.filter((c) => statusFilter === 'All' || c.status === statusFilter)

  const handleSaveClient = async () => {
    if (!tenantId) return
    const db = await getDatabase()
    const clientData = {
      ...formData,
      avatar: formData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??',
      tenantId: tenantId
    }
    if (editingClient) {
      await (db as any).set(`tenants/${tenantId}/clients/${editingClient.id}`, clientData)
      await logAudit(tenantId, `Updated client ${clientData.name}`, user?.email || 'Admin')
      hrToast.success('Client Updated', 'Client details updated')
    } else {
      const newClient = { ...clientData, id: `client-${Date.now()}` }
      await (db as any).set(`tenants/${tenantId}/clients/${newClient.id}`, newClient)
      await logAudit(tenantId, `Added client ${newClient.name}`, user?.email || 'Admin')
      hrToast.success('Client Added', 'New client created')
    }
    setShowModal(false)
    setEditingClient(null)
    setFormData({ name: '', title: '', email: '', phone: '', status: 'Active', description: '' })
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      title: client.title,
      email: client.email,
      phone: client.phone,
      status: client.status,
      description: client.description,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!tenantId) return
    const db = await getDatabase()
    const client = clients.find(c => c.id === id)
    await (db as any).remove(`tenants/${tenantId}/clients/${id}`)
    await logAudit(tenantId, `Deleted client ${client?.name || 'unknown'}`, user?.email || 'Admin')
    hrToast.success('Client Deleted', 'Client removed successfully')
  }

  return (
    <PageShell title="Clients List">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 focus-ring text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-body text-text-mid whitespace-nowrap">Status Filter</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-surface border border-border-soft rounded-lg text-sm focus-ring"
          >
            <option value="All">All Clients</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface border border-border-soft rounded-xl p-6 relative"
          >
            <div className="absolute top-4 right-4 flex gap-1">
              <button onClick={() => handleEdit(client)} className="p-1.5 rounded hover:bg-bg-app focus-ring" title="Edit">
                <Edit className="w-4 h-4 text-primary" />
              </button>
              <button onClick={() => handleDelete(client.id)} className="p-1.5 rounded hover:bg-bg-app focus-ring" title="Delete">
                <Trash2 className="w-4 h-4 text-accent-coral" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-full bg-accent-mint flex items-center justify-center text-white text-2xl font-mono mb-4">
              {client.avatar}
            </div>

            <h3 className="text-lg font-display font-semibold text-text-hi mb-1">{client.name}</h3>
            <p className="text-text-mid text-sm mb-3">{client.title}</p>

            <p className="text-text-mid text-sm mb-4 line-clamp-2">{client.description}</p>

            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              client.status === 'Active' ? 'bg-accent-mint/20 text-accent-mint' : 'bg-accent-amber/20 text-accent-amber'
            }`}>
              {client.status}
            </span>

            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => navigate('/admin/chat')}
                className="flex-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium focus-ring"
              >
                Chat
              </button>
              <button 
                onClick={() => setViewClient(client)}
                className="flex-1 px-3 py-1.5 border border-border-soft rounded-lg text-sm font-medium focus-ring hover:bg-bg-app"
              >
                Profile
              </button>
            </div>
          </motion.div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-8 text-text-mid">No clients found</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border-soft rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-display font-semibold text-text-hi mb-4">
              {editingClient ? 'Edit Client' : 'Add Client'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-body text-text-low mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-soft rounded focus-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-body text-text-low mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border-soft rounded focus-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-body text-text-low mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border-soft rounded focus-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-body text-text-low mb-1">Phone</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-border-soft rounded focus-ring text-sm"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-body text-text-low mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border-soft rounded focus-ring text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-body text-text-low mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border-soft rounded focus-ring text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveClient}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 transition-colors focus-ring"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowModal(false); setEditingClient(null) }}
                  className="px-4 py-2 border border-border-soft rounded text-sm focus-ring"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Client Modal */}
      {viewClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent-mint flex items-center justify-center text-white text-2xl font-mono">
                    {viewClient.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-text-hi">{viewClient.name}</h2>
                    <p className="text-text-mid text-sm flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {viewClient.title}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  viewClient.status === 'Active' ? 'bg-accent-mint/10 text-accent-mint' : 'bg-text-low/10 text-text-low'
                }`}>
                  {viewClient.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-bg-app p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shadow-sm">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-text-low uppercase tracking-wider">Email</div>
                      <div className="text-text-hi text-sm font-medium">{viewClient.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shadow-sm">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-text-low uppercase tracking-wider">Phone</div>
                      <div className="text-text-hi text-sm font-medium">{viewClient.phone}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text-hi mb-2">Description</h3>
                  <p className="text-sm text-text-mid bg-bg-app p-3 rounded-lg leading-relaxed">
                    {viewClient.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setViewClient(null)}
                  className="w-full px-4 py-2 border border-border-soft rounded-lg text-sm font-medium hover:bg-bg-app transition-colors focus-ring"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageShell>
  )
}