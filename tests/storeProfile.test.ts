import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_STORE_PROFILE, loadStoreProfile, saveStoreProfile, type StoreProfile } from "@/lib/storeProfile";

describe("storeProfile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when nothing has been saved yet", async () => {
    const profile = await loadStoreProfile();
    expect(profile).toEqual(DEFAULT_STORE_PROFILE);
  });

  it("persists and reloads a saved profile via the localStorage fallback", async () => {
    const profile: StoreProfile = {
      ...DEFAULT_STORE_PROFILE,
      storeName: "موبایل استار",
      phone: "0912xxxxxxx",
      paperSize: "A4"
    };
    await saveStoreProfile(profile);
    const reloaded = await loadStoreProfile();
    expect(reloaded.storeName).toBe("موبایل استار");
    expect(reloaded.phone).toBe("0912xxxxxxx");
    expect(reloaded.paperSize).toBe("A4");
  });

  it("fills in any missing fields from defaults when merging a saved profile", async () => {
    localStorage.setItem("store-profile", JSON.stringify({ storeName: "فقط اسم" }));
    const profile = await loadStoreProfile();
    expect(profile.storeName).toBe("فقط اسم");
    expect(profile.paperSize).toBe(DEFAULT_STORE_PROFILE.paperSize);
  });
});
