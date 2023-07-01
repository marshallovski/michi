'use strict';

function $(elem) {
  return document.querySelector(elem);
}

if (!window.WebSocket) {
  alert('Your browser doesn\'t support WebSocket!');
  location.href = 'https://www.mozilla.org/en-US/firefox/browsers/';
}

let ws;
const fastconn = new URLSearchParams(location.search).get('connect');

if (fastconn) ws = new WebSocket(fastconn);
else
  ws = new WebSocket(`${location.protocol === 'http:' ? 'ws://' : 'wss://'}${location.hostname}:7465`);


const sendmsgBtn = $('#sendmsgBtn');

sendmsgBtn.disabled = true;
$('#msginput').disabled = true;
$('#fileselectBtn').disabled = true;

ws.onopen = async () => mopen();

function mopen() {
  $('#msginput').disabled = false;
  $('#fileselectBtn').disabled = false;

  ws.send(JSON.stringify({
    author: localStorage.getItem('michi_nname'),
    type: 'plupdate'
  }));

  ws.send(JSON.stringify({
    author: localStorage.getItem('michi_nname'),
    type: 'srvupdate'
  }));

  ws.send(JSON.stringify({
    author: localStorage.getItem('michi_nname'),
    type: 'emojisupdate'
  }));

  setInterval(() => ws.send(JSON.stringify({
    type: "heartbeat",
    author: localStorage.getItem('michi_nname')
  })), 30000);

  ws.send(JSON.stringify({
    author: localStorage.getItem('michi_nname'),
    type: 'limits'
  }));
}

ws.onclose = async (event) => mclose(event);

