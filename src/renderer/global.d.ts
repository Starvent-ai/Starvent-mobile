export {};

import type { MobilePriceListResult, MobilePriceSourceConfig } from "@shared/types";

declare global {
  interface Window {
    starvent?: {
      appInfo: {
        version: string;
        platform: string;
      };
      settings: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<boolean>;
      };
      mobilePrices: {
        test: (config: MobilePriceSourceConfig) => Promise<{ ok: true; items: { name: string; price: number }[] } | { ok: false; error: string }>;
        getConfig: () => Promise<MobilePriceSourceConfig | null>;
        saveConfig: (config: MobilePriceSourceConfig) => Promise<boolean>;
        getList: () => Promise<MobilePriceListResult>;
        onUpdated: (callback: (result: MobilePriceListResult) => void) => () => void;
      };
    };
  }
}
