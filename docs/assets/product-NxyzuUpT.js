import{g as v}from"./cart-506XDx_e.js";const h="https://underlying-provinces-intense-technologies.trycloudflare.com",g=document.querySelector(".page-transition");g&&(v.set(g,{scaleY:1,transformOrigin:"center"}),v.to(g,{scaleY:0,duration:.8,ease:"power4.inOut",delay:.15}));function A(t){if(!g||t===window.location.pathname){window.location.href=t;return}v.to(g,{scaleY:1,duration:.8,ease:"power4.inOut",onComplete:()=>{window.location.href=t}})}const f=document.querySelector(".menu-toggle"),S=document.querySelector(".nav-links");f&&f.addEventListener("click",()=>{f.classList.toggle("active"),S.classList.toggle("active")});const q=document.querySelectorAll(".nav-links a");q.forEach(t=>{t.addEventListener("click",o=>{const e=t.getAttribute("href");!e||e==="#"||e===window.location.pathname||(o.preventDefault(),f&&(f.classList.remove("active"),S.classList.remove("active")),A(e))})});const E=t=>"$ "+t.toLocaleString("es-AR",{minimumFractionDigits:0,maximumFractionDigits:0}),T=new URLSearchParams(window.location.search),L=T.get("slug"),y=document.getElementById("product-page");async function B(t){try{const o=`${h}/api/collections/products/records?filter=${encodeURIComponent(`(slug='${t}')`)}`,e=await fetch(o);if(!e.ok)throw new Error(`HTTP ${e.status}`);return(await e.json()).items?.[0]||null}catch(o){return console.error("Error fetching product:",o),null}}async function I(t){try{const o=`${h}/api/collections/product_options/records?filter=(product='${t}')`,e=await fetch(o);if(!e.ok)throw new Error(`HTTP ${e.status}`);return(await e.json()).items||[]}catch(o){return console.error("Error fetching options:",o),[]}}async function P(t){try{const o=`${h}/api/collections/product_variants/records?filter=(product='${t}')`,e=await fetch(o);if(!e.ok)throw new Error(`HTTP ${e.status}`);return(await e.json()).items||[]}catch(o){return console.error("Error fetching variants:",o),[]}}function C(t,o){for(const e of t){const n=e.options||{},i=Object.keys(o);if(i.length===0)return e;let d=!0;for(const a of i)if(n[a]!==o[a]){d=!1;break}if(d)return e}return null}function k(t,o,e){return!o||o.length===0?'<div class="gallery-placeholder"></div>':`
    <div class="gallery-carousel">
      <button class="gallery-arrow gallery-arrow-left" aria-label="Anterior">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <div class="gallery-track">
        ${o.map((n,i)=>`
          <img class="gallery-slide ${i===e?"active":""}" src="${h}/api/files/products/${t.id}/${n}" alt="${t.name}" />
        `).join("")}
      </div>
      <button class="gallery-arrow gallery-arrow-right" aria-label="Siguiente">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
      <div class="gallery-dots">
        ${o.map((n,i)=>`<span class="gallery-dot ${i===e?"active":""}" data-index="${i}"></span>`).join("")}
      </div>
    </div>
  `}function $(t){const o=document.querySelector(".gallery-carousel");if(!o)return;const e=o.querySelectorAll(".gallery-slide"),n=o.querySelectorAll(".gallery-dot"),i=o.querySelector(".gallery-arrow-left"),d=o.querySelector(".gallery-arrow-right");if(e.length===0)return;let a=0;e.forEach((r,u)=>{r.classList.contains("active")&&(a=u)});function l(r){r<0&&(r=e.length-1),r>=e.length&&(r=0),a=r,e.forEach((u,p)=>u.classList.toggle("active",p===a)),n.forEach((u,p)=>u.classList.toggle("active",p===a))}i.addEventListener("click",()=>l(a-1)),d.addEventListener("click",()=>l(a+1)),n.forEach(r=>{r.addEventListener("click",()=>l(parseInt(r.dataset.index)))})}function j(t,o,e){const n=t.images&&t.images.length>0?t.images:[],i={tops:"Tops",outerwear:"Outerwear",bottoms:"Bottoms",accessories:"Accessories",archive_rental:"Archive Rental"},d=e.length>0?Math.min(...e.filter(c=>c.price_ars).map(c=>c.price_ars)):null;let a=e.find(c=>c.stock>0)||e[0]||null;const l=a?{...a.options}:{};let r=a;const u={negro:"#1a1a1a",blanco:"#f0f0f0",gris:"#999",oliva:"#6b6e4b",beige:"#e8dcc8",crudo:"#f5ecd7",celeste:"#b3d4e0",verde:"#5c7a5c",indigo:"#3f51b5",naranja:"#e67e22","negro/blanco":"linear-gradient(135deg, #1a1a1a 50%, #f0f0f0 50%)","rojo/crema":"linear-gradient(135deg, #c0392b 50%, #f5ecd7 50%)"};let p="";const w=o.find(c=>c.kind==="color");w&&(p=`
      <div class="product-options">
        <div class="product-option-group">
          <div class="product-option-values" data-kind="color">
            ${(Array.isArray(w.values)?w.values:[]).map(s=>`<button class="option-btn option-color ${l.color===s?"active":""}" data-value="${s}" style="background:${u[s.toLowerCase()]||"#ccc"}" title="${s}"></button>`).join("")}
          </div>
        </div>
      </div>`),y.innerHTML=`
    <a href="./shop.html" class="product-back">&larr; Volver</a>
    <div class="product-gallery-section">
      ${k(t,r?.images||n,0)}
    </div>
    <div class="product-info-section">
      <h1 class="product-name">${t.name}</h1>
      <span class="product-category">${i[t.category]||t.category}</span>
      <span class="product-price" id="product-price">${d?E(d):""}</span>
      ${p}
      <button class="add-to-bag-btn" id="add-to-bag-btn">Add to Bag</button>
    </div>
    <div class="cart-popup-overlay" id="cart-popup">
      <div class="cart-popup">
        <p class="cart-popup-msg">Agregado!</p>
        <div class="cart-popup-buttons">
          <button class="cart-popup-btn secondary" id="popup-continue">Seguir comprando</button>
          <button class="cart-popup-btn primary" id="popup-cart">Ver mi carrito</button>
        </div>
      </div>
    </div>
  `,$(r?.images||n),document.getElementById("add-to-bag-btn").addEventListener("click",()=>{r&&window.cart.add({id:t.id,slug:t.slug,name:t.name,image:r?.images?.[0]||t.images?.[0],price:r.price_ars,sku:r.sku,options:{...l},quantity:1}),document.getElementById("cart-popup").classList.add("open")}),document.getElementById("popup-continue").addEventListener("click",()=>{document.getElementById("cart-popup").classList.remove("open")}),document.getElementById("popup-cart").addEventListener("click",()=>{document.getElementById("cart-popup").classList.remove("open"),window.cart.open()});const b=y.querySelector(".product-option-values");b&&b.querySelectorAll(".option-btn").forEach(c=>{c.addEventListener("click",()=>{b.querySelectorAll(".option-btn").forEach(m=>m.classList.remove("active")),c.classList.add("active"),l.color=c.dataset.value;const s=C(e,l);if(s){r=s,document.getElementById("product-price").textContent=E(s.price_ars);const m=document.querySelector(".product-gallery-section");m&&(m.innerHTML=k(t,s.images||n,0),$(s.images||n))}})}),v.from([".gallery-carousel",".product-info-section"],{opacity:0,y:20,duration:.6,stagger:.1,ease:"power2.out"})}async function _(){if(!L){y.innerHTML='<div class="product-404"><h2>Producto no encontrado</h2><p>No se especifico un producto.</p></div>';return}const t=await B(L);if(!t){y.innerHTML='<div class="product-404"><h2>Producto no encontrado</h2><p>El producto que buscas no existe.</p></div>';return}const[o,e]=await Promise.all([I(t.id),P(t.id)]);j(t,o,e)}_();
