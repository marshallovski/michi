const WebSocket = require('ws');
const config = require('./config.json');
const port = config.port;
const wss = new WebSocket.Server({ port: port });

function parsedData(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        console.log(e);
        return 'error';
    }
}

wss.on('connection', function connection(ws, req) {
    console.log(`[${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}]: connected to chat from ${req.socket.remoteAddress}`);

    ws.on('message', function message(data) {
        console.log(`[${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}]: received: ${data} from ${req.socket.remoteAddress}`);
        if (!data.includes('msg') || !data.includes('author')) {
            return console.log(`Received strange data: ${data} from ${req.socket.remoteAddress}`);
        }

        if (data.includes('heartbeat updater')) {
            return null;
        }

        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                msg: parsedData(data).msg,
                author: Buffer.from(parsedData(data).author, 'base64').toString(),
                badge: null
            }));
        });
    });
    // setInterval(() => {
    //     ws.send(JSON.stringify({ msg: Math.random() + 1, author: config.serviceConf.name, badge: config.serviceConf.badge }));
    // }, 200);
});


console.log(`listening ${port}`);