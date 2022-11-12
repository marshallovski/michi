exports.onPlUpdate = async (wss, ws, htmlEncode, strings, config, data, parsedData, users, req) => wss.clients.forEach(client => {
    // sending welcome message, if "welcomerEnabled" set to true in config.json
    if (config.service.welcomerEnabled && ws.bufferedAmount === 0)
        client.send(JSON.stringify({
            author: config.service.welcomerName,
            msg: `${Buffer.from(parsedData(data).author, 'base64').toString()} ${strings.joined}`,
            badge: config.service.badge,
            type: 'msg',
            time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`
        }));

    // sending people count and new member
    if (ws.bufferedAmount === 0)
        client.send(JSON.stringify({
            author: Buffer.from(parsedData(data).author, 'base64').toString(),
            type: 'plupdate',
            pcount: wss.clients.size
        }));

    users[req.socket.remoteAddress] = htmlEncode(Buffer.from(parsedData(data).author, 'base64').toString());
    console.log(users);
})