function mclose(event) {
  if ($('.emptych')) $('.emptych').remove();
  $('#emojiBtn').disabled = true;
  $('#msginput').value = '';
  $('#msginput').disabled = true;
  $('#fileselectBtn').disabled = true;
  $('#msginput').placeholder = 'Error when connecting';
  sendmsgBtn.disabled = true;

  const content = `
  <br>
  <div class="msg">
  <span class="msg_author">
  Networker
  <span class="msg_badge">system</span>
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
let _limits = {};

function monmessage(res) {
  const msgCont = $('.messages');
  const obj = JSON.parse(res.data);

  switch (obj.type) {
    case 'limits':
      _limits = obj.limits;
      Object.freeze(_limits);
      break;

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
                author: localStorage.getItem('michi_nname'),
                type: 'emojihtml',
                src: emoji.src,
                name: emoji.name
              }));

              event.preventDefault();
              $('.shade').style.display = 'none';
              $('#emojiMenu').style.display = 'none';
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
              // clearning contents of messages and members count elements
              _clearElemTree('.messages');
              _clearElemTree('#plist_memberscount');

              $('#plist_memberscount').textContent = 'Total 0 members';
              $('#mainmenu-channels_channelslist').innerHTML = 'Server list is available only when you connected to Michi\'s official server. <a href="javascript:void" onclick="location.reload()">Connect to official server</a>';
              $('.header_chname').textContent = server.name;
              if ($('.emptych')) $('#emptych_chname').textContent = server.name;

              ws = new WebSocket(`${server.protocol}${server.ip}`);
              ws.onopen = mopen;
              ws.onclose = mclose;
              ws.onmessage = monmessage;
              $('#msginput').placeholder = `Enter message to ${server.name} here`;
              document.title = `${server.name} - michi`;
            }

            // srvelem_image
            const srvElemImage = document.createElement('img');
            srvElemImage.src = server.icon;
            srvElemImage.className = 'channelslist_channelicon';
            srvElemImage.alt = `${server.name}'s icon`;
            srvElemImage.onerror = () => srvElemImage.src = '/assets/senko-omg.jpg';

            // srvelem_channelname
            const srvElemChannelName = document.createElement('span');
            srvElemChannelName.className = 'channelslist_channelname';
            srvElemChannelName.textContent = server.name;

            $('#mainmenu-channels_channelslist').append(srvElem);
            srvElem.append(srvElemImage);
            srvElem.append(srvElemChannelName);
          }
        });
      break;

    case 'deletemsg':
      if ($(obj.htmlnode)) {
        console.log('delete', obj.htmlnode);
        $(obj.htmlnode).remove();
      } else console.log('cant delete, coz element to delete is not found');
      break;

    case 'msg':
      if ($('.emptych'))
        $('.emptych').remove();

      let messageID;
      if (!obj.messageid) messageID = generateID();

      // generating a message element... that was pretty hard

      const msgNode = document.createElement('div');
      msgNode.className = 'msg';
      msgNode.id = `message-${messageID}`;
      msgCont.appendChild(msgNode);

      // creating message header (nickname, badges, time, action btns etc...)

      // nickname
      const msgAuthor = document.createElement('span');
      msgAuthor.className = 'msg_author';
      msgAuthor.textContent = obj.author;
      msgNode.append(msgAuthor);

      // badge
      if (obj.badge) {
        const msgBadge = document.createElement('span');
        msgBadge.className = 'msg_badge';
        msgBadge.textContent = obj.badge;
        msgAuthor.append(msgBadge);
      }

      // time
      const msgTime = document.createElement('span');
      msgTime.className = 'msg_time';
      msgTime.textContent = obj.time;
      msgNode.append(msgTime);

      // action buttons

      // delete message button
      const msgDeleteButton = document.createElement('i');
      msgDeleteButton.textContent = 'delete';
      msgDeleteButton.setAttribute('translate', 'no');
      msgDeleteButton.classList.add('mi', 'msg_msgactions_icon');
      msgDeleteButton.onclick = () => _mdeleteMessage(`#message-${messageID}`);
      msgTime.append(msgDeleteButton);

      // edit message button
      const msgEditButton = document.createElement('i');
      msgEditButton.textContent = 'edit';
      msgEditButton.setAttribute('translate', 'no');
      msgEditButton.classList.add('mi', 'msg_msgactions_icon');
      msgEditButton.onclick = () => null;
      msgTime.append(msgEditButton);

      // br. some trick
      msgNode.append(document.createElement('br'));

      // message content (text, video embed, picture embed, file embeds etc.)
      const messageContent = document.createElement('div');
      messageContent.className = 'msg_text';
      messageContent.id = `message-content-${messageID}`;
      msgNode.append(messageContent);

      // message text content
      const messageText = document.createElement('pre');
      messageText.className = 'msg_textContent';

      // disaplaying various message types
      switch (true) {
        // video
        case obj.file && obj.fileName.endsWith('.mp4') || obj.file && obj.fileName.endsWith('.webm'):
          // creating video element
          const videoElem = document.createElement('video');
          videoElem.src = obj.fileContent;
          videoElem.setAttribute('controls', 'true');
          videoElem.className = 'msg_video';

          messageContent.append(videoElem);
          break;

        // audio
        case obj.file && obj.fileName.endsWith('.mp3') ||
          obj.file && obj.fileName.endsWith('.wav') ||
          obj.file && obj.fileName.endsWith('.ogg') ||
          obj.file && obj.fileName.endsWith('.m4a'):

          // creating audio element
          const audioElem = document.createElement('audio');
          audioElem.src = obj.fileContent;
          audioElem.setAttribute('controls', 'true');

          messageContent.append(audioElem);
          break;

        // pictures
        case obj.file && obj.fileName.endsWith('.png') || 
        obj.file && obj.fileName.endsWith('.jpg') || 
        obj.file && obj.fileName.endsWith('.gif') || 
        obj.file && obj.fileName.endsWith('.webp'):
          // creating clickable image and image itself  

          // link
          const imageLink = document.createElement('a');
          imageLink.href = obj.fileContent;
          imageLink.download = 'true';

          // image element
          const imageElem = document.createElement('img');
          imageElem.src = obj.fileContent;
          imageElem.alt = 'broken picture';
          imageElem.className = 'msg_picture';
          imageLink.append(imageElem);

          messageContent.append(imageLink);
          break;

        // file
        case obj.file:
          // if file uploading is successful
          if (obj.file && obj.ok) {
            // creating file download embed (?)

            // creating a link (container)
            const fileEmbed = document.createElement('a');
            fileEmbed.href = obj.fileContent;
            fileEmbed.className = 'msg_fileEmbed';
            fileEmbed.download = obj.fileName;
            messageContent.append(fileEmbed);

            // creating download icon
            const downloadIcon = document.createElement('i');
            downloadIcon.classList.add('mi', 'msg_fileEmbed-downloadIcon');
            downloadIcon.setAttribute('translate', 'no');
            downloadIcon.textContent = 'download';
            fileEmbed.append(downloadIcon);

            // creating label with file name
            const fileNameLabel = document.createElement('span');
            fileNameLabel.className = 'msg_fileEmbed-fileName';
            fileNameLabel.textContent = obj.fileName;
            fileEmbed.append(fileNameLabel);

            // creating label with file size
            const fileSizeLabel = document.createElement('small');
            fileSizeLabel.className = 'msg_fileEmbed-fileSize';
            fileSizeLabel.textContent = obj.fileSize;
            fileEmbed.append(fileSizeLabel);
          } else {
            $('#fileUploadProgress').style.display = 'block';
            $('#fileUploadProgress').textContent = 'Failed to upload file!';

            setTimeout(() => {
              $('#fileUploadProgress').style.display = 'none';
            }, 4000);
          }


          break;

        case obj.textMessage:
          messageText.textContent = obj.msg;
          messageContent.append(messageText);
          break;

        case obj.emoji:
          // @TODO: remove emoji because of possible XSS attack
          // or just send link to image instead of HTML
          messageContent.innerHTML += obj.html;
          break;

        default:
          console.error('Unknown message type: ', obj);
          break;
      }

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

