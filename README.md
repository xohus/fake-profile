# FakeProfile

FakeProfile is a local-only Bunny/Vendetta plugin for previewing a customized Discord profile. It changes what the signed-in user sees in their own client; it does not edit or upload Discord account/profile data.

## Features

- Custom display name and username
- Native profile picture and banner selection from Photos/Gallery or Files
- Animated GIF support for both profile pictures and banners
- Public, Nitro, boost, and extra badge previews
- Replace or selectively hide locally displayed badges
- Persistent plugin settings with an explicit Apply / Refresh action

## GIF profile editor

Open the plugin settings and use **Choose photo / GIF** or **Choose file** under **Profile picture** or **Profile banner**. On iOS this opens the system Photos or Files picker; on Android it opens the system Gallery/Photo Picker or file picker. The editor displays the selected image or animation before it is applied.

GIF, PNG, JPEG, and WebP files are supported. FakeProfile keeps the selection local and never sends it to Discord.

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
