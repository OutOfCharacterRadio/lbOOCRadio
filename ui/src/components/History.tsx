import { useEffect, useState } from 'react'
import { getHistory } from '../api'
import { AppData, HistoryItem } from '../types'
import { fmtTime } from './Player'

const FALLBACK_ART = 'logo.png'

const relTime = (iso?: string) => {
    if (!iso) return ''
    const diff = (Date.now() - Date.parse(iso)) / 1000
    if (!isFinite(diff)) return ''
    if (diff < 90) return 'just now'
    if (diff < 3600) return `${Math.round(diff / 60)} min ago`
    if (diff < 86400) return `${Math.round(diff / 3600)} hr ago`
    return `${Math.round(diff / 86400)} d ago`
}

const History = ({ app }: { app: AppData }) => {
    const [items, setItems] = useState<HistoryItem[] | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        getHistory(app)
            .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
            .catch(() => setError(true))
    }, [app])

    if (error) return <div className="empty error">Couldn't load the play history.</div>
    if (!items) return <div className="empty">Loading…</div>
    if (!items.length) return <div className="empty">No songs played yet.</div>

    return (
        <div className="list">
            <span className="section-label">Recently played</span>
            {items.map((it, i) => (
                <div className="row" key={i}>
                    <img
                        className="thumb"
                        src={it.art || FALLBACK_ART}
                        alt=""
                        onError={(e) => {
                            const img = e.currentTarget
                            if (!img.src.endsWith(FALLBACK_ART)) img.src = FALLBACK_ART
                        }}
                    />
                    <div className="meta">
                        <span className="t">{it.title || ''}</span>
                        <span className="s">{it.artist || ''}</span>
                    </div>
                    <div className="aside">
                        {relTime(it.played_at)}
                        {it.duration ? <br /> : null}
                        {it.duration ? fmtTime(it.duration) : null}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default History
