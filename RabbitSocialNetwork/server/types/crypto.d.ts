// Type definitions for crypto

declare module 'crypto' {
  export function scrypt(password: string | Buffer, salt: string | Buffer, keylen: number, options: ScryptOptions, callback: (err: Error | null, derivedKey: Buffer) => void): void;
  export function scrypt(password: string | Buffer, salt: string | Buffer, keylen: number, callback: (err: Error | null, derivedKey: Buffer) => void): void;
  
  export function randomBytes(size: number): Buffer;
  export function randomBytes(size: number, callback: (err: Error | null, buf: Buffer) => void): void;
  
  export function timingSafeEqual(a: Buffer | DataView, b: Buffer | DataView): boolean;
  
  export interface ScryptOptions {
    cost?: number;
    blockSize?: number;
    parallelization?: number;
    N?: number;
    r?: number;
    p?: number;
    maxmem?: number;
  }
}