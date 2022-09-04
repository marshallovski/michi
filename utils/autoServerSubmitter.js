const { submitServer } = require('./submitServer');
const config = require('../config.json');
const { log } = require('../utils/logger');

function startAutoSubmitServer(membersCount, wss) {
    submitServer({
        name: config.service.name,
        motd: config.service.motd,
        members: membersCount,
        icon: config.service.icon, // icon should be as link (http://example.com/icon.png, or as base64 image with "data:".
        // you can use https://m4r5ha11.com/assets/f2b64.html to convert your image to base64 encoded image string)
        type: 'newsrv',
        ip: `${wss.address().address}:${wss.address().port}`,
        protocol: config.protocol,
        author: `${config.service.name}@${wss.address().address}:${wss.address().port}`
    });

    log(`Submitted this server as "${config.service.name}@${wss.address().address}:${wss.address().port}"!`);

    setInterval(() => {
        submitServer({
            name: config.service.name,
            motd: config.service.motd,
            members: membersCount,
            icon: config.service.icon, // same here (see line 10)
            type: 'newsrv',
            ip: `${wss.address().address}:${wss.address().port}`,
            author: `${config.service.name}@${wss.address().address}:${wss.address().port}`
        });

        log(`Submitted this server as "${config.service.name}@${wss.address().address}:${wss.address().port}"!`);
    }, config.service.autoSubmittingInterval);
}


exports.startAutoSubmitServer = startAutoSubmitServer;
