import { db, isFirebaseConfigured } from "./firebase-config.js";
import { collection, onSnapshot, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { categories, escapeHTML, fillSelect, formatPrice, setupHeaderAuth } from "./common.js";

setupHeaderAuth();
fillSelect("categoryFilter", categories, "Alla kategorier");

const adsGrid = document.getElementById("adsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const cityFilter = document.getElementById("cityFilter");
let ads = [];

function renderAds(){
  const term = (searchInput.value || "").toLowerCase().trim();
  const cat = categoryFilter.value;
  const city = (cityFilter.value || "").toLowerCase().trim();
  const filtered = ads.filter(ad => {
    const text = `${ad.title||""} ${ad.description||""} ${ad.category||""}`.toLowerCase();
    return (!term || text.includes(term)) && (!cat || ad.category === cat) && (!city || (ad.city||"").toLowerCase().includes(city));
  });
  if(!filtered.length){
    adsGrid.innerHTML = `<div class="empty">Inga annonser hittades.</div>`;
    return;
  }
  adsGrid.innerHTML = filtered.map(ad => `
    <article class="ad-card">
      <a class="ad-media" href="details.html?id=${encodeURIComponent(ad.id)}">
        ${ad.imageUrls?.[0] ? `<img src="${escapeHTML(ad.imageUrls[0])}" alt="${escapeHTML(ad.title)}">` : "Ingen bild"}
        <span class="ad-tag">${escapeHTML(ad.category || "Annons")}</span>
      </a>
      <div class="ad-body">
        <a class="ad-title" href="details.html?id=${encodeURIComponent(ad.id)}">${escapeHTML(ad.title)}</a>
        <div class="price">${formatPrice(ad.price)}</div>
        <div class="meta"><span>${escapeHTML(ad.city || "Okänd plats")}</span><span>•</span><span>${escapeHTML(ad.condition || "Skick ej angivet")}</span></div>
        <p>${escapeHTML((ad.description || "").slice(0, 120))}${(ad.description||"").length>120?"...":""}</p>
      </div>
      <div class="ad-actions"><a class="btn btn-soft" href="details.html?id=${encodeURIComponent(ad.id)}">Visa detaljer</a></div>
    </article>`).join("");
}

[searchInput, categoryFilter, cityFilter].forEach(el => el?.addEventListener("input", renderAds));
document.getElementById("clearFilters")?.addEventListener("click", () => { searchInput.value=""; categoryFilter.value=""; cityFilter.value=""; renderAds(); });

if(!isFirebaseConfigured){
  adsGrid.innerHTML = `<div class="empty">Firebase är inte konfigurerat ännu. Öppna firebase-config.js och fyll i dina Firebase-uppgifter.</div>`;
}else{
  const q = query(collection(db, "ads"), where("status", "==", "active"), orderBy("createdAt", "desc"), limit(60));
  onSnapshot(q, snap => {
    ads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderAds();
  }, err => {
    console.error(err);
    adsGrid.innerHTML = `<div class="empty">Kunde inte ladda annonser. Kontrollera Firestore rules och index.</div>`;
  });
}
