import { Router } from "express";
import { HttpError } from "../../middleware/errorHandler";

export const lmtRouter = Router();

/**
 * Internationalization / Language Management & Translation (LMT) lab.
 *
 * Mirrors a real production pattern (e.g. Amazon's language switcher): the UI
 * never hardcodes translated strings. Every visible label is a stable LMT
 * KEY (e.g. `LOGIN_BTN`); the actual displayed text comes back from this API
 * for whichever language the CURRENT session has selected. Automation must
 * therefore locate elements by a stable attribute (data-testid / data-lmt-key)
 * — never by visible text, which changes per language — and can independently
 * verify correctness by calling GET /lmt/keys with the same X-Session-Key the
 * browser is using and comparing the returned value to the rendered DOM text.
 */

export type LangCode = "en" | "hi" | "ta" | "te" | "kn" | "ml" | "bn" | "mr";

export const SUPPORTED_LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "en", label: "English - EN" },
  { code: "hi", label: "हिन्दी - HI" },
  { code: "ta", label: "தமிழ் - TA" },
  { code: "te", label: "తెలుగు - TE" },
  { code: "kn", label: "ಕನ್ನಡ - KN" },
  { code: "ml", label: "മലയാളം - ML" },
  { code: "bn", label: "বাংলা - BN" },
  { code: "mr", label: "मराठी - MR" },
];
const LANGUAGE_CODES = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));

