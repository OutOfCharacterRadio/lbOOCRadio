Config = {}

-- App identity
Config.Identifier = "oocradio"
Config.Name = "OOC Radio"
Config.Description = "Off the RP, on the air. Listen live, see what's playing and send requests."
Config.Developer = "OOC Radio"
Config.DefaultApp = false -- true = installed by default and can't be uninstalled
-- Config.Price = 0 -- uncomment to make players buy the app with in-game money

-- Stream & API (these should not need changing)
Config.StreamUrl = "https://radio.oocradio.com/"
Config.ApiBase = "https://api.oocradio.com/v1"

-- Sent with song requests so OOC Radio staff can see where they came from.
-- Requests are sent from the game server with the player's name attached
-- (same as the OOCRadioLoader /requestsong and /shoutout commands).
Config.RequestSource = "FiveM"
Config.ServerName = "" -- your community name; if empty, sv_hostname is used
