'use strict';

const menubtn = document.getElementById('openMenu');
const mmcloseBtn = document.getElementById('mmenuCloseBtn');
const themeswitcher = document.getElementById('settings_theme');
const brswitcher = document.getElementById('settings_bradius');
const plmcloseBtn = document.getElementById('plmenuCloseBtn');
const plistMenu = document.querySelector('.plistmenu');
const plistBtn = document.getElementById('openplistMenu');
const fontSelect = $('#settings_font');

menubtn.onclick = function () {
  document.querySelector('.shade').style.display = 'block';
  document.querySelector('.mainmenu').style.display = 'block';
};

mmcloseBtn.onclick = function () {
  document.querySelector('.shade').style.display = 'none';
  document.querySelector('.mainmenu').style.display = 'none';
};

themeswitcher.onclick = function () {
  if (this.checked) {
    document.querySelector('body').style.backgroundColor = '#d9d9dd';
    document.querySelector('body').style.color = '#222';
    window.localStorage.setItem('michi_theme', 'light');
  } else {
    document.querySelector('body').style.backgroundColor = '#001e1d';
    document.querySelector('body').style.color = '#e8e4e6';
    window.localStorage.setItem('michi_theme', 'dark');
  }
};

if (window.localStorage.getItem('michi_theme') === 'dark') {
  document.querySelector('body').style.backgroundColor = '#001e1d';
  document.querySelector('body').style.color = '#e8e4e6';
  themeswitcher.checked = false;
}

if (window.localStorage.getItem('michi_theme') === 'light') {
  document.querySelector('body').style.backgroundColor = '#d9d9dd';
  document.querySelector('body').style.color = '#222';
  themeswitcher.checked = true;
}

if (window.localStorage.getItem('michi_circleborder') === 'true') {
  document.querySelector('body').style.setProperty('--mainbradius', '16px');
  document.querySelector('body').style.setProperty('--avatarbradius', '100%');
  brswitcher.checked = true;
}

brswitcher.onclick = function () {
  if (this.checked) {
    window.localStorage.setItem('michi_circleborder', 'true');
    document.querySelector('body').style.setProperty('--mainbradius', '16px');
    document.querySelector('body').style.setProperty('--avatarbradius', '100%');
  } else {
    window.localStorage.setItem('michi_circleborder', 'false');
    document.querySelector('body').style.setProperty('--mainbradius', '5px');
    document.querySelector('body').style.setProperty('--avatarbradius', '5px');
  }
};

plistBtn.onclick = function () {
  document.querySelector('.shade').style.display = 'block';
  plistMenu.style.display = 'block';
};

plmcloseBtn.onclick = function () {
  document.querySelector('.shade').style.display = 'none';
  plistMenu.style.display = 'none';
};

if (!window.localStorage.getItem('michi_font')) {
  window.localStorage.setItem('michi_font', btoa(fontSelect.value));
}

fontSelect.onchange = function () {
  window.localStorage.setItem('michi_font', btoa(fontSelect.value));
  fontSelect.setAttribute('data-font', fontSelect.value);
  fontSelect.value = atob(window.localStorage.getItem('michi_font'));
  document.querySelector('*').style.setProperty('--font', atob(window.localStorage.getItem('michi_font')));
}

document.querySelector('*').style.setProperty('--font', atob(window.localStorage.getItem('michi_font')));


