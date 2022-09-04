'use strict';

function $(elem) {
  return document.querySelector(elem);
}

if (!window.WebSocket) {
  alert('Your browser doesn\'t support WebSocket!');
  window.location.href = 'https://www.mozilla.org/en-US/firefox/browsers/';
}

function htmlEncode(str) {
  return String(str).replace(/[^\w. ]/gi, (c) => `&#${c.charCodeAt(0)};`);
}

const sendmsgBtn = $('#sendmsgBtn');
let ws = new WebSocket(`ws://${window.location.hostname}:7465`);

sendmsgBtn.disabled = true;
$('#msginput').disabled = true;

ws.onopen = () => {
  mopen();

  if (window) {

  }
}

function mopen() {
  sendmsgBtn.disabled = false;
  $('#msginput').disabled = false;

  ws.send(JSON.stringify({
    author: window.localStorage.getItem('michi_nname'),
    type: 'plupdate'
  }));

  ws.send(JSON.stringify({
    author: window.localStorage.getItem('michi_nname'),
    type: 'srvupdate'
  }));

  setInterval(() => ws.send(JSON.stringify({ type: "heartbeat", author: window.localStorage.getItem('michi_nname') })), 30000);
}

ws.onclose = async (event) => {
  mclose(event);
}

function mclose(event) {
  sendmsgBtn.disabled = true;
  $('#msginput').disabled = true;
  $('#msginput').placeholder = 'Error when connecting';
  if ($('.emptych'))
    $('.emptych').remove();

  const content = `<br>
  <div class="msg">
  <span class="msg_author">
  System
  <span class="badge">system</span>
  </span>
  <br>
  <div class="msg_text">
  Server was down. Error code: ${event.code}. You can try reload the page.
  </div>
  </div>`;

  $('.messages').innerHTML = content;
}

sendmsgBtn.onclick = async (event) => {
  submitOnEnter(event);
};

ws.onmessage = async (res) => {
  monmessage(res);
};

function monmessage(res) {
  const msgCont = $('.messages');
  if ($('.emptych'))
    $('.emptych').remove();

  const obj = JSON.parse(res.data);
  $('#plist_memberscount').textContent = `Total ${obj.pcount} members`;

  switch (obj.type) {
    case 'plupdate':
      $('#plist_memberscount').textContent = `Total ${obj.pcount} members`;
      $('#plmembers').innerHTML += `<br>${obj.author}`;
      break;

    case 'srvupdate':
      Object.entries(obj.servers)
        .forEach(element => {
          for (let i = 1; i < element.length; i++) {
            const server = element[i];

            $('#mainmenu-channels_channelslist').innerHTML += `<div class="channelslist_channel" onclick="$('.messages').innerHTML = ''; $('#plist_memberscount').textContent = 'Total 0 members'; $('#plmembers').innerHTML = ''; $('#mainmenu-channels_channelslist').innerHTML = ''; ws = new WebSocket('${server.protocol}${server.ip}'); ws.onopen = mopen; ws.onclose = mclose; ws.onmessage = monmessage;"> 
      <img src="${server.icon}" alt="${server.name}'s icon" onerror="this.src = '/assets/senko-omg.jpg';" class="channelslist_channelicon">
      <span class="channelslist_channelname">${server.name}</span>
      </div>`;
          }
        });
      break;

    case 'msg':
      const content = `<br>
        <div class="msg">
        <span class="msg_author">
        ${obj.author}
        ${obj.badge ? `<span class="badge"><span>${obj.badge}</span></span>` : ''}
        <span class="msg_time">${obj.time}</span>
        </span> 
        <br>
        <div class="msg_text">
        ${htmlEncode(obj.msg)}
        </div>
        </div>`;

      const msgNode = document.createElement('div');
      msgNode.innerHTML = content;
      msgCont.appendChild(msgNode);

      msgCont.scrollTop = 999999999999999 * 2;
      break;

    default:
      console.error('server res err');
      break;
  }
}

if (!/Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(window.navigator.userAgent)) {
  $('#sendmsgBtn').style.display = 'none';
}

function submitOnEnter(event) {
  const maxmsglen = 216;

  $('#sendmsgBtn').disabled = true;
  if (event.which === 13 && !event.shiftKey) {
    if ($('#msginput').value.length > maxmsglen)
      return alert(`Too long message (${$('#msginput').value.length} symbols)! Max message length: ${maxmsglen}.`);

    if (!$('#msginput').value.match(/\S/))
      return null;

    ws.send(JSON.stringify({
      type: 'msg',
      msg: $('#msginput').value,
      author: window.localStorage.getItem('michi_nname')
    }));

    $('#msginput').value = '';
    event.preventDefault();
  }

  setTimeout(() => {
    $('#sendmsgBtn').disabled = false;
  }, 1200);
}

window.addEventListener("keypress", submitOnEnter);
