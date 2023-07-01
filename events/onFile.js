const { formatBytes } = require('../utils/formatBytes');
const fs = require('fs');

exports.onFile = async (ws, wss, escapeHTML, parsedData, data, config) => {
    let fileContent = new Buffer.from(parsedData(data).fileContent, 'binary');

    try {
        fs.writeFileSync(`${config.service.fileUpload.userUploadsFolder}/${parsedData(data).fileName}`, fileContent);
    } catch (e) {
        console.error(e);

        return ws.send(JSON.stringify({
            type: 'file',
            ok: false
        }));
    }

    if (ws.bufferedAmount === 0)
        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                author: escapeHTML(Buffer.from(parsedData(data).author, 'base64').toString()),
                type: 'msg',
                time: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
                file: true,
                ok: true,
                fileContent: `${config.service.fileUpload.sslEnabled ? 'https' : 'http'}://${config.service.fileUpload.host}:${config.service.fileUpload.port}/uploads/?fileName=${parsedData(data).fileName}`,
                fileName: parsedData(data).fileName,
                fileSize: formatBytes(parsedData(data).fileSize, 1)
            }));
        });
}