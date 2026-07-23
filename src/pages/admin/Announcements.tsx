import { PageShell } from '../../components/PageShell'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { announcementSchema } from '../../lib/validators'
import type { AnnouncementFormData } from '../../lib/validators'
import { motion } from 'framer-motion'
import { Plus, Megaphone } from 'lucide-react'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

export function Announcements() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  })

  const announcements: Announcement[] = useMock
    ? [
        { id: 'ann-001', title: 'Office Closure', content: 'Dec 25th is a holiday', priority: 'high', createdAt: '2024-01-10' },
        { id: 'ann-002', title: 'Team Lunch', content: 'Friday team lunch at 1pm', priority: 'medium', createdAt: '2024-01-05' },
      ]
    : [
        { id: '1', title: 'Office Closure', content: 'Dec 25th is a holiday', priority: 'high', createdAt: '2024-01-10' },
      ]

const onSubmit = async (_data: AnnouncementFormData) => {}

  return (
    <PageShell title="Announcements">
      <div className="w-full">
        <motion.div
          className="w-full bg-surface border border-border-soft rounded-xl p-6 mb-8 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-hi">
              New Announcement
            </h3>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-2">
                Title
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 bg-bg-app border border-border-soft rounded text-text-hi focus:outline-none focus:border-primary transition-colors focus-ring"
                placeholder="Announcement title"
              />
              {errors.title && (
                <p className="text-primary text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-mid mb-2">
                Content
              </label>
              <textarea
                {...register('content')}
                rows={3}
                className="w-full px-3 py-2 bg-bg-app border border-border-soft rounded text-text-hi focus:outline-none focus:border-primary transition-colors focus-ring"
                placeholder="Announcement content"
              />
              {errors.content && (
                <p className="text-primary text-sm mt-1">{errors.content.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary-dim transition-colors disabled:opacity-50 flex items-center gap-2 focus-ring"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        </motion.div>

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="p-4 text-text-mid font-body">
              No announcements. Create one above.
            </div>
          ) : (
            announcements.map((a) => (
              <motion.div
                key={a.id}
                className="bg-surface border border-border-soft rounded-lg p-4"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-3">
                  <Megaphone className="w-5 h-5 text-text-mid mt-0.5" />
                  <div className="flex-1">
                    <div className="text-text-hi font-body">{a.title}</div>
                    <div className="text-text-mid text-sm mt-1">{a.content}</div>
                    <div className="text-text-low font-mono text-xs mt-2">{a.createdAt}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    a.priority === 'high' ? 'text-primary' :
                    a.priority === 'medium' ? 'text-accent-amber' : 'text-accent-mint'
                  }`}>
                    {a.priority}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  )
}