const WHATSAPP = '919769004737';
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Only the entry prices are public. Everything else is a WhatsApp conversation.
const MENU = {
  menuWomen: [
    ['Haircut', 500], ['Blow dry', 350], ['Hair spa', 0, 'L\'Oréal Hair Spa'], ['Hair colour', 0, 'L\'Oréal colour'],
    ['Highlights', 0], ['Smoothing', 0], ['Head massage', 0], ['Threading', 0], ['Facial', 0],
  ],
  menuMen: [
    ['Haircut', 200], ['Beard', 120, 'Normal or fade'], ['Hair wash', 0], ['Head massage', 0],
    ['Hair spa', 0], ['Clean-up', 0], ['Hair colour', 0],
  ],
};
const SERVICES = {
  Women: ['Haircut', 'Blow dry', 'Hair spa', 'Hair colour', 'Highlights', 'Smoothing', 'Head massage', 'Threading', 'Facial'],
  Men: ['Haircut', 'Beard', 'Hair wash', 'Head massage', 'Hair spa', 'Clean-up', 'Hair colour'],
  Child: ['Haircut'],
};

$$('.wa').forEach(a => {
  a.href = waLink(a.dataset.text);
  a.target = '_blank';
  a.rel = 'noopener';
});

for (const [id, rows] of Object.entries(MENU)) {
  const who = id === 'menuWomen' ? 'women' : 'men';
  $('#' + id).innerHTML = rows.map(([name, from, note]) => `<li>
    <span class="name">${name}${note ? `<small>${note}</small>` : ''}</span>
    ${from
      ? `<span class="price"><small>from</small>₹${from}</span>`
      : `<a class="ask" target="_blank" rel="noopener" href="${waLink(`Hi K Hair Studio, what is the price for ${name.toLowerCase()} (${who})?`)}" aria-label="Ask the price of ${name.toLowerCase()} on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3z"/></svg>Ask</a>`}
  </li>`).join('');
}

// Open or closed, in salon time
(function openStatus() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hour = now.getHours() + now.getMinutes() / 60;
  const open = hour >= 9 && hour < 22;
  $('#openNow').innerHTML = `<i class="dot${open ? '' : ' closed'}"></i> ${open ? 'Open now' : 'Closed now'}`;
  $('#openNote').textContent = open ? 'Today until 10 pm' : 'Opens at 9 am';
  const bar = $('#dayBar');
  bar.style.setProperty('--now', `${Math.min(100, Math.max(0, (hour - 9) / 13 * 100))}%`);
  bar.classList.toggle('closed', !open);
})();

$('#year').textContent = new Date().getFullYear();

// Header hairline once scrolled
const head = $('#head');
addEventListener('scroll', () => head.classList.toggle('stuck', scrollY > 60), { passive: true });

// Reveal on scroll
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
$$('.rise, .wipe').forEach(el => io.observe(el));

// Gallery filter
const shots = $$('.shot');
const showWork = filter => {
  $$('#tabs .tab').forEach(t => t.setAttribute('aria-pressed', t.dataset.filter === filter));
  shots.forEach(s => { s.hidden = filter !== 'all' && !s.dataset.cat.split(' ').includes(filter); });
};
$$('#tabs .tab').forEach(tab => tab.addEventListener('click', () => showWork(tab.dataset.filter)));
$$('#tiles .tile').forEach(tile => tile.addEventListener('click', () => {
  showWork(tile.dataset.go);
  $('#work').scrollIntoView();
}));

// Lightbox
const box = $('#lightbox');
$('#gallery').addEventListener('click', e => {
  const btn = e.target.closest('button[data-full]');
  if (!btn) return;
  $('#lbImg').src = `assets/img/${btn.dataset.full}.webp`;
  $('#lbImg').alt = $('img', btn).alt;
  $('#lbCap').textContent = btn.nextElementSibling ? btn.nextElementSibling.textContent : btn.parentElement.querySelector('figcaption').textContent;
  box.showModal();
});
$('#lbClose').addEventListener('click', () => box.close());
box.addEventListener('click', e => { if (e.target.tagName !== 'IMG') box.close(); });

