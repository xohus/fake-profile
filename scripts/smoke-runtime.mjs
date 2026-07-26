import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const currentUser = {
  id: "current-user",
  username: "real-user",
  globalName: "Real User",
  publicFlags: 0
};
const otherUser = {
  id: "other-user",
  username: "other-user",
  globalName: "Other User",
  publicFlags: 0
};
const currentProfile = {
  userId: currentUser.id,
  banner: null,
  badges: []
};

const UserStore = {
  getCurrentUser: () => currentUser,
  getUser: id => id === currentUser.id ? currentUser : otherUser,
  emitChange() {}
};
const ProfileStore = {
  getUserProfile: id => id === currentUser.id ? currentProfile : { userId: id },
  getGuildMemberProfile: id => id === currentUser.id ? currentProfile : { userId: id },
  emitChange() {}
};
const IconUtils = {
  getUserAvatarURL: user => `real-avatar:${user.id}`
};
const BannerUtils = {
  getUserBannerURL: user => `real-banner:${typeof user === "string" ? user : user.id}`
};
const Dispatcher = {
  dispatch() {},
  subscribe() {}
};
const ImagePicker = {
  launchImageLibrary(options, callback) {
    assert.equal(options.mediaType, "photo");
    callback({
      assets: [{
        uri: "file:///picked/avatar.gif",
        type: "image/gif",
        fileName: "picked-avatar.gif"
      }]
    });
  }
};
const DocumentPicker = {
  isCancel: () => false,
  async pickSingle(options) {
    assert.ok(options.type.includes("image/gif"));
    return {
      uri: "content://picked/banner.gif",
      fileCopyUri: "file:///cache/picked-banner.gif",
      type: "image/gif",
      name: "picked-banner.gif"
    };
  }
};

const modules = [UserStore, ProfileStore, IconUtils, BannerUtils, Dispatcher, ImagePicker, DocumentPicker];
const findByProps = (...props) => modules.find(module => props.every(prop => prop in module));
const unpatches = [];
const patcher = {
  instead(name, target, callback) {
    const original = target[name];
    target[name] = (...args) => callback(args, original.bind(target));
    const unpatch = () => {
      target[name] = original;
    };
    unpatches.push(unpatch);
    return unpatch;
  }
};
const React = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  useReducer: () => [0, () => {}],
  useState: initial => [initial, () => {}]
};
const ReactNative = new Proxy({}, {
  get: (_target, key) => String(key)
});
const storage = {
  enabled: true,
  displayName: "Preview Name",
  username: "preview-user",
  avatarMedia: {
    uri: "file:///local/avatar.gif",
    type: "image/gif",
    fileName: "avatar.gif"
  },
  bannerMedia: {
    uri: "content://local/banner.gif",
    type: "image/gif",
    fileName: "banner.gif"
  }
};

const context = {
  bunny: {
    metro: {
      common: { React, ReactNative },
      findByStoreName: name => name === "UserStore" ? UserStore : name === "UserProfileStore" ? ProfileStore : null,
      findByStoreNameLazy: () => null,
      findByProps
    },
    utils: { lazy: {} },
    api: { patcher }
  },
  vendetta: { plugin: { storage } },
  console
};

const pluginModule = vm.runInNewContext(readFileSync("index.js", "utf8"), context);
const fakeProfile = pluginModule.default;
fakeProfile.onLoad();

const previewUser = UserStore.getCurrentUser();
const previewProfile = ProfileStore.getUserProfile(currentUser.id);

assert.notEqual(previewUser, currentUser, "the preview must clone the real user");
assert.equal(currentUser.username, "real-user", "the real user object must not be mutated");
assert.equal(currentUser.globalName, "Real User", "the real display name must remain untouched");
assert.equal(previewUser.username, "preview-user");
assert.equal(previewUser.globalName, "Preview Name");
assert.equal(previewUser.getAvatarURL(), storage.avatarMedia.uri);
assert.equal(previewProfile.banner, storage.bannerMedia.uri);
assert.equal(IconUtils.getUserAvatarURL(currentUser), storage.avatarMedia.uri);
assert.equal(IconUtils.getUserAvatarURL(otherUser), `real-avatar:${otherUser.id}`);
assert.equal(BannerUtils.getUserBannerURL(currentUser.id), storage.bannerMedia.uri);
assert.equal(BannerUtils.getUserBannerURL(otherUser.id), `real-banner:${otherUser.id}`);
assert.equal(UserStore.getUser(otherUser.id), otherUser, "other users must not be preview-patched");

const walk = node => {
  if (!node || typeof node !== "object") return [];
  return [node, ...(node.children || []).flatMap(walk)];
};
const settingsTree = fakeProfile.settings();
const mediaFields = walk(settingsTree).filter(node => typeof node.type === "function" && node.props?.keyName);

const avatarField = mediaFields.find(node => node.props.keyName === "avatarMedia");
const bannerField = mediaFields.find(node => node.props.keyName === "bannerMedia");
assert.ok(avatarField && bannerField, "both native media controls must render");

const avatarButtons = walk(avatarField.type(avatarField.props)).filter(node => node.type === "Pressable");
avatarButtons[0].props.onPress();
assert.equal(storage.avatarMedia.uri, "file:///picked/avatar.gif", "photo picker result must be saved locally");

const bannerButtons = walk(bannerField.type(bannerField.props)).filter(node => node.type === "Pressable");
await bannerButtons[1].props.onPress();
assert.equal(storage.bannerMedia.uri, "file:///cache/picked-banner.gif", "file picker result must prefer its local cache copy");

fakeProfile.onUnload();
assert.equal(IconUtils.getUserAvatarURL(currentUser), `real-avatar:${currentUser.id}`);
assert.equal(BannerUtils.getUserBannerURL(currentUser.id), `real-banner:${currentUser.id}`);

console.log("Verified local-only runtime cloning, GIF media hooks, user scoping, and cleanup.");
