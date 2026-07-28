import { useEffect, useState } from 'react'
import { getAnalytics } from '../api'
import { Analytics, AppData } from '../types'

const TopSongs = ({ app }: { app: AppData }) => {
    const [data, setData] = useState<Analytics | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        getAnalytics(app).then(setData).catch(() => setError(true))
    }, [app])

    if (error) return <div className="empty error">Couldn't load station stats.</div>
    if (!data) return <div className="empty">Loading…</div>

    const top = Array.isArray(data.top_liked) ? data.top_liked : []

    return (
        <div className="list">
            <span className="section-label">Most liked</span>
            {top.length ? (
                top.map((it, i) => (
                    <div className="row" key={i}>
                        <span className={`rank ${i < 3 ? 'top' : ''}`}>{i + 1}</span>
                        <div className="meta">
                            <span className="t">{it.title || ''}</span>
                            <span className="s">{it.artist || ''}</span>
                        </div>
                        <div className="aside">
                            <span className="likes">♥ {it.count ?? 0}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="empty">No liked songs yet — be the first!</div>
            )}
        </div>
    )
}

export default TopSongs