$('#mfileuploadform').onchange = () => {
  const fsize = $('#mfileuploadform').files[0].size;

  if (fsize > _limits.maxFileSize) { // if file size is bigger than 5MB, aborting
    $('#fileUploadProgress').style.display = 'block';
    $('#fileUploadProgress').textContent = `Your file is bigger than ${(_limits.maxFileSize / 1024 / 1024).toFixed(1)}MB (you're tried uploading ${(fsize / 1024 / 1024).toFixed(1)}MB)`;

    setTimeout(() => {
      $('#fileUploadProgress').style.display = 'none';
    }, 4000);

    return null;
  }

  const reader = new FileReader();
  reader.readAsBinaryString($('#mfileuploadform').files[0]);

  reader.onprogress = (e) => {
    if (e.lengthComputable)
      $('#fileUploadProgress').textContent = `Uploading ${$('#mfileuploadform').files[0].name}: ${Math.round((e.loaded / e.total) * 100)}%`;
  }

  reader.onloadstart = () => $('#fileUploadProgress').style.display = 'block';

  reader.onerror = (e) => {
    $('#fileUploadProgress').style.display = 'block';
    $('#fileUploadProgress').textContent = `Error when uploading ${$('#mfileuploadform').files[0].name}`;
    setTimeout(() => {
      $('#fileUploadProgress').style.display = 'none';
    }, 4000);

    return console.error(e);
  }

  reader.onloadend = (e) => {
    ws.send(JSON.stringify({
      author: localStorage.getItem('michi_nname'),
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
  const maxmsglen = _limits.maxMessageLength;

  if (!$('#msginput').value.match(/\S/)) {
    sendmsgBtn.disabled = false;
    sendmsgBtn.style.display = 'inline'
  }

  if (!event.shiftKey) {
    if ($('#msginput').value.length > maxmsglen) {
      $('#fileUploadProgress').textContent = `Too long message (${$('#msginput').value.length} symbols)! Max message length: ${maxmsglen}.`;
      $('#fileUploadProgress').style.display = 'block';

      setTimeout(() => {
        $('#fileUploadProgress').style.display = 'none';
      }, 4000);

      return;
    }

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
        author: localStorage.getItem('michi_nname')
      }));
    }

    if ($('#msginput').value.startsWith('/') && $('#msginput').value.endsWith('')) {
      ws.send(JSON.stringify({
        type: 'chatcmd',
        chatcmd: $('#msginput').value.replaceAll('/', ''),
        author: localStorage.getItem('michi_nname')
      }));

      $('#msginput').value = '';
      return event.preventDefault();
    }

    ws.send(JSON.stringify({
      type: 'msg',
      textMessage: true,
      msg: $('#msginput').value,
      author: localStorage.getItem('michi_nname')
    }));

    $('#msginput').value = '';
    event.preventDefault();
  }

  setTimeout(() => {
    sendmsgBtn.disabled = false;
  }, 500);
}

function submitOnEnter(event) {
  const maxmsglen = _limits.maxMessageLength;

  if (event.which === 13 && !event.shiftKey) {
    if ($('#msginput').value.length > maxmsglen) {
      $('#fileUploadProgress').textContent = `Too long message (${$('#msginput').value.length} symbols)! Max message length: ${maxmsglen}.`;
      $('#fileUploadProgress').style.display = 'block';

      setTimeout(() => {
        $('#fileUploadProgress').style.display = 'none';
      }, 4000);

      return;
    }

    if (!$('#msginput').value.match(/\S/))
      return null;

    if ($('#msginput').value === '/help') {
      $('#msginput').value = '';
      event.preventDefault();

      return ws.send(JSON.stringify({
        type: 'chatcmd',
        chatcmd: 'help',
        author: localStorage.getItem('michi_nname')
      }));
    }

    if ($('#msginput').value.startsWith('/') && $('#msginput').value.endsWith('')) {
      ws.send(JSON.stringify({
        type: 'chatcmd',
        chatcmd: $('#msginput').value.replaceAll('/', ''),
        author: localStorage.getItem('michi_nname')
      }));

      $('#msginput').value = '';
      return event.preventDefault();
    }

    ws.send(JSON.stringify({
      type: 'msg',
      msg: $('#msginput').value,
      author: localStorage.getItem('michi_nname')
    }));

    $('#msginput').value = '';
    event.preventDefault();
  }
}

window.addEventListener('keypress', submitOnEnter);

function _mdeleteMessage(msgid) {
  ws.send(JSON.stringify({
    type: 'deletemsg',
    author: localStorage.getItem('michi_nname'),
    msgAuthor: $(msgid).getAttribute('sendedby'),
    htmlnode: msgid,
    messageid: msgid
  }));
}