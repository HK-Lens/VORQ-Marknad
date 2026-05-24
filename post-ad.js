import { db, storage } from "./firebase-config.js";
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { categories, conditions, fillSelect, requireLogin, setupHeaderAuth, showMessage, getParam } from "./common.js";

setupHeaderAuth();
fillSelect("category", categories, "Välj kategori");
fillSelect("condition", conditions, "Välj skick");
let currentUser; let editId = getParam("id"); let existingImageUrls = [];

requireLogin(async user => { currentUser = user; if(editId) await loadAd(editId, user.uid); });

images.addEventListener("change", () => {
  const files = [...images.files].slice(0,6);
  preview.innerHTML = files.map(f => `<img src="${URL.createObjectURL(f)}" alt="preview">`).join("");
});

async function loadAd(id, uid){
  const snap = await getDoc(doc(db,"ads",id));
  if(!snap.exists()){ showMessage("status","Annonsen finns inte.","error"); return; }
  const ad = snap.data();
  if(ad.ownerId !== uid){ showMessage("status","Du kan bara redigera dina egna annonser.","error"); adForm.classList.add("hidden"); return; }
  title.value = ad.title||""; price.value = ad.price||""; category.value = ad.category||""; condition.value = ad.condition||""; city.value = ad.city||""; address.value = ad.address||""; description.value = ad.description||""; existingImageUrls = ad.imageUrls || [];
  preview.innerHTML = existingImageUrls.map(url => `<img src="${url}" alt="existing">`).join("");
  submitBtn.textContent = "Spara ändringar";
}

adForm.addEventListener("submit", async e => {
  e.preventDefault();
  submitBtn.disabled = true; adForm.classList.add("loading");
  try{
    const files = [...images.files].slice(0,6);
    let imageUrls = existingImageUrls;
    if(files.length){ imageUrls = await uploadImages(files, currentUser.uid); }
    const data = {
      title: title.value.trim(),
      titleLower: title.value.trim().toLowerCase(),
      price: Number(price.value),
      category: category.value,
      condition: condition.value,
      city: city.value.trim(),
      cityLower: city.value.trim().toLowerCase(),
      address: address.value.trim(),
      description: description.value.trim(),
      imageUrls,
      ownerId: currentUser.uid,
      ownerName: currentUser.displayName || "VORQ Marknad-användare",
      ownerEmail: currentUser.email || "",
      status: "active",
      updatedAt: serverTimestamp()
    };
    if(editId){ await updateDoc(doc(db,"ads",editId), data); showMessage("status","Annonsen har uppdaterats.","success"); }
    else{ const refDoc = await addDoc(collection(db,"ads"), { ...data, createdAt: serverTimestamp() }); editId = refDoc.id; showMessage("status","Annonsen har publicerats.","success"); }
    setTimeout(()=> location.href = "account.html", 900);
  }catch(err){ showMessage("status", "Kunde inte publicera: " + err.message, "error"); }
  finally{ submitBtn.disabled=false; adForm.classList.remove("loading"); }
});

async function uploadImages(files, uid){
  const urls = [];
  for(const file of files){
    if(!file.type.startsWith("image/")) continue;
    if(file.size > 5 * 1024 * 1024) throw new Error("En bild är större än 5 MB.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const path = `ads/${uid}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    urls.push(await getDownloadURL(storageRef));
  }
  return urls;
}
