exports.onServerUpdate = async (ws, editJsonFile, config, parsedData, data) => {
    if (ws.bufferedAmount === 0)
        return ws.send(JSON.stringify({
            author: Buffer.from(parsedData(data).author, 'base64').toString(),
            type: 'srvupdate',
            servers: editJsonFile(config.serversPath).toObject()
        }));
}