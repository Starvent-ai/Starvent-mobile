export type PaperSize = "A4" | "80mm" | "58mm";

export interface StoreProfile {
  storeName: string;
  brand: string;
  logoDataUrl: string | null;
  address: string;
  phone: string;
  taxId: string;
  printerName: string;
  paperSize: PaperSize;
  autoBackupEnabled: boolean;
  backupFolder: string;
  backupIntervalHours: number;
  proxyAddress: string;
  offlineModeEnabled: boolean;
  /** Used to pre-fill the Calculator's tax field — per the "calculator
   *  should just calculate" principle, business-level defaults like this
   *  live in Settings, not re-typed into a tool every time. */
  defaultTaxPercent: number;
}

export const STORE_PROFILE_KEY = "store-profile";

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  storeName: "",
  brand: "",
  logoDataUrl: null,
  address: "",
  phone: "",
  taxId: "",
  printerName: "",
  paperSize: "80mm",
  autoBackupEnabled: false,
  backupFolder: "",
  backupIntervalHours: 24,
  proxyAddress: "",
  offlineModeEnabled: false,
  defaultTaxPercent: 9
};

/**
 * Same electron-store-backed channel Settings already uses for the AI
 * provider config (window.starvent.settings) — falls back to localStorage
 * only in the Vite dev server, where the preload bridge isn't present.
 */
export async function loadStoreProfile(): Promise<StoreProfile> {
  if (window.starvent) {
    const saved = (await window.starvent.settings.get(STORE_PROFILE_KEY)) as StoreProfile | undefined;
    return saved ? { ...DEFAULT_STORE_PROFILE, ...saved } : DEFAULT_STORE_PROFILE;
  }
  const raw = localStorage.getItem(STORE_PROFILE_KEY);
  return raw ? { ...DEFAULT_STORE_PROFILE, ...(JSON.parse(raw) as StoreProfile) } : DEFAULT_STORE_PROFILE;
}

export async function saveStoreProfile(profile: StoreProfile): Promise<void> {
  if (window.starvent) {
    await window.starvent.settings.set(STORE_PROFILE_KEY, profile);
    return;
  }
  localStorage.setItem(STORE_PROFILE_KEY, JSON.stringify(profile));
}
