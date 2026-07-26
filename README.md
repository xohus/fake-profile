# FakeProfile

FakeProfile is a local-only Bunny/Vendetta plugin for previewing a customized Discord profile. It changes what the signed-in user sees in their own client; it does not edit or upload Discord account/profile data.

## Features

- Custom display name and username
- Profile picture and banner previews from HTTPS image URLs
- Animated GIF support for both profile pictures and banners
- Public, Nitro, boost, and extra badge previews
- Replace or selectively hide locally displayed badges
- Persistent plugin settings with an explicit Apply / Refresh action

## GIF profile editor

Open the plugin settings and paste an HTTPS URL ending in `.gif` into **Profile picture** or **Profile banner**. The editor displays the animation before it is applied. PNG, JPEG, WebP, and image data URLs are supported too.

The image host receives a normal image request when the preview is rendered. FakeProfile never sends these settings to Discord.

## Repository layout

- `index.js` — shipped Bunny/Vendetta plugin entrypoint referenced by `manifest.json`
- `src/sincordplugins/fakeProfile/` — organized Sincord source version and styles
- `src/api`, `src/utils`, `src/webpack` — supporting source snapshot
- `scripts/verify.mjs` — dependency-free syntax, manifest, layout, and feature verification

## Verify

Requires Node.js 18 or newer:

```sh
npm test
```
