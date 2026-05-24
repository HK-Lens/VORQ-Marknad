import { auth, db, googleProvider, isFirebaseConfigured } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ensureUserProfile, showMessage, hideMessage } from "./common.js";

const next = new URLSearchParams(location.search).get("next") || "account.html";
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

function switchTab(mode){
  const create = mode === "create";
  loginForm.classList.toggle("hidden", create);
  signupForm.classList.toggle("hidden", !create);
  loginTab.classList.toggle("active", !create);
  signupTab.classList.toggle("active", create);
  hideMessage("status");
}
loginTab.onclick = () => switchTab("login");
signupTab.onclick = () => switchTab("create");
if(location.hash === "#create") switchTab("create");

if(!isFirebaseConfigured){ showMessage("status", "Firebase saknas. Fyll i firebase-config.js innan inloggning fungerar.", "error"); }

onAuthStateChanged(auth, user => { if(user) ensureUserProfile(user); });

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  try{
    await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value);
    location.href = next;
  }catch(err){ showMessage("status", firebaseError(err), "error"); }
});

signupForm.addEventListener("submit", async e => {
  e.preventDefault();
  try{
    const cred = await createUserWithEmailAndPassword(auth, signupEmail.value.trim(), signupPassword.value);
    await updateProfile(cred.user, { displayName: signupName.value.trim() });
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid, displayName: signupName.value.trim(), email: signupEmail.value.trim(), city: signupCity.value.trim(), phone:"", address:"", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    }, { merge:true });
    location.href = next;
  }catch(err){ showMessage("status", firebaseError(err), "error"); }
});

document.getElementById("googleBtn").addEventListener("click", async () => {
  try{
    const cred = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(cred.user);
    location.href = next;
  }catch(err){ showMessage("status", firebaseError(err), "error"); }
});

document.getElementById("resetBtn").addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  if(!email){ showMessage("status", "Skriv din e-post först, klicka sedan på återställ lösenord.", "error"); return; }
  try{
    await sendPasswordResetEmail(auth, email);
    showMessage("status", "Ett återställningsmejl har skickats om kontot finns.", "success");
  }catch(err){ showMessage("status", firebaseError(err), "error"); }
});

function firebaseError(err){
  const code = err?.code || "";
  if(code.includes("auth/invalid-credential")) return "Fel e-post eller lösenord.";
  if(code.includes("auth/email-already-in-use")) return "E-postadressen används redan.";
  if(code.includes("auth/weak-password")) return "Lösenordet är för svagt. Använd minst 6 tecken.";
  if(code.includes("auth/popup")) return "Google-inloggningen avbröts eller blockerades.";
  return "Fel: " + (err.message || code);
}
