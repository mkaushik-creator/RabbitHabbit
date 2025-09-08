// Type definitions for vite/client

declare module 'vite/client' {
  // HMR interface
  interface ImportMeta {
    hot: {
      accept: ((callback?: (modules: any[]) => void) => void) & 
              ((dependencies: string[], callback: (modules: any[]) => void) => void);
      dispose: (callback: (data: any) => void) => void;
      decline: () => void;
      invalidate: () => void;
      on: {
        (event: 'vite:beforeUpdate', listener: (payload: UpdatePayload) => void): void;
        (event: 'vite:beforePrune', listener: (payload: PrunePayload) => void): void;
        (event: 'vite:beforeFullReload', listener: (payload: FullReloadPayload) => void): void;
        (event: 'vite:error', listener: (payload: ErrorPayload) => void): void;
      };
      prune: (cb: (data: any) => void) => void;
      data: any;
    };
    env: Record<string, boolean>;
    glob: (pattern: string) => Record<string, any>;
  }

  // Payload interfaces for HMR events
  interface UpdatePayload {
    type: 'update';
    updates: Update[];
  }

  interface Update {
    type: 'js-update' | 'css-update';
    path: string;
    acceptedPath: string;
    timestamp: number;
    explicitImportRequired?: boolean;
  }

  interface PrunePayload {
    type: 'prune';
    paths: string[];
  }

  interface FullReloadPayload {
    type: 'full-reload';
    path?: string;
  }

  interface ErrorPayload {
    type: 'error';
    err: Error;
  }
}