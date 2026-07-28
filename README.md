# OOC Radio — LB Phone App

The official OOC Radio (oocradio.com) app for LB Phone on FiveM. "Off the RP, on the air."

- **Listen** — the live stream from `radio.oocradio.com` with album art, live/AutoDJ badge, listener count, track progress and volume. When a DJ is live you'll see who's in the booth and can send a song request or shoutout straight to the station.
- **History** — the last songs played on air.
- **Top Songs** — the station's most-liked tracks.
- **Schedule** — upcoming shows straight from the station's schedule, shown in the player's local time.

Station data (now playing, live status, history, top songs, schedule) comes live from the public OOC Radio API (`api.oocradio.com/v1`, open CORS), fetched directly by the phone UI. Requests/shoutouts are sent by the **game server** — the same way the OOCRadioLoader `/requestsong` and `/shoutout` commands do it — with the player's name as `display_name`, the community name (or `sv_hostname`) as `server_name`, and `source: "FiveM"`. They're only accepted while a DJ is live (403 during AutoDJ shows "Presenter is not live."), so the request button only appears during live shows.

## Installation

The UI comes pre-built in `ui/dist` — no build step needed.

1. Drop the `lbOOCRadio` folder into your server's `resources` directory.
2. Add `ensure lbOOCRadio` to your `server.cfg`, **after** `ensure lb-phone`.

## Configuration (`config.lua`)

- `Config.ServerName` — set this to your FiveM server's name; it's attached to song requests so OOC Radio staff can see where they came from.
- Stream/API URLs are preset for OOC Radio and shouldn't need changing.

## Rebuilding the UI (developers only)

Only needed if you change the source in `ui/src`:

1. Install [Node.js](https://nodejs.org/en/download)
2. In the `ui` folder: `npm install`, then `npm run build` → output lands in `ui/dist`

## Previewing without a server

Run `npm run dev` in the `ui` folder and open `http://localhost:3000`. Because the OOC Radio API has open CORS, the browser preview is fully live: real stream audio, real now-playing/history/top-songs/schedule data, and real request submission.
