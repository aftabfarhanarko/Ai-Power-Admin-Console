# SquadCart Console — Change Log

> বিস্তারিত প্রজেক্ট হিস্ট্রি — সর্বশেষ থেকে সর্বপ্রথম

---

## v1.2.0 — Deployment & Docker Fixes (2026-02-28)

**কী করা হয়েছে:**

- Dockerfile-এ Base Image পরিবর্তন করে `node:20-alpine` করা হয়েছে।
- _কারণ:_ Vite-এর লেটেস্ট ভার্সন Node 18 বা তার পুরোনো ভার্সনে রান করে না, যা Railway-এ deployment crash করাচ্ছিল।

## v1.1.0 — CMS & Website Management Features (2026-02-27)

**নতুন ফিচার:**

- **Sidebar Refactoring:** Sidebar এ সাব-মেনু সাপোর্ট যুক্ত করা হয়েছে।
- **Website CMS Link:** Superadmin sidebar এ Website CMS লিন্ক অ্যাড করা হয়েছে।
- **Website Management Modules:**
  - Brands, Slides, এবং Legal Pages ম্যানেজমেন্ট করার জন্য comprehensive section editors তৈরি করা হয়েছে।
- **UI Design Match:** Superadmin login UI কে premium merchant login design-এর সাথে মিলিয়ে আপডেট করা হয়েছে (Linear/Vercel style)।

**বাগ ফিক্স:**

- `/superadmin/login` রাউট enable করা হয়েছে ফ্রন্টএন্ডে।
- Superadmin login-এর ক্ষেত্রে by default _name_ এর পরিবর্তে _email_ ব্যবহার করার লজিক ঠিক করা হয়েছে।
- Login 404 এবং missing translations ফিক্স করা হয়েছে।
- `WebsiteManagementPage` missing import ফিক্স করে blank screen issue সমাধান করা হয়েছে।

---

## v1.0.0 — Role-Based Unified Auth (2026-02-25)

**প্রধান আপডেট:**

- Unified auth system ইমপ্লিমেন্ট করা হয়েছে যেখানে General User, Store Owner এবং Superadmin একই সিস্টেমে লগিন করতে পারে।
- Role-based Dashboard redirection লজিক যুক্ত করা হয়েছে।
