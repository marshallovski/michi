'use strict';

function $(elem) {
  return document.querySelector(elem);
}

if (!window.WebSocket) {
  alert('Your browser doesn\'t support WebSocket!');
  window.location.href = 'https://www.mozilla.org/en-US/firefox/browsers/';
}

let ws;
const fastconn = new URLSearchParams(window.location.search).get('connect');

if (fastconn) ws = new WebSocket(fastconn);
else
  ws = new WebSocket(`${window.location.protocol === 'http:' ? 'ws://' : 'wss://'}${window.location.hostname}:7465`);


const sendmsgBtn = $('#sendmsgBtn');

sendmsgBtn.disabled = true;
$('#msginput').disabled = true;

ws.onopen = async () => mopen();

function mopen() {
  $('#msginput').disabled = false;

  ws.send(JSON.stringify({
    author: window.localStorage.getItem('michi_nname'),
    type: 'plupdate'
  }));

  ws.send(JSON.stringify({
    author: window.localStorage.getItem('michi_nname'),
    type: 'srvupdate'
  }));

  ws.send(JSON.stringify({
    author: window.localStorage.getItem('michi_nname'),
    type: 'emojisupdate'
  }));

  setInterval(() => ws.send(JSON.stringify({
    type: "heartbeat",
    author: window.localStorage.getItem('michi_nname')
  })), 30000);
}

ws.onclose = async (event) => mclose(event);

function mclose(event) {
  if ($('.emptych')) $('.emptych').remove();
  $('#emojiBtn').disabled = true;
  $('#msginput').value = '';
  $('#msginput').disabled = true;
  $('#msginput').placeholder = 'Error when connecting';
  sendmsgBtn.disabled = true;

  const content = `
  <br>
  <div class="msg">
  <span class="msg_author">
  Networker
  <span class="badge">system</span>
  </span>
  <br>
  <div class="msg_text">
  Server was down. Error code: ${event.code}. You can try reload the page.
  </div>
  </div>`;

  $('.messages').innerHTML = content;
}

sendmsgBtn.onclick = async (event) => sendMsgTouch(event);
ws.onmessage = async (res) => monmessage(res);

function monmessage(res) {
  const msgCont = $('.messages');
  const obj = JSON.parse(res.data);

  switch (obj.type) {
    case 'plupdate':
      $('#plist_memberscount').textContent = `Total ${obj.pcount} members`;
      $('#plmembers').innerHTML += `<br>${obj.author}`;
      break;

    case 'emojiupdate':
      Object.entries(obj.emoji)
        .forEach(element => {
          for (let i = 1; i < element.length; i++) {
            const emoji = element[i];
            let emojiElem = document.createElement('img');

            emojiElem.className = 'msgbox_emojiMenu_emoji';
            emojiElem.src = emoji.src;
            emojiElem.title = `:${emoji.name}:`;
            emojiElem.alt = `:${emoji.name}:`;
            emojiElem.onclick = (event) => {
              ws.send(JSON.stringify({
                author: window.localStorage.getItem('michi_nname'),
                type: 'emojihtml',
                src: emoji.src,
                name: emoji.name
              }));

              $('.shade').style.display = 'none';
              $('#emojiMenu').style.display = 'none';
              event.preventDefault();
            }

            $('#emojiMenu').append(emojiElem);
          }
        });
      break;

    case 'srvupdate':
      Object.entries(obj.servers)
        .forEach(element => {
          for (let i = 1; i < element.length; i++) {
            const server = element[i];
            let srvElem = document.createElement('div');

            srvElem.className = 'channelslist_channel';

            srvElem.onclick = () => {
              $('.messages').innerHTML = '';
              $('#plist_memberscount').textContent = 'Total 0 members';
              $('#plmembers').innerHTML = '';
              $('#mainmenu-channels_channelslist').innerHTML = 'Server list is available only when you connected to Michi\'s official server. <a href="javascript:void" onclick="window.location.reload()">Connect to official server</a>';
              $('.header_chname').textContent = server.name;
              if ($('.emptych')) $('#emptych_chname').textContent = server.name;

              ws = new WebSocket(`${server.protocol}${server.ip}`);
              ws.onopen = mopen;
              ws.onclose = mclose;
              ws.onmessage = monmessage;
              $('#msginput').placeholder = `Enter message to ${server.name} here`;
              document.title = `${server.name} - michi`;
            }

            srvElem.innerHTML = `<img src="${server.icon}" alt="${server.name}'s icon" 
            onerror="this.src = '/assets/senko-omg.jpg';" class="channelslist_channelicon">
            <span class="channelslist_channelname">${server.name}</span>`;

            $('#mainmenu-channels_channelslist').append(srvElem);
          }
        });
      break;

    case 'msg':
      if ($('.emptych'))
        $('.emptych').remove();

      const content = `<span class="msg_author">
        ${obj.author}
        ${obj.badge ? `<span class="badge">${obj.badge}</span>` : ''}
        <span class="msg_time">${obj.time}</span>
        </span> 
        <br>
        <div class="msg_text">
        ${obj.emoji ? obj.html : ''}
        ${obj.file && obj.fileName.endsWith('.mp4') ? // video
          `<video src="${obj.fileContent}" controls="" class="msg_video"></video>` :

          obj.file && obj.fileName.endsWith('.png') || obj.file && obj.fileName.endsWith('.jpg') // picture
            ? `<a href="${obj.fileContent}" download><img src="${obj.fileContent}" class="msg_picture"></a>` :

            obj.file ? `<a href="${obj.fileContent}" class="msg_fileEmbed" download> 
            <i class="mi msg_fileEmbed-downloadIcon">download</i>
            <span class="msg_fileEmbed-fileName">${obj.fileName}</span>
            <small class="msg_fileEmbed-fileSize">${obj.fileSize}</small></a>` : ''} 
        <pre>${obj.msg ? obj.msg : ''}</pre>
        </div>`; // other file types

      const msgNode = document.createElement('div');
      msgNode.className = 'msg';
      msgNode.innerHTML = content;
      msgCont.appendChild(msgNode);

      msgCont.scrollTop = 999999999999999 * 2;
      break;

    case 'err':
      console.error(`Error from server:\n${obj.msg}`);
      break;

    default:
      console.log('Unhandled server response: ', obj);
      break;
  }
}

