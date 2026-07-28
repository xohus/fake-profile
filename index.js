(function(exports, metro, common, patcher, plugin) {
  "use strict";

  const React = common.React;
  const RN = common.ReactNative;
  const storage = plugin.storage;

  storage.enabled ??= false;
  storage.displayName ??= "Badge Collector";
  storage.username ??= "badgecollector";
  storage.avatarMedia ??= null;
  storage.bannerMedia ??= null;
  storage.nitroEnabled ??= true;
  storage.selectedFlags ??= {};
  storage.selectedExtras ??= {};
  storage.hiddenFlags ??= {};
  storage.hiddenExtras ??= {};
  storage.replaceMode ??= true;

  const FLAG_BADGES = [
    ["hypesquad", "HypeSquad Events", 4],
    ["bug1", "Bug Hunter 1", 8],
    ["bravery", "HypeSquad Bravery", 64],
    ["brilliance", "HypeSquad Brilliance", 128],
    ["balance", "HypeSquad Balance", 256],
    ["early", "Early Supporter", 512],
    ["bug2", "Bug Hunter 2", 16384],
    ["vdev", "Verified Developer", 131072],
    ["mod", "Former Moderator", 262144],
    ["active", "Active Developer", 4194304]
  ];

  const EXTRA_BADGES = [
    ["hypesquad_icon", "HypeSquad Events", "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png"],
    ["bug1_icon", "Bug Hunter", "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png"],
    ["bravery_icon", "HypeSquad Bravery", "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png"],
    ["brilliance_icon", "HypeSquad Brilliance", "https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png"],
    ["balance_icon", "HypeSquad Balance", "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png"],
    ["early_icon", "Early Supporter", "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png"],
    ["bug2_icon", "Bug Hunter 2", "https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png"],
    ["vdev_icon", "Verified Developer", "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png"],
    ["mod_icon", "Former Moderator", "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png"],
    ["active_icon", "Active Developer", "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png"],
    ["old_username", "Originally Known As", "https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png"],
    ["quest", "Completed a Quest", "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png"],
    ["orbs", "Orbs Apprentice", "https://cdn.discordapp.com/badge-icons/83d8a1eb09a8d64e59233eec5d4d5c2d.png"],
    ["nitro_0", "Nitro Subscriber", "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"],
    ["nitro_1", "Nitro 1 Month", "https://cdn.discordapp.com/badge-icons/4f33c4a9c64ce221936bd256c356f91f.png"],
    ["nitro_2", "Nitro 2 Months", "https://cdn.discordapp.com/badge-icons/4514fab914bdbfb4ad2fa23df76121a6.png"],
    ["nitro_3", "Nitro 3 Months", "https://cdn.discordapp.com/badge-icons/2895086c18d5531d499862e41d1155a6.png"],
    ["nitro_6", "Nitro 6 Months", "https://cdn.discordapp.com/badge-icons/0334688279c8359120922938dcb1d6f8.png"],
    ["nitro_12", "Nitro 1 Year", "https://cdn.discordapp.com/badge-icons/0d61871f72bb9a33a7ae568c1fb4f20a.png"],
    ["nitro_24", "Nitro 2 Years", "https://cdn.discordapp.com/badge-icons/11e2d339068b55d3a506cff34d3780f3.png"],
    ["nitro_36", "Nitro 3 Years", "https://cdn.discordapp.com/badge-icons/cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4.png"],
    ["nitro_72", "Nitro 6 Years", "https://cdn.discordapp.com/badge-icons/5b154df19c53dce2af92c9b61e6be5e2.png"],
    ["boost_1", "Boost 1 Month", "https://cdn.discordapp.com/badge-icons/51040c70d4f20a921ad6674ff86fc95c.png"],
    ["boost_2", "Boost 2 Months", "https://cdn.discordapp.com/badge-icons/0e4080d1d333bc7ad29ef6528b6f2fb7.png"],
    ["boost_3", "Boost 3 Months", "https://cdn.discordapp.com/badge-icons/72bed924410c304dbe3d00a6e593ff59.png"],
    ["boost_6", "Boost 6 Months", "https://cdn.discordapp.com/badge-icons/df199d2050d3ed4ebf84d64ae83989f8.png"],
    ["boost_9", "Boost 9 Months", "https://cdn.discordapp.com/badge-icons/996b3e870e8a22ce519b3a50e6bdd52f.png"],
    ["boost_12", "Boost 1 Year", "https://cdn.discordapp.com/badge-icons/991c9f39ee33d7537d9f408c3e53141e.png"],
    ["boost_15", "Boost 15 Months", "https://cdn.discordapp.com/badge-icons/cb3ae83c15e970e8f3d410bc62cb8b99.png"],
    ["boost_18", "Boost 18 Months", "https://cdn.discordapp.com/badge-icons/7142225d31238f6387d9f09efaa02759.png"],
    ["boost_24", "Boost 2 Years", "https://cdn.discordapp.com/badge-icons/ec92202290b48d0879b7413d2dde3bab.png"]
  ];

  let unpatches = [];
  let myId = null;
  let userCache = new WeakMap();
  let profileCache = new WeakMap();

  function clearFakeCache() {
    userCache = new WeakMap();
    profileCache = new WeakMap();
  }

  function safeStore(name) {
    try { return metro.findByStoreName?.(name) || metro.findByStoreNameLazy?.(name); }
    catch { return null; }
  }

  function oldDate(months) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d;
  }

  function mediaValue(key) {
    const media = storage[key];
    if (typeof media === "string") return { uri: media };
    if (media?.uri) return media;

    // Keep previously saved URL-based previews working until the user replaces them.
    const legacyKey = key === "avatarMedia" ? "avatarUrl" : "bannerUrl";
    const legacyUri = String(storage[legacyKey] || "").trim();
    return legacyUri ? { uri: legacyUri } : null;
  }

  function mediaUri(key) {
    return String(mediaValue(key)?.uri || "").trim();
  }

  function isSupportedImage(asset) {
    const type = String(asset?.type || "").toLowerCase();
    const name = String(asset?.fileName || asset?.name || asset?.uri || "").toLowerCase();
    return type.startsWith("image/") || /\.(gif|png|jpe?g|webp)(?:$|[?#])/i.test(name);
  }

  function savePickedMedia(key, asset) {
    const uri = asset?.fileCopyUri || asset?.uri;
    if (!uri || !isSupportedImage(asset)) throw new Error("Choose a GIF, PNG, JPEG, or WebP image.");

    storage[key] = {
      uri,
      type: asset.type || "",
      fileName: asset.fileName || asset.name || uri.split("/").pop() || "Selected image"
    };
    delete storage[key === "avatarMedia" ? "avatarUrl" : "bannerUrl"];
    clearFakeCache();
    refreshDiscord();
  }

  function pickFromPhotos(key, onDone, onError) {
    const ImagePicker = metro.findByProps?.("launchImageLibrary");
    if (!ImagePicker?.launchImageLibrary) {
      onError("The system photo picker is unavailable in this client build.");
      return;
    }

    try {
      ImagePicker.launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
        includeBase64: false
      }, result => {
        if (result?.didCancel) return;
        if (result?.errorCode) {
          onError(result.errorMessage || "The system photo picker could not open.");
          return;
        }

        const asset = result?.assets?.[0];
        if (!asset) return;
        try {
          savePickedMedia(key, asset);
          onDone();
        } catch (error) {
          onError(error?.message || "That image could not be used.");
        }
      });
    } catch (error) {
      onError(error?.message || "The system photo picker could not open.");
    }
  }

  async function pickFromFiles(key, onDone, onError) {
    try {
      const DocumentPicker = metro.findByProps?.("pickSingle", "isCancel");
      if (DocumentPicker?.pickSingle) {
        const asset = await DocumentPicker.pickSingle({
          type: ["image/gif", "image/png", "image/jpeg", "image/webp"],
          copyTo: "cachesDirectory"
        });
        savePickedMedia(key, asset);
        onDone();
        return;
      }

      const Documents = metro.findByProps?.("pick", "saveDocuments");
      if (Documents?.pick) {
        const result = await Documents.pick({
          type: ["image/*"],
          allowMultiSelection: false
        });
        const asset = Array.isArray(result) ? result[0] : result;
        if (!asset) return;
        savePickedMedia(key, asset);
        onDone();
        return;
      }

      onError("The system file picker is unavailable in this client build.");
    } catch (error) {
      const cancelled = error?.code === "DOCUMENT_PICKER_CANCELED" || error?.code === "OPERATION_CANCELED" || /cancel/i.test(String(error?.message || ""));
      if (!cancelled) onError(error?.message || "The system file picker could not open.");
    }
  }

  function isCurrentUser(user) {
    if (!user) return false;
    try {
      const userId = typeof user === "string" ? user : user.id;
      return !!myId && !!userId && userId === myId;
    } catch {
      return false;
    }
  }

  function selectedFlagMask() {
    let mask = 0;
    const selected = storage.selectedFlags || {};
    for (const [id, _label, flag] of FLAG_BADGES) if (selected[id]) mask |= flag;
    return mask;
  }

  function hiddenFlagMask() {
    let mask = 0;
    const hidden = storage.hiddenFlags || {};
    for (const [id, _label, flag] of FLAG_BADGES) if (hidden[id]) mask |= flag;
    return mask;
  }

  function withBadges(value) {
    const original = storage.replaceMode ? 0 : (Number(value || 0) & ~hiddenFlagMask());
    return original | selectedFlagMask();
  }

  function extraBadgeObjects(existing) {
    const hidden = storage.hiddenExtras || {};
    const selected = storage.selectedExtras || {};
    const out = storage.replaceMode ? [] : (Array.isArray(existing)
      ? existing.filter(b => {
          const badgeId = String(b?.id || b?.key || "").toLowerCase();
          const badgeDesc = String(b?.description || b?.label || "").toLowerCase();

          for (const hideId of Object.keys(hidden)) {
            if (!hidden[hideId]) continue;
            const h = hideId.toLowerCase();
            if (badgeId.includes(h) || badgeDesc.includes(h)) return false;
          }

          return true;
        })
      : []);

    for (const [id, description, icon] of EXTRA_BADGES) {
      if (selected[id] && !out.some(x => x?.id === id)) {
        out.push({ id, description, icon, iconSrc: icon });
      }
    }

    return out;
  }

  function setOwnValue(obj, key, value) {
    try {
      const oldDesc = Object.getOwnPropertyDescriptor(obj, key);
      const enumerable = oldDesc ? !!oldDesc.enumerable : true;

      if (!oldDesc || oldDesc.configurable) {
        Object.defineProperty(obj, key, {
          value,
          writable: true,
          enumerable,
          configurable: true
        });
        return;
      }

      if (oldDesc.writable) {
        obj[key] = value;
      }
    } catch {
      try { obj[key] = value; } catch {}
    }
  }

  function applyFake(obj, original) {
    if (!obj || !storage.enabled) return obj;

    const display = storage.displayName || original?.globalName || original?.displayName || original?.username || "Badge Collector";
    const username = storage.username || original?.username || "badgecollector";
    const flags = withBadges(original?.publicFlags ?? original?.flags ?? obj.publicFlags ?? obj.flags);

    setOwnValue(obj, "username", username);
    setOwnValue(obj, "globalName", display);
    setOwnValue(obj, "displayName", display);
    setOwnValue(obj, "publicFlags", flags);
    setOwnValue(obj, "flags", flags);
    setOwnValue(obj, "badges", extraBadgeObjects(original?.badges ?? obj.badges));
    setOwnValue(obj, "profileBadges", extraBadgeObjects(original?.profileBadges ?? obj.profileBadges));

    const avatarUrl = mediaUri("avatarMedia");
    const bannerUrl = mediaUri("bannerMedia");

    if (avatarUrl) {
      setOwnValue(obj, "avatarURL", avatarUrl);
      setOwnValue(obj, "avatarUrl", avatarUrl);
      setOwnValue(obj, "getAvatarURL", () => avatarUrl);
    }

    if (bannerUrl) {
      setOwnValue(obj, "banner", bannerUrl);
      setOwnValue(obj, "bannerURL", bannerUrl);
      setOwnValue(obj, "bannerUrl", bannerUrl);
      setOwnValue(obj, "getBannerURL", () => bannerUrl);
    }

    if (storage.nitroEnabled) {
      setOwnValue(obj, "premiumType", 2);
      setOwnValue(obj, "premiumSince", oldDate(72));
      setOwnValue(obj, "premiumGuildSince", oldDate(24));
    }

    try { obj.hasFlag = flag => !!(flags & flag); } catch {}

    return obj;
  }

  function cloneWithDescriptors(original) {
    try {
      const clone = Object.create(Object.getPrototypeOf(original));

      for (const key of Reflect.ownKeys(original)) {
        try {
          const desc = Object.getOwnPropertyDescriptor(original, key);
          if (desc) Object.defineProperty(clone, key, desc);
        } catch {}
      }

      return clone;
    } catch {
      try { return { ...original }; }
      catch { return original; }
    }
  }

  function cloneObject(original, type) {
    if (!original || !storage.enabled) return original;

    const cache = type === "profile" ? profileCache : userCache;

    try {
      const cached = cache.get(original);
      if (cached) return cached;
    } catch {}

    const fake = applyFake(cloneWithDescriptors(original), original);

    try { cache.set(original, fake); } catch {}

    return fake;
  }

  function cloneUser(user) {
    if (!user || !storage.enabled) return user;

    try {
      if (myId && user.id !== myId) return user;
    } catch {}

    return cloneObject(user, "user");
  }

  function cloneProfile(profile, userId) {
    if (!profile || !storage.enabled) return profile;

    try {
      if (myId && userId && userId !== myId) return profile;
    } catch {}

    return cloneObject(profile, "profile");
  }

  function patchStores() {
    const UserStore = safeStore("UserStore") || metro.findByProps?.("getCurrentUser", "getUser");

    if (UserStore) {
      try { myId = UserStore.getCurrentUser?.()?.id || myId; } catch {}

      try {
        if (UserStore.getCurrentUser) {
          unpatches.push(patcher.instead("getCurrentUser", UserStore, (a, o) => {
            const user = o(...a);
            try { myId = user?.id || myId; } catch {}
            return cloneUser(user);
          }));
        }
      } catch {}

      try {
        if (UserStore.getUser) {
          unpatches.push(patcher.instead("getUser", UserStore, (a, o) => {
            const wantedId = a?.[0];

            if (wantedId && myId && wantedId !== myId) return o(...a);
            if (wantedId && !myId) return o(...a);

            return cloneUser(o(...a));
          }));
        }
      } catch {}
    }

    const ProfileStore = safeStore("UserProfileStore") || metro.findByProps?.("getUserProfile", "getGuildMemberProfile");

    if (ProfileStore) {
      try {
        if (ProfileStore.getUserProfile) {
          unpatches.push(patcher.instead("getUserProfile", ProfileStore, (a, o) => {
            const userId = a?.[0];

            if (userId && myId && userId !== myId) return o(...a);
            if (userId && !myId) return o(...a);

            return cloneProfile(o(...a), userId);
          }));
        }
      } catch {}

      try {
        if (ProfileStore.getGuildMemberProfile) {
          unpatches.push(patcher.instead("getGuildMemberProfile", ProfileStore, (a, o) => {
            const userId = a?.[0];

            if (userId && myId && userId !== myId) return o(...a);
            if (userId && !myId) return o(...a);

            return cloneProfile(o(...a), userId);
          }));
        }
      } catch {}
    }

    const IconUtils = metro.findByProps?.("getUserAvatarURL");

    try {
      if (IconUtils?.getUserAvatarURL) {
        unpatches.push(patcher.instead("getUserAvatarURL", IconUtils, (a, o) => {
          const avatarUrl = mediaUri("avatarMedia");
          return storage.enabled && avatarUrl && isCurrentUser(a?.[0]) ? avatarUrl : o(...a);
        }));
      }
    } catch {}

    const BannerUtils = metro.findByProps?.("getUserBannerURL");

    try {
      if (BannerUtils?.getUserBannerURL) {
        unpatches.push(patcher.instead("getUserBannerURL", BannerUtils, (a, o) => {
          const bannerUrl = mediaUri("bannerMedia");
          return storage.enabled && bannerUrl && isCurrentUser(a?.[0]) ? bannerUrl : o(...a);
        }));
      }
    } catch {}
  }

  function refreshDiscord() {
    clearFakeCache();

    try { (safeStore("UserStore") || metro.findByProps?.("getCurrentUser", "getUser"))?.emitChange?.(); } catch {}
    try { (safeStore("UserProfileStore") || metro.findByProps?.("getUserProfile", "getGuildMemberProfile"))?.emitChange?.(); } catch {}

    try {
      const Dispatcher = metro.findByProps?.("dispatch", "subscribe");
      Dispatcher?.dispatch?.({ type: "CURRENT_USER_UPDATE" });
      if (myId) Dispatcher?.dispatch?.({ type: "USER_PROFILE_UPDATE", userId: myId });
    } catch {}
  }

  function Settings() {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const set = (key, value) => {
      storage[key] = value;
      clearFakeCache();
      forceUpdate();
    };

    const apply = () => {
      clearFakeCache();
      forceUpdate();
      refreshDiscord();
    };

    const Toggle = ({ label, sub, value, onPress }) => React.createElement(RN.Pressable, {
      onPress,
      style: { backgroundColor: value ? "#2f7d46" : "#2b2b2b", padding: 12, borderRadius: 10, marginBottom: 8 }
    },
      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 15, fontWeight: "800" } }, value ? `${label}: ON` : `${label}: OFF`),
      sub ? React.createElement(RN.Text, { style: { color: "#aaa", marginTop: 3, fontSize: 12 } }, sub) : null
    );

    const Field = ({ label, keyName, placeholder }) => React.createElement(RN.View, { style: { marginBottom: 14 } },
      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 8 } }, label),
      React.createElement(RN.TextInput, {
        defaultValue: String(storage[keyName] ?? ""),
        placeholder,
        placeholderTextColor: "#777",
        onChangeText: text => {
          storage[keyName] = text;
          clearFakeCache();
        },
        autoCorrect: false,
        autoCapitalize: "none",
        editable: true,
        style: { color: "#fff", backgroundColor: "#1f1f1f", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#333" }
      })
    );

    const MediaField = ({ label, keyName, banner = false }) => {
      const [error, setError] = React.useState("");
      const media = mediaValue(keyName);
      const previewUri = mediaUri(keyName);
      const displayName = String(media?.fileName || "Selected image");
      const isGif = String(media?.type || "").toLowerCase() === "image/gif" || /\.gif(?:$|[?#])/i.test(displayName) || /\.gif(?:$|[?#])/i.test(previewUri);
      const selected = !!previewUri;
      const done = () => {
        setError("");
        forceUpdate();
      };

      return React.createElement(RN.View, { style: { marginBottom: 16 } },
        React.createElement(RN.Text, { style: { color: "#fff", fontSize: 14, fontWeight: "800", marginBottom: 4 } }, label),
        React.createElement(RN.Text, { style: { color: "#aaa", fontSize: 12, lineHeight: 17, marginBottom: 8 } },
          "Choose a GIF or image from Photos/Gallery or Files. It stays in this local fake-profile preview."
        ),
        React.createElement(RN.View, { style: { flexDirection: "row", gap: 8 } },
          React.createElement(RN.Pressable, {
            onPress: () => pickFromPhotos(keyName, done, setError),
            style: { flex: 1, backgroundColor: "#5865f2", padding: 12, borderRadius: 8 }
          }, React.createElement(RN.Text, { style: { color: "#fff", textAlign: "center", fontSize: 13, fontWeight: "800" } }, "Choose photo / GIF")),
          React.createElement(RN.Pressable, {
            onPress: () => pickFromFiles(keyName, done, setError),
            style: { flex: 1, backgroundColor: "#35373c", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#4e5058" }
          }, React.createElement(RN.Text, { style: { color: "#fff", textAlign: "center", fontSize: 13, fontWeight: "800" } }, "Choose file"))
        ),
        error ? React.createElement(RN.Text, { style: { color: "#ff7b84", fontSize: 12, marginTop: 8 } }, error) : null,
        selected ? React.createElement(RN.View, {
          style: { marginTop: 10, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#3a3a3a", backgroundColor: "#171717" }
        },
          React.createElement(RN.Image, {
            source: { uri: previewUri },
            resizeMode: "cover",
            style: banner
              ? { width: "100%", height: 120, backgroundColor: "#111" }
              : { width: 96, height: 96, borderRadius: 48, alignSelf: "center", marginVertical: 12, backgroundColor: "#111" }
          }),
          React.createElement(RN.View, {
            style: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#202020" }
          },
            React.createElement(RN.View, { style: { flex: 1, marginRight: 8 } },
              React.createElement(RN.Text, { numberOfLines: 1, style: { color: "#fff", fontSize: 12, fontWeight: "800" } }, displayName),
              React.createElement(RN.Text, { style: { color: isGif ? "#57f287" : "#b5bac1", fontSize: 11, marginTop: 2, fontWeight: "700" } }, isGif ? "ANIMATED GIF" : "IMAGE PREVIEW")
            ),
            React.createElement(RN.Pressable, {
              onPress: () => {
                storage[keyName] = null;
                delete storage[keyName === "avatarMedia" ? "avatarUrl" : "bannerUrl"];
                clearFakeCache();
                forceUpdate();
                refreshDiscord();
              },
              style: { backgroundColor: "#4a2024", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }
            }, React.createElement(RN.Text, { style: { color: "#ff7b84", fontSize: 12, fontWeight: "800" } }, "Clear"))
          )
        ) : null
      );
    };

    const toggleFlag = id => {
      storage.selectedFlags = { ...(storage.selectedFlags || {}), [id]: !storage.selectedFlags?.[id] };
      clearFakeCache();
      forceUpdate();
      refreshDiscord();
    };

    const toggleExtra = id => {
      storage.selectedExtras = { ...(storage.selectedExtras || {}), [id]: !storage.selectedExtras?.[id] };
      clearFakeCache();
      forceUpdate();
      refreshDiscord();
    };

    const toggleHiddenFlag = id => {
      storage.hiddenFlags = { ...(storage.hiddenFlags || {}), [id]: !storage.hiddenFlags?.[id] };
      clearFakeCache();
      forceUpdate();
      refreshDiscord();
    };

    const toggleHiddenExtra = id => {
      storage.hiddenExtras = { ...(storage.hiddenExtras || {}), [id]: !storage.hiddenExtras?.[id] };
      clearFakeCache();
      forceUpdate();
      refreshDiscord();
    };

    return React.createElement(RN.ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 16 } },
      React.createElement(Toggle, { label: "Enabled", sub: "Local-only changes", value: !!storage.enabled, onPress: () => { set("enabled", !storage.enabled); refreshDiscord(); } }),
      React.createElement(Toggle, { label: "Replace Mode / Hide Owned", sub: "ON = hides all real owned badges and only shows selected badges", value: !!storage.replaceMode, onPress: () => { set("replaceMode", !storage.replaceMode); refreshDiscord(); } }),
      React.createElement(Toggle, { label: "Nitro / Boost Dates", sub: "72-month Nitro + 24-month boost", value: !!storage.nitroEnabled, onPress: () => { set("nitroEnabled", !storage.nitroEnabled); refreshDiscord(); } }),
      React.createElement(Field, { label: "Display name", keyName: "displayName", placeholder: "Badge Collector" }),
      React.createElement(Field, { label: "Username", keyName: "username", placeholder: "badgecollector" }),
      React.createElement(MediaField, { label: "Profile picture", keyName: "avatarMedia" }),
      React.createElement(MediaField, { label: "Profile banner", keyName: "bannerMedia", banner: true }),
      React.createElement(RN.Pressable, { onPress: apply, style: { backgroundColor: "#5865f2", padding: 13, borderRadius: 10, marginBottom: 16 } },
        React.createElement(RN.Text, { style: { color: "#fff", textAlign: "center", fontWeight: "800" } }, "Apply / Refresh")
      ),

      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 16, fontWeight: "900", marginBottom: 8 } }, "Add Public Badge Flags"),
      ...FLAG_BADGES.map(([id, label]) => React.createElement(Toggle, { key: "add-flag-" + id, label, value: !!storage.selectedFlags?.[id], onPress: () => toggleFlag(id) })),

      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 14, marginBottom: 8 } }, "Add Nitro / Boost / Extra Icons"),
      ...EXTRA_BADGES.map(([id, label]) => React.createElement(Toggle, { key: "add-extra-" + id, label, value: !!storage.selectedExtras?.[id], onPress: () => toggleExtra(id) })),

      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 14, marginBottom: 8 } }, "Remove Owned Public Badges"),
      ...FLAG_BADGES.map(([id, label]) => React.createElement(Toggle, { key: "hide-flag-" + id, label: "Hide " + label, value: !!storage.hiddenFlags?.[id], onPress: () => toggleHiddenFlag(id) })),

      React.createElement(RN.Text, { style: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 14, marginBottom: 8 } }, "Remove Owned Nitro / Extra Icons"),
      ...EXTRA_BADGES.map(([id, label]) => React.createElement(Toggle, { key: "hide-extra-" + id, label: "Hide " + label, value: !!storage.hiddenExtras?.[id], onPress: () => toggleHiddenExtra(id) })),

      React.createElement(RN.Text, { style: { color: "#aaa", marginTop: 12, lineHeight: 18 } }, "Typing is saved without refreshing every letter now. Tap Apply / Refresh after editing text. Restart Discord if badges do not refresh instantly.")
    );
  }

  const index = {
    onLoad() {
      patchStores();
    },
    onUnload() {
      for (const unpatch of unpatches) try { unpatch?.(); } catch {}
      unpatches = [];
      clearFakeCache();
      refreshDiscord();
    },
    settings: Settings
  };

  exports.default = index;
  Object.defineProperty(exports, "__esModule", { value: true });
  return exports;
})({}, vendetta.metro, vendetta.metro.common, vendetta.patcher, vendetta.plugin);
