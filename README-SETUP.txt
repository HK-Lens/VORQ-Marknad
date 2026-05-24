VORQ Marknad - Setup

الميزات الموجودة:
1. تسجيل حساب بالبريد وكلمة السر.
2. تسجيل دخول وخروج.
3. تسجيل الدخول عبر Google.
4. إعادة تعيين كلمة السر عبر البريد.
5. صفحة إدارة بيانات الحساب: الاسم، الهاتف، المدينة، العنوان.
6. نشر إعلان مع: عنوان، تصنيف، حالة المنتج، سعر، مدينة، عنوان/منطقة، وصف دقيق.
7. رفع حتى 6 صور لكل إعلان عبر Firebase Storage.
8. عرض الإعلانات العامة في الصفحة الرئيسية.
9. صفحة تفاصيل لكل إعلان.
10. إدارة إعلانات المستخدم من صفحة الحساب: تعديل أو أرشفة.

طريقة التشغيل:
1. ارفعي الملفات إلى GitHub Pages أو Firebase Hosting.
2. افتحي Firebase Console وأنشئي مشروعاً جديداً باسم VORQ Marknad.
3. من Authentication > Sign-in method فعّلي:
   - Email/Password
   - Google
4. فعّلي Cloud Firestore.
5. فعّلي Cloud Storage.
6. من Project settings > Your apps > Web app انسخي Firebase config.
7. ضعي البيانات داخل firebase-config.js بدل PASTE_...
8. ضعي firestore.rules داخل Firestore Rules ثم Publish.
9. ضعي storage.rules داخل Storage Rules ثم Publish.
10. افتحي login.html وجربي إنشاء حساب ثم post-ad.html لنشر إعلان.

ملاحظة مهمة:
هذه نسخة تقنية أولية. قبل التشغيل التجاري الكامل يجب إضافة terms.html و privacy.html و cookie-policy.html و legal.html المناسبة للموقع، وتأكيد الوضع القانوني والضريبي والترخيص إن وُجد.
