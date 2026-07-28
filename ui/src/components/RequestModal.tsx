import { useEffect, useState } from 'react'
import { submitRequestDirect } from '../api'
import { devMode, nuiFetch } from '../nui'
import { AppData, RequestResult } from '../types'

// The request is sent by the game server with the player's name and the
// server name attached — no name field needed here.
const RequestModal = ({ app, result, close }: { app: AppData; result: RequestResult | null; close: () => void }) => {
    const [mode, setMode] = useState<'song' | 'shout'>('song')
    const [artist, setArtist] = useState('')
    const [title, setTitle] = useState('')
    const [shoutMsg, setShoutMsg] = useState('')
    const [status, setStatus] = useState<{ text: string; cls: 'ok' | 'err' | '' }>({ text: '', cls: '' })
    const [sending, setSending] = useState(false)

    // In-game the result arrives asynchronously from the server
    useEffect(() => {
        if (!result || !sending) return

        setSending(false)

        if (result.success) {
            setStatus({ text: mode === 'song' ? 'Request sent! 🎶' : 'Shoutout sent! 📣', cls: 'ok' })
            if (mode === 'song') {
                setArtist('')
                setTitle('')
            } else {
                setShoutMsg('')
            }
            setTimeout(close, 1200)
        } else {
            setStatus({ text: result.message || 'Something went wrong.', cls: 'err' })
        }
    }, [result])

    const send = async () => {
        if (sending) return

        let type: 'song' | 'shoutout'
        let message: string

        if (mode === 'song') {
            if (!artist.trim() || !title.trim()) {
                setStatus({ text: 'Please fill in the artist and song title.', cls: 'err' })
                return
            }
            type = 'song'
            message = `${artist.trim()} - ${title.trim()}`
        } else {
            if (!shoutMsg.trim()) {
                setStatus({ text: 'Write a shoutout first.', cls: 'err' })
                return
            }
            type = 'shoutout'
            message = shoutMsg.trim()
        }

        setSending(true)
        setStatus({ text: 'Sending…', cls: '' })

        if (devMode) {
            const res = await submitRequestDirect(app, type, message)

            setSending(false)

            if (res.ok) {
                setStatus({ text: type === 'song' ? 'Request sent! 🎶' : 'Shoutout sent! 📣', cls: 'ok' })
                setTimeout(close, 1200)
            } else {
                setStatus({ text: res.error || 'Something went wrong.', cls: 'err' })
            }
            return
        }

        nuiFetch('submitRequest', { type, message })
    }

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="modal">
                <div className="modal-tabs">
                    <button className={mode === 'song' ? 'active' : ''} onClick={() => setMode('song')}>
                        Song request
                    </button>
                    <button className={mode === 'shout' ? 'active' : ''} onClick={() => setMode('shout')}>
                        Shoutout
                    </button>
                </div>

                {mode === 'song' ? (
                    <>
                        <input placeholder="Artist" maxLength={120} value={artist} onChange={(e) => setArtist(e.target.value)} />
                        <input placeholder="Song title" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
                    </>
                ) : (
                    <textarea placeholder="Your shoutout…" maxLength={450} rows={4} value={shoutMsg} onChange={(e) => setShoutMsg(e.target.value)} />
                )}

                <div className={`modal-status ${status.cls}`}>{status.text}</div>

                <div className="modal-actions">
                    <button className="modal-cancel" onClick={close}>
                        Cancel
                    </button>
                    <button className="btn-primary" disabled={sending} onClick={send}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RequestModal
