/*
 * FakeProfile Kettu Full Attempt
 *
 * This package includes the original Sincord fakeProfile source plus the Sincord API files it imports.
 * It is NOT guaranteed plug-and-play on Kettu because Sincord/Vencord plugin APIs are different from Kettu/Vendetta.
 *
 * Next port step:
 * - replace @api/*, @utils/*, and @webpack/* imports with Kettu/Vendetta equivalents
 * - replace definePlugin({ patches, start, stop }) with Kettu exports onLoad/onUnload
 * - rewrite CSS/modal/headerbar/context menu parts for mobile
 */

import { showToast } from "@vendetta/ui/toasts";

export const onLoad = () => {
  showToast("FakeProfile source bundle loaded. Needs real Kettu port.");
};

export const onUnload = () => {
  showToast("FakeProfile source bundle unloaded.");
};
