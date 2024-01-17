exports.onMessage = async (ws, wss, parsedData, data, config, editJsonFile, log, req, escapeHTML) => {
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
                author: escapeHTML(Buffer.from(parsedData(data).author, 'base64').toString()),
                msg: escapeHTML(parsedData(data).msg),
                type: 'msg',
                textMessage: true,
                time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                badge: null,
                pcount: wss.clients.size
            }));
    });
}
