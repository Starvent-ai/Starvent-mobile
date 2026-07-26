export {};

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
    };
  }
}
