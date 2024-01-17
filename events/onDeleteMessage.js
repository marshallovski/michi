exports.onDeleteMessage = async (ws, wss, parsedData, data) => {
    if (parsedData(data).author === parsedData(data).msgAuthor) {
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
            ws.send(
                JSON.stringify({
                    type: 'err',
                    msg: 'You cannot delete someone else\'s message'
                })
            );
    }

}
