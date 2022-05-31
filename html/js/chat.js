'use strict';

function $(type, elem) {
  if (type === 'id')
    return document.getElementById(elem);
  else if (type === 'cl')
    return document.querySelector(elem);
}


window.onload = function () {
  if (!window.WebSocket) {
    return alert('Your browser doesn\'t support WebSocket!');
  }
}

function htmlEncode(str) {
  return String(str).replace(/[^\w. ]/gi, function (c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
}

const sendmsgBtn = $('id', 'sendmsgBtn');
const ws = new WebSocket(`ws://${window.location.hostname}:7465`);

sendmsgBtn.disabled = true;
$('cl', '.msgbox_input').disabled = true;

ws.onopen = function () {
  sendmsgBtn.disabled = false;
  $('cl', '.msgbox_input').disabled = false;

  setInterval(() => ws.send(JSON.stringify({ msg: "heartbeat updater", author: window.localStorage.getItem('michi_nname') })), 30000);
}

ws.onclose = function (event) {
  sendmsgBtn.disabled = true;
  $('cl', '.msgbox_input').disabled = true;
  $('cl', '.msgbox_input').placeholder = 'Error when connecting';
  if ($('cl', '.emptych')) {
    $('cl', '.emptych').remove();
  }

  const content = `
  <br>
  <div class="msg">
  <span class="msg_author">
  Michi
  <span class="badge">system</span>
  </span>
  <br>
  <div class="msg_text">
  Server was down. Error code: ${event.code}. You can try reloading the page.
  </div>
  </div>
  `;

  $('cl', '.messages').innerHTML = content;

}

sendmsgBtn.onclick = function () {
  sendmsgBtn.disabled = true;
  if (!$('cl', '.msgbox_input').value) {
    return null;
  }

  if ($('cl', '.msgbox_input').value.length > 216) {
    return alert(`Too long message (${$('cl', '.msgbox_input').value.length})! Max message length: 216.`);
  }

  setTimeout(() => {
    sendmsgBtn.disabled = false;
  }, 1200);
};

ws.onmessage = function (res) {
  const msgCont = $('cl', '.messages');

  if ($('cl', '.emptych')) {
    $('cl', '.emptych').remove();
  }

  const obj = JSON.parse(res.data);

  if (obj.type === 'plupdate') {
    document.getElementById("plist_memberscount").innerText = `Total members: ${obj.pcount}`;
  }

  const content = `
  <br>
  <div class="msg">
  <span class="msg_author">
  ${obj.author}
  ${obj.badge ? `<span class="badge">${obj.badge}</span>` : ''}
  </span>
  <br>
  <div class="msg_text">
  ${htmlEncode(obj.msg)}
  </div>
  </div>
  `;

  let msgNode = document.createElement('div');
  msgNode.innerHTML = content;
  msgCont.appendChild(msgNode);
  msgCont.scrollTop = 999999999999999 * 2;
};

if (!/Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(window.navigator.userAgent)) {
  $('id', 'sendmsgBtn').style.display = 'none';
}

function submitOnEnter(event) {
  $('id', 'sendmsgBtn').disabled = true;
  if (event.which === 13 && !event.shiftKey) {
    if ($('cl', '.msgbox_input').value.length > 216) {
      return alert(`Too long message (${$('cl', '.msgbox_input').value.length} symbols)! Max message length: 216.`);
    }

    if (!$('cl', '.msgbox_input').value) {
      return null;
    }

    ws.send(JSON.stringify({
      msg: $('cl', '.msgbox_input').value,
      author: window.localStorage.getItem('michi_nname')
    }));

    $('cl', '.msgbox_input').value = '';
    event.preventDefault();
  }

  setTimeout(() => {
    $('id', 'sendmsgBtn').disabled = false;
  }, 1200);
}

window.addEventListener("keypress", submitOnEnter);
