// Preview lock. This hides the page from casual visitors; it is not real security,
// because the files themselves stay public. To remove it, delete this file and its
// script tag in index.html.
(function () {
  var HASH = '0ad18617f94894d3eef5f8f652109de008cc3130d473b069de4fef137b52a549';
  var KEY = 'khair-preview';
  var root = document.documentElement;
  try { if (sessionStorage.getItem(KEY) === HASH) return; } catch (e) {}
  root.classList.add('locked');

  var sha = function (text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    var gate = document.createElement('form');
    gate.id = 'gate';
    gate.innerHTML = '<div class="gate-card"><svg aria-hidden="true"><use href="#k"/></svg>' +
      '<h1>K Hair Studio</h1><p>Private preview. Enter the password to continue.</p>' +
      '<label class="sr" for="gatePw">Password</label>' +
      '<input id="gatePw" type="password" autocomplete="off" placeholder="Password" required>' +
      '<button class="btn btn-red" type="submit">Open the site</button>' +
      '<p class="gate-err" role="alert"></p></div>';
    document.body.appendChild(gate);
    var input = gate.querySelector('input');
    input.focus();
    gate.addEventListener('submit', function (e) {
      e.preventDefault();
      sha(input.value).then(function (hash) {
        if (hash !== HASH) {
          gate.querySelector('.gate-err').textContent = 'That password is not right.';
          input.select();
          return;
        }
        try { sessionStorage.setItem(KEY, HASH); } catch (err) {}
        root.classList.remove('locked');
        gate.remove();
      });
    });
  });
})();
