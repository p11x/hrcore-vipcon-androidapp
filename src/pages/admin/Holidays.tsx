import { PageShell } from '../../components/PageShell'
import { motion } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'
import { useState, useEffect } from 'react'
import { hrToast } from '../../components/HRCToast'
import { getDatabase } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'

interface HolidayEvent {
  id: string
  date: string
  name: string
  type: 'national' | 'optional' | 'observance'
}

export function Holidays() {
  const { tenantId } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [holidays, setHolidays] = useState<HolidayEvent[]>([])
  const [holidayName, setHolidayName] = useState('')
  const [holidayDate, setHolidayDate] = useState('')
  const [holidayType, setHolidayType] = useState<'national' | 'optional' | 'observance'>('national')

  useEffect(() => {
    if (!tenantId) return
    let unsub: (() => void) | null = null
    getDatabase().then((db: any) => {
      unsub = db.onValue(`tenants/${tenantId}/holidays`, (snapshot: any) => {
        const data = snapshot.val() as Record<string, Omit<HolidayEvent, 'id'>> | undefined
        if (data) {
          setHolidays(Object.entries(data).map(([id, h]) => ({ ...h, id } as HolidayEvent)))
        } else {
          setHolidays([])
        }
      })
    })
    return () => { if (unsub) unsub() }
  }, [tenantId])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const today = format(new Date(), 'yyyy-MM-dd')

  const getHolidayTypeColor = (type: string) => {
    switch (type) {
      case 'national':
        return 'bg-accent-mint'
      case 'optional':
        return 'bg-accent-amber'
      case 'observance':
        return 'bg-accent-coral'
      default:
        return 'bg-primary'
    }
  }

  const handleAddHoliday = async () => {
    if (!holidayDate || !holidayName.trim() || !tenantId) return
    const db = await getDatabase()
    const newHoliday: HolidayEvent = {
      id: `hol-${Date.now()}`,
      date: holidayDate,
      name: holidayName,
      type: holidayType,
    }
    await (db as any).set(`tenants/${tenantId}/holidays/${newHoliday.id}`, newHoliday)
    hrToast.success('Holiday Added', 'Holiday event created successfully')
    setHolidayName('')
    setHolidayDate('')
  }

  return (
    <PageShell title="Holidays">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-display font-semibold text-text-hi whitespace-nowrap">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-2 rounded-lg border border-border-soft hover:bg-bg-app transition-colors focus-ring"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium focus-ring"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-2 rounded-lg border border-border-soft hover:bg-bg-app transition-colors focus-ring"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 focus-ring text-sm self-end lg:self-auto">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="bg-surface border border-border-soft rounded-xl p-6 mb-6">
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-text-low font-mono text-xs py-2">
              {d}
            </div>
          ))}

          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const holiday = holidays.find((h) => h.date === dateStr)
            const isToday = dateStr === today

            return (
              <motion.div
                key={dateStr}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border font-mono text-sm relative p-1 ${
                  isToday ? 'bg-primary-dim' : 'bg-surface border-border-soft'
                }`}
                whileHover={{ scale: holiday ? 1.05 : 1.02 }}
              >
                <span className={isToday ? 'text-primary font-medium' : 'text-text-hi'}>{format(day, 'd')}</span>
                {holiday && (
                  <div className={`w-full h-1.5 rounded-full mt-1 ${getHolidayTypeColor(holiday.type)}`} />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="bg-surface border border-border-soft rounded-xl p-6">
        <h3 className="text-lg font-display font-semibold text-text-hi mb-4">Add Holiday</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="px-3 py-2 bg-surface border border-border-soft rounded-lg text-sm focus-ring"
          />
          <input
            type="text"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            className="px-3 py-2 bg-surface border border-border-soft rounded-lg text-sm focus-ring"
            placeholder="Holiday name"
          />
          <select
            value={holidayType}
            onChange={(e) => setHolidayType(e.target.value as any)}
            className="px-3 py-2 bg-surface border border-border-soft rounded-lg text-sm focus-ring"
          >
            <option value="national">National</option>
            <option value="optional">Optional</option>
            <option value="observance">Observance</option>
          </select>
          <button
            onClick={handleAddHoliday}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium focus-ring text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </PageShell>
  )
}