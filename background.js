// Autonomous Restrictor - Background Service Worker
// ARE (Autonomous Restrictor Engine) v2.2 - Cozy 3-Day Anti-Escapism, Entertainment & NSFW Shield

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 72 Hours Mandatory Lock
const CATALOG_VERSION = 5;

// Built-in 24/7 Adult & NSFW Heuristic Guard (Works across Normal + Incognito)
const ADULT_TLDS = ['.xxx', '.porn', '.sex', '.adult', '.sexy'];

const ADULT_HOST_SUBSTRINGS = [
  'pornhub', 'xvideos', 'xnxx', 'xhamster', 'redtube', 'youporn', 'tube8',
  'spankbang', 'eporner', 'hqporner', 'chaturbate', 'stripchat', 'bongacams',
  'camsoda', 'livejasmin', 'myfreecams', 'onlyfans', 'fansly', 'hentai',
  'rule34', 'nhentai', 'hanime', 'erome', 'fapello', 'brazzers', 'bangbros',
  'naughtyamerica', 'realitykings', 'motherless', 'literotica', 'missav',
  'javhd', 'thisvid', 'heavy-r', 'efukt', 'f95zone', 'coomer', 'kemono',
  'simpcity', 'nsfw', 'nudevista', 'nudogram', 'camgirl', 'jerkmate',
  'sexcam', 'livesex', 'freeporn', 'hotsex', 'milf', 'blowjob', 'handjob',
  'creampie', 'gangbang', 'bukkake', 'cuckold', 'incest', 'bdsm', 'fetish',
  'gelbooru', 'danbooru', 'e621'
];

const ADULT_LABEL_REGEX = /(^|[.-])(xxx|sex|porn|porno|nude|nudes|tits|boobs|fap|escort|adult|cam4)([.-]|$)/i;

const SEARCH_ENGINE_HOSTS = [
  'google.', 'bing.com', 'search.yahoo.com', 'duckduckgo.com',
  'yandex.', 'ecosia.org', 'search.brave.com', 'startpage.com', 'baidu.com'
];

const ADULT_SEARCH_REGEX = /\b(porn|porno|pornography|xxx|xvideos|xnxx|xhamster|pornhub|redtube|youporn|spankbang|eporner|hqporner|hentai|rule34|nhentai|hanime|onlyfans|fansly|chaturbate|stripchat|bongacams|camsoda|livejasmin|myfreecams|nsfw|nude|nudes|naked girls|naked women|sex video|sex videos|brazzers|bangbros|erome|fapello|missav|javhd|motherless|literotica)\b/i;

function isAdultOrNsfwUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.toLowerCase();

    // 1. Unambiguous Adult TLDs
    for (const tld of ADULT_TLDS) {
      if (hostname.endsWith(tld)) {
        return { isAdult: true, reason: "24/7 NSFW Shield (Adult TLD Blocked)" };
      }
    }

    // 2. Unambiguous Adult Hostname Substrings & Label Boundaries
    for (const kw of ADULT_HOST_SUBSTRINGS) {
      if (hostname.includes(kw)) {
        return { isAdult: true, reason: "24/7 NSFW Shield (Adult Domain Blocked)" };
      }
    }
    if (ADULT_LABEL_REGEX.test(hostname)) {
      return { isAdult: true, reason: "24/7 NSFW Shield (Adult Keyword Blocked)" };
    }

    // 3. Adult Path Triggers (e.g. forums/subreddits)
    if (/\/r\/(nsfw|gonewild|realgirls|porn|hentai|rule34|sex)\b/i.test(pathname)) {
      return { isAdult: true, reason: "24/7 NSFW Shield (NSFW Community Blocked)" };
    }

    // 4. Search Engine Query Safe-Guard (stops NSFW searches in Normal & Incognito)
    const isSearchEngine = SEARCH_ENGINE_HOSTS.some(h =>
      h.endsWith('.') ? (hostname === h.slice(0, -1) || hostname.startsWith(h) || hostname.includes('.' + h)) : (hostname === h || hostname.endsWith('.' + h))
    );
    if (isSearchEngine) {
      const q = [
        parsed.searchParams.get('q'),
        parsed.searchParams.get('p'),
        parsed.searchParams.get('query'),
        parsed.searchParams.get('text')
      ].filter(Boolean).join(' ');
      if (q && ADULT_SEARCH_REGEX.test(q)) {
        return { isAdult: true, reason: "24/7 NSFW Search Guard (Query Intercepted)" };
      }
    }
  } catch (e) {
    // Ignore malformed URLs
  }
  return { isAdult: false };
}

