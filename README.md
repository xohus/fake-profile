# FakeProfile Kettu Full Attempt

This ZIP includes:

- Original `src/sincordplugins/fakeProfile/index.tsx`
- Original `src/sincordplugins/fakeProfile/style.css`
- Sincord API files needed by the imports:
  - `src/api/Badges.ts`
  - `src/api/ContextMenu.ts`
  - `src/api/HeaderBar.tsx`
  - `src/api/index.ts`
  - `src/api/DataStore/`
  - `src/utils/modal.tsx`
  - `src/utils/types.ts`
  - `src/utils/constants.ts`
  - `src/webpack/`
- A Kettu/Vendetta-style `manifest.json`
- A simple `index.js` loader stub

## Important

This is a full source bundle / port attempt, not a guaranteed plug-and-play Kettu plugin.

The original fakeProfile plugin is made for Sincord/Vencord desktop-style APIs.
Kettu uses different mobile/Vendetta-style APIs, so the plugin must still be rewritten.

## Why it will not fully work yet

The original file uses imports like:

```ts
@api/Badges
@api/ContextMenu
@api/HeaderBar
@utils/modal
@utils/types
@webpack/common
```

Kettu expects imports like:

```ts
@vendetta/metro
@vendetta/patcher
@vendetta/ui/toasts
```

## License

Sincord source is GPL-3.0-or-later. Original license is included as `LICENSE`.
