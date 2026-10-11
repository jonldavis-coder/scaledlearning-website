/* ScaledLearning help assistant: a small built-in chat widget.
   Runs entirely in the browser. No external services, no API keys, no tracking.
   The only request it makes is for the local knowledge base (assets/assistant-kb.js), on first open. */
(function(){
  'use strict';
  if (window.__slAssistant) return; window.__slAssistant = true;
  var me = document.currentScript || document.querySelector('script[src*="assistant.js"]');
  var src = me ? me.src : 'assets/assistant.js';
  var VER = (src.match(/[?&]v=([^&]+)/) || [,''])[1];
  var BASE = src.replace(/assets\/assistant\.js.*$/, '');   // site root (works from /dl/ pages and file://)
  var STORE = 'slAssistantLog';
  var KB = null, kbLoading = false, pending = [];
  var CHAT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 11h7M8.5 14h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var KITE = '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="11" fill="#ff7a2a"/><path d="M33 6 Q22 22 7 30 Q18 26 28 33 Q26 18 33 6Z" fill="#5a3fd0"/><path d="M33 6 Q26 18 28 33 Q23 28 19 27 Q28 18 33 6Z" fill="#fff"/></svg>';

  function el(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function url(h){ return /^(https?:|mailto:|#)/.test(h) ? h : BASE + h; }

  // ---------- UI ----------
  var launcher = el('button', 'sla-launch', CHAT_SVG + '<span class="sla-launch-label">Ask ScaledLearning</span>');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Ask ScaledLearning: open the help assistant');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'sla-panel');

  var panel = el('div', 'sla-panel');
  panel.id = 'sla-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'sla-title');
  panel.hidden = true;
  panel.innerHTML =
    '<div class="sla-head">' + KITE +
      '<div class="sla-head-txt"><h2 id="sla-title">Ask ScaledLearning</h2><p>Quick answers from our site. Runs in your browser.</p></div>' +
      '<button type="button" class="sla-close" aria-label="Close help assistant"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>' +
    '</div>' +
    '<div class="sla-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="Conversation"></div>' +
    '<div class="sla-chips" role="group" aria-label="Suggested topics"></div>' +
    '<form class="sla-form" autocomplete="off">' +
      '<label class="sla-sr" for="sla-input">Type your question</label>' +
      '<input id="sla-input" class="sla-input" type="text" maxlength="200" placeholder="Ask a question..." enterkeyhint="send">' +
      '<button type="submit" class="sla-send" aria-label="Send question"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '</form>';
  var log = panel.querySelector('.sla-log'), chips = panel.querySelector('.sla-chips');
  var form = panel.querySelector('.sla-form'), input = panel.querySelector('.sla-input'), closeBtn = panel.querySelector('.sla-close');

  function mount(){ document.body.appendChild(panel); document.body.appendChild(launcher); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  // ---------- Conversation log (sessionStorage only, so it survives page changes within a visit) ----------
  var msgs = [];
  try { msgs = JSON.parse(sessionStorage.getItem(STORE) || '[]') || []; } catch (e) { msgs = []; }
  function save(){ try { sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-30))); } catch (e) {} }

  function renderMsg(m){
    var row = el('div', 'sla-msg ' + (m.who === 'me' ? 'sla-me' : 'sla-bot'));
    var bubble = el('div', 'sla-bubble');
    var p = document.createElement('p'); var sr = el('span', 'sla-sr'); sr.textContent = m.who === 'me' ? 'You: ' : 'Assistant: '; p.appendChild(sr); p.appendChild(document.createTextNode(m.text)); bubble.appendChild(p);
    if (m.links && m.links.length){
      var ul = el('ul', 'sla-links');
      m.links.forEach(function(l){ var li = document.createElement('li'), a = document.createElement('a'); a.href = url(l[0]); a.textContent = l[1]; li.appendChild(a); ul.appendChild(li); });
      bubble.appendChild(ul);
    }
    row.appendChild(bubble); log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }
  function add(m){ msgs.push(m); save(); renderMsg(m); }

  // ---------- Matching ----------
  var SYN = {};
  function stem(w){
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (/sses$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function tokens(s){
    s = String(s).toLowerCase()
      .replace(/[\u2018\u2019']/g, '')
      .replace(/(\d),(\d)/g, '$1$2')
      .replace(/\be[\s-]+books?\b/g, 'ebook')
      .replace(/\bbook (a|an|my|our)\b/g, 'schedule $1')
      .replace(/[^a-z0-9]+/g, ' ').trim();
    if (!s) return [];
    return s.split(' ').map(function(w){ w = stem(w); return SYN[w] || w; });
  }
  function has(toks, phrase){
    var n = phrase.length;
    outer: for (var i = 0; i + n <= toks.length; i++){
      for (var j = 0; j < n; j++) if (toks[i + j] !== phrase[j]) continue outer;
      return true;
    }
    return false;
  }
  function prep(kb){
    Object.keys(kb.synonyms || {}).forEach(function(canon){
      var c = stem(canon);
      kb.synonyms[canon].forEach(function(w){ SYN[stem(w)] = c; });
      SYN[c] = c;
    });
    kb.byId = {};
    kb.intents.forEach(function(it){
      kb.byId[it.id] = it;
      it._k = (it.k || []).map(tokens).filter(function(t){ return t.length; });
      it._w = (it.w || []).map(tokens).filter(function(t){ return t.length; });
    });
  }
  function score(it, toks){
    var strong = 0, weak = 0;
    it._k.forEach(function(p){ if (has(toks, p)) strong += 3 + 1.5 * (p.length - 1); });
    if (!strong) return 0;
    it._w.forEach(function(p){ if (has(toks, p)) weak += 1; });
    return strong + weak;
  }
  function answer(q){
    var toks = tokens(q), best = null, bestScore = 0;
    KB.intents.forEach(function(it){ var s = score(it, toks); if (s > bestScore){ bestScore = s; best = it; } });
    if (!best || bestScore < 3) return KB.fallback;
    return best;
  }
  window.slAssistantAnswer = function(q){ return KB ? answer(q) : null; };   // handy for testing

  // ---------- KB loading (one local file) ----------
  function withKB(fn){
    if (KB) return fn();
    pending.push(fn);
    if (kbLoading) return; kbLoading = true;
    var s = document.createElement('script');
    s.src = BASE + 'assets/assistant-kb.js' + (VER ? '?v=' + VER : '');
    s.async = true;
    s.onload = function(){ KB = window.SL_ASSISTANT_KB; if (!KB){ s.onerror(); return; } prep(KB); var p = pending; pending = []; p.forEach(function(f){ f(); }); };
    s.onerror = function(){ kbLoading = false; pending = []; renderMsg({who: 'bot', text: "Sorry, the help assistant couldn't load. Please use the Contact page.", links: [['contact.html', 'Contact us']]}); };
    document.head.appendChild(s);
  }
  function respond(it){ add({who: 'bot', text: it.text, links: it.links || []}); }
  function ask(q){
    q = String(q || '').trim(); if (!q) return;
    add({who: 'me', text: q});
    withKB(function(){ respond(answer(q)); });
  }

  var built = false;
  function build(){
    if (built) return; built = true;
    chips.innerHTML = '';
    KB.chips.forEach(function(c){
      var b = el('button', 'sla-chip'); b.type = 'button'; b.textContent = c[0];
      b.addEventListener('click', function(){ add({who: 'me', text: c[0]}); respond(KB.byId[c[1]]); input.focus({preventScroll: true}); });
      chips.appendChild(b);
    });
    if (!msgs.length) add({who: 'bot', text: KB.greeting});
  }

  // ---------- Open / close ----------
  function open(){
    if (!panel.hidden) return;
    panel.hidden = false;
    document.documentElement.classList.add('sla-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!log.childNodes.length) msgs.forEach(renderMsg);
    withKB(build);
    requestAnimationFrame(function(){ log.scrollTop = log.scrollHeight; input.focus({preventScroll: true}); });
  }
  function close(){
    if (panel.hidden) return;
    panel.hidden = true;
    document.documentElement.classList.remove('sla-open');
    launcher.setAttribute('aria-expanded', 'false');
    try { launcher.focus({preventScroll: true}); } catch (e) {}
  }
  launcher.addEventListener('click', function(){ panel.hidden ? open() : close(); });
  closeBtn.addEventListener('click', close);
  panel.addEventListener('keydown', function(e){ if (e.key === 'Escape' || e.key === 'Esc'){ e.preventDefault(); e.stopPropagation(); close(); } });
  document.addEventListener('keydown', function(e){ if ((e.key === 'Escape' || e.key === 'Esc') && !panel.hidden && panel.contains(document.activeElement)) close(); });
  form.addEventListener('submit', function(e){ e.preventDefault(); var q = input.value; input.value = ''; ask(q); });
  // Opening the mobile menu closes the assistant so the two never overlap.
  var hdrToggle = document.querySelector('.hdr-toggle');
  if (hdrToggle) hdrToggle.addEventListener('click', close);
})();
