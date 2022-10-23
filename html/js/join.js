const nnBox = document.getElementById('mnickname');
const emailBox = document.getElementById('memail');
const submBtn = document.getElementById('regbtn');

submBtn.onclick = async () => {
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
    'хуесос',
    'срака',
    'русня',
    'москаль',
    'balls',
    'gay',
    'faggot',
    'пидорасина',
    'нигер',
    'негр',
    'ниггер',
    'негритос',
    'nigg',
    'nigg er',
    'sjw',
    'lgbt',
    'Ubisoft',
    'blowjob',
    'xi',
    'nigger alarm'
  ]; // updated at 23.08.2022

  if (!nnBox.value)
    return alert('Enter valid nickname');

  if (!emailBox.value)
    return alert('Enter valid email');

  bw.forEach(word => {
    if (nnBox.value.includes(word) || nnBox.value.includes(word.toString().toUpperCase())) {
      alert(`Banned word: "${word}"`);
      nnBox.value = '';
      nnBox.validity.valid = false;
    }
  });

  if (nnBox.validity.valid && emailBox.validity.valid) {
    try {
      window.localStorage.setItem('michi_nname', btoa(nnBox.value));
      window.localStorage.setItem('michi_email', btoa(emailBox.value));
      window.location.href = './chat.html';
    } catch {
      return alert('Please use only latin (english) letters.');
    }
  }
}