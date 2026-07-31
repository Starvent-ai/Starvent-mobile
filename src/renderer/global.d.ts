export {};

import type {
  MobilePriceListResult,
  MobilePriceSourceConfig,
  SmsGatewayConfig,
  PhoneCaptureConfig
} from "@shared/types";

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
      sms: {
        getConfig: () => Promise<SmsGatewayConfig | null>;
        saveConfig: (config: SmsGatewayConfig) => Promise<boolean>;
        send: (config: SmsGatewayConfig, phone: string, message: string) => Promise<{ ok: boolean; error: string | null }>;
      };
      phoneCapture: {
        getConfig: () => Promise<PhoneCaptureConfig>;
        saveConfig: (config: PhoneCaptureConfig) => Promise<boolean>;
        onReceived: (callback: (phone: string) => void) => () => void;
      };
    };
  }
}
