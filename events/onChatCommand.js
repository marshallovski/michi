const { connectedUsers } = require('../utils/connectedUsers');

exports.onChatCommand = async (parsedData, data, ws, config, strings, users, wss, cmdList) => {
    switch (parsedData(data).chatcmd) {
        case 'help':
            if (ws.bufferedAmount === 0)
                ws.send(JSON.stringify({
                    author: config.service.name,
                    msg: `${strings.availableCmds} ${cmdList.join(', ')}`,
                    type: 'msg',
                    time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                    badge: config.service.badge
                }));
            break;

        case 'users':
            if (ws.bufferedAmount === 0)
                ws.send(JSON.stringify({
                    author: config.service.name,
                    msg: `${strings.serverConnectedUsers} ${connectedUsers(users)}`,
                    type: 'msg',
                    time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                    badge: config.service.badge
                }));
            break;

        case 'serverinfo':
            if (ws.bufferedAmount === 0)
                ws.send(JSON.stringify({
                    author: config.service.name,
                    msg: `${strings.serverName} ${config.service.name}\n${strings.serverDesc}\n${config.service.motd}\n${strings.serverConnectedUsers} ${wss.clients.size}`,
                    type: 'msg',
                    time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                    badge: config.service.badge
                }));
            break;

        default:
            if (ws.bufferedAmount === 0)
                return ws.send(JSON.stringify({
                    author: config.service.name,
                    msg: `${strings.unknownCmd} ${cmdList.join(', ')}`,
                    type: 'msg',
                    time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                    badge: config.service.badge
                }));
    }
}