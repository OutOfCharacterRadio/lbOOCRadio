import { Analytics, AppData, HistoryItem, LiveStatus, NowPlaying, ScheduleItem } from './types'

async function apiGet<T>(app: AppData, path: string): Promise<T> {
    const resp = await fetch(app.apiBase + path)

    if (!resp.ok) throw new Error(`${path} returned ${resp.status}`)

    return (await resp.json()) as T
}

export const getNowPlaying = (app: AppData) => apiGet<NowPlaying>(app, '/public-now-playing')

export const getLiveStatus = async (app: AppData): Promise<{ isLive: boolean; presenter?: LiveStatus['presenter'] }> => {
    const status = await apiGet<LiveStatus>(app, '/public-live-status')

    return { isLive: !!(status.is_live ?? status.live), presenter: status.presenter }
}

export const getHistory = (app: AppData) => apiGet<{ items?: HistoryItem[] }>(app, '/public-history')

export const getAnalytics = (app: AppData) => apiGet<Analytics>(app, '/public-analytics')

export const getSchedule = (app: AppData) => apiGet<{ items?: ScheduleItem[] }>(app, '/public-schedule')

// Browser-preview only: in-game, requests go through the game server so the
// player's name and the server name are attached (see server/server.lua).
export async function submitRequestDirect(
    app: AppData,
    type: 'song' | 'shoutout',
    message: string
): Promise<{ ok: boolean; error?: string }> {
    const body = {
        type,
        message,
        display_name: 'Browser Preview',
        server_name: 'Browser Preview',
        source: 'FiveM'
    }

    try {
        const resp = await fetch(app.apiBase + '/public-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await resp.json().catch(() => null)

        if (resp.ok) return { ok: true }
        if (resp.status === 403) return { ok: false, error: 'Presenter is not live.' }

        return { ok: false, error: data?.error || `Request failed (${resp.status})` }
    } catch {
        return { ok: false, error: 'Could not reach OOC Radio.' }
    }
}
