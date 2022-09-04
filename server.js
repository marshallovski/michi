const WebSocket = require('ws');
const config = require('./config.json');
const wss = new WebSocket.Server({ port: config.port, host: config.host });
const editJsonFile = require("edit-json-file");
const { log } = require('./utils/logger');
const { parsedData } = require("./utils/parsedData");
const { startAutoSubmitServer } = require('./utils/autoServerSubmitter');
const phrases = require('./db/randphrases.json');

wss.on('listening', () => {
    log(`Michi server is listening ${config.protocol}${wss.address().address}:${wss.address().port}`);
    startAutoSubmitServer(wss.clients.size, wss);
});

wss.on('connection', function connection(ws, req) {
    log(`connected to chat from ${req.socket.remoteAddress}`);

    ws.on('message', async (data) => {
        if (!parsedData(data).author && !parsedData(data).msg || !parsedData(data).type || !parsedData(data).author)
            return log(`Received strange data: ${data} from ${req.socket.remoteAddress}`);

        if (parsedData(data).type === 'heartbeat') // it's required to keep connection on client alive
            return;

        switch (parsedData(data).type) {
            case 'newsrv': // someone wants add a new server to our master-server
                const serverID = Date.now().toString();
                const serversFilePath = config.serversPath;
                let file = editJsonFile(serversFilePath, {
                    autosave: true
                });

                try {
                    file.set(serverID, parsedData(data)); // @FIXME: check for duplicated servers
                    file.save();
                    file = editJsonFile(serversFilePath, {
                        autosave: true
                    });

                    ws.send(JSON.stringify({
                        msg: 'OK',
                        err: false,
                        id: serverID
                    }));
                } catch (e) {
                    ws.send(JSON.stringify({
                        err: true,
                        errdesc: e.message,
                        msg: 'Please create an issue in our repository',
                        id: serverID,
                        time: Date.now()
                    }));

                    return console.error(e);
                }
                break;

            case 'plupdate':  // client is requesting member count update
                return wss.clients.forEach(client => {
                    // welcome message
                    client.send(JSON.stringify({
                        author: config.service.welcomerName,
                        msg: `${Buffer.from(parsedData(data).author, 'base64').toString()} joined`,
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

            case 'msg': // new message
                if (!parsedData(data).msg || parsedData(data).msg.length === 0 || !parsedData(data).msg.match(/\S/)) {
                    return { type: 'err', desc: 'Cannot send an empty message' }
                }

                if (!parsedData(data).author || parsedData(data).author.length < 1 || !parsedData(data).author.match(/\S/)) {
                    return { type: 'err', desc: 'Cannot send message with empty author' }
                }
                
                log(`${Buffer.from(parsedData(data).author, 'base64').toString()}: ${parsedData(data).msg} from ${req.socket.remoteAddress}`);

                if (config.service.msglogging) { // will log only messages
                    let file = editJsonFile(config.logfilePath);
                    file.set(Date.now().toString(), { author: parsedData(data).author, msg: parsedData(data).msg, ip: req.socket.remoteAddress });
                    file.save();
                    file = editJsonFile(config.logfilePath, {
                        autosave: true
                    });
                }

                // sending message to all
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({
                        author: Buffer.from(parsedData(data).author, 'base64').toString(),
                        msg: parsedData(data).msg,
                        type: 'msg',
                        time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                        badge: null,
                        pcount: wss.clients.size
                    }));
                });
                break;

            default:
                break;
        }

        if (config.service.fullLogging) { // will log all info (messages, member count updates etc.)
            let file = editJsonFile(config.logfilePath);
            file.set(Date.now().toString(), { data: parsedData(data), time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}` });
            file.save();
            file = editJsonFile(config.logfilePath, {
                autosave: true
            });
        }
    });

    if (config.service.randPhrases) { // sends random phrase every X ms (see "randPhrasesInterval" at ./config.json)
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

// @TODO: make disconnect event