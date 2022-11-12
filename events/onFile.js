const { formatBytes } = require('../utils/formatBytes');

exports.onFile = async (ws, htmlEncode, parsedData, data) => {
    if (ws.bufferedAmount === 0)
        return ws.send(JSON.stringify({
            author: htmlEncode(Buffer.from(parsedData(data).author, 'base64').toString()),
            type: 'msg',
            time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
            file: true,
            fileContent: parsedData(data).fileContent,
            fileName: parsedData(data).fileName,
            fileSize: formatBytes(parsedData(data).fileSize, 1)
        }));
}