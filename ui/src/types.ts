export type AppData = {
    streamUrl: string
    apiBase: string
}

export type RequestResult = {
    success: boolean
    message: string
}

// GET /public-now-playing
export type NowPlaying = {
    title?: string
    artist?: string
    album?: string
    art?: string
    spotify_track_id?: string | null
    started_at?: string
    duration?: number
    listeners?: number
}

// GET /public-live-status
export type LiveStatus = {
    is_live?: boolean
    live?: boolean
    presenter?: {
        display_name?: string
        avatar_url?: string
    } | null
    started_at?: string
}

// GET /public-history
export type HistoryItem = {
    title?: string
    artist?: string
    album?: string
    art?: string
    played_at?: string
    duration?: number
}

// GET /public-analytics
export type Analytics = {
    top_liked?: {
        title?: string
        artist?: string
        count?: number
    }[]
}

// GET /public-schedule
export type ScheduleItem = {
    id?: string
    title?: string
    description?: string
    start_time?: string
    recurring_type?: string
    presenter?: {
        display_name?: string
        avatar_url?: string
    } | null
}
