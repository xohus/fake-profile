(function(exports, metro, common, lazy, api, plugin) {
  "use strict";

  const React = common.React;
  const RN = common.ReactNative;
  const storage = plugin.storage;

  storage.enabled ??= false;
  storage.displayName ??= "Badge Collector";
  storage.username ??= "badgecollector";
  storage.badgesEnabled ??= true;
  storage.nitroEnabled ??= true;
  storage.allNitroIcons ??= true;

  // All public/user badge flags except Staff (1) and Partner (2)
  const FLAGS = {
    HYPESQUAD: 4,
    BUG_HUNTER_1: 8,
    BRAVERY: 64,
    BRILLIANCE: 128,
    BALANCE: 256,
    EARLY_SUPPORTER: 512,
    BUG_HUNTER_2: 16384,
    VERIFIED_DEVELOPER: 131072,
    MOD_ALUMNI: 262144,
    ACTIVE_DEVELOPER: 4194304
  };

  const ALL_FLAGS_NO_STAFF_PARTNER = Object.values(FLAGS).reduce((a, b) => a | b, 0);

  const EXTRA_BADGES = [
    ["old_username", "Originally Known As", "https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png"],
    ["quest", "Completed a Quest", "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png"],
    ["orbs", "Orbs Apprentice", "https://cdn.discordapp.com/badge-icons/83d8a1eb09a8d64e59233eec5d4d5c2d.png"],

    ["nitro_0", "Nitro Subscriber", "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"],
    ["nitro_1", "Nitro Bronze - 1 Month", "https://cdn.discordapp.com/badge-icons/4f33c4a9c64ce221936bd256c356f91f.png"],
    ["nitro_2", "Nitro Silver - 2 Months", "https://cdn.discordapp.com/badge-icons/4514fab914bdbfb4ad2fa23df76121a6.png"],
    ["nitro_3", "Nitro Gold - 3 Months", "https://cdn.discordapp.com/badge-icons/2895086c18d5531d499862e41d1155a6.png"],
    ["nitro_6", "Nitro Platinum - 6 Months", "https://cdn.discordapp.com/badge-icons/0334688279c8359120922938dcb1d6f8.png"],
    ["nitro_12", "Nitro Diamond - 1 Year", "https://cdn.discordapp.com/badge-icons/0d61871f72bb9a33a7ae568c1fb4f20a.png"],
    ["nitro_24", "Nitro Emerald - 2 Years", "https://cdn.discordapp.com/badge-icons/11e2d339068b55d3a506cff34d3780f3.png"],
    ["nitro_36", "Nitro Ruby - 3 Years", "https://cdn.discordapp.com/badge-icons/cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4.png"],
    ["nitro_72", "Nitro Opal - 6 Years", "https://cdn.discordapp.com/badge-icons/5b154df19c53dce2af92c9b61e6be5e2.png"],

    ["boost_1", "Server Booster - 1 Month", "https://cdn.discordapp.com/badge-icons/51040c70d4f20a921ad6674ff86fc95c.png"],
    ["boost_2", "Server Booster - 2 Months", "https://cdn.discordapp.com/badge-icons/0e4080d1d333bc7ad29ef6528b6f2fb7.png"],
    ["boost_3", "Server Booster - 3 Months", "https://cdn.discordapp.com/badge-icons/72bed924410c304dbe3d00a6e593ff59.png"],
    ["boost_6", "Server Booster - 6 Months", "https://cdn.discordapp.com/badge-icons/df199d2050d3ed4ebf84d64ae83989f8.png"],
    ["boost_9", "Server Booster - 9 Months", "https://cdn.discordapp.com/badge-icons/996b3e870e8a22ce519b3a50e6bdd52f.png"],
    ["boost_12", "Server Booster - 1 Year", "https://cdn.discordapp.com/badge-icons/991c9f39ee33d7537d9f408c3e53141e.png"],
    ["boost_15", "Server Booster - 15 Months", "https://cdn.discordapp.com/badge-icons/cb3ae83c15e970e8f3d410bc62cb8b99.png"],
    ["boost_18", "Server Booster - 18 Months", "https://cdn.discordapp.com/badge-icons/7142225d31238f6387d9f09efaa02759.png"],
    ["boost_24", "Server Booster - 2 Years", "https://cdn.discordapp.com/badge-icons/ec92202290b48d0879b7413d2dde3bab.png"]
  ];

  let unpatches = [];
  let myId = null;

  function safeStore(name) {
    try { return metro.findByStoreName?.(name) || metro.findByStoreNameLazy?.(name); }
    catch { return null; }
  }

  function oldDate(months) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d;
  }

  function withBadges(value) {
    const current = Number(value || 0);
    return storage.badgesEnabled ? (current | ALL_FLAGS_NO_STAFF_PARTNER) : current;
  }

  function badgeObjects(existing) {
    const out = Array.isArray(existing) ? existing.slice() : [];
    if (!storage.enabled || !storage.badgesEnabled || !storage.allNitroIcons) return out;

    for (const [id, description, icon] of EXTRA_BADGES) {
      if (!out.some(x => x?.id === id)) out.push({ id, description, icon, iconSrc: icon });
    }
    return out;
  }

  function applyFake(obj, original) {
    if (!obj || !storage.enabled) return obj;

    const display = storage.displayName || original?.globalName || original?.displayName || original?.username || "Badge Collector";
    const username = storage.username || original?.username || "badgecollector";

    try { obj.username = username; } catch {}
    try { obj.globalName = display; } catch {}
    try { obj.displayName = display; } catch {}
    try { obj.publicFlags = withBadges(original?.publicFlags ?? obj.publicFlags); } catch {}
    try { obj.flags = withBadges(original?.flags ?? obj.flags); } catch {}
    try { obj.badges = badgeObjects(original?.badges ?? obj.badges); } catch {}
    try { obj.profileBadges = badgeObjects(original?.profileBadges ?? obj.profileBadges); } catch {}

    if (storage.nitroEnabled) {
      try { obj.premiumType = 2; } catch {}
      try { obj.premiumSince = oldDate(72); } catch {}
      try { obj.premiumGuildSince = oldDate(24); } catch {}
    }

    try {
      Object.defineProperty(obj, "username", { get: () => username, configurable: true });
      Object.defineProperty(obj, "globalName", { get: () => display, configurable: true });
      Object.defineProperty(obj, "displayName", { get: () => display, configurable: true });
      Object.defineProperty(obj, "publicFlags", { get: () => withBadges(original?.publicFlags), configurable: true });
      Object.defineProperty(obj, "flags", { get: () => withBadges(original?.flags), configurable: true });
      Object.defineProperty(obj, "badges", { get: () => badgeObjects(original?.badges), configurable: true });
      Object.defineProperty(obj, "profileBadges", { get: () => badgeObjects(original?.profileBadges), configurable: true });
      if (storage.nitroEnabled) {
        Object.defineProperty(obj, "premiumType", { get: () => 2, configurable: true });
        Object.defineProperty(obj, "premiumSince", { get: () => oldDate(72), configurable: true });
        Object.defineProperty(obj, "premiumGuildSince", { get: () => oldDate(24), configurable: true });
      }
    } catch {}

    try { obj.hasFlag = flag => !!(withBadges(original?.publicFlags || original?.flags || 0) & flag); } catch {}
    return obj;
  }

  function cloneObject(original) {
    if (!original || !storage.enabled) return original;
    try {
      const clone = Object.create(Object.getPrototypeOf(original));
      for (const key of Reflect.ownKeys(original)) {
        try {
          const desc = Object.getOwnPropertyDescriptor(original, key);
          if (desc) Object.defineProperty(clone, key, desc);
        } catch {}
      }
      return applyFake(clone, original);
    } catch {
      return applyFake({ ...original }, original);
    }
  }

  function cloneUser(user) {
    if (!user || !storage.enabled) return user;
    try { if (myId && user.id !== myId) return user; } catch {}
    return cloneObject(user);
  }

  function cloneProfile(profile, userId) {
    if (!profile || !storage.enabled) return profile;
    try { if (myId && userId && userId !== myId) return profile; } catch {}
    return cloneObject(profile);
  }

  function patchStores() {
    const UserStore = safeStore("UserStore") || metro.findByProps?.("getCurrentUser", "getUser");
    if (UserStore) {
      try { myId = UserStore.getCurrentUser?.()?.id || myId; } catch {}
      try { if (UserStore.getCurrentUser) unpatches.push(api.patcher.instead("getCurrentUser", UserStore, (a, o) => cloneUser(o(...a)))); } catch {}
      try { if (UserStore.getUser) unpatches.push(api.patcher.instead("getUser", UserStore, (a, o) => cloneUser(o(...a)))); } catch {}
    }

    const ProfileStore = safeStore("UserProfileStore") || metro.findByProps?.("getUserProfile", "getGuildMemberProfile");
    if (ProfileStore) {
      try { if (ProfileStore.getUserProfile) unpatches.push(api.patcher.instead("getUserProfile", ProfileStore, (a, o) => cloneProfile(o(...a), a?.[0]))); } catch {}
      try { if (ProfileStore.getGuildMemberProfile) unpatches.push(api.patcher.instead("getGuildMemberProfile", ProfileStore, (a, o) => cloneProfile(o(...a), a?.[0]))); } catch {}
    }
  }

  function refreshDiscord() {
    try { (safeStore("UserStore") || metro.findByProps?.("getCurrentUser", "getUser"))?.emitChange?.(); } catch {}
    try { (safeStore("UserProfileStore") || metro.findByProps?.("getUserProfile", "getGuildMemberProfile"))?.emitChange?.(); } catch {}
    try {
      const Dispatcher = metro.findByProps?.("dispatch", "subscribe");
      Dispatcher?.dispatch?.({ type: "USER_UPDATE", user: {} });
      Dispatcher?.dispatch?.({ type: "USER_PROFILE_UPDATE", userId: myId });
      Dispatcher?.dispatch?.({ type: "CURRENT_USER_UPDATE" });
    } catch {}
  }

  function Settings() {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const set = (key, value) => {
      storage[key] = value;
      forceUpdate();
      refreshDiscord();
    };

    const Toggle = ({ label, sub, keyName }) => React.createElement(RN.Pressable, {
      onPress: () => set(keyName, !storage[keyName]),
      style: { backgroundColor: storage[keyName] ? "#2f7d46" : "#2b2b2b", padding: 14, borderRadius: 10, marginBottom: 12 }
    },
      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 16, fontWeight: "800" } }, storage[keyName] ? `${label}: ON` : `${label}: OFF`),
      React.createElement(RN.Text, { style: { color: "#aaa", marginTop: 4 } }, sub)
    );

    const Field = ({ label, keyName, placeholder }) => React.createElement(RN.View, { style: { marginBottom: 16 } },
      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 8 } }, label),
      React.createElement(RN.TextInput, {
        value: String(storage[keyName] ?? ""),
        placeholder,
        placeholderTextColor: "#777",
        onChangeText: text => set(keyName, text),
        autoCorrect: false,
        autoCapitalize: "none",
        editable: true,
        style: { color: "#fff", backgroundColor: "#1f1f1f", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#333" }
      })
    );

    return React.createElement(RN.ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 16 } },
      React.createElement(Toggle, { label: "Enabled", sub: "Local-only changes on your device", keyName: "enabled" }),
      React.createElement(Toggle, { label: "Badges", sub: "All public/user badges except Staff and Partner", keyName: "badgesEnabled" }),
      React.createElement(Toggle, { label: "Nitro / Boost", sub: "72-month Nitro + 24-month boost locally", keyName: "nitroEnabled" }),
      React.createElement(Toggle, { label: "All Nitro Icons", sub: "Tries to add all Nitro/boost badge icon objects", keyName: "allNitroIcons" }),
      React.createElement(Field, { label: "Display name", keyName: "displayName", placeholder: "Badge Collector" }),
      React.createElement(Field, { label: "Username", keyName: "username", placeholder: "badgecollector" }),
      React.createElement(RN.Text, { style: { color: "#aaa", marginTop: 8, lineHeight: 18 } }, "Restart Discord after enabling if badges/name do not refresh instantly. Some screens only show one Nitro/boost level because Discord normally supports one current Nitro/boost badge.")
    );
  }

  const index = {
    onLoad() { patchStores(); refreshDiscord(); },
    onUnload() {
      for (const unpatch of unpatches) try { unpatch?.(); } catch {}
      unpatches = [];
      refreshDiscord();
    },
    settings: Settings
  };

  exports.default = index;
  Object.defineProperty(exports, "__esModule", { value: true });
  return exports;
})({}, bunny.metro, bunny.metro.common, bunny.utils.lazy, bunny.api, vendetta.plugin);
