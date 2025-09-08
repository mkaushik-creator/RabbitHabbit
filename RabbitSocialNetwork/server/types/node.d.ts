// Type definitions for Node.js

declare module 'node' {
  // Global objects
  global {
    var process: NodeJS.Process;
    var console: Console;
    var Buffer: typeof Buffer;
    var __dirname: string;
    var __filename: string;
    var require: NodeRequire;
    var module: NodeModule;
    var exports: any;
  }

  // Common Node.js namespaces
  namespace NodeJS {
    interface Process {
      env: ProcessEnv;
      argv: string[];
      exit(code?: number): never;
      cwd(): string;
      platform: string;
      version: string;
      nextTick(callback: Function, ...args: any[]): void;
    }

    interface ProcessEnv {
      [key: string]: string | undefined;
      NODE_ENV?: string;
    }
  }

  // Buffer class
  interface Buffer extends Uint8Array {
    toString(encoding?: string, start?: number, end?: number): string;
    write(string: string, encoding?: string): number;
    toJSON(): { type: 'Buffer'; data: number[] };
  }
}