// Before and after
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
$$('.ba').forEach(ba => {
  const input = $('input', ba);
  let touched = false;
  input.addEventListener('input', e => { touched = true; ba.style.setProperty('--pos', e.target.value + '%'); });
  if (calm) return;
  // One slow sweep the first time it's seen, so people know it moves
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    seen.disconnect();
    const start = performance.now();
    const step = t => {
      if (touched) return;
      const p = Math.min(1, (t - start) / 2200);
      const pos = 50 + Math.sin(p * Math.PI * 2) * 26 * (1 - p * .2);
      ba.style.setProperty('--pos', (p === 1 ? 50 : pos) + '%');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, { threshold: .55 });
  seen.observe(ba);
});

// Score counts up when it arrives
const score = $('#scoreNum');
if (!calm) {
  const counted = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    counted.disconnect();
    const start = performance.now();
    const step = t => {
      const p = Math.min(1, (t - start) / 900);
      score.textContent = (4.7 * (1 - (1 - p) ** 3)).toFixed(1);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, { threshold: .6 });
  counted.observe(score);
}

// Chip helpers
const chip = (type, name, value, label, sub, checked) => `<label class="chip">
  <input type="${type}" name="${name}" value="${value}"${checked ? ' checked' : ''}>
  <span>${label}${sub ? `<small>${sub}</small>` : ''}</span></label>`;
const picked = (form, name) => $$(`input[name="${name}"]:checked`, form).map(i => i.value);
const setErr = (form, key, msg) => { $(`[data-err="${key}"]`, form).textContent = msg || ''; };

// Booking
const book = $('#bookForm');
$('#bFor').innerHTML = ['Women', 'Men', 'Child'].map((w, i) => chip('radio', 'for', w, w, '', i === 0)).join('');
$('#bFirst').innerHTML = chip('radio', 'first', 'yes', 'Yes, it\'s my first visit', '', true) + chip('radio', 'first', 'no', 'I\'ve been before');

const drawServices = () => {
  const who = picked(book, 'for')[0];
  $('#bServices').innerHTML = SERVICES[who].map(s => chip('checkbox', 'service', s, s)).join('');
};
drawServices();
$('#bFor').addEventListener('change', drawServices);

const ist = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
const days = Array.from({ length: 7 }, (_, i) => { const d = ist(); d.setDate(d.getDate() + i); return d; });
const dayLabel = (d, i) => i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
const daySub = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
$('#bDays').innerHTML = days.map((d, i) => chip('radio', 'day', `${dayLabel(d, i)}, ${daySub(d)}`, dayLabel(d, i), daySub(d))).join('');

const hourLabel = h => `${h > 12 ? h - 12 : h} ${h >= 12 ? 'pm' : 'am'}`;
const hours = Array.from({ length: 13 }, (_, i) => i + 9); // last slot 9 pm, salon closes at 10
$('#bTimes').innerHTML = hours.map(h => chip('radio', 'time', hourLabel(h), hourLabel(h))).join('');

// Today's slots that have already passed can't be picked
const lockPast = () => {
  const today = $('#bDays input').checked;
  const now = ist().getHours();
  $$('#bTimes input').forEach((inp, i) => {
    inp.disabled = today && hours[i] <= now;
    if (inp.disabled) inp.checked = false;
  });
};
$('#bDays').addEventListener('change', lockPast);

// The coupon fills itself in as choices are made
const ticket = key => $(`#ticket [data-t="${key}"]`);
const drawTicket = () => {
  const services = picked(book, 'service');
  const day = picked(book, 'day')[0];
  const time = picked(book, 'time')[0];
  const fill = (key, value, empty) => {
    ticket(key).textContent = value || empty;
    ticket(key).classList.toggle('set', !!value);
  };
  fill('name', $('#bName').value.trim(), 'Your name');
  fill('service', services.join(', '), 'Pick from the list');
  fill('when', day && time ? `${day} at ${time}` : day || time, 'Pick a day and time');
  fill('offer', picked(book, 'first')[0] === 'yes' ? 'First-visit discount applied' : '', 'Regular visit');
};
book.addEventListener('change', drawTicket);
book.addEventListener('input', drawTicket);
drawTicket();

