let websocket = require('ws');

function submitServer(params) {
  if (typeof params !== 'object') throw new TypeError('Server params must be an Object.');

  let ws = new websocket.WebSocket('ws://localhost:7465'); // @TODO: replace localhost to official master server (soon)

  ws.onopen = () => {
    ws.send(JSON.stringify(params));
    ws.close();
  }
}

exports.submitServer = submitServer;