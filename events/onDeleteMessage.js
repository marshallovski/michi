exports.onDeleteMessage = async (ws, wss, parsedData, data) => {
    if (parsedData(data).author === parsedData(data).msgAuthor) {
        if (ws.bufferedAmount === 0)
            wss.clients.forEach(client => {
                client.send(
                    JSON.stringify({
                        type: 'deletemsg',
                        author: parsedData(data).author,
                        htmlnode: parsedData(data).htmlnode,
                        messageid: parsedData(data).messageid
                    })
                );
            });
    } else {
        if (ws.bufferedAmount === 0)
            ws.send(
                JSON.stringify({
                    type: 'err',
                    msg: 'You cannot delete someone else\'s message'
                })
            );
    }

}