book.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#bName').value.trim();
  const services = picked(book, 'service');
  const day = picked(book, 'day')[0];
  const time = picked(book, 'time')[0];
  setErr(book, 'name', name ? '' : 'Please add your name.');
  setErr(book, 'services', services.length ? '' : 'Pick at least one service.');
  setErr(book, 'day', day ? '' : 'Pick a day.');
  setErr(book, 'time', time ? '' : 'Pick a time.');
  if (!name || !services.length || !day || !time) {
    $('.err:not(:empty)', book).scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const first = picked(book, 'first')[0] === 'yes';
  const note = $('#bNote').value.trim();
  const text = [
    'New booking from the K Hair website',
    '',
    `Name: ${name}`,
    `For: ${picked(book, 'for')[0]}`,
    `Service: ${services.join(', ')}`,
    `When: ${day} at ${time}`,
    `First visit: ${first ? 'Yes (website offer: 15% off on ₹1,000+, 10% below)' : 'No'}`,
    note ? `Note: ${note}` : '',
  ].filter((l, i) => l || i === 1).join('\n');
  const url = waLink(text);
  window.open(url, '_blank', 'noopener');
  const sent = $('#bSent');
  sent.innerHTML = `WhatsApp is open with your booking. Press send to finish. <a class="link" target="_blank" rel="noopener" href="${url}">Didn't open? Tap here.</a>`;
  sent.classList.add('show');
});

// Feedback
const fb = $('#fbForm');
const RATES = ['Poor', 'Could be better', 'Okay', 'Good', 'Loved it'];
$('#fRate').innerHTML = RATES.map((r, i) => `<label class="star"><input type="radio" name="rate" value="${i + 1}/5 (${r})" aria-label="${r}"><span aria-hidden="true">★</span></label>`).join('');
const stars = $$('#fRate .star');
const lightStars = upto => stars.forEach((s, i) => s.classList.toggle('on', i <= upto));
const chosenStar = () => stars.findIndex(s => $('input', s).checked);
stars.forEach((s, i) => {
  s.addEventListener('mouseenter', () => lightStars(i));
  $('input', s).addEventListener('change', () => { lightStars(i); $('#fRateWord').textContent = RATES[i]; });
});
$('#fRate').addEventListener('mouseleave', () => lightStars(chosenStar()));
$('#fTopics').innerHTML = ['Haircut', 'Colour', 'Skin and threading', 'Staff', 'Cleanliness', 'Waiting time', 'Price'].map(t => chip('checkbox', 'topic', t, t)).join('');

fb.addEventListener('submit', e => {
  e.preventDefault();
  const rate = picked(fb, 'rate')[0];
  const body = $('#fText').value.trim();
  setErr(fb, 'rate', rate ? '' : 'Please pick one.');
  setErr(fb, 'text', body ? '' : 'A line or two helps us most.');
  if (!rate || !body) return;
  const topics = picked(fb, 'topic');
  const name = $('#fName').value.trim();
  const text = [
    'Feedback from the K Hair website',
    '',
    `Rating: ${rate}`,
    topics.length ? `About: ${topics.join(', ')}` : '',
    `Message: ${body}`,
    name ? `From: ${name}` : '',
  ].filter((l, i) => l || i === 1).join('\n');
  const url = waLink(text);
  window.open(url, '_blank', 'noopener');
  const sent = $('#fSent');
  sent.innerHTML = `Thank you. Press send in WhatsApp and it reaches Kadir. <a class="link" target="_blank" rel="noopener" href="${url}">Didn't open? Tap here.</a>`;
  sent.classList.add('show');
});
