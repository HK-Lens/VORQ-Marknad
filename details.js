import { db, isFirebaseConfigured } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { setupHeaderAuth, getParam, escapeHTML, formatPrice } from "./common.js";
setupHeaderAuth();
const id = getParam("id");
const box = document.getElementById("details");
if(!id){ box.innerHTML = `<div class="empty">Ingen annons vald.</div>`; }
else if(!isFirebaseConfigured){ box.innerHTML = `<div class="empty">Firebase är inte konfigurerat.</div>`; }
else load(id);
async function load(id){
  try{
    const snap = await getDoc(doc(db,"ads",id));
    if(!snap.exists()){ box.innerHTML = `<div class="empty">Annonsen finns inte.</div>`; return; }
    const ad = snap.data();
    const imgs = ad.imageUrls || [];
    box.innerHTML = `<section class="gallery"><div class="main-img" id="mainImg">${imgs[0] ? `<img src="${escapeHTML(imgs[0])}" alt="${escapeHTML(ad.title)}">` : "Ingen bild"}</div><div class="thumbs">${imgs.map((u,i)=>`<img class="${i===0?'active':''}" src="${escapeHTML(u)}" alt="Bild ${i+1}">`).join("")}</div></section><aside class="panel"><div class="eyebrow">${escapeHTML(ad.category || "Annons")}</div><h1 class="section-title">${escapeHTML(ad.title)}</h1><div class="price">${formatPrice(ad.price)}</div><div class="meta" style="margin:12px 0"><span>${escapeHTML(ad.city||"")}</span><span>•</span><span>${escapeHTML(ad.condition||"")}</span></div><p><strong>Adress/område:</strong><br>${escapeHTML(ad.address || "Ej angivet")}</p><hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><h2>Beskrivning</h2><p style="white-space:pre-wrap">${escapeHTML(ad.description||"")}</p><hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><h2>Säljare</h2><p>${escapeHTML(ad.ownerName || "VORQ Marknad-användare")}</p><p><a class="btn btn-primary" href="mailto:${escapeHTML(ad.ownerEmail || "info@vorq.group")}?subject=Annons: ${encodeURIComponent(ad.title||"")}">Kontakta säljaren</a></p><p class="admin-note">VORQ Marknad förmedlar inte betalning i denna prototyp. Kontrollera varan innan köp.</p></aside>`;
    document.querySelectorAll(".thumbs img").forEach(img => img.onclick = () => { document.querySelector("#mainImg").innerHTML = `<img src="${img.src}" alt="Annonsbild">`; document.querySelectorAll(".thumbs img").forEach(t=>t.classList.remove("active")); img.classList.add("active"); });
  }catch(err){ box.innerHTML = `<div class="empty">Kunde inte ladda annonsen: ${escapeHTML(err.message)}</div>`; }
}
