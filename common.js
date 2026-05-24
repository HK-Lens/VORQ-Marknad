import { auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const categories = [
  "Elektronik", "Möbler", "Kläder", "Hem & trädgård", "Cyklar", "Barnartiklar", "Sport", "Böcker", "Verktyg", "Övrigt"
];

export const conditions = ["Ny", "Som ny", "Bra skick", "Använd", "Behöver reparation"];

export function formatPrice(value){
  const n = Number(value || 0);
  return new Intl.NumberFormat("sv-SE", { style:"currency", currency:"SEK", maximumFractionDigits:0 }).format(n);
}

export function escapeHTML(str=""){
  return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

export function showMessage(id, text, type="notice"){
  const el = document.getElementById(id);
  if(!el) return;
  el.className = `notice ${type}`;
  el.textContent = text;
  el.classList.remove("hidden");
}

export function hideMessage(id){
  const el = document.getElementById(id);
  if(el) el.classList.add("hidden");
}

export function fillSelect(id, values, placeholder){
  const select = document.getElementById(id);
  if(!select) return;
  select.innerHTML = placeholder ? `<option value="">${placeholder}</option>` : "";
  values.forEach(v => select.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`));
}

export function setupHeaderAuth(){
  const authArea = document.getElementById("authArea");
  const logoutBtn = document.getElementById("logoutBtn");
  if(!authArea) return;

  if(!isFirebaseConfigured){
    authArea.innerHTML = `<a href="README-SETUP.txt">Firebase saknas</a>`;
    return;
  }

  onAuthStateChanged(auth, async user => {
    if(user){
      authArea.innerHTML = `<a href="post-ad.html">Publicera annons</a><a href="account.html">Mitt konto</a><button id="logoutBtn2">Logga ut</button>`;
      document.getElementById("logoutBtn2")?.addEventListener("click", async()=>{
        await signOut(auth);
        location.href = "index.html";
      });
      await ensureUserProfile(user);
    }else{
      authArea.innerHTML = `<a href="login.html">Logga in</a><a class="btn btn-primary" href="login.html#create">Skapa konto</a>`;
    }
  });

  logoutBtn?.addEventListener("click", () => signOut(auth));
}

export async function ensureUserProfile(user){
  if(!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if(!snap.exists()){
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      phone: "",
      city: "",
      address: "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge:true });
  }
}

export function requireLogin(callback){
  if(!isFirebaseConfigured){
    showMessage("status", "Firebase är inte konfigurerat ännu. Fyll i firebase-config.js först.", "error");
    return;
  }
  onAuthStateChanged(auth, user => {
    if(!user){
      location.href = "login.html?next=" + encodeURIComponent(location.pathname.split('/').pop() + location.search);
      return;
    }
    callback(user);
  });
}

export function getParam(name){
  return new URLSearchParams(location.search).get(name);
}
