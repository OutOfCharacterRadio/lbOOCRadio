import { AppData } from './types'

export const devMode = !window?.['invokeNative']

// How long to wait for the resource's NUI callback before giving up and using
// the fallback — keeps the app usable even if the callback never answers.
const NUI_TIMEOUT_MS = 3000

// In-game the app is served from https://cfx-nui-<resource>/ui/dist/, so our
// own NUI callbacks live on window.location.origin — we call them directly
// (the standard FiveM NUI fetch) instead of going through LB Phone's injected
// fetchNui wrapper, whose behavior differs between phone versions. Same-origin,
// so it's also unaffected by FiveM's NUI callback strict mode.
//
// In a normal browser we fall back to mock data — the OOC Radio API itself has
// open CORS, so everything except the resource config works for real in the
// browser preview.
//
// The fallback is also used in-game if the NUI callback errors or times out:
// the error is logged (visible in the CEF devtools / F8 console) and the app
// continues with the fallback instead of sitting on its loading screen forever.
export function nuiFetch<T>(event: string, data?: unknown, fallback?: T): Promise<T> {
    if (devMode) return Promise.resolve(fallback as T)

    return new Promise<T>((resolve) => {
        let settled = false

        const settle = (value: T, error?: unknown) => {
            if (settled) return
            settled = true

            if (error !== undefined) {
                console.error(`[OOC Radio] NUI callback "${event}" failed, using fallback:`, error)
            }

            resolve(value)
        }

        setTimeout(() => settle(fallback as T, `no response after ${NUI_TIMEOUT_MS}ms`), NUI_TIMEOUT_MS)

        fetch(`${window.location.origin}/${event}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data ?? {})
        })
            .then((resp) => resp.json())
            .then((value: T) => settle(value))
            .catch((error: unknown) => settle(fallback as T, error ?? 'rejected'))
    })
}

export function onAppMessage<T>(action: string, cb: (data: T) => void) {
    if (devMode || typeof useNuiEvent !== 'function') return

    useNuiEvent<T>(action, cb)
}

// The production stream/API URLs. Used as mock data in the browser preview and
// as the in-game fallback when the getAppData NUI callback is unavailable.
export const DEFAULT_APP_DATA: AppData = {
    streamUrl: 'https://radio.oocradio.com/',
    apiBase: 'https://api.oocradio.com/v1'
}