// Comprehensive Anti-Escapism Catalog: Adult, Entertainment, Streaming, Gaming, Comics, Social & Chat
const SOCIAL_CONSUMPTION_CATALOG = [
  // --- 1. Adult & Pornography (24/7 Always) ---
  { id: "rule_pornhub", name: "Pornhub", pattern: "pornhub.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_xvideos", name: "XVideos", pattern: "xvideos.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_xnxx", name: "XNXX", pattern: "xnxx.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_xhamster", name: "xHamster (All Regions)", pattern: "xhamster.*", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_redtube", name: "RedTube", pattern: "redtube.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_youporn", name: "YouPorn", pattern: "youporn.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_spankbang", name: "SpankBang", pattern: "spankbang.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_eporner", name: "EPorner", pattern: "eporner.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_hqporner", name: "HQPorner", pattern: "hqporner.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_beeg", name: "Beeg", pattern: "beeg.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_txxx", name: "TXXX", pattern: "txxx.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your mind, discipline, and dignity." },
  { id: "rule_onlyfans", name: "OnlyFans", pattern: "onlyfans.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Step back and guard your focus." },
  { id: "rule_fansly", name: "Fansly", pattern: "fansly.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Step back and guard your focus." },
  { id: "rule_chaturbate", name: "Chaturbate", pattern: "chaturbate.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your peace." },
  { id: "rule_stripchat", name: "Stripchat", pattern: "stripchat.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your peace." },
  { id: "rule_bongacams", name: "BongaCams", pattern: "bongacams.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Protect your peace." },
  { id: "rule_rule34", name: "Rule34", pattern: "rule34.*", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Step away from the screen." },
  { id: "rule_nhentai", name: "nHentai", pattern: "nhentai.net", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Step away from the screen." },
  { id: "rule_hanime", name: "Hanime", pattern: "hanime.tv", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Step away from the screen." },
  { id: "rule_erome", name: "EroMe", pattern: "erome.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Guard your attention." },
  { id: "rule_fapello", name: "Fapello", pattern: "fapello.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active. Guard your attention." },
  { id: "rule_coomer", name: "Coomer", pattern: "coomer.su", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active." },
  { id: "rule_kemono", name: "Kemono", pattern: "kemono.su", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active." },
  { id: "rule_literotica", name: "Literotica", pattern: "literotica.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active." },
  { id: "rule_missav", name: "MissAV", pattern: "missav.*", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active." },
  { id: "rule_porncom", name: "Porn.com", pattern: "porn.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active." },
  { id: "rule_sexcom", name: "Sex.com", pattern: "sex.com", category: "adult", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "24/7 NSFW Shield Active." },

  // --- 2. Movies, Streaming, Anime & Live Entertainment (24/7 Always) ---
  { id: "rule_netflix", name: "Netflix", pattern: "netflix.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active. Choose real rest over binge-watching." },
  { id: "rule_primevideo", name: "Prime Video", pattern: "primevideo.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active. Protect your valuable hours." },
  { id: "rule_hotstar", name: "Disney+ Hotstar", pattern: "hotstar.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active. Step away and focus." },
  { id: "rule_disneyplus", name: "Disney+", pattern: "disneyplus.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_jiocinema", name: "JioCinema", pattern: "jiocinema.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_sonyliv", name: "SonyLIV", pattern: "sonyliv.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_zee5", name: "ZEE5", pattern: "zee5.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_mxplayer", name: "MX Player", pattern: "mxplayer.in", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_hulu", name: "Hulu", pattern: "hulu.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_max", name: "Max (HBO)", pattern: "max.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_appletv", name: "Apple TV+", pattern: "tv.apple.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_tubi", name: "Tubi", pattern: "tubitv.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment Shield Active." },
  { id: "rule_crunchyroll", name: "Crunchyroll", pattern: "crunchyroll.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Anime marathon blocked under your focus commitment." },
  { id: "rule_hianime", name: "HiAnime", pattern: "hianime.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Anime streaming blocked. Protect your focus." },
  { id: "rule_aniwatch", name: "AniWatch", pattern: "aniwatch.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Anime streaming blocked." },
  { id: "rule_9anime", name: "9anime", pattern: "9anime.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Anime streaming blocked." },
  { id: "rule_gogoanime", name: "Gogoanime", pattern: "gogoanime.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Anime streaming blocked." },
  { id: "rule_fmovies", name: "FMovies", pattern: "fmovies.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Movie streaming blocked." },
  { id: "rule_123movies", name: "123Movies", pattern: "123movies.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Movie streaming blocked." },
  { id: "rule_cineb", name: "Cineb", pattern: "cineb.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Movie streaming blocked." },
  { id: "rule_moviesjoy", name: "MoviesJoy", pattern: "moviesjoy.*", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Movie streaming blocked." },
  { id: "rule_twitch", name: "Twitch", pattern: "twitch.tv", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Livestreams paused. Live your own life instead." },
  { id: "rule_kick", name: "Kick", pattern: "kick.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Livestreams paused under your 3-day pledge." },
  { id: "rule_rumble", name: "Rumble", pattern: "rumble.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Video streaming blocked." },
  { id: "rule_imdb", name: "IMDb", pattern: "imdb.com", category: "streaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Movie browsing rabbit hole paused." },

  // --- 3. Browser Games & Gaming Entertainment (24/7 Always) ---
  { id: "rule_poki", name: "Poki Games", pattern: "poki.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked. Focus on real goals." },
  { id: "rule_crazygames", name: "CrazyGames", pattern: "crazygames.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked." },
  { id: "rule_coolmath", name: "Coolmath Games", pattern: "coolmathgames.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked." },
  { id: "rule_miniclip", name: "Miniclip", pattern: "miniclip.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked." },
  { id: "rule_y8", name: "Y8 Games", pattern: "y8.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked." },
  { id: "rule_friv", name: "Friv", pattern: "friv.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked." },
  { id: "rule_kongregate", name: "Kongregate", pattern: "kongregate.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked." },
  { id: "rule_newgrounds", name: "Newgrounds", pattern: "newgrounds.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment portal blocked." },
  { id: "rule_armorgames", name: "Armor Games", pattern: "armorgames.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Browser gaming blocked." },
  { id: "rule_krunker", name: "Krunker.io", pattern: "krunker.io", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Web game blocked." },
  { id: "rule_slither", name: "Slither.io", pattern: "slither.io", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Web game blocked." },
  { id: "rule_agar", name: "Agar.io", pattern: "agar.io", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Web game blocked." },
  { id: "rule_skribbl", name: "Skribbl.io", pattern: "skribbl.io", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Web game blocked." },
  { id: "rule_roblox", name: "Roblox", pattern: "roblox.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Gaming blocked under your 3-day commitment." },
  { id: "rule_steam", name: "Steam Community/Store", pattern: "steampowered.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Gaming store blocked." },
  { id: "rule_epic", name: "Epic Games", pattern: "epicgames.com", category: "gaming", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Gaming portal blocked." },

  // --- 4. Manga, Webtoons, Fanfic & Sports/Gossip Entertainment (24/7 Always) ---
  { id: "rule_webtoons", name: "WEBTOON", pattern: "webtoons.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Comics & Webtoons paused. Guard your focus." },
  { id: "rule_mangadex", name: "MangaDex", pattern: "mangadex.org", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Manga reading paused under your commitment." },
  { id: "rule_mangakakalot", name: "Mangakakalot", pattern: "mangakakalot.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Manga reading paused." },
  { id: "rule_manganato", name: "Manganato", pattern: "manganato.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Manga reading paused." },
  { id: "rule_asura", name: "Asura Scans", pattern: "asuracomic.net", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Manga/Manhwa reading paused." },
  { id: "rule_wattpad", name: "Wattpad", pattern: "wattpad.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Story consumption paused." },
  { id: "rule_ao3", name: "Archive of Our Own", pattern: "archiveofourown.org", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Fanfiction rabbit hole paused." },
  { id: "rule_boredpanda", name: "Bored Panda", pattern: "boredpanda.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Clickbait entertainment paused." },
  { id: "rule_buzzfeed", name: "BuzzFeed", pattern: "buzzfeed.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Entertainment feeds paused." },
  { id: "rule_cricbuzz", name: "Cricbuzz", pattern: "cricbuzz.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Sports distraction paused. Stay locked in." },
  { id: "rule_espncricinfo", name: "ESPNcricinfo", pattern: "espncricinfo.com", category: "comics", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Sports distraction paused." },

  // --- 5. Visual, Pins & Short-Form Video Dopamine Traps ---
  { id: "rule_fb_reel", name: "Facebook Reels (24/7)", pattern: "facebook.com/reel", category: "video", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Short-form loops are locked 24/7." },
  { id: "rule_fb_watch", name: "Facebook Watch (24/7)", pattern: "facebook.com/watch", category: "video", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Video feed locked 24/7." },
  { id: "rule_pinterest", name: "Pinterest (All Regions)", pattern: "pinterest.*", category: "video", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Visual rabbit holes paused 24/7. Save your energy for real creation." },
  { id: "rule_pinit", name: "Pinterest Shortlink", pattern: "pin.it", category: "video", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Pinterest redirect intercepted under your 3-day lock." },
  { id: "rule_tiktok", name: "TikTok", pattern: "tiktok.com", category: "video", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Short-form dopamine loop blocked 24/7. Guard your attention span." },
  { id: "rule_snapchat", name: "Snapchat Web", pattern: "snapchat.com", category: "video", defaultMode: "schedule", customMessage: "Snaps and streaks can wait. Stay present." },
  { id: "rule_vimeo", name: "Vimeo", pattern: "vimeo.com", category: "video", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Video consumption barrier active." },
  { id: "rule_dailymotion", name: "Dailymotion", pattern: "dailymotion.com", category: "video", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Video consumption barrier active." },

  // --- 6. Social Networks & Infinite Feeds ---
  { id: "rule_facebook", name: "Facebook", pattern: "facebook.com", category: "social", defaultMode: "schedule", customMessage: "No endless feed scrolling. Reclaim your quiet time." },
  { id: "rule_fb", name: "Facebook Shortlink", pattern: "fb.com", category: "social", defaultMode: "schedule", customMessage: "Social detour intercepted. Stay grounded." },
  { id: "rule_threads_net", name: "Threads", pattern: "threads.net", category: "social", defaultMode: "schedule", customMessage: "Don't hop to another feed. Let your mind rest." },
  { id: "rule_threads_com", name: "Threads (Alt)", pattern: "threads.com", category: "social", defaultMode: "schedule", customMessage: "Don't hop to another feed. Let your mind rest." },
  { id: "rule_x", name: "X (Twitter)", pattern: "x.com", category: "social", defaultMode: "schedule", customMessage: "Step away from the noise and timeline outrage." },
  { id: "rule_twitter", name: "Twitter (Legacy)", pattern: "twitter.com", category: "social", defaultMode: "schedule", customMessage: "Step away from the noise and timeline outrage." },
  { id: "rule_bluesky", name: "Bluesky", pattern: "bsky.app", category: "social", defaultMode: "schedule", customMessage: "Another microblogging feed won't give you peace. Rest." },
  { id: "rule_mastodon", name: "Mastodon", pattern: "mastodon.social", category: "social", defaultMode: "schedule", customMessage: "Social timeline paused under your 3-day pledge." },
  { id: "rule_linkedin", name: "LinkedIn", pattern: "linkedin.com", category: "social", defaultMode: "schedule", customMessage: "Even 'productive' feeds are still dopamine traps after hours." },
  { id: "rule_tumblr", name: "Tumblr", pattern: "tumblr.com", category: "social", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Infinite scroll barrier active. Protect your focus." },

  // --- 7. Messaging & Community Escapism ---
  { id: "rule_whatsapp", name: "WhatsApp Web", pattern: "web.whatsapp.com", category: "messaging", defaultMode: "schedule", customMessage: "Curfew Active. Disconnect from chats, rest your mind, and recharge." },
  { id: "rule_wa_me", name: "WhatsApp Direct", pattern: "wa.me", category: "messaging", defaultMode: "schedule", customMessage: "Direct chat link paused under your commitment." },
  { id: "rule_telegram", name: "Telegram Web", pattern: "telegram.org", category: "messaging", defaultMode: "schedule", customMessage: "Channels and chats paused. Protect your quiet hours." },
  { id: "rule_tme", name: "Telegram Links", pattern: "t.me", category: "messaging", defaultMode: "schedule", customMessage: "Telegram redirect intercepted." },
  { id: "rule_messenger", name: "Messenger", pattern: "messenger.com", category: "messaging", defaultMode: "schedule", customMessage: "Messaging barrier active. Unplug for real rest." },
  { id: "rule_discord", name: "Discord Web", pattern: "discord.com", category: "messaging", defaultMode: "schedule", customMessage: "Servers and chats paused. Protect your deep focus." },
  { id: "rule_discord_gg", name: "Discord Invites", pattern: "discord.gg", category: "messaging", defaultMode: "schedule", customMessage: "Discord invite link paused under your 3-day pledge." },

  // --- 8. Forums, Q&A & Meme Aggregators ---
  { id: "rule_quora", name: "Quora", pattern: "quora.com", category: "forums", defaultMode: "schedule", customMessage: "Q&A doom-scrolling paused. Save your focus." },
  { id: "rule_9gag", name: "9GAG", pattern: "9gag.com", category: "forums", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Meme feed paused 24/7. Protect your dopamine balance." },
  { id: "rule_imgur", name: "Imgur", pattern: "imgur.com", category: "forums", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Image scroll barrier active 24/7." },
  { id: "rule_4chan", name: "4chan", pattern: "4chan.org", category: "forums", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Imageboard barrier active 24/7. Guard your peace." },
  { id: "rule_ifunny", name: "iFunny", pattern: "ifunny.co", category: "forums", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Meme consumption paused 24/7." },

  // --- 9. Dating & Swipe Apps (24/7 Always) ---
  { id: "rule_tinder", name: "Tinder Web", pattern: "tinder.com", category: "dating", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Swiping paused 24/7. Protect your focus and energy." },
  { id: "rule_bumble", name: "Bumble Web", pattern: "bumble.com", category: "dating", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Swiping paused 24/7 under your 3-day pledge." },
  { id: "rule_hinge", name: "Hinge", pattern: "hinge.co", category: "dating", defaultMode: "always", forceAlwaysOnUpgrade: true, customMessage: "Dating app barrier active 24/7." }
];

function buildCatalogRules(options = {}) {
  const now = Date.now();
  const forceGlobalMode = options.forceGlobalMode || null; // 'always' or null (respect item defaultMode)
  const startTime = options.startTime || "21:00";
  const endTime = options.endTime || "07:00";

  return SOCIAL_CONSUMPTION_CATALOG.map(item => ({
    id: item.id,
    name: item.name,
    pattern: item.pattern,
    category: item.category,
    enabled: true,
    mode: forceGlobalMode || item.defaultMode || "schedule",
    startTime,
    endTime,
    days: [0, 1, 2, 3, 4, 5, 6],
    customMessage: item.customMessage,
    createdAt: now,
    lockedUntil: now + THREE_DAYS_MS,
    renewalCount: 0,
    graceExpiresAt: null
  }));
}

function getLocalDateKey(dateObj = new Date()) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createDefaultStats() {
  return {
    totalBlocked: 0,
    todayBlocked: 0,
    normalBlocked: 0,
    incognitoBlocked: 0,
    estimatedSavedMinutes: 0,
    focusMinutesCompleted: 0,
    focusSessionsCount: 0,
    commitmentsHonored: 0,
    lastResetDate: getLocalDateKey(),
    dailyHistory: {},
    hourlyDistribution: new Array(24).fill(0),
    categoryCounts: {},
    domainCounts: {}
  };
}

function getDefaultState() {
  return {
    catalogVersion: CATALOG_VERSION,
    nsfwGuardEnabled: true,
    rules: buildCatalogRules({ startTime: "21:00", endTime: "07:00" }),
    globalCurfew: {
      enabled: true,
      startTime: "21:00",
      endTime: "07:00"
    },
    focusLock: {
      active: false,
      durationMinutes: 0,
      startedAt: 0,
      expiresAt: 0
    },
    strictMode: true,
    reflectionLogs: [],
    stats: createDefaultStats()
  };
}

// Initialize Storage Defaults & Upgrade Migration
async function initializeAndMigrateStorage() {
  const data = await chrome.storage.local.get(null);
  const now = Date.now();

  if (!data.rules) {
    await chrome.storage.local.set(getDefaultState());
  } else {
    let modified = false;
    let rules = (data.rules || []).map(r => {
      const createdAt = r.createdAt || now;
      const lockedUntil = r.lockedUntil || (createdAt + THREE_DAYS_MS);
      if (!r.createdAt || !r.lockedUntil) modified = true;

      let pattern = r.pattern;
      if (pattern && pattern.toLowerCase().replace(/^www\./, '').trim() === 'pinterest.com') {
        pattern = 'pinterest.*';
        modified = true;
      }

      const clean = (pattern || "").toLowerCase().replace(/^www\./, '').trim();
      const catalogMatch = SOCIAL_CONSUMPTION_CATALOG.find(c => c.pattern === clean);

      let category = r.category;
      if (!category) {
        category = catalogMatch ? catalogMatch.category : "custom";
        modified = true;
      }

      // Upgrade pure entertainment / adult / short-form items to 24/7 'always' mode if specified by catalog v3
      let mode = r.mode;
      if ((data.catalogVersion || 1) < CATALOG_VERSION && catalogMatch && catalogMatch.forceAlwaysOnUpgrade && mode !== 'always') {
        mode = 'always';
        modified = true;
      }

      return {
        ...r,
        pattern,
        category,
        mode,
        createdAt,
        lockedUntil,
        renewalCount: r.renewalCount || 0,
        graceExpiresAt: r.graceExpiresAt || null
      };
    });

    const currentCatalogVersion = data.catalogVersion || 1;
    if (currentCatalogVersion < CATALOG_VERSION) {
      const deprecatedPatterns = new Set();
      if (currentCatalogVersion < 4) {
        // Unblock YouTube and YouTube Studio across existing installations (creator channel workflow).
        ["youtube.com", "youtu.be", "youtube.com/shorts", "studio.youtube.com", "m.youtube.com", "music.youtube.com"]
          .forEach(p => deprecatedPatterns.add(p));
      }
      if (currentCatalogVersion < 5) {
        // Unblock Instagram and Reddit across existing installations.
        ["instagram.com", "instagram.com/reels", "instagr.am", "reddit.com", "redd.it", "old.reddit.com", "new.reddit.com"]
          .forEach(p => deprecatedPatterns.add(p));
      }
      if (deprecatedPatterns.size > 0) {
        rules = rules.filter(r => {
          const normalized = (r.pattern || "").toLowerCase().replace(/^www\./, '').trim();
          return !deprecatedPatterns.has(normalized);
        });
      }

      const alwaysCount = rules.filter(r => r.mode === 'always').length;
      const scheduleRule = rules.find(r => r.mode === 'schedule');
      const allAlways = (rules.length > 0 && alwaysCount === rules.length);
      const defaultStart = (scheduleRule && scheduleRule.startTime) || (data.globalCurfew && data.globalCurfew.startTime) || "21:00";
      const defaultEnd = (scheduleRule && scheduleRule.endTime) || (data.globalCurfew && data.globalCurfew.endTime) || "07:00";

      const existingPatterns = new Set(
        rules.map(r => (r.pattern || "").toLowerCase().replace(/^www\./, '').trim())
      );

      for (const item of SOCIAL_CONSUMPTION_CATALOG) {
        if (!existingPatterns.has(item.pattern)) {
          rules.push({
            id: item.id,
            name: item.name,
            pattern: item.pattern,
            category: item.category,
            enabled: true,
            mode: allAlways ? 'always' : (item.defaultMode || 'schedule'),
            startTime: defaultStart,
            endTime: defaultEnd,
            days: [0, 1, 2, 3, 4, 5, 6],
            customMessage: item.customMessage,
            createdAt: now,
            lockedUntil: now + THREE_DAYS_MS,
            renewalCount: 0,
            graceExpiresAt: null
          });
          existingPatterns.add(item.pattern);
        }
      }
      modified = true;
    }

    const reflectionLogs = data.reflectionLogs || [];
    if (!data.reflectionLogs) modified = true;

    if (modified || currentCatalogVersion < CATALOG_VERSION || data.nsfwGuardEnabled === undefined) {
      await chrome.storage.local.set({
        rules,
        reflectionLogs,
        nsfwGuardEnabled: true,
        catalogVersion: CATALOG_VERSION
      });
    }
  }

  chrome.alarms.create("autonomousCheck", { periodInMinutes: 1 });
  await sweepOpenTabs();
  console.log("ARE Cozy v2.2 Active: 24/7 NSFW Guard + All Entertainment & Social Shield (Normal & Incognito).");
}

chrome.runtime.onInstalled.addListener(() => {
  initializeAndMigrateStorage();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("autonomousCheck", { periodInMinutes: 1 });
  sweepOpenTabs();
});

// Time utilities
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function normalizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return {
      hostname: parsed.hostname.toLowerCase().replace(/^www\./, ''),
      pathname: parsed.pathname.toLowerCase()
    };
  } catch (e) {
    return {
      hostname: rawUrl.toLowerCase().replace(/^www\./, ''),
      pathname: ""
    };
  }
}

function doesPatternMatch(hostname, pathname, rawPattern) {
  const pattern = (rawPattern || "").toLowerCase().replace(/^www\./, '').trim();
  if (!pattern) return false;

  if (pattern.endsWith('.*')) {
    const base = pattern.slice(0, -2);
    if (!base) return false;
    return hostname === base || hostname.startsWith(base + '.') || hostname.includes('.' + base + '.');
  }

  if (pattern.includes('/')) {
    const fullPath = hostname + pathname;
    return fullPath === pattern || fullPath.startsWith(pattern);
  }

  return hostname === pattern || hostname.endsWith('.' + pattern);
}

// Core Matching Engine (Normal + Incognito)
async function evaluateUrlAgainstRestrictions(targetUrl) {
  if (!targetUrl || targetUrl.startsWith('chrome://') || targetUrl.startsWith('chrome-extension://') || targetUrl.startsWith('about:') || targetUrl.startsWith('edge://')) {
    return { shouldBlock: false };
  }

  const { hostname, pathname } = normalizeUrl(targetUrl);
  const state = await chrome.storage.local.get(null);

  // PRIORITY 0: Permanent 24/7 Built-in Adult / NSFW & Search Shield (Normal + Incognito)
  if (state.nsfwGuardEnabled !== false) {
    const nsfwCheck = isAdultOrNsfwUrl(targetUrl);
    if (nsfwCheck.isAdult) {
      return {
        shouldBlock: true,
        isPermanentShield: true,
        rule: { id: "nsfw_builtin_shield", pattern: hostname },
        isReviewDue: false,
        reason: nsfwCheck.reason,
        remainingMs: THREE_DAYS_MS,
        lockedUntil: Date.now() + THREE_DAYS_MS,
        commitmentRemainingMs: THREE_DAYS_MS,
        message: "24/7 Pornography & NSFW Shield Active across Normal and Incognito windows. Protect your focus, energy, and clarity."
      };
    }
  }

  const rules = state.rules || [];
  const focusLock = state.focusLock || {};
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nowMs = Date.now();

  const isFocusLockActive = focusLock.active && nowMs < focusLock.expiresAt;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (doesPatternMatch(hostname, pathname, rule.pattern)) {
      // Skip only this specific rule if user has an active 1-hour grace pass (never skips adult heuristic or other rules)
      if (rule.graceExpiresAt && nowMs < rule.graceExpiresAt) {
        continue;
      }

      // Check if the 3-day restriction period has elapsed -> trigger milestone review
      const isReviewDue = rule.lockedUntil && nowMs >= rule.lockedUntil;
      if (isReviewDue) {
        return {
          shouldBlock: true,
          rule,
          isReviewDue: true,
          reason: "3-Day Restriction Complete • Decision Required",
          remainingMs: 0,
          lockedUntil: rule.lockedUntil,
          message: "You have completed 3 days under this restriction. Do you wish to continue?"
        };
      }

      const commitmentRemainingMs = Math.max(0, (rule.lockedUntil || 0) - nowMs);

      if (isFocusLockActive) {
        return {
          shouldBlock: true,
          rule,
          isReviewDue: false,
          reason: "Focus Sanctuary Active",
          remainingMs: focusLock.expiresAt - nowMs,
          lockedUntil: rule.lockedUntil,
          commitmentRemainingMs,
          message: rule.customMessage || "Deep focus session in progress."
        };
      }

      if (rule.mode === 'always') {
        return {
          shouldBlock: true,
          rule,
          isReviewDue: false,
          reason: "24/7 Continuous Rest Barrier",
          remainingMs: commitmentRemainingMs,
          lockedUntil: rule.lockedUntil,
          commitmentRemainingMs,
          message: rule.customMessage
        };
      }

      if (rule.mode === 'countdown') {
        if (rule.expiresAt && nowMs < rule.expiresAt) {
          return {
            shouldBlock: true,
            rule,
            isReviewDue: false,
            reason: "Timer Sprint Barrier Active",
            remainingMs: rule.expiresAt - nowMs,
            lockedUntil: rule.lockedUntil,
            commitmentRemainingMs,
            message: rule.customMessage
          };
        }
      }

      if (rule.mode === 'schedule') {
        const days = rule.days || [0, 1, 2, 3, 4, 5, 6];
        const start = timeToMinutes(rule.startTime);
        const end = timeToMinutes(rule.endTime);
        let inCurfew = false;

        if (start > end) {
          if (currentMinutes >= start) {
            inCurfew = days.includes(currentDay);
          } else if (currentMinutes < end) {
            const prevDay = (currentDay + 6) % 7;
            inCurfew = days.includes(prevDay);
          }
        } else {
          inCurfew = days.includes(currentDay) && currentMinutes >= start && currentMinutes < end;
        }

        if (inCurfew) {
          return {
            shouldBlock: true,
            rule,
            isReviewDue: false,
            reason: `Curfew Active (${rule.startTime} - ${rule.endTime})`,
            remainingMs: commitmentRemainingMs,
            lockedUntil: rule.lockedUntil,
            commitmentRemainingMs,
            message: rule.customMessage
          };
        }
      }
    }
  }

  return { shouldBlock: false };
}

// Debounce map to prevent double-counting stats
const recentTabBlocks = new Map();

const SAVED_MINS_BY_CATEGORY = {
  adult: 25,
  streaming: 35,
  gaming: 30,
  comics: 20,
  video: 18,
  social: 15,
  forums: 15,
  messaging: 10,
  dating: 15,
  custom: 15
};

async function enforceBlockOnTab(tabId, targetUrl, evaluation) {
  const now = Date.now();
  const lastBlock = recentTabBlocks.get(tabId) || 0;
  const shouldCountStat = (now - lastBlock) > 2000;
  recentTabBlocks.set(tabId, now);

  if (shouldCountStat) {
    let isIncognito = false;
    try {
      const tabInfo = await chrome.tabs.get(tabId);
      isIncognito = !!(tabInfo && tabInfo.incognito);
    } catch (e) {
      isIncognito = false;
    }

    const state = await chrome.storage.local.get("stats");
    const defaults = createDefaultStats();
    const stats = { ...defaults, ...(state.stats || {}) };
    stats.dailyHistory = { ...(stats.dailyHistory || {}) };
    stats.hourlyDistribution = Array.isArray(stats.hourlyDistribution) && stats.hourlyDistribution.length === 24
      ? [...stats.hourlyDistribution]
      : new Array(24).fill(0);
    stats.categoryCounts = { ...(stats.categoryCounts || {}) };
    stats.domainCounts = { ...(stats.domainCounts || {}) };

    const nowDate = new Date();
    const today = getLocalDateKey(nowDate);
    const hour = nowDate.getHours();

    if (stats.lastResetDate !== today) {
      stats.todayBlocked = 0;
      stats.lastResetDate = today;
    }

    const category = evaluation.isPermanentShield
      ? "adult"
      : ((evaluation.rule && evaluation.rule.category) || "custom");
    const savedMins = SAVED_MINS_BY_CATEGORY[category] || 15;
    const { hostname } = normalizeUrl(targetUrl);
    const domainKey = (evaluation.rule && evaluation.rule.pattern) || hostname || "unknown";

    stats.totalBlocked += 1;
    stats.todayBlocked += 1;
    if (isIncognito) stats.incognitoBlocked += 1;
    else stats.normalBlocked += 1;
    stats.estimatedSavedMinutes += savedMins;

    stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1;
    stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
    stats.domainCounts[domainKey] = (stats.domainCounts[domainKey] || 0) + 1;

    if (!stats.dailyHistory[today]) {
      stats.dailyHistory[today] = { blocked: 0, incognito: 0, savedMinutes: 0, focusMinutes: 0 };
    }
    stats.dailyHistory[today].blocked += 1;
    if (isIncognito) stats.dailyHistory[today].incognito += 1;
    stats.dailyHistory[today].savedMinutes += savedMins;

    // Immutable Reality Ledger: Full historical dailyHistory is preserved permanently without pruning
    await chrome.storage.local.set({ stats });
  }

  const isReview = evaluation.isReviewDue ? "1" : "0";
  const isPermanent = evaluation.isPermanentShield ? "1" : "0";
  const ruleId = evaluation.rule ? evaluation.rule.id : "";
  const lockedUntil = evaluation.lockedUntil || 0;
  const commitmentRemainingMs = evaluation.commitmentRemainingMs || 0;

  const blockedPageUrl = chrome.runtime.getURL(
    `blocked/blocked.html?url=${encodeURIComponent(targetUrl)}` +
    `&reason=${encodeURIComponent(evaluation.reason || "Autonomous Restriction")}` +
    `&message=${encodeURIComponent(evaluation.message || "")}` +
    `&remaining=${encodeURIComponent(evaluation.remainingMs || 0)}` +
    `&review=${isReview}` +
    `&permanent=${isPermanent}` +
    `&ruleId=${encodeURIComponent(ruleId)}` +
    `&lockedUntil=${lockedUntil}` +
    `&commitmentRemaining=${commitmentRemainingMs}`
  );

  try {
    await chrome.tabs.update(tabId, { url: blockedPageUrl });
  } catch (e) {
    // Tab may have closed concurrently
  }
}

async function sweepOpenTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url) {
        const evaluation = await evaluateUrlAgainstRestrictions(tab.url);
        if (evaluation.shouldBlock) {
          await enforceBlockOnTab(tab.id, tab.url, evaluation);
        }
      }
    }
  } catch (e) {
    console.warn("ARE sweep error:", e);
  }
}

// Layer 1: Pre-Navigation Interceptor (Normal + Incognito)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const evaluation = await evaluateUrlAgainstRestrictions(details.url);
  if (evaluation.shouldBlock) {
    await enforceBlockOnTab(details.tabId, details.url, evaluation);
  }
});

// Layer 2: SPA / Redirect Tab URL Watcher
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url) {
    const evaluation = await evaluateUrlAgainstRestrictions(changeInfo.url);
    if (evaluation.shouldBlock) {
      await enforceBlockOnTab(tabId, changeInfo.url, evaluation);
    }
  }
});

// Layer 3: Autonomous Periodic Watcher
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "autonomousCheck") {
    await sweepOpenTabs();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  recentTabBlocks.delete(tabId);
});

function formatRemainingTime(ms) {
  if (ms <= 0) return "0 minutes";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days} day(s) and ${remHours} hour(s)`;
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} hour(s) and ${mins} minute(s)`;
}

function checkIncognitoAllowed() {
  return new Promise((resolve) => {
    try {
      if (chrome.extension && chrome.extension.isAllowedIncognitoAccess) {
        chrome.extension.isAllowedIncognitoAccess((allowed) => resolve(!!allowed));
      } else {
        resolve(false);
      }
    } catch (e) {
      resolve(false);
    }
  });
}

// Message Listener for Popup, Options, and Blocked Interceptor
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.action === "GET_STATE") {
        const state = await chrome.storage.local.get(null);
        const incognitoAllowed = await checkIncognitoAllowed();
        sendResponse({
          status: "success",
          state,
          incognitoAllowed,
          catalogCount: SOCIAL_CONSUMPTION_CATALOG.length
        });
      }

      else if (request.action === "GET_CATALOG") {
        sendResponse({ status: "success", catalog: SOCIAL_CONSUMPTION_CATALOG });
      }

      else if (request.action === "ADD_RULE") {
        const state = await chrome.storage.local.get("rules");
        let rules = state.rules || [];
        const cleanPattern = request.rule.pattern.toLowerCase().replace(/^www\./, '').trim();
        const existingIndex = rules.findIndex(r => r.pattern.toLowerCase().replace(/^www\./, '').trim() === cleanPattern);

        const now = Date.now();
        const newRule = {
          category: "custom",
          ...request.rule,
          pattern: cleanPattern,
          createdAt: now,
          lockedUntil: now + THREE_DAYS_MS,
          renewalCount: 0,
          graceExpiresAt: null,
          enabled: true
        };

        if (existingIndex !== -1) {
          const existing = rules[existingIndex];
          rules[existingIndex] = {
            ...existing,
            ...newRule,
            id: existing.id,
            lockedUntil: Math.max(existing.lockedUntil || 0, now + THREE_DAYS_MS)
          };
        } else {
          rules.push(newRule);
        }
        await chrome.storage.local.set({ rules });
        await sweepOpenTabs();
        sendResponse({ status: "success", rule: newRule, rules });
      }

      else if (request.action === "ADD_RULES_BATCH") {
        const state = await chrome.storage.local.get("rules");
        let rules = state.rules || [];
        const now = Date.now();
        const incoming = Array.isArray(request.rules) ? request.rules : [];

        for (const reqRule of incoming) {
          const cleanPattern = (reqRule.pattern || "").toLowerCase().replace(/^www\./, '').trim();
          if (!cleanPattern) continue;

          const existingIndex = rules.findIndex(r => r.pattern.toLowerCase().replace(/^www\./, '').trim() === cleanPattern);
          if (existingIndex !== -1) {
            const existing = rules[existingIndex];
            const isLocked = existing.lockedUntil && now < existing.lockedUntil;
            const nextMode = (isLocked && existing.mode === 'always' && reqRule.mode !== 'always') ? 'always' : (reqRule.mode || existing.mode);
            rules[existingIndex] = {
              ...existing,
              ...reqRule,
              id: existing.id,
              mode: nextMode,
              pattern: cleanPattern,
              createdAt: existing.createdAt || now,
              lockedUntil: Math.max(existing.lockedUntil || 0, now + THREE_DAYS_MS),
              enabled: true
            };
          } else {
            rules.push({
              category: "custom",
              ...reqRule,
              pattern: cleanPattern,
              createdAt: now,
              lockedUntil: now + THREE_DAYS_MS,
              renewalCount: 0,
              graceExpiresAt: null,
              enabled: true
            });
          }
        }
        await chrome.storage.local.set({ rules, catalogVersion: CATALOG_VERSION });
        await sweepOpenTabs();
        sendResponse({ status: "success", rules });
      }

      else if (request.action === "ARM_FULL_SOCIAL_SHIELD") {
        const requestedMode = request.mode === "always" ? "always" : "schedule";
        const startTime = request.startTime || "21:00";
        const endTime = request.endTime || "07:00";
        const days = Array.isArray(request.days) ? request.days : [0, 1, 2, 3, 4, 5, 6];

        const state = await chrome.storage.local.get("rules");
        let rules = state.rules || [];
        const now = Date.now();

        for (const item of SOCIAL_CONSUMPTION_CATALOG) {
          // Pure Adult & Entertainment never downgrade from 24/7 'always'
          const itemMode = requestedMode === "always" ? "always" : (item.forceAlwaysOnUpgrade ? "always" : (item.defaultMode || "schedule"));
          const existingIndex = rules.findIndex(r => (r.pattern || "").toLowerCase().replace(/^www\./, '').trim() === item.pattern);

          if (existingIndex !== -1) {
            const existing = rules[existingIndex];
            const isLocked = existing.lockedUntil && now < existing.lockedUntil;
            const nextMode = (isLocked && existing.mode === 'always' && itemMode !== 'always') ? 'always' : itemMode;
            rules[existingIndex] = {
              ...existing,
              category: item.category,
              enabled: true,
              mode: nextMode,
              startTime,
              endTime,
              days,
              lockedUntil: Math.max(existing.lockedUntil || 0, now + THREE_DAYS_MS)
            };
          } else {
            rules.push({
              id: item.id,
              name: item.name,
              pattern: item.pattern,
              category: item.category,
              enabled: true,
              mode: itemMode,
              startTime,
              endTime,
              days,
              customMessage: item.customMessage,
              createdAt: now,
              lockedUntil: now + THREE_DAYS_MS,
              renewalCount: 0,
              graceExpiresAt: null
            });
          }
        }

        await chrome.storage.local.set({ rules, nsfwGuardEnabled: true, catalogVersion: CATALOG_VERSION });
        await sweepOpenTabs();
        sendResponse({ status: "success", rules, count: rules.length });
      }

      else if (request.action === "UPDATE_RULE") {
        const state = await chrome.storage.local.get(["rules", "strictMode", "focusLock"]);
        const rules = state.rules || [];
        const existing = rules.find(r => r.id === request.rule.id);

        if (!existing) {
          sendResponse({ status: "error", message: "Rule not found." });
          return;
        }

        const now = Date.now();
        const isLocked = existing.lockedUntil && now < existing.lockedUntil;

        if (isLocked) {
          const timeLeft = formatRemainingTime(existing.lockedUntil - now);
          if (existing.enabled && !request.rule.enabled) {
            sendResponse({
              status: "error",
              message: `🔒 3-Day Commitment Active! This rule cannot be toggled off for another ${timeLeft}. Honor your pledge.`
            });
            return;
          }
          if (existing.mode === 'always' && request.rule.mode !== 'always') {
            sendResponse({
              status: "error",
              message: `🔒 3-Day Commitment Active! A 24/7 rule cannot be downgraded for another ${timeLeft}.`
            });
            return;
          }
        }

        if (state.strictMode && state.focusLock && state.focusLock.active && now < state.focusLock.expiresAt && !request.rule.enabled) {
          sendResponse({
            status: "error",
            message: "Strict Mode Active: Cannot modify or disable rules during an active Focus Sprint!"
          });
          return;
        }

        const updatedRules = rules.map(r => {
          if (r.id === request.rule.id) {
            return {
              ...r,
              ...request.rule,
              createdAt: r.createdAt,
              lockedUntil: r.lockedUntil,
              renewalCount: r.renewalCount
            };
          }
          return r;
        });

        await chrome.storage.local.set({ rules: updatedRules });
        sendResponse({ status: "success", rules: updatedRules });
      }

      else if (request.action === "DELETE_RULE") {
        const state = await chrome.storage.local.get("rules");
        const rules = state.rules || [];
        const ruleToDelete = rules.find(r => r.id === request.ruleId);

        if (!ruleToDelete) {
          sendResponse({ status: "error", message: "Rule not found." });
          return;
        }

        const now = Date.now();
        if (ruleToDelete.lockedUntil && now < ruleToDelete.lockedUntil) {
          const timeLeft = formatRemainingTime(ruleToDelete.lockedUntil - now);
          sendResponse({
            status: "error",
            message: `🚫 Access Denied: 3-Day Commitment Pledge is active! You cannot remove this restriction for another ${timeLeft}.`
          });
          return;
        }

        const updatedRules = rules.filter(r => r.id !== request.ruleId);
        await chrome.storage.local.set({ rules: updatedRules });
        sendResponse({ status: "success", rules: updatedRules });
      }

      else if (request.action === "RENEW_RULE_3DAYS") {
        const state = await chrome.storage.local.get(["rules", "stats"]);
        let rules = state.rules || [];
        const stats = state.stats || { commitmentsHonored: 0 };

        const target = rules.find(r => r.id === request.ruleId);
        if (!target) {
          sendResponse({ status: "error", message: "Rule not found." });
          return;
        }

        const now = Date.now();
        target.lockedUntil = now + THREE_DAYS_MS;
        target.renewalCount = (target.renewalCount || 0) + 1;
        target.graceExpiresAt = null;
        target.enabled = true;

        stats.commitmentsHonored = (stats.commitmentsHonored || 0) + 1;

        await chrome.storage.local.set({ rules, stats });
        sendResponse({
          status: "success",
          message: `Restriction renewed for another 3 days! New unlock: ${new Date(target.lockedUntil).toLocaleString()}`,
          rule: target
        });
      }

      else if (request.action === "SUBMIT_REFLECTION_AUDIT") {
        const state = await chrome.storage.local.get(["rules", "reflectionLogs", "stats"]);
        let rules = state.rules || [];
        let reflectionLogs = state.reflectionLogs || [];
        let stats = state.stats || {};

        const target = rules.find(r => r.id === request.ruleId);
        const auditEntry = {
          id: "audit_" + Date.now(),
          ruleId: request.ruleId,
          domain: target ? target.pattern : "unknown",
          timestamp: new Date().toISOString(),
          answers: request.answers || {},
          finalAction: request.finalAction
        };

        reflectionLogs.unshift(auditEntry);
        // Immutable Reality Ledger: All reflection audits are preserved permanently

        if (request.finalAction === 'remove') {
          rules = rules.filter(r => r.id !== request.ruleId);
        } else if (request.finalAction === 'grace_1h' && target) {
          const now = Date.now();
          target.graceExpiresAt = now + 60 * 60 * 1000;
          target.lockedUntil = now + (3 * 24 + 1) * 60 * 60 * 1000;
        } else if (request.finalAction === 'relock_3d' && target) {
          const now = Date.now();
          target.lockedUntil = now + THREE_DAYS_MS;
          target.renewalCount = (target.renewalCount || 0) + 1;
          target.graceExpiresAt = null;
          stats.commitmentsHonored = (stats.commitmentsHonored || 0) + 1;
        }

        await chrome.storage.local.set({ rules, reflectionLogs, stats });
        sendResponse({ status: "success", finalAction: request.finalAction, auditEntry });
      }

      else if (request.action === "START_FOCUS_LOCK") {
        const duration = Number(request.durationMinutes) || 30;
        const startedAt = Date.now();
        const expiresAt = startedAt + duration * 60 * 1000;
        const focusLock = { active: true, durationMinutes: duration, startedAt, expiresAt };

        const stData = await chrome.storage.local.get("stats");
        const stats = { ...createDefaultStats(), ...(stData.stats || {}) };
        stats.dailyHistory = { ...(stats.dailyHistory || {}) };
        const today = getLocalDateKey();
        if (!stats.dailyHistory[today]) {
          stats.dailyHistory[today] = { blocked: 0, incognito: 0, savedMinutes: 0, focusMinutes: 0 };
        }
        stats.focusMinutesCompleted = (stats.focusMinutesCompleted || 0) + duration;
        stats.focusSessionsCount = (stats.focusSessionsCount || 0) + 1;
        stats.dailyHistory[today].focusMinutes += duration;

        await chrome.storage.local.set({ focusLock, stats });
        await sweepOpenTabs();
        sendResponse({ status: "success", focusLock });
      }

      else if (request.action === "STOP_FOCUS_LOCK") {
        const state = await chrome.storage.local.get(["focusLock", "strictMode"]);
        if (state.strictMode && state.focusLock && state.focusLock.active && Date.now() < state.focusLock.expiresAt) {
          sendResponse({ status: "error", message: "Strict Mode Active: Focus sprint cannot be cancelled early!" });
          return;
        }
        const focusLock = { active: false, durationMinutes: 0, startedAt: 0, expiresAt: 0 };
        await chrome.storage.local.set({ focusLock });
        sendResponse({ status: "success", focusLock });
      }

      else if (request.action === "CLEAR_REFLECTION_LOGS" || request.action === "RESET_STATS") {
        sendResponse({
          status: "error",
          message: "🔒 Immutable Reality Ledger: Recorded interceptions and reflection audits are permanent and cannot be deleted or altered."
        });
      }
    } catch (err) {
      console.error("ARE Background Error:", err);
      sendResponse({ status: "error", message: err.message });
    }
  })();
  return true;
});

// Immutable Reality Ledger Guard: Automatically restores any external attempt to erase or decrease recorded stats or reflectionLogs
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  const restorePayload = {};
  let needsRestore = false;

  if (changes.stats && changes.stats.oldValue) {
    const oldStats = changes.stats.oldValue;
    const newStats = changes.stats.newValue || {};
    const oldTotal = oldStats.totalBlocked || 0;
    const newTotal = newStats.totalBlocked || 0;
    const oldSaved = oldStats.estimatedSavedMinutes || 0;
    const newSaved = newStats.estimatedSavedMinutes || 0;
    const oldHonored = oldStats.commitmentsHonored || 0;
    const newHonored = newStats.commitmentsHonored || 0;

    if (newTotal < oldTotal || newSaved < oldSaved || newHonored < oldHonored) {
      restorePayload.stats = oldStats;
      needsRestore = true;
    }
  }

  if (changes.reflectionLogs && changes.reflectionLogs.oldValue) {
    const oldLogs = Array.isArray(changes.reflectionLogs.oldValue) ? changes.reflectionLogs.oldValue : [];
    const newLogs = Array.isArray(changes.reflectionLogs.newValue) ? changes.reflectionLogs.newValue : [];
    if (newLogs.length < oldLogs.length) {
      restorePayload.reflectionLogs = oldLogs;
      needsRestore = true;
    }
  }

  if (needsRestore) {
    console.warn("ARE Immutable Reality Guard: Blocked tampering attempt on permanent ledger. Restoring reality.");
    chrome.storage.local.set(restorePayload);
  }
});
