exports.onHTMLEmoji = async (wss, ws, htmlEncode, parsedData, data) => {
    wss.clients.forEach(client => {
        if (ws.bufferedAmount === 0)
            client.send(JSON.stringify({
                author: htmlEncode(Buffer.from(parsedData(data).author, 'base64').toString()),
                type: 'msg',
                emoji: true,
                time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                html: `<img src="${parsedData(data).src}" alt="${parsedData(data).name}" style="width: 35px;">`
            }));
    });
}