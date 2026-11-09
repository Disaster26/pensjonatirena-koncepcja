(function(){
  var d=document;
  var rok=d.getElementById('rok'); if(rok) rok.textContent=new Date().getFullYear();

  // przeciąganie myszą (palec działa natywnie)
  function przeciagnij(el){
    var x0=0,s0=0,ciag=false,ruch=0;
    el.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='mouse'||e.button!==0) return;
      ciag=true;ruch=0;x0=e.clientX;s0=el.scrollLeft;el.classList.add('ciagnie');
    });
    window.addEventListener('pointermove',function(e){
      if(!ciag) return; var dx=e.clientX-x0; ruch=Math.max(ruch,Math.abs(dx)); el.scrollLeft=s0-dx; if(ruch>3) e.preventDefault();
    });
    window.addEventListener('pointerup',function(){
      if(!ciag) return; ciag=false; el.classList.remove('ciagnie');
      // dociągnij do najbliższego elementu
      var kids=[].slice.call(el.children),best=0,bd=1e9,pad=parseFloat(getComputedStyle(el).scrollPaddingLeft)||0;
      kids.forEach(function(k){var dd=Math.abs(k.offsetLeft-pad-el.scrollLeft); if(dd<bd){bd=dd;best=k.offsetLeft-pad;}});
      el.scrollTo({left:best,behavior:'smooth'});
    });
    el.addEventListener('click',function(e){ if(ruch>5){e.preventDefault();e.stopPropagation();} },true);
    el.addEventListener('dragstart',function(e){e.preventDefault();});
  }

  // karuzele w kartach
  [].forEach.call(d.querySelectorAll('[data-karuzela]'),function(k){
    var tor=k.querySelector('.k-tor'), n=tor.children.length; if(n<2) return;
    var licz=d.createElement('span'); licz.className='k-licznik'; licz.textContent='1 / '+n; k.appendChild(licz);
    ['l','p'].forEach(function(s){
      var b=d.createElement('button'); b.className='k-btn '+s; b.type='button';
      b.setAttribute('aria-label',s==='l'?'Poprzednie zdjęcie':'Następne zdjęcie');
      b.innerHTML='<svg><use href="#i-'+s+'"/></svg>';
      b.addEventListener('click',function(){ var w=tor.clientWidth; var i=Math.round(tor.scrollLeft/w)+(s==='l'?-1:1); i=(i+n)%n; tor.scrollTo({left:i*w,behavior:'smooth'}); });
      k.appendChild(b);
    });
    tor.setAttribute('tabindex','0'); tor.setAttribute('aria-label','Zdjęcia, przesuń w bok');
    tor.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); tor.scrollBy({left:(e.key==='ArrowRight'?1:-1)*tor.clientWidth,behavior:'smooth'}); }});
    tor.addEventListener('scroll',function(){ licz.textContent=(Math.round(tor.scrollLeft/tor.clientWidth)+1)+' / '+n; },{passive:true});
    przeciagnij(tor);
  });

  // rząd okolicy
  [].forEach.call(d.querySelectorAll('[data-przeciagnij]'),przeciagnij);
  [].forEach.call(d.querySelectorAll('.strzalki'),function(s){
    var tor=d.getElementById(s.getAttribute('data-dla')); var b=s.querySelectorAll('button');
    function krok(){ var c=tor.children[0]; return c.getBoundingClientRect().width+parseFloat(getComputedStyle(tor).columnGap||22); }
    b[0].addEventListener('click',function(){tor.scrollBy({left:-krok(),behavior:'smooth'});});
    b[1].addEventListener('click',function(){tor.scrollBy({left:krok(),behavior:'smooth'});});
  });

  // menu mobilne
  var burger=d.querySelector('.burger'), menu=d.getElementById('menu-m');
  function zamknij(){ burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-label','Otwórz menu'); menu.hidden=true; d.body.classList.remove('menu-otw'); }
  burger.addEventListener('click',function(){
    var otw=burger.getAttribute('aria-expanded')==='true';
    if(otw){zamknij();} else {burger.setAttribute('aria-expanded','true'); burger.setAttribute('aria-label','Zamknij menu'); menu.hidden=false; d.body.classList.add('menu-otw');}
  });
  [].forEach.call(menu.querySelectorAll('a'),function(a){ if(a.getAttribute('href').charAt(0)==='#') a.addEventListener('click',zamknij); });
  d.addEventListener('keydown',function(e){ if(e.key==='Escape') zamknij(); });

  // nagłówek przezroczysty nad zdjęciem (komputer)
  var top=d.querySelector('.top'), hero=d.querySelector('.hero'), mq=window.matchMedia('(min-width:900px)');
  function naFoto(){ top.classList.toggle('na-foto', mq.matches && window.scrollY < hero.offsetHeight-90); }
  window.addEventListener('scroll',naFoto,{passive:true}); window.addEventListener('resize',naFoto); naFoto();

  // dolny pasek po przewinięciu za przycisk w hero
  var pasek=d.getElementById('pasek'), cta=d.querySelector('.hero-cta');
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      var poza=!en[0].isIntersecting && en[0].boundingClientRect.top<0;
      pasek.classList.toggle('widac',poza);
      pasek.setAttribute('aria-hidden',poza?'false':'true');
      [].forEach.call(pasek.querySelectorAll('a'),function(a){a.tabIndex=poza?0:-1;});
    }).observe(cta);
    // aktywna pozycja menu
    var linki={}; [].forEach.call(d.querySelectorAll('.nav a'),function(a){linki[a.getAttribute('href').slice(1)]=a;});
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ for(var k in linki) linki[k].classList.remove('akt'); if(linki[e.target.id]) linki[e.target.id].classList.add('akt'); }});
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(linki).forEach(function(id){ var s=d.getElementById(id); if(s) io.observe(s); });
  }

  // formularze pokazowe
  var dzis=new Date(), iso=function(t){return t.toISOString().slice(0,10);};
  var rf=d.getElementById('rez-form');
  rf.od.min=iso(dzis); rf.do.min=iso(dzis);
  rf.od.addEventListener('change',function(){ rf.do.min=rf.od.value; });
  rf.addEventListener('submit',function(e){ e.preventDefault(); var m=d.getElementById('rez-msg'); m.hidden=false;
    m.textContent='W gotowej stronie w tym miejscu otworzy się Państwa kalendarz rezerwacji z wybranymi datami i wolnymi pokojami.'; });
  d.getElementById('form-kontakt').addEventListener('submit',function(e){ e.preventDefault(); var m=d.getElementById('form-msg'); m.hidden=false;
    m.textContent='W gotowej stronie zapytanie trafi od razu na recepcja@pensjonatirena.pl.'; });
})();
