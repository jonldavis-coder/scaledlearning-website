/* ScaledLearning example build — minimal JS (nav, year, spam-safe email, placeholder forms) */
(function(){
  var t=document.querySelector('.nav-toggle'),l=document.getElementById('nav-links');
  if(t&&l){t.addEventListener('click',function(){var o=l.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false');});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&l.classList.contains('open')){l.classList.remove('open');t.setAttribute('aria-expanded','false');t.focus();}});}
  document.querySelectorAll('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear();});
  // Spam-safe email: assembled at runtime from parts, never present as plain text in HTML.
  document.querySelectorAll('[data-eu]').forEach(function(el){
    var a=el.getAttribute('data-eu')+String.fromCharCode(64)+el.getAttribute('data-ed');
    var link=document.createElement('a');link.href='mai'+'lto:'+a;link.textContent=a;el.textContent='';el.appendChild(link);
  });
  // Simple math check
  document.querySelectorAll('[data-math]').forEach(function(box){
    var a=2+Math.floor(Math.random()*7),b=1+Math.floor(Math.random()*8);
    box.querySelector('.q').textContent=a+' + '+b;box.setAttribute('data-answer',a+b);
  });
  // Placeholder forms — no backend; nothing is transmitted.
  document.querySelectorAll('form[data-placeholder]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var s=f.querySelector('.form-status');s.className='form-status';
      var hp=f.querySelector('.hp input');
      if(hp&&hp.value){s.textContent='Thanks!';return;} // silently ignore bots
      if(!f.checkValidity()){f.reportValidity();return;}
      var m=f.querySelector('[data-math]');
      if(m){var v=parseInt(m.querySelector('input').value,10);if(v!==parseInt(m.getAttribute('data-answer'),10)){s.textContent='Please check the math answer and try again.';s.classList.add('err');return;}}
      s.textContent=f.getAttribute('data-placeholder');s.classList.add('ok');f.reset();
    });
  });
})();
/* Free AI-Readiness quick check: scored entirely in the browser; nothing is stored or sent. */
(function(){
  var q=document.getElementById('ai-quick-check');if(!q)return;
  q.addEventListener('submit',function(e){
    e.preventDefault();
    var sets=q.querySelectorAll('fieldset'),total=0,answered=0;
    sets.forEach(function(fs){var c=fs.querySelector('input:checked');if(c){answered++;total+=parseInt(c.value,10);}});
    var out=document.getElementById('quiz-result');
    if(answered<sets.length){out.className='quiz-result show notice';out.textContent='Please answer all '+sets.length+' questions to see your result.';return;}
    var max=sets.length*2,pct=Math.round(total/max*100),msg;
    if(pct<40)msg='Getting started: begin by capturing what your teams already know (lessons learned, how-tos) and run one small, low-risk AI experiment with a clear learning goal.';
    else if(pct<75)msg='Building momentum: you have some foundations. Next, connect your captured knowledge to the tools people use daily, and make reflection a habit after each piece of work.';
    else msg='Ready to scale: you have strong foundations for in-the-workflow AI learning agents. Focus on governance, shared context, and spreading what works across teams.';
    out.className='quiz-result show notice';
    out.innerHTML='<strong>Your example score: '+pct+'%</strong><br>'+msg+'<br><span class="small">This is an illustrative self-check, not a validated assessment. Nothing you entered was stored or sent.</span>';
  });
})();
/* Placeholder checkout: buttons with data-checkout open a "coming soon" notice. No payment is taken.
   Before launch, replace each href with a Stripe Payment Link / Gumroad / Lemon Squeezy URL and remove this handler. */
(function(){
  var btns=document.querySelectorAll('[data-checkout]');if(!btns.length)return;
  var d=document.createElement('dialog');d.className='checkout-modal';d.setAttribute('aria-labelledby','co-title');
  d.innerHTML='<div class="inner"><span class="example-chip">Placeholder</span><h2 id="co-title">Checkout coming soon</h2><p>This example site doesn\'t take payments yet. No payment was taken and no data was collected.</p><p class="small">Item: <code class="co-item"></code></p><button class="btn btn-violet co-close" type="button">Close</button></div>';
  document.body.appendChild(d);
  d.querySelector('.co-close').addEventListener('click',function(){d.close();});
  d.addEventListener('click',function(e){if(e.target===d)d.close();});
  btns.forEach(function(b){b.addEventListener('click',function(e){
    if(typeof d.showModal!=='function')return; // fallback: follow #checkout-coming-soon anchor
    e.preventDefault();d.querySelector('.co-item').textContent=b.getAttribute('data-checkout');d.showModal();d.querySelector('.co-close').focus();
  });});
  // Preselect a free book when a "Get the free book" button is used
  document.querySelectorAll('[data-book]').forEach(function(a){a.addEventListener('click',function(){var s=document.getElementById('fb-book');if(s)s.value=a.getAttribute('data-book');});});
})();
