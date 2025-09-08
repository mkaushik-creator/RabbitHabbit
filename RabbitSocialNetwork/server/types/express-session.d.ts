// Type definitions for express-session

declare module 'express-session' {
  import { Request, Response, NextFunction } from 'express';

  interface SessionData {
    cookie: any;
    [key: string]: any;
  }

  interface Session extends SessionData {
    id: string;
    regenerate(callback: (err?: any) => void): void;
    destroy(callback: (err?: any) => void): void;
    reload(callback: (err?: any) => void): void;
    save(callback: (err?: any) => void): void;
    touch(callback: (err?: any) => void): void;
    cookie: any;
  }

  interface SessionOptions {
    secret: string | string[];
    name?: string;
    store?: any;
    cookie?: any;
    genid?: (req: Request) => string;
    rolling?: boolean;
    resave?: boolean;
    proxy?: boolean;
    saveUninitialized?: boolean;
    unset?: string;
    createTableIfMissing?: boolean;
  }

  function session(options: SessionOptions): (req: Request, res: Response, next: NextFunction) => void;
  
  namespace session {
    var Session: SessionConstructor;
    var Store: StoreConstructor;
    var MemoryStore: MemoryStoreConstructor;
  }

  interface SessionConstructor {
    new(request: Request, data?: any): Session;
  }

  interface StoreConstructor {
    new(options?: any): Store;
  }

  interface Store {
    get(sid: string, callback: (err: any, session?: SessionData) => void): void;
    set(sid: string, session: SessionData, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    touch?(sid: string, session: SessionData, callback?: (err?: any) => void): void;
  }

  interface MemoryStoreConstructor {
    new(options?: any): MemoryStore;
  }

  interface MemoryStore extends Store {
    get(sid: string, callback: (err: any, session?: SessionData) => void): void;
    set(sid: string, session: SessionData, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    all(callback: (err: any, sessions?: SessionData[]) => void): void;
    length(callback: (err: any, length?: number) => void): void;
    clear(callback?: (err?: any) => void): void;
  }

  export = session;
}