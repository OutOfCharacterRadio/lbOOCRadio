import { useEffect, useRef, useState } from 'react'
import { getLiveStatus, getNowPlaying } from '../api'
import { onAppMessage } from '../nui'
import { AppData, LiveStatus, NowPlaying, RequestResult } from '../types'
import RequestModal from './RequestModal'

const NP_POLL_MS = 15000
const LIVE_POLL_MS = 30000
const FALLBACK_ART = 'logo.png'
// Playing right at the live edge stutters on network hiccups — let the stream
// pre-load this long before starting playback so there's a cushion of buffered audio
const PRE_BUFFER_MS = 1000

export const fmtTime = (sec?: number) => {
    if (!sec || !isFinite(sec) || sec < 0) sec = 0
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
}

const Player = ({ app }: { app: AppData }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const preBufferTimer = useRef<number | null>(null)
    const [np, setNp] = useState<NowPlaying | null>(null)
    const [live, setLive] = useState<{ isLive: boolean; presenter?: LiveStatus['presenter'] }>({ isLive: false })
    const [offline, setOffline] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [buffering, setBuffering] = useState(false)
    const [streamError, setStreamError] = useState(false)
    const [volume, setVolume] = useState(() => {
        const saved = parseInt(localStorage.getItem('ooc_volume') ?? '80', 10)
        return isNaN(saved) ? 80 : saved
    })
    const [elapsed, setElapsed] = useState(0)
    const [modalOpen, setModalOpen] = useState(false)
    const [requestResult, setRequestResult] = useState<RequestResult | null>(null)

    useEffect(() => {
        onAppMessage<RequestResult>('requestResult', setRequestResult)
    }, [])

    // ---------- polling ----------
    useEffect(() => {
        const pollNp = () =>
            getNowPlaying(app)
                .then((data) => {
                    setNp(data)
                    setOffline(false)
                })
                .catch(() => setOffline(true))
        const pollLive = () => getLiveStatus(app).then(setLive).catch(() => {})

        pollNp()
        pollLive()

        const npInterval = setInterval(pollNp, NP_POLL_MS)
        const liveInterval = setInterval(pollLive, LIVE_POLL_MS)

        return () => {
            clearInterval(npInterval)
            clearInterval(liveInterval)
        }
    }, [app])

    // ---------- progress ----------
    useEffect(() => {
        if (!np?.duration || !np.started_at) return

        const startedAt = Date.parse(np.started_at)
        if (isNaN(startedAt)) return

        const tick = () => setElapsed(Math.min((Date.now() - startedAt) / 1000, np.duration!))

        tick()
        const interval = setInterval(tick, 1000)

        return () => clearInterval(interval)
    }, [np?.started_at, np?.duration])

    // ---------- audio ----------
    const clearPreBuffer = () => {
        if (preBufferTimer.current !== null) {
            clearTimeout(preBufferTimer.current)
            preBufferTimer.current = null
        }
    }

    const getAudio = () => {
        if (!audioRef.current) {
            const audio = new Audio()
            audio.preload = 'auto'

            audio.onplaying = () => {
                setBuffering(false)
                setPlaying(true)
            }
            audio.onpause = () => setPlaying(false)
            audio.onwaiting = () => setBuffering(true)
            audio.onerror = () => {
                clearPreBuffer()
                setBuffering(false)
                setPlaying(false)
                setStreamError(true)
            }

            audioRef.current = audio
        }

        return audioRef.current
    }

    useEffect(() => {
        return () => {
            clearPreBuffer()
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ''
            }
        }
    }, [])

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = Math.pow(volume / 100, 2) // perceptual curve
        localStorage.setItem('ooc_volume', String(volume))
    }, [volume])

    const togglePlayback = () => {
        const audio = getAudio()

        setStreamError(false)

        if (playing || preBufferTimer.current !== null) {
            // Live stream: stop fully so we rejoin live (not a stale buffer) on next play
            clearPreBuffer()
            audio.pause()
            audio.src = ''
            setBuffering(false)
        } else {
            setBuffering(true)
            audio.src = app.streamUrl
            audio.volume = Math.pow(volume / 100, 2)
            audio.load()
            preBufferTimer.current = window.setTimeout(() => {
                preBufferTimer.current = null
                audio.play().catch(() => {
                    setBuffering(false)
                    setStreamError(true)
                })
            }, PRE_BUFFER_MS)
        }
    }

    const hasDuration = !!(np?.duration && np.started_at && !isNaN(Date.parse(np.started_at)))
    const progressPct = hasDuration ? Math.min((elapsed / np!.duration!) * 100, 100) : 100

    return (
        <div className="player">
            <div className="status-row">
                <span className={`badge ${live.isLive ? 'live' : 'autodj'}`}>{live.isLive ? '● LIVE' : 'AutoDJ'}</span>
                <span className="listeners">
                    <ListenerIcon />
                    {np?.listeners ?? '–'}
                </span>
            </div>

            <div className="art-wrap">
                <img
                    className="art"
                    src={np?.art || FALLBACK_ART}
                    alt=""
                    onError={(e) => {
                        const img = e.currentTarget
                        if (!img.src.endsWith(FALLBACK_ART)) img.src = FALLBACK_ART
                    }}
                />
                <div className="art-glow" />
            </div>

            <div className="track">
                <span className="track-title">{offline ? 'OOC Radio' : np?.title || 'OOC Radio'}</span>
                <span className="track-artist">{offline ? 'Station unreachable' : np?.artist || 'Off the RP, on the air'}</span>
                <span className="track-album">{np?.album || ' '}</span>
            </div>

            <div className="progress">
                <span>{hasDuration ? fmtTime(elapsed) : 'LIVE'}</span>
                <div className="bar">
                    <div className="bar-fill" style={{ width: `${progressPct}%`, opacity: hasDuration ? 1 : 0.3 }} />
                </div>
                <span>{hasDuration ? fmtTime(np!.duration) : '∞'}</span>
            </div>

            <div className="controls">
                <button className="play-button" onClick={togglePlayback}>
                    {buffering ? <span className="spinner" /> : playing ? <StopIcon /> : <PlayIcon />}
                </button>
                <div className="volume-row">
                    <VolumeIcon muted={volume === 0} />
                    <input
                        className="volume-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                    />
                </div>
            </div>

            {streamError && <div className="stream-error">Couldn't play the stream — try again in a moment.</div>}

            {live.isLive && live.presenter?.display_name && (
                <div className="live-presenter">
                    <span className="dot" />
                    {live.presenter.avatar_url && <img src={live.presenter.avatar_url} alt="" />}
                    <span>
                        <strong>{live.presenter.display_name}</strong> is live in the booth
                    </span>
                </div>
            )}

            {live.isLive && (
                <button
                    className="request-open"
                    onClick={() => {
                        setRequestResult(null)
                        setModalOpen(true)
                    }}
                >
                    📨 Request a song or send a shoutout
                </button>
            )}

            {modalOpen && <RequestModal app={app} result={requestResult} close={() => setModalOpen(false)} />}
        </div>
    )
}

const PlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
)

const StopIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6z" />
    </svg>
)

const ListenerIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.7 0 4.8-2.2 4.8-4.8S14.7 2.4 12 2.4 7.2 4.6 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
)

const VolumeIcon = ({ muted }: { muted: boolean }) => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3z" />
        {!muted && <path d="M16.5 12A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z" />}
    </svg>
)

export default Player
