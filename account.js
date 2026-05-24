import { auth, db } from "./firebase-config.js";
import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, orderBy, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { requireLogin, setupHeaderAuth, showMessage, escapeHTML, formatPrice } from "./common.js";

setupHeaderAuth();
let currentUser;
requireLogin(async user => {
  currentUser = user;
  document.getElementById("avatar").textContent = (user.displayName || user.email || "V").slice(0,1).toUpperCase();
  await loadProfile(user.uid);
  listenMyAds(user.uid);
});

async function loadProfile(uid){
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data() || {};
  displayName.value = data.displayName || currentUser.displayName || "";
  phone.value = data.phone || "";
  city.value = data.city || "";
  address.value = data.address || "";
}

profileForm.addEventListener("submit", async e => {
  e.preventDefault();
  try{
    await updateProfile(currentUser, { displayName: displayName.value.trim() });
    await setDoc(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid, displayName: displayName.value.trim(), email: currentUser.email || "", phone: phone.value.trim(), city: city.value.trim(), address: address.value.trim(), updatedAt: serverTimestamp()
    }, { merge:true });
    showMessage("status", "Kontot har uppdaterats.", "success");
  }catch(err){ showMessage("status", "Kunde inte spara: " + err.message, "error"); }
});

logoutNow.addEventListener("click", async()=>{ await signOut(auth); location.href="index.html"; });

function listenMyAds(uid){
  const q = query(collection(db, "ads"), where("ownerId", "==", uid), orderBy("createdAt", "desc"));
  onSnapshot(q, snap => {
    const ads = snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!ads.length){ myAds.innerHTML = `<div class="empty">Du har inga annonser ännu.</div>`; return; }
    myAds.innerHTML = ads.map(ad => `<article class="ad-card"><a class="ad-media" href="details.html?id=${ad.id}">${ad.imageUrls?.[0] ? `<img src="${escapeHTML(ad.imageUrls[0])}" alt="${escapeHTML(ad.title)}">` : "Ingen bild"}<span class="ad-tag">${escapeHTML(ad.status||"active")}</span></a><div class="ad-body"><a class="ad-title" href="details.html?id=${ad.id}">${escapeHTML(ad.title)}</a><div class="price">${formatPrice(ad.price)}</div><div class="meta"><span>${escapeHTML(ad.category||"")}</span><span>•</span><span>${escapeHTML(ad.city||"")}</span></div></div><div class="ad-actions" style="display:grid;gap:8px"><a class="btn btn-soft" href="post-ad.html?id=${ad.id}">Redigera</a><button class="btn btn-danger" data-delete="${ad.id}">Arkivera</button></div></article>`).join("");
    document.querySelectorAll("[data-delete]").forEach(btn=> btn.onclick = async()=>{
      if(confirm("Vill du arkivera annonsen? Den försvinner från publika listan.")) await updateDoc(doc(db,"ads",btn.dataset.delete), {status:"archived", updatedAt:serverTimestamp()});
    });
  }, err => myAds.innerHTML = `<div class="empty">Kunde inte ladda annonser: ${escapeHTML(err.message)}</div>`);
}
