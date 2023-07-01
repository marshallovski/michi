const WebSocket = require('ws');
const config = require('./config.json');

// you can set port and hostname in config.json
const wss = new WebSocket.Server({ port: config.port, host: config.host });
const editJsonFile = require("edit-json-file");

const { log } = require('./utils/logger');
const { parsedData } = require("./utils/parsedData");
const { escapeHTML } = require('./utils/escapeHTML');

const events = require('./events');

const cmdList = require('./db/commands.json');
const phrases = require('./db/randphrases.json');
const emojiList = require(config.emojiPath);

// you can translate strings in your language, see strings file path in config.json
const strings = require(config.stringsPath);

// connected users, needn't to save locally (locally: for example, in JSON file)
let users = {};

wss.on('listening', async () => {
    log(`${strings.serverIsListening} ${config.protocol}${wss.address().address}:${wss.address().port}`);
});

wss.on('connection', async (ws, req) => {
    log(`${strings.connFrom} ${req.socket.remoteAddress}`);

    ws.on('message', async (data) => {
        // it's required to keep connection on client alive
        if (parsedData(data).type === 'heartbeat')
            return;

        switch (parsedData(data).type) {
            case 'plupdate':  // client is requesting member count update
                await events.onPlUpdate(wss, ws, escapeHTML, strings, config, data, parsedData, users, req);
                break;

            case 'srvupdate': // client is requesting servers list update
                // sending servers
                await events.onServerUpdate(ws, editJsonFile, config, parsedData, data);
                break;

            case 'emojihtml':
                await events.onHTMLEmoji(wss, ws, escapeHTML, parsedData, data);
                break;

            case 'msg': // new message
                await events.onMessage(ws, wss, parsedData, data, config, editJsonFile, log, req, escapeHTML);
                break;

            // client is requesting all server's emoji
            case 'emojisupdate':
                await events.onEmojiUpdate(ws, data, emojiList, parsedData);
                break;

            // slash commands
            case 'chatcmd':
                await events.onChatCommand(parsedData, data, ws, config, strings, users, wss, cmdList);
                break;

            // client sended a file
            case 'file':
                await events.onFile(ws, wss, escapeHTML, parsedData, data, config);
                break;

            case 'deletemsg':
                await events.onDeleteMessage(ws, wss, parsedData, data);
                break;

            case 'limits':
                ws.send(JSON.stringify({
                    type: 'limits',
                    limits: {
                        maxFileSize: config.service.fileUpload.maxFileSize,
                        maxMessageLength: config.service.maxMsgLength
                    }
                }));
                break;

            // case 'editmsg':
            //     await events.onEditMessage(ws, parsedData, data);
            //     break;

            default:
                if (ws.bufferedAmount === 0)
                    ws.send(JSON.stringify({
                        type: 'err',
                        err: true,
                        msg: `Unknown type "${parsedData(data).type}", available types: msg, srvupdate, plupdate, newsrv, heartbeat, chatcmd, stickerhtml, file, editmsg, deletemsg`
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
                    textMessage: true,
                    time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                    badge: config.service.badge,
                    pcount: wss.clients.size
                }));
        }, config.service.randPhraseInterval);
    }
});

// file upload server
const http = require('http');
const url = require('url');
var mime = require('mime');

http.createServer((req, res) => {
    const q = url.parse(req.url, true).query;
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/uploads/' && q.fileName) {
        const fileContent = require('fs').readFileSync(`${config.service.fileUpload.userUploadsFolder}/${q.fileName}`);
        const fileMimeType = mime.getType(`${config.service.fileUpload.userUploadsFolder}/${q.fileName}`);

        res.writeHead(200, { 'Content-Type': fileMimeType });
        res.write(fileContent);
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ ok: false, code: 404 }));
        res.end();
    }
}).listen(config.service.fileUpload.port, config.service.fileUpload.host);