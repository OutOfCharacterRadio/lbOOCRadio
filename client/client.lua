while GetResourceState("lb-phone") ~= "started" do
    Wait(500)
end

Wait(1000) -- wait for the AddCustomApp export to exist

local url = GetResourceMetadata(GetCurrentResourceName(), "ui_page", 0)

local function AddApp()
    local added, errorMessage = exports["lb-phone"]:AddCustomApp({
        identifier = Config.Identifier,

        name = Config.Name,
        description = Config.Description,
        developer = Config.Developer,

        defaultApp = Config.DefaultApp,
        size = 24576,
        price = Config.Price,

        ui = url:find("http") and url or GetCurrentResourceName() .. "/" .. url,
        icon = url:find("http") and url .. "/public/icon.svg" or "https://cfx-nui-" .. GetCurrentResourceName() .. "/ui/dist/icon.svg",

        fixBlur = true
    })

    if not added then
        print("Could not add app:", errorMessage)
    end
end

AddApp()

AddEventHandler("onResourceStart", function(resource)
    if resource == "lb-phone" then
        AddApp()
    end
end)

-- The UI reads station data from the OOC Radio API directly (CORS is open);
-- it only needs the config from the resource.
RegisterNUICallback("getAppData", function(data, cb)
    cb({
        streamUrl = Config.StreamUrl,
        apiBase = Config.ApiBase
    })
end)

-- Requests/shoutouts go through the game server (like the OOCRadioLoader
-- commands) so the player's name and the server name are attached. The server
-- answers with oocradio:requestResult, forwarded to the UI as an app message.
RegisterNUICallback("submitRequest", function(data, cb)
    TriggerServerEvent("oocradio:submitRequest", data)
    cb("ok")
end)

RegisterNetEvent("oocradio:requestResult", function(result)
    exports["lb-phone"]:SendCustomAppMessage(Config.Identifier, {
        action = "requestResult",
        data = result
    })
end)