/** LMT_KEY -> translated string per language. Stable key names, changing values. */
const LMT_DICTIONARY: Record<string, Record<LangCode, string>> = {
  LOGIN_BTN: { en: "Login", hi: "लॉग इन", ta: "உள்நுழைய", te: "లాగిన్", kn: "ಲಾಗಿನ್", ml: "ലോഗിൻ", bn: "লগ ইন", mr: "लॉग इन" },
  SIGNUP_BTN: { en: "Sign Up", hi: "साइन अप करें", ta: "பதிவு செய்யவும்", te: "సైన్ అప్", kn: "ಸೈನ್ ಅಪ್", ml: "സൈൻ അപ്പ്", bn: "সাইন আপ", mr: "साइन अप करा" },
  SIGNOUT_BTN: { en: "Sign Out", hi: "लॉग आउट", ta: "வெளியேறு", te: "లాగ్అవుట్", kn: "ಲಾಗ್ ಔಟ್", ml: "ലോഗ് ഔട്ട്", bn: "লগ আউট", mr: "लॉग आउट" },
  CART_LABEL: { en: "Cart", hi: "कार्ट", ta: "வண்டி", te: "కార్ట్", kn: "ಕಾರ್ಟ್", ml: "കാർട്ട്", bn: "কার্ট", mr: "कार्ट" },
  WISHLIST_LABEL: { en: "Wishlist", hi: "इच्छा-सूची", ta: "விருப்பப் பட்டியல்", te: "కోరిక జాబితా", kn: "ಬಯಕೆ ಪಟ್ಟಿ", ml: "ആഗ്രഹപ്പട്ടിക", bn: "ইচ্ছেতালিকা", mr: "इच्छा यादी" },
  SEARCH_PLACEHOLDER: { en: "Search products…", hi: "उत्पाद खोजें…", ta: "தயாரிப்புகளைத் தேடுங்கள்…", te: "ఉత్పత్తులను శోధించండి…", kn: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ…", ml: "ഉൽപ്പന്നങ്ങൾ തിരയുക…", bn: "পণ্য খুঁজুন…", mr: "उत्पादने शोधा…" },
  DELIVERY_TEXT: { en: "Delivering to Bengaluru 560066", hi: "बेंगलुरु 560066 पर डिलीवरी", ta: "பெங்களூரு 560066 க்கு விநியோகம்", te: "బెంగళూరు 560066కి డెలివరీ", kn: "ಬೆಂಗಳೂರು 560066ಗೆ ವಿತರಣೆ", ml: "ബെംഗളൂരു 560066 ലേക്ക് ഡെലിവറി", bn: "বেঙ্গালুরু 560066-এ ডেলিভারি", mr: "बंगळूर 560066 येथे डिलिव्हरी" },
  HOME_NAV: { en: "Home", hi: "होम", ta: "முகப்பு", te: "హోమ్", kn: "ಮುಖಪುಟ", ml: "ഹോം", bn: "হোম", mr: "मुख्यपृष्ठ" },
  DEALS_NAV: { en: "Deals", hi: "ऑफर", ta: "சலுகைகள்", te: "డీల్స్", kn: "ಡೀಲ್‌ಗಳು", ml: "ഡീലുകൾ", bn: "ডিলস", mr: "सौदे" },
  ELECTRONICS_NAV: { en: "Electronics", hi: "इलेक्ट्रॉनिक्स", ta: "மின்னணுவியல்", te: "ఎలక్ట్రానిక్స్", kn: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್", ml: "ഇലക്ട്രോണിക്സ്", bn: "ইলেকট্রনিক্স", mr: "इलेक्ट्रॉनिक्स" },
  FASHION_NAV: { en: "Fashion", hi: "फैशन", ta: "ஃபேஷன்", te: "ఫ్యాషన్", kn: "ಫ್ಯಾಷನ್", ml: "ഫാഷൻ", bn: "ফ্যাশন", mr: "फॅशन" },
  ADD_TO_CART_BTN: { en: "Add to Cart", hi: "कार्ट में डालें", ta: "கார்ட்டில் சேர்", te: "కార్ట్‌కి జోడించండి", kn: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ", ml: "കാർട്ടിൽ ചേർക്കുക", bn: "কার্টে যোগ করুন", mr: "कार्टमध्ये जोडा" },
  BUY_NOW_BTN: { en: "Buy Now", hi: "अभी खरीदें", ta: "இப்போது வாங்கவும்", te: "ఇప్పుడు కొనండి", kn: "ಈಗ ಖರೀದಿಸಿ", ml: "ഇപ്പോൾ വാങ്ങുക", bn: "এখনই কিনুন", mr: "आता खरेदी करा" },
  PRICE_LABEL: { en: "Price", hi: "कीमत", ta: "விலை", te: "ధర", kn: "ಬೆಲೆ", ml: "വില", bn: "মূল্য", mr: "किंमत" },
  QUANTITY_LABEL: { en: "Quantity", hi: "मात्रा", ta: "அளவு", te: "పరిమాణం", kn: "ಪ್ರಮಾಣ", ml: "അളവ്", bn: "পরিমাণ", mr: "प्रमाण" },
  FULL_NAME_LABEL: { en: "Full Name", hi: "पूरा नाम", ta: "முழு பெயர்", te: "పూర్తి పేరు", kn: "ಪೂರ್ಣ ಹೆಸರು", ml: "മുഴുവൻ പേര്", bn: "পুরো নাম", mr: "पूर्ण नाव" },
  EMAIL_LABEL: { en: "Email Address", hi: "ईमेल पता", ta: "மின்னஞ்சல் முகவரி", te: "ఇమెయిల్ చిరునామా", kn: "ಇಮೇಲ್ ವಿಳಾಸ", ml: "ഇമെയിൽ വിലാസം", bn: "ইমেল ঠিকানা", mr: "ईमेल पत्ता" },
  PASSWORD_LABEL: { en: "Password", hi: "पासवर्ड", ta: "கடவுச்சொல்", te: "పాస్‌వర్డ్", kn: "ಪಾಸ್‌ವರ್ಡ್", ml: "പാസ്‌വേഡ്", bn: "পাসওয়ার্ড", mr: "पासवर्ड" },
  ADDRESS_LABEL: { en: "Delivery Address", hi: "डिलीवरी पता", ta: "விநியோக முகவரி", te: "డెలివరీ చిరునామా", kn: "ವಿತರಣಾ ವಿಳಾಸ", ml: "ഡെലിവറി വിലാസം", bn: "ডেলিভারি ঠিকানা", mr: "डिलिव्हरी पत्ता" },
  REMEMBER_ME_LABEL: { en: "Remember me", hi: "मुझे याद रखें", ta: "என்னை நினைவில் கொள்", te: "నన్ను గుర్తుంచుకో", kn: "ನನ್ನನ್ನು ನೆನಪಿಡಿ", ml: "എന്നെ ഓർമ്മിക്കുക", bn: "আমাকে মনে রাখুন", mr: "मला लक्षात ठेवा" },
  SUBSCRIBE_LABEL: { en: "Subscribe to newsletter", hi: "न्यूज़लेटर की सदस्यता लें", ta: "செய்திமடலுக்கு குழுசேரவும்", te: "న్యూస్‌లెటర్‌కి సభ్యత్వం పొందండి", kn: "ಸುದ್ದಿಪತ್ರಕ್ಕೆ ಚಂದಾದಾರರಾಗಿ", ml: "വാർത്താക്കുറിപ്പിന് സബ്‌സ്‌ക്രൈബ് ചെയ്യുക", bn: "নিউজলেটার সাবস্ক্রাইব করুন", mr: "वृत्तपत्राची सदस्यता घ्या" },
  CREATE_ACCOUNT_BTN: { en: "Create Account", hi: "खाता बनाएं", ta: "கணக்கை உருவாக்கு", te: "ఖాతా సృష్టించండి", kn: "ಖಾತೆ ರಚಿಸಿ", ml: "അക്കൗണ്ട് സൃഷ്ടിക്കുക", bn: "অ্যাকাউন্ট তৈরি করুন", mr: "खाते तयार करा" },
  ABOUT_US_LINK: { en: "About Us", hi: "हमारे बारे में", ta: "எங்களைப் பற்றி", te: "మా గురించి", kn: "ನಮ್ಮ ಬಗ್ಗೆ", ml: "ഞങ്ങളെക്കുറിച്ച്", bn: "আমাদের সম্পর্কে", mr: "आमच्याबद्दल" },
  CONTACT_US_LINK: { en: "Contact Us", hi: "संपर्क करें", ta: "எங்களை தொடர்பு கொள்ள", te: "మమ్మల్ని సంప్రదించండి", kn: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ", ml: "ഞങ്ങളെ ബന്ധപ്പെടുക", bn: "যোগাযোগ করুন", mr: "आमच्याशी संपर्क साधा" },
  TERMS_LINK: { en: "Terms & Conditions", hi: "नियम और शर्तें", ta: "விதிமுறைகள் மற்றும் நிபந்தனைகள்", te: "నిబంధనలు మరియు షరతులు", kn: "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು", ml: "നിബന്ധനകളും വ്യവസ്ഥകളും", bn: "শর্তাবলী", mr: "नियम आणि अटी" },
  PRIVACY_LINK: { en: "Privacy Policy", hi: "गोपनीयता नीति", ta: "தனியுரிமைக் கொள்கை", te: "గోప్యతా విధానం", kn: "ಗೌಪ್ಯತಾ ನೀತಿ", ml: "സ്വകാര്യതാ നയം", bn: "গোপনীয়তা নীতি", mr: "गोपनीयता धोरण" },
};

const sessionLanguages = new Map<string, LangCode>();

function sessionKeyOf(req: any): string {
  return req.header("X-Session-Key") ?? "anonymous";
}

function keysForLanguage(language: LangCode): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, translations] of Object.entries(LMT_DICTIONARY)) {
    out[key] = translations[language];
  }
  return out;
}

/** Cleared by POST /api/lab/reset so a fresh attempt starts back on English. */
export function resetLanguageForSession(sessionKey: string) {
  sessionLanguages.delete(sessionKey);
}

lmtRouter.get("/languages", (req, res) => {
  res.json({ data: { languages: SUPPORTED_LANGUAGES } });
});

/**
 * The core lesson endpoint: pass the SAME X-Session-Key the browser tab is
 * using (visible in DevTools -> Network -> any request header, or read off
 * the on-page session panel) and get back the exact key/value map currently
 * backing the UI — the authoritative source of truth to assert DOM text
 * against, independent of whatever the page happens to render.
 */
lmtRouter.get("/keys", (req, res) => {
  const sessionKey = sessionKeyOf(req);
  const language = sessionLanguages.get(sessionKey) ?? "en";
  res.json({ data: { sessionId: sessionKey, language, keys: keysForLanguage(language) } });
});

lmtRouter.post("/language", (req, res, next) => {
  const language = req.body?.language;
  if (!LANGUAGE_CODES.has(language)) {
    return next(new HttpError(400, "Bad Request", `Unsupported language code '${language}'.`));
  }
  const sessionKey = sessionKeyOf(req);
  sessionLanguages.set(sessionKey, language);
  res.json({ data: { sessionId: sessionKey, language } });
});
