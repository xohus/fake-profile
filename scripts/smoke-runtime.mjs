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

const modules = [UserStore, ProfileStore, IconUtils, BannerUtils, Dispatcher];
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
  useReducer: () => [0, () => {}]
};
const ReactNative = new Proxy({}, {
  get: (_target, key) => String(key)
});
const storage = {
  enabled: true,
  displayName: "Preview Name",
  username: "preview-user",
  avatarUrl: "https://example.com/avatar.gif",
  bannerUrl: "https://example.com/banner.gif"
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
assert.equal(previewUser.getAvatarURL(), storage.avatarUrl);
assert.equal(previewProfile.banner, storage.bannerUrl);
assert.equal(IconUtils.getUserAvatarURL(currentUser), storage.avatarUrl);
assert.equal(IconUtils.getUserAvatarURL(otherUser), `real-avatar:${otherUser.id}`);
assert.equal(BannerUtils.getUserBannerURL(currentUser.id), storage.bannerUrl);
assert.equal(BannerUtils.getUserBannerURL(otherUser.id), `real-banner:${otherUser.id}`);
assert.equal(UserStore.getUser(otherUser.id), otherUser, "other users must not be preview-patched");

fakeProfile.onUnload();
assert.equal(IconUtils.getUserAvatarURL(currentUser), `real-avatar:${currentUser.id}`);
assert.equal(BannerUtils.getUserBannerURL(currentUser.id), `real-banner:${currentUser.id}`);

console.log("Verified local-only runtime cloning, GIF media hooks, user scoping, and cleanup.");
