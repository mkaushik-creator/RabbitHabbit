// Type definitions for util

declare module 'util' {
  export function promisify<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => Promise<any>;
  export function inspect(object: any, options?: InspectOptions): string;
  export function format(format: any, ...param: any[]): string;
  export function inherits(constructor: any, superConstructor: any): void;
  export function debuglog(section: string): (msg: string, ...param: any[]) => void;
  export function isArray(object: any): object is any[];
  export function isBoolean(object: any): object is boolean;
  export function isNull(object: any): object is null;
  export function isNullOrUndefined(object: any): object is null | undefined;
  export function isNumber(object: any): object is number;
  export function isString(object: any): object is string;
  export function isSymbol(object: any): object is symbol;
  export function isUndefined(object: any): object is undefined;
  export function isObject(object: any): object is Object;
  export function isFunction(object: any): object is Function;
  export function isBuffer(object: any): object is Buffer;
  export function isPrimitive(object: any): object is (string | number | boolean | symbol | null | undefined);
  export function isDate(object: any): object is Date;
  export function isError(object: any): object is Error;
  export function isRegExp(object: any): object is RegExp;
  
  export interface InspectOptions {
    showHidden?: boolean;
    depth?: number | null;
    colors?: boolean;
    customInspect?: boolean;
    showProxy?: boolean;
    maxArrayLength?: number | null;
    breakLength?: number;
    compact?: boolean;
    sorted?: boolean | ((a: string, b: string) => number);
    getters?: boolean | 'get' | 'set';
  }
}