'use strict';

const menubtn = document.getElementById('openMenu');
const mmcloseBtn = document.getElementById('mmenuCloseBtn');
const themeswitcher = document.getElementById('settings_theme');
const brswitcher = document.getElementById('settings_bradius');
const plmcloseBtn = document.getElementById('plmenuCloseBtn');
const plistMenu = document.querySelector('.plistmenu');
const plistBtn = document.getElementById('openplistMenu');
const fontSelect = $('#settings_font');

const mtheme = {
  light: {
    body: {
      bg: '#d9d9dd',
      clr: '#222'
    },
    header: {
      bg: '#b0b0b0',
      clr: '#333'
    }
  },
  dark: {
    body: {
      bg: '#001e1d',
      clr: '#e8e4e6'
    },
    header: {
      bg: '#222',
      clr: '#eee'
    }
  }
}

function setTheme(colorScheme) {
  if (colorScheme === 'dark') {
    document.querySelector('body').style.backgroundColor = mtheme.dark.body.bg;
    document.querySelector('body').style.color = mtheme.dark.body.clr;
    document.querySelector('body').style.setProperty('--headerBg', mtheme.dark.header.bg);
    document.querySelector('body').style.setProperty('--headerClr', mtheme.dark.header.clr);
  } else if (colorScheme === 'light') {
    document.querySelector('body').style.backgroundColor = mtheme.light.body.bg;
    document.querySelector('body').style.color = mtheme.light.body.clr;
    document.querySelector('body').style.setProperty('--headerBg', mtheme.light.header.bg);
    document.querySelector('body').style.setProperty('--headerClr', mtheme.light.header.clr);
  } else return console.error('Unknown theme. Available themes: "dark", "light". You can create custom themes by adding your theme to mtheme object.');
}

menubtn.onclick = function () {
  $('#mainmenu_servers').open = false;
  $('#mainmenu_settings').open = false;
  document.querySelector('.shade').style.display = 'block';
  document.querySelector('.mainmenu').style.display = 'block';
};

mmcloseBtn.onclick = function () {
  $('#mainmenu_servers').open = true;
  $('#mainmenu_settings').open = true;
  document.querySelector('.shade').style.display = 'none';
  document.querySelector('.mainmenu').style.display = 'none';
};

themeswitcher.onclick = function () {
  if (this.checked) {
    setTheme('light');
    window.localStorage.setItem('michi_theme', 'light');
  } else {
    setTheme('dark');
    window.localStorage.setItem('michi_theme', 'dark');
  }
};

if (window.localStorage.getItem('michi_theme') === 'dark') {
  setTheme('dark');
  themeswitcher.checked = false;
}

if (window.localStorage.getItem('michi_theme') === 'light') {
  setTheme('light');
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


