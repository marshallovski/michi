const WebSocket = require('ws');
const config = require('./config.json');
const wss = new WebSocket.Server({ port: config.port, host: config.host }); // you can set port and host in config.json
const editJsonFile = require("edit-json-file");

const { log } = require('./utils/logger');
const { parsedData } = require("./utils/parsedData");
const { startAutoSubmitServer } = require('./utils/autoServerSubmitter');
const { htmlEncode } = require('./utils/htmlEncode');
const { connectedUsers } = require('./utils/connectedUsers');
const { formatBytes } = require('./utils/formatBytes');

const cmdList = require(config.cmdsPath);
const phrases = require('./db/randphrases.json');
const emojiList = require(config.emojiPath);
const strings = require(config.stringsPath); // you can translate strings in your language, see strings file path in config.json
let users = {}; // connected users, needn't to save locally (locally: for example, in JSON file)

wss.on('listening', () => {
    log(`${strings.serverIsListening} ${config.protocol}${wss.address().address}:${wss.address().port}`);
    startAutoSubmitServer(wss.clients.size, wss);
});

wss.on('connection', (ws, req) => {
    log(`${strings.connFrom} ${req.socket.remoteAddress}`);

    ws.on('message', async (data) => {
        if (parsedData(data).type === 'heartbeat') // it's required to keep connection on client alive
            return;

        switch (parsedData(data).type) {
            case 'newsrv': // someone wants add a new server to our master-server
                const serverID = Date.now().toString();
                const serversFilePath = config.serversPath;
                let file = editJsonFile(serversFilePath);

                try {
                    file.set(serverID, parsedData(data)); // @FIXME: check for duplicated servers
                    file.save();

                    ws.send(JSON.stringify({
                        msg: 'OK',
                        err: false,
                        id: serverID
                    }));
                } catch (e) {
                    ws.send(JSON.stringify({
                        err: true,
                        msg: `${strings.errgh}\n${e.message}`,
                        id: serverID,
                        time: Date.now()
                    }));

                    return console.error(e);
                }
                break;

            case 'plupdate':  // client is requesting member count update
                return wss.clients.forEach(client => {
                    // sending welcome message, if "welcomerEnabled" set to true in config.json
                    if (config.service.welcomerEnabled)
                        client.send(JSON.stringify({
                            author: config.service.welcomerName,
                            msg: `${Buffer.from(parsedData(data).author, 'base64').toString()} ${strings.joined}`,
                            badge: config.service.badge,
                            type: 'msg',
                            time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`
                        }));

                    // sending people count and new member
                    client.send(JSON.stringify({
                        author: Buffer.from(parsedData(data).author, 'base64').toString(),
                        type: 'plupdate',
                        pcount: wss.clients.size
                    }));

                    users[req.socket.remoteAddress] = htmlEncode(Buffer.from(parsedData(data).author, 'base64').toString());
                });
                break;

            case 'srvupdate': // client is requesting servers list update
                // sending servers
                return ws.send(JSON.stringify({
                    author: Buffer.from(parsedData(data).author, 'base64').toString(),
                    type: 'srvupdate',
                    servers: editJsonFile(config.serversPath).toObject()
                }));
                break;

            case 'emojihtml':
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({
                        author: htmlEncode(Buffer.from(parsedData(data).author, 'base64').toString()),
                        type: 'msg',
                        emoji: true,
                        time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                        html: `<img src="${parsedData(data).src}" alt="${parsedData(data).name}" style="width: 35px;">`
                    }));
                });
                break;

            case 'msg': // new message
                if (!parsedData(data).msg || parsedData(data).msg.length === 0 || !parsedData(data).msg.match(/\S/))
                    return ws.send(JSON.stringify({ type: 'err', msg: 'Cannot send an empty message.' }));

                if (!parsedData(data).author || parsedData(data).author.length < 1 || !parsedData(data).author.match(/\S/))
                    return ws.send(JSON.stringify({ type: 'err', msg: 'Cannot send message without author.' }));

                if (parsedData(data).msg.length > config.service.maxMsgLength)
                    return ws.send(JSON.stringify({ type: 'err', msg: `Message is too long (${parsedData(data).msg.length} chars). Max message length: ${config.service.maxMsgLength} chars.` }));

                if (parsedData(data).author.length > config.service.maxNicknameLength)
                    return ws.send(JSON.stringify({ type: 'err', msg: `Nickname is too long (${parsedData(data).author.length} chars). Max nickname length: ${config.service.maxNicknameLength} chars.` }));

                log(`${Buffer.from(parsedData(data).author, 'base64').toString()}: ${parsedData(data).msg} from ${req.socket.remoteAddress}`);

                if (config.service.msglogging) { // will log only messages
                    let file = editJsonFile(config.logfilePath);
                    file.set(Date.now().toString(), { author: parsedData(data).author, msg: parsedData(data).msg, ip: req.socket.remoteAddress });
                    file.save();
                }

                // sending message to all
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({
                        author: htmlEncode(Buffer.from(parsedData(data).author, 'base64').toString()),
                        msg: htmlEncode(parsedData(data).msg),
                        type: 'msg',
                        time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                        badge: null,
                        pcount: wss.clients.size
                    }));
                });
                break;

            // client is requesting all server's emoji
            case 'emojisupdate':
                ws.send(JSON.stringify({
                    author: Buffer.from(parsedData(data).author, 'base64').toString(),
                    emoji: emojiList,
                    type: 'emojiupdate'
                }));
                break;

            // slash commands
            case 'chatcmd':
                switch (parsedData(data).chatcmd) {
                    case 'help':
                        ws.send(JSON.stringify({
                            author: config.service.name,
                            msg: `${strings.availableCmds} ${cmdList.join(', ')}`,
                            type: 'msg',
                            time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                            badge: config.service.badge
                        }));
                        break;

                    case 'users':
                        ws.send(JSON.stringify({
                            author: config.service.name,
                            msg: `${strings.serverConnectedUsers} ${connectedUsers(users)}`,
                            type: 'msg',
                            time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                            badge: config.service.badge
                        }));
                        break;

                    case 'serverinfo':
                        ws.send(JSON.stringify({
                            author: config.service.name,
                            msg: `${strings.serverName} ${config.service.name}\n${strings.serverDesc}\n${config.service.motd}\n${strings.serverConnectedUsers} ${wss.clients.size}`,
                            type: 'msg',
                            time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                            badge: config.service.badge
                        }));
                        break;

                    default:
                        return ws.send(JSON.stringify({
                            author: config.service.name,
                            msg: `${strings.unknownCmd} ${cmdList.join(', ')}`,
                            type: 'msg',
                            time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                            badge: config.service.badge
                        }));
                        break;
                }
                break;

            case 'file':
                ws.send(JSON.stringify({
                    author: htmlEncode(Buffer.from(parsedData(data).author, 'base64').toString()),
                    type: 'msg',
                    time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                    file: true,
                    fileContent: parsedData(data).fileContent,
                    fileName: parsedData(data).fileName,
                    fileSize: formatBytes(parsedData(data).fileSize, 1)
                }));
                break;

            default:
                ws.send(JSON.stringify({
                    type: 'err',
                    err: true,
                    msg: `Unknown type "${parsedData(data).type}", available types: msg, srvupdate, plupdate, newsrv, heartbeat, chatcmd, stickerhtml`
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

wss.on('disconnect', () => {
    delete users[req.socket.remoteAddress];
    console.log('disconnected');
});

// setInterval(() => {
//     console.log(users);

// }, 1000);