import { useEffect, useState } from 'react'
import { getSchedule } from '../api'
import { AppData, ScheduleItem } from '../types'

const FALLBACK_ART = 'logo.png'

const dayLabel = (date: Date) => {
    const today = new Date()
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const diffDays = Math.round((target.getTime() - startOfToday.getTime()) / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'

    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

const timeLabel = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const recurringLabel = (type?: string) => {
    if (!type || type === 'none') return null

    return type.charAt(0).toUpperCase() + type.slice(1)
}

const Schedule = ({ app }: { app: AppData }) => {
    const [items, setItems] = useState<ScheduleItem[] | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        getSchedule(app)
            .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
            .catch(() => setError(true))
    }, [app])

    if (error) return <div className="empty error">Couldn't load the schedule.</div>
    if (!items) return <div className="empty">Loading…</div>

    const shows = items
        .map((item) => ({ item, date: item.start_time ? new Date(item.start_time) : null }))
        .filter((s): s is { item: ScheduleItem; date: Date } => !!s.date && !isNaN(s.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (!shows.length) return <div className="empty">No shows scheduled right now.</div>

    let lastDay = ''

    return (
        <div className="schedule">
            {shows.map(({ item, date }, index) => {
                const day = dayLabel(date)
                const showHeader = day !== lastDay
                lastDay = day

                const recurring = recurringLabel(item.recurring_type)

                return (
                    <div key={item.id || index}>
                        {showHeader && <span className="section-label">{day}</span>}
                        <div className="show">
                            <img
                                className="show-avatar"
                                src={item.presenter?.avatar_url || FALLBACK_ART}
                                alt=""
                                onError={(e) => {
                                    const img = e.currentTarget
                                    if (!img.src.endsWith(FALLBACK_ART)) img.src = FALLBACK_ART
                                }}
                            />
                            <div className="show-info">
                                <span className="show-title">{item.title || 'Untitled show'}</span>
                                <span className="show-meta">
                                    {timeLabel(date)}
                                    {item.presenter?.display_name ? ` · ${item.presenter.display_name}` : ''}
                                </span>
                                {item.description && <span className="show-desc">{item.description}</span>}
                            </div>
                            {recurring && <span className="show-recurring">{recurring}</span>}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Schedule
