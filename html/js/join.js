const nnBox = document.getElementById('mnickname');
const emailBox = document.getElementById('memail');
const submBtn = document.getElementById('regbtn');

function htmlEncode(str) {
  return String(str).replace(/[^\w. ]/gi, function (c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
}

submBtn.onclick = function () {
  let bw = [
    'nigger',
    'nigga',
    'anus',
    'dick',
    'cock',
    'suck',
    'hitler',
    'nig ger',
    'shitter',
    'fuck',
    'gachi',
    'gachiman',
    'fisting',
    'gachi man',
    'блять',
    'сука',
    'пидор',
    'блядь',
    'хуй',
    'хуесос'
  ];

  if (!nnBox.value) {
    alert('Enter valid nickname');
  }

  if (!emailBox.value) {
    alert('Enter valid email');
  }

  bw.forEach(word => {
    if (nnBox.value.includes(word)) {
      alert(`Banned word: "${word}"`);
      nnBox.value = '';
      nnBox.validity.valid = false;
    }
  });

  if (nnBox.validity.valid && emailBox.validity.valid) {
    try {
      window.localStorage.setItem('michi_nname', btoa(htmlEncode(nnBox.value)));
      window.localStorage.setItem('michi_email', btoa(htmlEncode(emailBox.value)));
      window.location.href = './chat.html';
    } catch (e) {
      console.error(e);
      return alert('Please use only latin (english) letters.');
    }
  }
}

const randname = document.getElementById('randnick');
randname.innerHTML = `or, try fresh, random generated nickname: <code><b>${(Math.random() + 1).toString(36).substr(7)}</b></code>`;