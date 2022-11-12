const WebSocket = require('ws');
const config = require('./config.json');
const wss = new WebSocket.Server({ port: config.port, host: config.host }); // you can set port and hostname in config.json
const editJsonFile = require("edit-json-file");

const { log } = require('./utils/logger');
const { parsedData } = require("./utils/parsedData");
const { htmlEncode } = require('./utils/htmlEncode');
const { startAutoSubmitServer } = require('./utils/autoServerSubmitter');

const events = require('./events');

const cmdList = require('./db/commands.json');
const phrases = require('./db/randphrases.json');
const emojiList = require(config.emojiPath);
const strings = require(config.stringsPath); // you can translate strings in your language, see strings file path in config.json
let users = {}; // connected users, needn't to save locally (locally: for example, in JSON file)

wss.on('listening', async () => {
    log(`${strings.serverIsListening} ${config.protocol}${wss.address().address}:${wss.address().port}`);

    startAutoSubmitServer(wss.clients.size, wss);
});

wss.on('connection', async (ws, req) => {
    log(`${strings.connFrom} ${req.socket.remoteAddress}`);

    ws.on('message', async (data) => {
        if (parsedData(data).type === 'heartbeat') // it's required to keep connection on client alive
            return;

        switch (parsedData(data).type) {
            case 'plupdate':  // client is requesting member count update
                await events.onPlUpdate(wss, ws, htmlEncode, strings, config, data, parsedData, users, req);
                break;

            case 'srvupdate': // client is requesting servers list update
                // sending servers
                await events.onServerUpdate(ws, editJsonFile, config, parsedData, data);
                break;

            case 'emojihtml':
                await events.onHTMLEmoji(wss, ws, htmlEncode, parsedData, data);
                break;

            case 'msg': // new message
                await events.onMessage(ws, wss, parsedData, data, config, editJsonFile, log, req, htmlEncode);
                break;

            // client is requesting all server's emoji
            case 'emojisupdate':
                await events.onEmojiUpdate(ws, data, emojiList, parsedData);
                break;

            // slash commands
            case 'chatcmd':
                await events.onChatCommand(parsedData, data, ws, config, strings, users, wss, cmdList);
                break;

            case 'file':
                await events.onFile(ws, htmlEncode, parsedData, data);
                break;

            default:
                if (ws.bufferedAmount === 0)
                    ws.send(JSON.stringify({
                        type: 'err',
                        err: true,
                        msg: `Unknown type "${parsedData(data).type}", available types: msg, srvupdate, plupdate, newsrv, heartbeat, chatcmd, stickerhtml, file`
                    }));
                break;
        }

        if (config.service.fullLogging) { // will log all info (messages, member count updates etc.)
            let file = editJsonFile(config.logfilePath);
            file.set(Date.now().toString(), { data: parsedData(data), time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}` });
            file.save();
        }
    });

    if (config.service.randPhrases) {
        // sends random phrase from ./db/randphrases.json 
        // every X ms (see "randPhrasesInterval" at ./config.json)
        setInterval(() => {
            if (ws.bufferedAmount === 0)
                ws.send(JSON.stringify({
                    author: config.service.name,
                    msg: phrases[Math.floor(Math.random() * phrases.length)],
                    type: 'msg',
                    time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                    badge: config.service.badge,
                    pcount: wss.clients.size
                }));
        }, config.service.randPhraseInterval);
    }
});

// doesn't work for some reason
wss.on('close', function close(ws, req) {
    console.log('disconnected');
    delete users[req.socket.remoteAddress];
});