$('#msginput').oninput = () => {
  sendmsgBtn.disabled = false;
  if ($('#msginput').value.length > 0) $('#emojiBtn').style.display = 'none';
  else $('#emojiBtn').style.display = 'inline';
}

$('#emojiBtn').onclick = () => {
  if ($('#emojiMenu').style.display === 'block') {
    $('.shade').style.display = 'none';
    return $('#emojiMenu').style.display = 'none';
  }

  $('#emojiMenu').style.display = 'block';
  return $('.shade').style.display = 'block';
}

$('#fileselectBtn').onclick = () => $('#mfileuploadform').click();

$('#mfileuploadform').onchange = () => {
  const fsize = $('#mfileuploadform').files[0].size;

  if (fsize > 5000000) { // if file size is bigger than 5MB, aborting
    $('#fileUploadProgress').style.display = 'block';
    $('#fileUploadProgress').textContent = `Your file is bigger than 5MB (you're uploading ${(fsize / 1024 / 1024).toFixed(1)}MB)`;

    setTimeout(() => {
      $('#fileUploadProgress').style.display = 'none';
    }, 4000);

    return null;
  }

  const reader = new FileReader();
  reader.readAsDataURL($('#mfileuploadform').files[0]);

  reader.onprogress = (e) => {
    if (e.lengthComputable)
      $('#fileUploadProgress').textContent = `Uploading ${$('#mfileuploadform').files[0].name}: ${Math.round((e.loaded / e.total) * 100)}%`;
  }

  reader.onloadstart = () => $('#fileUploadProgress').style.display = 'block';

  reader.onerror = (e) => {
    $('#fileUploadProgress').style.display = 'block';
    $('#fileUploadProgress').textContent = `Error when uploading ${$('#mfileuploadform').files[0].name}`;
    return console.error(e.error);
  }

  reader.onloadend = (e) => {
    ws.send(JSON.stringify({
      author: window.localStorage.getItem('michi_nname'),
      type: 'file',
      fileContent: e.target.result,
      fileName: $('#mfileuploadform').files[0].name,
      fileSize: $('#mfileuploadform').files[0].size
    }));

    $('#fileUploadProgress').style.display = 'none';
  }
}


function sendMsgTouch(event) {
  sendmsgBtn.disabled = true;
  const maxmsglen = 216;

  if (!$('#msginput').value.match(/\S/))
    sendmsgBtn.disabled = false;

  if (!event.shiftKey) {
    if ($('#msginput').value.length > maxmsglen)
      return alert(`Too long message (${$('#msginput').value.length} symbols)! Max message length: ${maxmsglen}.`);

    if (!$('#msginput').value.match(/\S/)) {
      sendmsgBtn.disabled = true;
      return;
    }

    if ($('#msginput').value === '/help') {
      $('#msginput').value = '';
      event.preventDefault();

      return ws.send(JSON.stringify({
        type: 'chatcmd',
        chatcmd: 'help',
        author: window.localStorage.getItem('michi_nname')
      }));
    }

    if ($('#msginput').value.startsWith('/') && $('#msginput').value.endsWith('')) {
      ws.send(JSON.stringify({
        type: 'chatcmd',
        chatcmd: $('#msginput').value.replaceAll('/', ''),
        author: window.localStorage.getItem('michi_nname')
      }));

      $('#msginput').value = '';
      return event.preventDefault();
    }

    ws.send(JSON.stringify({
      type: 'msg',
      msg: $('#msginput').value,
      author: window.localStorage.getItem('michi_nname')
    }));

    $('#msginput').value = '';
    event.preventDefault();
  }

  setTimeout(() => {
    sendmsgBtn.disabled = false;
  }, 500);
}

function submitOnEnter(event) {
  const maxmsglen = 216;

  if (event.which === 13 && !event.shiftKey) {
    if ($('#msginput').value.length > maxmsglen)
      return alert(`Too long message (${$('#msginput').value.length} symbols)! Max message length: ${maxmsglen}.`);

    if (!$('#msginput').value.match(/\S/))
      return null;

    if ($('#msginput').value === '/help') {
      $('#msginput').value = '';
      event.preventDefault();

      return ws.send(JSON.stringify({
        type: 'chatcmd',
        chatcmd: 'help',
        author: window.localStorage.getItem('michi_nname')
      }));
    }

    if ($('#msginput').value.startsWith('/') && $('#msginput').value.endsWith('')) {
      ws.send(JSON.stringify({
        type: 'chatcmd',
        chatcmd: $('#msginput').value.replaceAll('/', ''),
        author: window.localStorage.getItem('michi_nname')
      }));

      $('#msginput').value = '';
      return event.preventDefault();
    }

    ws.send(JSON.stringify({
      type: 'msg',
      msg: $('#msginput').value,
      author: window.localStorage.getItem('michi_nname')
    }));

    $('#msginput').value = '';
    event.preventDefault();
  }
}

window.addEventListener('keypress', submitOnEnter);