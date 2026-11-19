/* ==========================================================================
   SSC 2027 Smart Study Companion — Curriculum & Content Data
   --------------------------------------------------------------------------
   শিক্ষক/অ্যাডমিন চাইলে এই ফাইল এডিট করে অধ্যায়ের নাম, স্টার রেটিং
   (3 = ★★★ CQ মাস্ট, 2 = ★★ ব্যাকআপ, 1 = ★ শুধু MCQ/SQ) এবং
   সাপ্তাহিক প্ল্যান পরিবর্তন করতে পারবেন। অ্যাপ নিজে থেকেই সব হিসাব করবে।
   ========================================================================== */
(function () {
  'use strict';

  // "3|গতি" => {s:3, t:'গতি'}
  const ch = (list, prefix) => list.map((x, i) => {
    const [s, t] = x.split('|');
    return { n: i + 1, s: +s, t, p: prefix ? prefix(i) : null };
  });

  /* ---------- Subject icons (inline SVG paths, 24x24 stroke) ---------- */
  const ICONS = {
    atom: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.2 15h9.6"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    sigma: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2.5"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    lang: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
    spell: '<path d="m6 16 6-12 6 12M8 12h8M15 20l2 2 4-4"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 2v4M17 4h4"/>',
    ledger: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 7h6M9 11h6"/>',
    bank: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
    case: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    micro: '<path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2ZM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
    scroll: '<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    scale: '<path d="M12 3v18M7 21h10M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>'
  };

  /* ---------------------------- Subjects ----------------------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const SUBJECTS = {
    phy: { bn: 'পদার্থবিজ্ঞান', en: 'Physics', short: 'পদার্থ', icon: 'atom', c: '#6C5CE7', bg: '#EEEBFF', practical: true,
      chapters: ch(['1|ভৌত রাশি ও পরিমাপ', '3|গতি', '3|বল', '3|কাজ, ক্ষমতা ও শক্তি', '3|পদার্থের অবস্থা ও চাপ', '3|বস্তুর উপর তাপের প্রভাব', '3|তরঙ্গ ও শব্দ', '3|আলোর প্রতিফলন', '2|আলোর প্রতিসরণ', '2|স্থির তড়িৎ', '3|চল তড়িৎ', '1|তড়িতের চৌম্বক ক্রিয়া', '1|আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স', '1|জীবন বাঁচাতে পদার্থবিজ্ঞান']) },
    che: { bn: 'রসায়ন', en: 'Chemistry', short: 'রসায়ন', icon: 'flask', c: '#0E9F7E', bg: '#E1F6EF', practical: true,
      chapters: ch(['1|রসায়নের ধারণা', '2|পদার্থের অবস্থা', '3|পদার্থের গঠন', '3|পর্যায় সারণি', '3|রাসায়নিক বন্ধন', '3|মোলের ধারণা ও রাসায়নিক গণনা', '3|রাসায়নিক বিক্রিয়া', '3|রসায়ন ও শক্তি', '2|এসিড-ক্ষারক সমতা', '2|খনিজ সম্পদ: ধাতু-অধাতু', '3|খনিজ সম্পদ: জীবাশ্ম', '1|আমাদের জীবনে রসায়ন']) },
    bio: { bn: 'জীববিজ্ঞান', en: 'Biology', short: 'জীব', icon: 'leaf', c: '#2F9E5B', bg: '#E5F5EA', practical: true,
      chapters: ch(['1|জীবন পাঠ', '3|জীবকোষ ও টিস্যু', '3|কোষ বিভাজন', '3|জীবনীশক্তি', '3|খাদ্য, পুষ্টি এবং পরিপাক', '3|জীবে পরিবহন', '2|গ্যাসীয় বিনিময়', '3|রেচন প্রক্রিয়া', '1|দৃঢ়তা প্রদান ও চলন', '2|সমন্বয়', '3|জীবের প্রজনন', '3|জীবের বংশগতি ও বিবর্তন', '1|জীবের পরিবেশ', '2|জীবপ্রযুক্তি']) },
    hm: { bn: 'উচ্চতর গণিত', en: 'Higher Math', short: 'উ. গণিত', icon: 'sigma', c: '#E26A3D', bg: '#FFEDE4', practical: true,
      chapters: ch(['2|সেট ও ফাংশন', '3|বীজগাণিতিক রাশি', '1|জ্যামিতি', '1|জ্যামিতিক অঙ্কন', '2|সমীকরণ', '1|অসমতা', '3|অসীম ধারা', '3|ত্রিকোণমিতি', '3|সূচকীয় ও লগারিদমীয় ফাংশন', '3|দ্বিপদী বিস্তৃতি', '3|স্থানাঙ্ক জ্যামিতি', '1|সমতলীয় ভেক্টর', '1|ঘন জ্যামিতি', '3|সম্ভাবনা']) },
    gm: { bn: 'সাধারণ গণিত', en: 'General Math', short: 'সা. গণিত', icon: 'calc', c: '#2F7BEA', bg: '#E5EFFF',
      chapters: ch(['1|বাস্তব সংখ্যা', '3|সেট ও ফাংশন', '3|বীজগাণিতিক রাশি', '3|সূচক ও লগারিদম', '2|এক চলকবিশিষ্ট সমীকরণ', '1|রেখা, কোণ ও ত্রিভুজ', '3|ব্যবহারিক জ্যামিতি / সম্পাদ্য', '2|বৃত্ত', '3|ত্রিকোণমিতিক অনুপাত', '3|দূরত্ব ও উচ্চতা', '3|বীজগাণিতিক অনুপাত ও সমানুপাত', '2|দুই চলকবিশিষ্ট সরল সহসমীকরণ', '3|সসীম ধারা', '1|অনুপাত, সদৃশতা ও প্রতিসমতা', '1|ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য', '3|পরিমিতি', '3|পরিসংখ্যান']) },
    b1: { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper', short: 'বাংলা ১ম', icon: 'book', c: '#D2457A', bg: '#FDE8F0', unit: 'item',
      chapters: ch([
        '2|প্রত্যুপকার', '1|ফুলের বিবাহ', '3|সুভা', '3|বইপড়া', '3|অভাগীর স্বর্গ', '2|নিরীহ বাঙালি', '3|পল্লিসাহিত্য', '3|আম-আঁটির ভেঁপু', '3|মানুষ মুহম্মদ (স.)', '3|নিমগাছ', '2|উপেক্ষিত শক্তির উদ্বোধন', '3|প্রবাস বন্ধু', '3|মমতাদি', '2|একুশের গল্প', '1|আমাদের নতুন গৌরবগাথা',
        '1|বন্দনা', '3|কপোতাক্ষ নদ', '2|প্রাণ', '2|অন্ধবধূ', '2|ঝরনার গান', '3|জীবন বিনিময়', '2|উমর ফারুক', '3|সেইদিন এই মাঠ', '1|যাব আমি তোমার দেশে', '3|আমার দেশ', '3|বৃষ্টি', '3|আমি কোনো আগন্তুক নই', '3|রানার', '3|তোমাকে পাওয়ার জন্য হে স্বাধীনতা', '1|বোশেখ',
        '3|উপন্যাস — ১৯৭১', '3|নাটক — বহিপীর'
      ], (i) => i < 15 ? 'গদ্য ' + pad(i + 1) : i < 30 ? 'কবিতা ' + pad(i - 14) : 'সহপাঠ') },
    b2: { bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper', short: 'বাংলা ২য়', icon: 'pen', c: '#A855D6', bg: '#F4E8FC', unit: 'item',
      chapters: ch(['2|পরিচ্ছেদ ০১–০৫', '3|পরিচ্ছেদ ০৬–১০', '3|পরিচ্ছেদ ১১–১৫', '3|পরিচ্ছেদ ১৬–২০', '3|পরিচ্ছেদ ২১–২৫', '2|পরিচ্ছেদ ২৬–৩০', '3|পরিচ্ছেদ ৩১–৩৫', '3|পরিচ্ছেদ ৩৬–৪০', '2|পরিচ্ছেদ ৪১–৪৩', '3|বাগধারা ও প্রবাদ-প্রবচন', '2|এক কথায় প্রকাশ',
        '3|অনুচ্ছেদ রচনা', '3|চিঠিপত্র / আবেদনপত্র', '3|সারাংশ / সারমর্ম', '3|ভাবসম্প্রসারণ', '3|সংবাদ প্রতিবেদন', '3|প্রবন্ধ রচনা'], (i) => i < 11 ? 'ব্যাকরণ' : 'নির্মিতি') },
    e1: { bn: 'ইংরেজি ১ম পত্র', en: 'English 1st Paper', short: 'ইংরেজি ১ম', icon: 'lang', c: '#0B9DB0', bg: '#DFF5F8', unit: 'item',
      chapters: ch(['3|Unit 1', '3|Unit 2', '3|Unit 3', '3|Unit 4', '3|Unit 5', '3|Unit 6', '3|Unit 7', '3|Unit 8', '3|Unit 9', '3|Unit 10', '3|Unit 11', '3|Unit 12', '2|Unit 13', '2|Unit 14', '2|Poems',
        '3|Unseen Passage & Summary', '3|Matching Table & Rearrange', '3|Paragraph', '3|Completing Story', '3|Graph / Chart Analysis', '3|Informal Letter / E-mail & Dialogue'], (i) => i < 15 ? 'Seen' : 'Writing') },
    e2: { bn: 'ইংরেজি ২য় পত্র', en: 'English 2nd Paper', short: 'ইংরেজি ২য়', icon: 'spell', c: '#3366E6', bg: '#E6EDFF', unit: 'item',
      chapters: ch(['3|Gap Filling with Clues', '3|Substitution Table', '3|Right Forms of Verbs', '3|Changing Sentences', '3|Tag Questions', '3|Suffixes & Prefixes', '3|Prepositions', '3|Sentence Connectors', '3|Punctuation',
        '3|Paragraph', '3|Formal Application', '3|CV with Cover Letter', '3|Composition'], (i) => i < 9 ? 'Grammar' : 'Writing') },
    ict: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT', short: 'ICT', icon: 'monitor', c: '#5B4FE0', bg: '#ECEBFF', practical: true,
      chapters: ch(['3|তথ্য ও যোগাযোগ প্রযুক্তি', '3|কম্পিউটার ও ব্যবহারকারীর নিরাপত্তা', '2|আমার লেখাপড়া ও গবেষণায় ইন্টারনেট', '3|আমার লেখালেখি ও হিসাব', '3|মাল্টিমিডিয়া ও গ্রাফিক্স', '3|ডেটাবেজের ব্যবহার ও ব্যবহারিক']) },
    bgs: { bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'BGS', short: 'BGS', icon: 'globe', c: '#C27C0E', bg: '#FDF3DC',
      chapters: ch(['3|ঔপনিবেশিক যুগ ও স্বাধিকার আন্দোলন', '3|মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশের অভ্যুদয়', '3|সৌরজগৎ ও পৃথিবী', '3|বাংলাদেশের ভৌগোলিক অবস্থান ও ভূপ্রকৃতি', '2|বাংলাদেশের নদ-নদী ও প্রাকৃতিক সম্পদ', '2|রাষ্ট্র, নাগরিকতা ও আইন', '3|বাংলাদেশের রাষ্ট্রব্যবস্থা ও সরকার কাঠামো', '3|বাংলাদেশের নির্বাচন ও গণতন্ত্র', '2|জাতিসংঘ ও বাংলাদেশ', '2|টেকসই উন্নয়ন', '3|জাতীয় সম্পদ ও অর্থনৈতিক ব্যবস্থা', '3|বাংলাদেশের অর্থনীতি', '2|আর্থিক ব্যবস্থা', '2|বাংলাদেশের পরিবার কাঠামো', '3|বাংলাদেশের সামাজিক পরিবর্তন', '3|বাংলাদেশের সামাজিক সমস্যা ও প্রতিকার']) },
    rel: { bn: 'ধর্ম ও নৈতিক শিক্ষা', en: 'Religion & Moral Edu.', short: 'ধর্ম', icon: 'moon', c: '#0C8F7E', bg: '#DFF4F0',
      chapters: ch(['3|আকাইদ ও নৈতিক জীবন', '3|শরিয়তের উৎস', '3|ইবাদত', '3|আখলাক', '3|আদর্শ জীবনচরিত']) },

    /* --------- Business Studies (ব্যবসায় শিক্ষা) --------- */
    acc: { bn: 'হিসাববিজ্ঞান', en: 'Accounting', short: 'হিসাব', icon: 'ledger', c: '#7C3AED', bg: '#F0E9FE',
      chapters: ch(['1|হিসাববিজ্ঞান পরিচিতি', '2|লেনদেন', '2|দুতরফা দাখিলা পদ্ধতি', '2|হিসাব', '3|জাবেদা', '3|খতিয়ান', '3|নগদান বই', '3|রেওয়ামিল', '3|আর্থিক বিবরণী', '3|উৎপাদন ব্যয় হিসাব', '2|ব্যবস্থাপকীয় হিসাববিজ্ঞান', '3|ব্যক্তিগত হিসাব']) },
    fin: { bn: 'ফিন্যান্স ও ব্যাংকিং', en: 'Finance & Banking', short: 'ফিন্যান্স', icon: 'bank', c: '#0891B2', bg: '#E0F4FA',
      chapters: ch(['2|অর্থায়নের প্রাথমিক ধারণা', '2|ব্যবসায় অর্থায়ন', '3|অর্থের সময়মূল্য', '3|ঝুঁকি ও আয়', '3|মূলধন বাজেটিং', '3|মূলধন ব্যয়', '2|ব্যাংক ব্যবস্থা পরিচিতি', '3|বাণিজ্যিক ব্যাংক', '3|কেন্দ্রীয় ব্যাংক', '2|বিমার প্রাথমিক ধারণা', '3|জীবন বিমা', '3|সম্পত্তি বিমা']) },
    bent: { bn: 'ব্যবসায় উদ্যোগ', en: 'Business Entrepreneurship', short: 'উদ্যোগ', icon: 'case', c: '#E0661B', bg: '#FFEEDF',
      chapters: ch(['2|ব্যবসায় পরিচিতি', '3|ব্যবসায় উদ্যোগ ও উদ্যোক্তা', '3|আত্মকর্মসংস্থান', '2|ব্যবসায়ের আইনগত দিক', '3|একমালিকানা ব্যবসায়', '3|অংশীদারি ব্যবসায়', '3|যৌথমূলধনী ব্যবসায়', '3|সমবায় সমিতি', '2|রাষ্ট্রীয় ব্যবসায়', '2|ব্যবসায়ের সহায়ক সেবা', '3|ব্যবসায় নৈতিকতা ও সামাজিক দায়বদ্ধতা', '1|বাংলাদেশের শিল্প উদ্যোগ']) },
    sci: { bn: 'বিজ্ঞান', en: 'General Science', short: 'বিজ্ঞান', icon: 'micro', c: '#16A34A', bg: '#E3F6E8',
      chapters: ch(['3|উন্নততর জীবনধারা', '3|জীবনের জন্য পানি', '3|হৃদযন্ত্রের যত কথা', '3|নবজীবনের সূচনা', '3|দেখতে হলে আলো চাই', '2|পলিমার', '3|অম্ল, ক্ষারক ও লবণের ব্যবহার', '2|আমাদের সম্পদ', '2|দুর্যোগের সাথে বসবাস', '3|এসো বলকে জানি', '2|জীবন বাঁচাতে বিজ্ঞান', '3|প্রাত্যহিক জীবনে তড়িৎ', '2|সবাই কাছাকাছি', '2|জীবপ্রযুক্তি']) },

    /* --------- Humanities (মানবিক) --------- */
    his: { bn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', en: 'History & World Civilization', short: 'ইতিহাস', icon: 'scroll', c: '#B45309', bg: '#FCEFDD',
      chapters: ch(['2|ইতিহাস পরিচিতি', '3|প্রাচীন বিশ্বসভ্যতা (মিশর, সিন্ধু, মেসোপটেমিয়া)', '3|প্রাচীন বিশ্বসভ্যতা (গ্রিক ও রোমান)', '2|প্রাচীন বাংলার জনপদ', '3|প্রাচীন বাংলার রাজনৈতিক ইতিহাস', '2|প্রাচীন বাংলার সমাজ ও সংস্কৃতি', '3|মধ্যযুগে বাংলার রাজনৈতিক ইতিহাস', '2|মধ্যযুগে বাংলার সমাজ ও সংস্কৃতি', '3|বাংলায় ব্রিটিশ শাসন', '3|ব্রিটিশ শাসনবিরোধী আন্দোলন', '3|ভাষা আন্দোলন ও স্বাধিকার আন্দোলন', '3|মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশ']) },
    geo: { bn: 'ভূগোল ও পরিবেশ', en: 'Geography & Environment', short: 'ভূগোল', icon: 'map', c: '#0D9488', bg: '#DDF5F2',
      chapters: ch(['2|ভূগোল ও পরিবেশ', '3|মহাবিশ্ব ও আমাদের পৃথিবী', '3|পৃথিবীর অভ্যন্তরীণ ও বাহ্যিক গঠন', '3|বায়ুমণ্ডল', '3|বারিমণ্ডল', '2|জনসংখ্যা', '2|মানব বসতি', '2|সম্পদ ও অর্থনৈতিক কার্যাবলি', '3|বাংলাদেশের ভৌগোলিক বিবরণ', '3|বাংলাদেশের সম্পদ ও শিল্প', '2|বাংলাদেশের যোগাযোগ ও বাণিজ্য', '2|বাংলাদেশের উন্নয়ন ও পরিবেশ', '3|বাংলাদেশের প্রাকৃতিক দুর্যোগ']) },
    civ: { bn: 'পৌরনীতি ও নাগরিকতা', en: 'Civics & Citizenship', short: 'পৌরনীতি', icon: 'scale', c: '#9333EA', bg: '#F3E8FF',
      chapters: ch(['2|পৌরনীতি ও নাগরিকতা', '3|নাগরিক ও নাগরিকতা', '3|আইন, স্বাধীনতা ও সাম্য', '3|রাষ্ট্র ও সরকার ব্যবস্থা', '3|সংবিধান', '3|গণতন্ত্রে রাজনৈতিক দল ও নির্বাচন', '3|বাংলাদেশ সরকারের বিভিন্ন অঙ্গ', '2|বাংলাদেশের স্থানীয় শাসন', '2|স্বাধীন বাংলাদেশের অভ্যুদয়', '2|নাগরিক সমস্যা ও আমাদের করণীয়', '2|বাংলাদেশ ও আন্তর্জাতিক সংগঠন']) },
    eco: { bn: 'অর্থনীতি', en: 'Economics', short: 'অর্থনীতি', icon: 'trend', c: '#DB2777', bg: '#FCE7F3',
      chapters: ch(['2|অর্থনীতি পরিচয়', '3|উপযোগ, চাহিদা, যোগান ও ভারসাম্য', '3|উৎপাদন ও সংগঠন', '3|বাজার', '3|জাতীয় আয় ও এর পরিমাপ', '3|অর্থ ও ব্যাংক ব্যবস্থা', '2|বাংলাদেশের অর্থনীতি', '2|বাংলাদেশের কৃষি', '2|বাংলাদেশের শিল্প', '3|বাংলাদেশ সরকারের বাজেট', '2|বাংলাদেশের অর্থনৈতিক উন্নয়ন']) }
  };

  /* ---------------------- Groups (বিভাগ) ---------------------- */
  const GROUPS = {
    science: { bn: 'বিজ্ঞান', en: 'Science', emoji: '🔬', code: 'SC', c: '#6C5CE7', bg: '#EEEBFF',
      desc: 'পদার্থ, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত', descEn: 'Physics, Chemistry, Biology, Higher Math',
      core: ['phy', 'che', 'bio', 'hm'], social: 'bgs',
      subjects: ['phy', 'che', 'bio', 'hm', 'gm', 'b1', 'b2', 'e1', 'e2', 'ict', 'bgs', 'rel'] },
    business: { bn: 'ব্যবসায় শিক্ষা', en: 'Business Studies', emoji: '📊', code: 'BS', c: '#E0661B', bg: '#FFEEDF',
      desc: 'হিসাববিজ্ঞান, ফিন্যান্স ও ব্যাংকিং, ব্যবসায় উদ্যোগ', descEn: 'Accounting, Finance & Banking, Entrepreneurship',
      core: ['acc', 'fin', 'bent'], social: 'sci',
      subjects: ['acc', 'fin', 'bent', 'gm', 'sci', 'b1', 'b2', 'e1', 'e2', 'ict', 'rel'] },
    humanities: { bn: 'মানবিক', en: 'Humanities', emoji: '🏛️', code: 'HU', c: '#0D9488', bg: '#DDF5F2',
      desc: 'ইতিহাস, ভূগোল, পৌরনীতি, অর্থনীতি', descEn: 'History, Geography, Civics, Economics',
      core: ['his', 'geo', 'civ', 'eco'], social: 'sci',
      subjects: ['his', 'geo', 'civ', 'eco', 'gm', 'sci', 'b1', 'b2', 'e1', 'e2', 'ict', 'rel'] }
  };

  const RELIGIONS = {
    islam: { bn: 'ইসলাম ও নৈতিক শিক্ষা', en: 'Islam & Moral Education' },
    hindu: { bn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা', en: 'Hinduism & Moral Education' },
    buddha: { bn: 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা', en: 'Buddhism & Moral Education' },
    christ: { bn: 'খ্রিষ্টধর্ম ও নৈতিক শিক্ষা', en: 'Christianity & Moral Education' }
  };

  /* --------------------- Phases --------------------- */
  const PHASES = [
    { n: 1, bn: 'ফাউন্ডেশন ও বোর্ড প্রশ্ন', en: 'Foundation & Board Questions', days: [1, 30], weeks: [1, 4], c: '#7B61FF', bg: '#EFEBFF',
      focus: 'মূল বই + ২০২২–২০২৬ বোর্ড প্রশ্ন দিয়ে ★★★ অধ্যায়গুলোর শক্ত ভিত তৈরি।', focusEn: 'Textbook fundamentals + 2022–26 board questions for ★★★ chapters.' },
    { n: 2, bn: 'টেস্ট পেপার মাস্টারি', en: 'Test Paper Mastery', days: [31, 60], weeks: [5, 8], c: '#1FA67A', bg: '#E2F7EE',
      focus: 'শীর্ষ স্কুলের টেস্ট পেপার, সংক্ষিপ্ত প্রশ্ন, রাইটিং ও ব্যবহারিক প্রস্তুতি।', focusEn: 'Top school test papers, short questions, writing & practicals.' },
    { n: 3, bn: 'ফাইনাল রিভিশন ও মডেল টেস্ট', en: 'Final Revision & Simulation', days: [61, 90], weeks: [9, 12], c: '#F07A4A', bg: '#FFEDE4',
      focus: 'পূর্ণাঙ্গ মডেল টেস্ট, র‍্যাপিড রিভিশন, দুর্বল অধ্যায় ও ভুল সংশোধন।', focusEn: 'Full model tests, rapid revision, weak chapters & error correction.' }
  ];

  // explicit ranges so each phase exactly matches 30 days
  const WEEK_RANGES = [
    [1, 7], [8, 14], [15, 21], [22, 30],
    [31, 37], [38, 44], [45, 51], [52, 60],
    [61, 67], [68, 74], [75, 81], [82, 90]
  ];

  /* ---------------- Task kinds (time & 4-step mapping) ---------------- */
  const KINDS = {
    read:   { bn: 'মূল বই + সূত্র নোট', en: 'Textbook + formula notes', min: 60, steps: [1], tone: 'lav' },
    board:  { bn: 'বোর্ড CQ + MCQ (২০২২–২৬)', en: 'Board CQ + MCQ (2022–26)', min: 90, steps: [2], tone: 'blue' },
    lite:   { bn: 'রিডিং + SQ + বোর্ড MCQ', en: 'Reading + SQ + board MCQ', min: 40, per: true, steps: [1, 2], tone: 'mint' },
    lang:   { bn: 'পড়া + লেখা অনুশীলন', en: 'Read + writing practice', min: 30, per: true, steps: [1, 2], tone: 'pink' },
    test:   { bn: 'টেস্ট পেপার CQ + SQ', en: 'Test paper CQ + SQ', min: 30, per: true, steps: [3], tone: 'peach' },
    prac:   { bn: 'ব্যবহারিক খাতা', en: 'Practical notebook', min: 60, steps: [], tone: 'mint' },
    revise: { bn: 'Error Log রিভিশন', en: 'Error log revision', min: 15, per: true, steps: [4], tone: 'lav' },
    recall: { bn: 'র‍্যাপিড রিকল', en: 'Rapid recall', min: 45, steps: [], tone: 'blue' },
    weak:   { bn: 'দুর্বল টপিক রিভিশন', en: 'Weak topic revision', min: 45, steps: [], tone: 'peach' },
    wtest:  { bn: 'সাপ্তাহিক পরীক্ষা', en: 'Weekly test', min: 60, steps: [], tone: 'peach' },
    model:  { bn: 'পূর্ণাঙ্গ মডেল টেস্ট (৩ ঘণ্টা)', en: 'Full model test (3 hrs)', min: 180, steps: [], tone: 'peach' },
    reflect:{ bn: 'সাপ্তাহিক রিভিউ ও রিফ্লেকশন', en: 'Weekly review & reflection', min: 10, steps: [], tone: 'lav' },
    buffer: { bn: 'বাফার ডে: বাকি কাজ + রিভিশন', en: 'Buffer day: catch up + revise', min: 45, steps: [], tone: 'mint' },
    errrev: { bn: 'ভুলের খাতা রিভিউ', en: 'Mistake notebook review', min: 20, steps: [], tone: 'mint' },
    custom: { bn: 'নিজের কাজ', en: 'My task', min: 30, steps: [], tone: 'yellow' }
  };

  const STEPS = [
    { n: 1, bn: 'মূল বই মাস্টারি', en: 'Textbook Mastery', share: '৩০%', icon: '📖',
      d: 'মূল বই পড়ে কনসেপ্ট, সংজ্ঞা, সূত্র, চিত্র ও গুরুত্বপূর্ণ লাইন হাইলাইট করো। সূত্রগুলো পকেট নোটে লেখো।',
      dEn: 'Read the textbook: concepts, definitions, formulas, diagrams and key lines. Keep a pocket formula note.' },
    { n: 2, bn: 'বোর্ড প্রশ্ন অনুশীলন', en: 'Board Question Practice', share: '৩৫%', icon: '📝',
      d: '২০২২–২০২৬ সালের সব বোর্ডের CQ ও MCQ সমাধান করো—৮০% প্রশ্নের ধরন এখান থেকেই আসে।',
      dEn: 'Solve all-board CQ and MCQ from 2022–2026 — 80% of question patterns come from here.' },
    { n: 3, bn: 'টেস্ট পেপার ও সংক্ষিপ্ত প্রশ্ন', en: 'Test Paper & Short Qs', share: '২৫%', icon: '🏫',
      d: 'শীর্ষ স্কুল ও ক্যাডেট কলেজের টেস্ট পেপার CQ, সংক্ষিপ্ত-উত্তর প্রশ্ন এবং প্রযোজ্য হলে ব্যবহারিক।',
      dEn: 'Top school & cadet college test paper CQ, short-answer questions and practicals where applicable.' },
    { n: 4, bn: 'ভুলের খাতা ও রিভিশন', en: 'Error Log & Revision', share: '১০%', icon: '🔁',
      d: 'ভুল উত্তরগুলো Error Log-এ লেখো, দুর্বল কনসেপ্ট আবার পড়ো, কঠিন প্রশ্ন ঘড়ি ধরে আবার করো।',
      dEn: 'Log wrong answers, revise weak concepts and redo difficult questions on a timer.' }
  ];

  /* ------------------------- Plan builder ------------------------- */
  const star = (sub, s) => SUBJECTS[sub].chapters.filter(c => (Array.isArray(s) ? s.includes(c.s) : c.s === s)).map(c => c.n);
  const not3 = (sub) => SUBJECTS[sub].chapters.filter(c => c.s < 3).map(c => c.n);
  const all = (sub) => SUBJECTS[sub].chapters.map(c => c.n);
  const except = (sub, arr) => all(sub).filter(n => !arr.includes(n));
  const splitN = (arr, n) => { const out = []; const base = Math.floor(arr.length / n), rem = arr.length % n; let k = 0; for (let i = 0; i < n; i++) { const sz = base + (i < rem ? 1 : 0); out.push(arr.slice(k, k + sz)); k += sz; } return out; };

  const B1_FIRST = [3, 4, 5, 7, 8];
  const GM_P1 = [[2, 3, 17], [4, 7, 9], [10, 11, 13, 16], []];

  function buildPlan(groupKey) {
    const G = GROUPS[groupKey];
    const core = G.core, social = G.social;
    const weeks = [];
    const W = (n, goal, goalEn, units, tests) => weeks.push({ n, goal, goalEn, units, tests });

    /* ---------- Phase 1 ---------- */
    if (groupKey === 'science') {
      W(1, 'পদার্থ, রসায়ন ও সাধারণ গণিতের প্রথম ★★★ অধ্যায়গুলো জয় করো', 'Conquer the first ★★★ chapters of Physics, Chemistry & Math',
        [['phy', [2, 3, 4], 'cq'], ['che', [3, 4, 5], 'cq'], ['gm', [2, 3, 17], 'cq']], ['phy', 'gm']);
      W(2, 'বিজ্ঞানের ভিত শক্ত করো—জীববিজ্ঞানেও যাত্রা শুরু', 'Strengthen science basics — start Biology',
        [['phy', [5, 6, 7], 'cq'], ['che', [6, 7], 'cq'], ['gm', [4, 7, 9], 'cq'], ['bio', [2, 3, 4], 'cq']], ['che', 'bio']);
      W(3, 'তড়িৎ, শক্তি ও উচ্চতর গণিতের বীজগণিত', 'Electricity, energy & Higher Math algebra',
        [['phy', [8, 11], 'cq'], ['che', [8, 11], 'cq'], ['gm', [10, 11, 13, 16], 'cq'], ['hm', [2, 7, 8], 'cq']], ['phy', 'hm']);
      W(4, 'জীববিজ্ঞানের চিত্রভিত্তিক অধ্যায় + উচ্চতর গণিত + বাংলা', 'Diagram-based Biology + Higher Math + Bangla',
        [['bio', [5, 6, 8, 11, 12], 'cq'], ['hm', [9, 10, 11, 14], 'cq'], ['b1', B1_FIRST, 'lang', 2]], ['bio', 'gm']);
    } else {
      const chunks = core.map(s => splitN(star(s, 3), 4));
      const goals = [
        ['বিভাগের মূল বিষয়গুলোর প্রথম ★★★ অধ্যায় শুরু', 'Start the first ★★★ chapters of your core subjects'],
        ['মূল বিষয় + সাধারণ গণিতের গতি বাড়াও', 'Speed up core subjects + General Math'],
        ['গুরুত্বপূর্ণ সৃজনশীল অধ্যায়গুলো শেষ করো', 'Finish key creative-question chapters'],
        ['ফাউন্ডেশন শেষ + বাংলা ১ম পত্র', 'Complete foundation + Bangla 1st Paper']
      ];
      for (let w = 0; w < 4; w++) {
        const units = [];
        core.forEach((s, i) => { if (chunks[i][w] && chunks[i][w].length) units.push([s, chunks[i][w], 'cq']); });
        if (GM_P1[w].length) units.push(['gm', GM_P1[w], 'cq']);
        if (w === 3) units.push(['b1', B1_FIRST, 'lang', 2]);
        const tsub = units.map(u => u[0]).filter((v, i, a) => v !== 'b1' && a.indexOf(v) === i).slice(0, 2);
        W(w + 1, goals[w][0], goals[w][1], units, tsub);
      }
    }

    /* ---------- Phase 2 ---------- */
    const p2w5 = core.map(s => [s, not3(s), 'lite', groupKey === 'science' ? 1 : 2]);
    if (groupKey !== 'science') p2w5.push(['gm', not3('gm'), 'lite', 2]);
    W(5, 'বাকি (★★/★) অধ্যায়ের মূল বই রিডিং + সংক্ষিপ্ত প্রশ্ন + বোর্ড MCQ', 'Remaining (★★/★) chapters: reading + short Qs + board MCQ',
      p2w5, core.slice(0, 3));
    W(6, 'বাংলা ১ম ও ২য় পত্র—সাহিত্য, ব্যাকরণ ও নির্মিতি', 'Bangla 1st & 2nd paper — literature, grammar & composition',
      [['b1', except('b1', B1_FIRST), 'lang', 3], ['b2', all('b2'), 'lang', 3]], ['b1', 'b2', groupKey === 'science' ? 'hm' : 'gm']);
    W(7, 'ইংরেজি রাইটিং, গ্রামার এবং ICT', 'English writing, grammar & ICT',
      [['e1', all('e1'), 'lang', 3], ['e2', all('e2'), 'lang', 3], ['ict', all('ict'), 'lite', 1]], ['e1', 'e2', 'ict']);
    const w8 = [[social, all(social), 'lite', 2], ['rel', all('rel'), 'lite', 2]];
    core.forEach(s => w8.push([s, star(s, 3), 'test', 4]));
    if (groupKey === 'science') {
      w8.push(['gm', not3('gm'), 'lite', 2]);
      core.forEach(s => w8.push([s, [], 'prac']));
    }
    W(8, 'শীর্ষ স্কুলের টেস্ট পেপার CQ + ' + SUBJECTS[social].bn + ' ও ধর্ম' + (groupKey === 'science' ? ' + ব্যবহারিক খাতা' : ''),
      'Top school test papers + ' + SUBJECTS[social].en + ' & Religion', w8, [social, 'rel', 'gm']);

    /* ---------- Phase 3 ---------- */
    const w9 = core.map(s => [s, [], 'model']);
    if (core.length < 4) w9.push([social, [], 'model']);
    core.forEach(s => w9.push([s, star(s, 3), 'revise', 4]));
    W(9, 'মূল বিষয়গুলোর পূর্ণাঙ্গ মডেল টেস্ট + Error Log রিভিশন', 'Core subject full model tests + error log revision', w9, null);
    W(10, 'সাধারণ গণিত, বাংলা ও ইংরেজির মডেল টেস্ট', 'Model tests: General Math, Bangla & English',
      [['gm', [], 'model'], ['b1', [], 'model'], ['b2', [], 'model'], ['e1', [], 'model'], ['e2', [], 'model'],
       ['gm', star('gm', 3), 'test', 4], ['gm', star('gm', 3), 'revise', 4]], null);
    const w11 = [['ict', [], 'model'], [social, [], 'model'], ['rel', [], 'model']];
    if (core.length < 4 && social === 'sci') w11.splice(1, 1, ['gm', [], 'model']);
    w11.push(['ict', all('ict'), 'revise', 3], [social, star(social, 3), 'revise', 4]);
    core.forEach(s => { const b = star(s, 2); if (b.length) w11.push([s, b, 'test', 4]); });
    w11.push(['', [], 'weak'], ['', [], 'weak'], ['', [], 'weak']);
    W(11, 'ICT, ' + SUBJECTS[social].bn + ', ধর্ম + দুর্বল টপিকে দ্বিতীয়বার রিভিশন', 'ICT, ' + SUBJECTS[social].en + ', Religion + weak topics', w11, null);
    const w12 = [];
    const finals = groupKey === 'science' ? ['phy', 'che', 'bio', 'hm', 'gm'] : core.concat(['gm']).slice(0, 5);
    finals.forEach(s => w12.push([s, [], 'model']));
    G.subjects.forEach(s => w12.push([s, [], 'recall']));
    w12.push(['', [], 'weak']);
    W(12, 'ফাইনাল র‍্যাপিড রিকল—সূত্র, বিক্রিয়া, চিত্র ও সাজেশন ঝালাই', 'Final rapid recall — formulas, reactions, diagrams', w12, null);

    return weeks;
  }

  /* ---------------------- Badges ---------------------- */
  const BADGES = [
    { id: 'first_task', e: '🌱', bn: 'প্রথম ধাপ', en: 'First Step', d: 'প্রথম টাস্ক সম্পন্ন', dEn: 'Complete your first task' },
    { id: 'streak3', e: '🔥', bn: '৩ দিনের আগুন', en: '3-Day Spark', d: 'টানা ৩ দিন পড়া', dEn: '3-day streak' },
    { id: 'streak7', e: '⚡', bn: 'সাপ্তাহিক যোদ্ধা', en: 'Week Warrior', d: 'টানা ৭ দিন পড়া', dEn: '7-day streak' },
    { id: 'streak21', e: '🌟', bn: 'অভ্যাসের রাজা', en: 'Habit Hero', d: 'টানা ২১ দিন পড়া', dEn: '21-day streak' },
    { id: 'streak45', e: '👑', bn: 'অপ্রতিরোধ্য', en: 'Unstoppable', d: 'টানা ৪৫ দিন পড়া', dEn: '45-day streak' },
    { id: 'focus1', e: '🎯', bn: 'প্রথম ফোকাস', en: 'First Focus', d: 'প্রথম ফোকাস সেশন শেষ', dEn: 'Finish a focus session' },
    { id: 'focus10h', e: '⏳', bn: '১০ ঘণ্টা ফোকাস', en: '10h Focus', d: 'মোট ১০ ঘণ্টা ফোকাস', dEn: '10 hours focused' },
    { id: 'focus50h', e: '🧠', bn: 'গভীর মনোযোগী', en: 'Deep Worker', d: 'মোট ৫০ ঘণ্টা ফোকাস', dEn: '50 hours focused' },
    { id: 'tasks50', e: '✅', bn: '৫০ টাস্ক', en: '50 Tasks', d: '৫০টি টাস্ক সম্পন্ন', dEn: 'Complete 50 tasks' },
    { id: 'tasks150', e: '🏅', bn: '১৫০ টাস্ক', en: '150 Tasks', d: '১৫০টি টাস্ক সম্পন্ন', dEn: 'Complete 150 tasks' },
    { id: 'chapter1', e: '📘', bn: 'অধ্যায় মাস্টার', en: 'Chapter Master', d: 'একটি অধ্যায়ের ৪ ধাপ শেষ', dEn: 'Master one chapter (4/4)' },
    { id: 'chapter10', e: '📚', bn: '১০ অধ্যায় মাস্টার', en: '10 Chapters', d: '১০টি অধ্যায় মাস্টার', dEn: 'Master 10 chapters' },
    { id: 'error10', e: '📒', bn: 'ভুল থেকে শেখা', en: 'Learner', d: '১০টি ভুল লগ করা', dEn: 'Log 10 mistakes' },
    { id: 'errfix10', e: '🔧', bn: 'ভুল সংশোধক', en: 'Fixer', d: '১০টি ভুল আয়ত্ত', dEn: 'Master 10 mistakes' },
    { id: 'test1', e: '🧪', bn: 'প্রথম পরীক্ষা', en: 'First Test', d: 'প্রথম সাপ্তাহিক পরীক্ষার নম্বর লেখা', dEn: 'Log your first test' },
    { id: 'test80', e: '💯', bn: '৮০% ক্লাব', en: '80% Club', d: 'কোনো পরীক্ষায় ৮০%+', dEn: 'Score 80%+ on a test' },
    { id: 'week1', e: '🚀', bn: 'প্রথম রকেট', en: 'First Launch', d: 'প্রথম সাপ্তাহিক মাইলফলক', dEn: 'First weekly milestone' },
    { id: 'comeback', e: '💪', bn: 'ফিরে আসা যোদ্ধা', en: 'Comeback', d: 'বিরতির পর আবার শুরু', dEn: 'Return after a break' },
    { id: 'early', e: '🌅', bn: 'ভোরের পাখি', en: 'Early Bird', d: 'সকাল ৭টার আগে টাস্ক শেষ', dEn: 'Finish a task before 7 AM' },
    { id: 'reflect4', e: '🪞', bn: 'আত্মবিশ্লেষক', en: 'Reflector', d: '৪টি সাপ্তাহিক রিফ্লেকশন', dEn: '4 weekly reflections' },
    { id: 'level5', e: '⭐', bn: 'লেভেল ৫', en: 'Level 5', d: 'লেভেল ৫-এ পৌঁছানো', dEn: 'Reach level 5' },
    { id: 'level10', e: '🌠', bn: 'লেভেল ১০', en: 'Level 10', d: 'লেভেল ১০-এ পৌঁছানো', dEn: 'Reach level 10' }
  ];

  const LEVEL_NAMES = [
    ['নবীন পাঠক', 'Rookie Reader'], ['কৌতূহলী মন', 'Curious Mind'], ['মনোযোগী শিক্ষার্থী', 'Focused Learner'], ['নিয়মিত যোদ্ধা', 'Steady Warrior'],
    ['অধ্যায় বিজয়ী', 'Chapter Conqueror'], ['বোর্ড প্রশ্ন শিকারি', 'Board Hunter'], ['সূত্রের জাদুকর', 'Formula Wizard'], ['টেস্ট পেপার মাস্টার', 'Test Paper Master'],
    ['রিভিশন রাজা', 'Revision Royal'], ['A+ অভিযাত্রী', 'A+ Explorer'], ['গোল্ডেন চ্যালেঞ্জার', 'Golden Challenger'], ['মডেল টেস্ট নায়ক', 'Model Test Hero'],
    ['অদম্য মেধাবী', 'Unstoppable Mind'], ['বোর্ড স্টার', 'Board Star'], ['গোল্ডেন A+ লিজেন্ড', 'Golden A+ Legend']
  ];

  /* ----------------- Funny / roast notification copy ----------------- */
  const MSG = {
    soft: [
      'এক ধাপ, শুধু এক ধাপ 💜 ২৫ মিনিট পড়ে এসো, তারপর চা ☕',
      'তুমি পারবে! আজকের প্রথম টাস্কটা শুরু করো—বাকিটা নিজে থেকেই সহজ হবে 🌱',
      'ছোট ছোট ধাপেই বড় স্বপ্ন পূরণ হয়। চলো আজকের মিশন শুরু করি 🚀',
      'পারফেক্ট হওয়ার দরকার নেই, শুধু আজ একটু এগোলেই চলবে ✨',
      'পেঁচু স্যার তোমার জন্য অপেক্ষা করছে 🦉 মাত্র একটা টাস্ক!'
    ],
    funny: [
      'পড়ার টেবিল তোমাকে মিস করছে 🥲 বইগুলো ধুলো জমাচ্ছে, আর তুমি জমাচ্ছ রিলস!',
      'ফোন স্ক্রল করে GPA 5 আসে না, আসে শুধু চোখের নিচে কালি 👀',
      'নিউটন আপেল পড়তে দেখে মহাকর্ষ আবিষ্কার করেছিল, আর তুমি আপেল খেয়ে ঘুমিয়ে পড়লে 🍎😴',
      'রসায়নে বিক্রিয়া হয়, কিন্তু তোমার পড়ার টেবিলে কোনো বিক্রিয়াই নেই কেন? ⚗️',
      'আজকের টাস্ক অনেকগুলো, তোমার কমপ্লিট: ০। গণিত তো পারো, হিসাবটা মিলাও 😏',
      'জড়তার সূত্র পড়োনি, কিন্তু প্র্যাকটিক্যালি তুমি জড়তার জীবন্ত উদাহরণ 😅',
      'বইটা খুলে দেখো—ভেতরে রিলসের চেয়েও মজার জিনিস আছে… মানে, অন্তত নম্বর আছে 📚',
      'Netflix-এর পরের এপিসোড অপেক্ষা করবে, বোর্ড পরীক্ষা করবে না ⏳',
      'মা যদি জানতো আজ কিছুই পড়োনি… থাক, পেঁচু কাউকে বলবে না। আপাতত 🤐',
      'তোমার ক্লাসমেট এইমাত্র একটা টাস্ক শেষ করলো… শুধু জানিয়ে রাখলাম 👀',
      'শেষ বেঞ্চে বসা যায়, কিন্তু শেষ মুহূর্তে সিলেবাস শেষ করা যায় না 😬',
      'স্ট্রিক ভেঙে যাচ্ছে! ২০ মিনিট পড়লেই বাঁচবে—ডাক্তার পেঁচুর প্রেসক্রিপশন 🩺'
    ],
    savage: [
      'তোমার পড়ার গতি দেখে শামুকও ওভারটেক করে চলে গেল 🐌💨',
      'সিলেবাস: ১০০%। তোমার প্রস্তুতি: লোডিং… ২% 🔋',
      'বইটা এতদিন না খোলায় সে এখন তোমাকে চেনে না, পরিচয় দিয়ে খুলতে হবে 📕🤨',
      'তুমি যত সময় “কাল থেকে পড়বো” বলেছ, সেই সময়ে পুরো ফিজিক্স শেষ হয়ে যেত 🙃',
      'GPA 5 চাই, কিন্তু পড়া চাই না—এটা তো পদার্থবিজ্ঞানের নিয়মেও অসম্ভব ⚛️',
      'আলসেমির বোর্ড পরীক্ষা হলে তুমি গোল্ডেন A+ পেতে 🥇😴',
      'পেঁচু স্যার রাত জেগে বসে আছে, আর তুমি? বালিশের সাথে গ্রুপ স্টাডি? 🦉🛏️',
      'ফোনের স্ক্রিন টাইম দেখলে মনে হয় তুমি স্মার্টফোনে অনার্স করছো 📱🎓'
    ],
    comeback: [
      'ফিরে এসেছ! 🎉 গতকালকে ভুলে যাও—আজ নতুন দিন, নতুন শুরু।',
      'বিরতি হয়, থেমে যাওয়া হয় না। তুমি ফিরে এসেছ—এটাই আসল জয় 💪',
      'স্ট্রিক ভেঙেছে, কিন্তু তুমি ভাঙোনি 😎 চলো আবার শুরু করি!'
    ],
    done: [
      'দারুণ! আরেক ধাপ এগোলে 🚀', 'চমৎকার! পেঁচু স্যার গর্বিত 🦉', 'এভাবেই! ছোট ধাপ, বড় অগ্রগতি ✨',
      'জোস! A+ এর দিকে এক কদম 🏃', 'বাহ! আজকের তুমি গতকালের তুমির চেয়ে এগিয়ে 💜'
    ],
    tips: [
      'সকালের সতেজ মাথায় গণিত করো—সূত্রগুলো দ্রুত মনে থাকে।',
      'ভুল মানেই শেখার সুযোগ। প্রতিটা ভুল Error Log-এ লিখে রাখো।',
      'অন্যের সাথে নয়, গতকালের নিজের সাথে তুলনা করো।',
      '২৫ মিনিট ফোকাস + ৫ মিনিট বিরতি = মস্তিষ্কের জন্য সেরা রেসিপি।',
      '★★★ অধ্যায় আগে, তারপর বাকিগুলো—৮০/২০ কৌশল মনে রাখো।',
      'ঘুম কম মানে স্মৃতি কম। রাতে ৬–৭ ঘণ্টা ঘুমাও।',
      'বোর্ড প্রশ্ন ২০২২–২৬ ঠিকঠাক করলে ৮০% প্রশ্নের ধরন কমন আসে।'
    ],
    slots: {
      '06:00': '⏰ গণিত স্লট শুরু! সকালের সতেজ মাথায় সৃজনশীল আর সম্পাদ্য 💪',
      '09:30': '⏰ বিজ্ঞান স্লট! মূল বই + বোর্ড প্রশ্ন—চলো শুরু করি ⚛️',
      '14:30': '⏰ বিকালের স্লট! চিত্র আঁকো, অধ্যায় পড়ো 🌿',
      '18:00': '⏰ ভাষা স্লট! বাংলা ও ইংরেজি রাইটিং ✍️',
      '21:30': '⏰ MCQ চ্যালেঞ্জ ও ডেইলি রিভিউ! Error Log আপডেট করো 📒'
    }
  };

  const DISTRICTS = ['বাগেরহাট', 'বান্দরবান', 'বরগুনা', 'বরিশাল', 'ভোলা', 'বগুড়া', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'চাঁপাইনবাবগঞ্জ', 'চট্টগ্রাম', 'চুয়াডাঙ্গা', 'কুমিল্লা', 'কক্সবাজার', 'ঢাকা', 'দিনাজপুর', 'ফরিদপুর', 'ফেনী', 'গাইবান্ধা', 'গাজীপুর', 'গোপালগঞ্জ', 'হবিগঞ্জ', 'জামালপুর', 'যশোর', 'ঝালকাঠি', 'ঝিনাইদহ', 'জয়পুরহাট', 'খাগড়াছড়ি', 'খুলনা', 'কিশোরগঞ্জ', 'কুড়িগ্রাম', 'কুষ্টিয়া', 'লক্ষ্মীপুর', 'লালমনিরহাট', 'মাদারীপুর', 'মাগুরা', 'মানিকগঞ্জ', 'মেহেরপুর', 'মৌলভীবাজার', 'মুন্সিগঞ্জ', 'ময়মনসিংহ', 'নওগাঁ', 'নড়াইল', 'নারায়ণগঞ্জ', 'নরসিংদী', 'নাটোর', 'নেত্রকোনা', 'নীলফামারী', 'নোয়াখালী', 'পাবনা', 'পঞ্চগড়', 'পটুয়াখালী', 'পিরোজপুর', 'রাজবাড়ী', 'রাজশাহী', 'রাঙামাটি', 'রংপুর', 'সাতক্ষীরা', 'শরীয়তপুর', 'শেরপুর', 'সিরাজগঞ্জ', 'সুনামগঞ্জ', 'সিলেট', 'টাঙ্গাইল', 'ঠাকুরগাঁও'];

  window.SSC_DATA = { ICONS, SUBJECTS, GROUPS, RELIGIONS, PHASES, WEEK_RANGES, KINDS, STEPS, BADGES, LEVEL_NAMES, MSG, DISTRICTS, buildPlan };
})();
