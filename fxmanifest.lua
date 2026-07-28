fx_version "cerulean"
game "gta5"

title "OOC Radio"
description "OOC Radio app for LB Phone - live player, history, top songs & requests"
author "OOC Radio"
version "1.0.0"

shared_script "config.lua"
client_script "client/**.lua"
server_script "server/**.lua"

file "ui/dist/**/*"

ui_page "ui/dist/index.html"
-- ui_page "http://localhost:3000/" -- swap with the line above while developing the UI (npm run dev)
