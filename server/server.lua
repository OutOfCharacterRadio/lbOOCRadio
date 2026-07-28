-- Song requests & shoutouts are sent from the game server, matching the
-- OOCRadioLoader resource: display_name is the player's name, server_name is
-- the community name (or sv_hostname), source tags it as coming from FiveM.

local endpoint = Config.ApiBase .. "/public-requests"

local function postRequest(src, requestType, message)
    local displayName = GetPlayerName(src)

    if not displayName or displayName == "" then
        displayName = "Player"
    end

    local serverName = Config.ServerName

    if not serverName or serverName == "" then
        serverName = GetConvar("sv_hostname", "FiveM Server")
    end

    local body = json.encode({
        type = requestType,
        message = message,
        display_name = displayName:sub(1, 50),
        server_name = serverName:sub(1, 100),
        source = Config.RequestSource
    })

    local headers = { ["Content-Type"] = "application/json" }

    local function reply(success, text)
        TriggerClientEvent("oocradio:requestResult", src, {
            success = success,
            message = text
        })
    end

    PerformHttpRequest(endpoint, function(statusCode, responseText)
        if statusCode >= 200 and statusCode < 300 then
            reply(true, requestType == "song" and "Request sent!" or "Shoutout sent!")
        elseif statusCode == 403 then
            reply(false, "Presenter is not live.")
        elseif statusCode >= 500 or statusCode == 0 then
            reply(false, "Could not reach OOC Radio.")
        else
            local errorText

            if responseText then
                local ok, decoded = pcall(json.decode, responseText)

                if ok and type(decoded) == "table" and type(decoded.error) == "string" then
                    errorText = decoded.error
                end
            end

            reply(false, errorText or ("Request failed (%s)."):format(tostring(statusCode)))
        end
    end, "POST", body, headers)
end

RegisterNetEvent("oocradio:submitRequest", function(data)
    local src = source

    if type(data) ~= "table" or type(data.message) ~= "string" then
        return
    end

    local requestType = data.type == "shoutout" and "shoutout" or "song"
    local message = data.message:sub(1, 500):gsub("[\r\n]+", " ")

    if message:gsub("%s", "") == "" then
        return
    end

    postRequest(src, requestType, message)
end)
