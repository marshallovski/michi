const { submitServer } = require('./submitServer');
const config = require('../config.json');
const { log } = require('../utils/logger');

function startAutoSubmitServer(membersCount, wss) {
    submitServer({
        name: config.service.name,
        motd: config.service.motd,
        members: membersCount,
        icon: '/home/michi/assets/logo.png',
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
            icon: '/home/michi/assets/logo.png',
            type: 'newsrv',
            ip: `${wss.address().address}:${wss.address().port}`,
            author: `${config.service.name}@${wss.address().address}:${wss.address().port}`
        });

        log(`Submitted this server as "${config.service.name}@${wss.address().address}:${wss.address().port}"!`);
    }, config.service.autoSubmittingInterval);
}


exports.startAutoSubmitServer = startAutoSubmitServer;
