// Type definitions for express modules

declare namespace Express {
  interface Request {
    body: any;
    cookies: any;
    query: any;
    params: any;
    headers: any;
    session?: any;
    user?: any;
    method: string;
    originalUrl: string;
    get(name: string): string | undefined;
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(user: any, callback?: (err: any) => void): void;
    logout(callback?: (err: any) => void): void;
    logIn(user: any, callback?: (err: any) => void): void;
    logOut(callback?: (err: any) => void): void;
  }

  interface Response {
    status(code: number): Response;
    send(body: any): Response;
    json(body: any): Response;
    render(view: string, locals?: any): Response;
    redirect(url: string): Response;
    redirect(status: number, url: string): Response;
    cookie(name: string, value: string, options?: any): Response;
    clearCookie(name: string, options?: any): Response;
    sendFile(path: string, options?: any, callback?: (err: any) => void): Response;
    download(path: string, filename?: string, callback?: (err: any) => void): Response;
    type(type: string): Response;
    format(obj: any): Response;
    attachment(filename?: string): Response;
    set(field: any): Response;
    set(field: string, value: string): Response;
    header(field: any): Response;
    header(field: string, value: string): Response;
    get(field: string): string;
    cookie(name: string, value: string, options?: any): Response;
    clearCookie(name: string, options?: any): Response;
    location(url: string): Response;
    links(links: any): Response;
    vary(field: string): Response;
    append(field: string, value: string | string[]): Response;
  }

  interface NextFunction {
    (err?: any): void;
  }

  interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }

  interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): any;
  }
}

declare module 'express' {
  import { Server } from 'http';
  import { EventEmitter } from 'events';

  export interface Request extends Express.Request {}

  export interface Response extends Express.Response {}

  export interface NextFunction extends Express.NextFunction {}
  
  export namespace session {
    interface SessionOptions {
      secret: string;
      resave: boolean;
      saveUninitialized: boolean;
      cookie?: any;
      store?: any;
      name?: string;
      genid?: (req: Request) => string;
      rolling?: boolean;
      proxy?: boolean;
      unset?: string;
    }
  }

  export interface RequestHandler extends Express.RequestHandler {}

  export interface ErrorRequestHandler extends Express.ErrorRequestHandler {}

  export interface Application extends EventEmitter {
    use(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    use(...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    get(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    post(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    put(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    delete(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    patch(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    all(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    options(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    head(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    route(path: string): any;
    listen(port: number, hostname?: string, backlog?: number, callback?: Function): Server;
    listen(port: number, hostname?: string, callback?: Function): Server;
    listen(port: number, callback?: Function): Server;
    listen(path: string, callback?: Function): Server;
    listen(handle: any, callback?: Function): Server;
    set(setting: string, val: any): Application;
    engine(ext: string, fn: Function): Application;
    render(name: string, options?: any, callback?: (err: Error, html: string) => void): void;
    locals: any;
    mountpath: string | string[];
  }

  export interface Express extends Application {
    (): Application;
    request: Request;
    response: Response;
    Router: any;
    static: any;
    json: any;
    urlencoded: any;
  }

  export function Router(options?: any): any;
  export function static(root: string, options?: any): RequestHandler;
  export function json(options?: any): RequestHandler;
  export function urlencoded(options?: any): RequestHandler;

  export default function createApplication(): Express;
}

declare module 'express-session' {
  import { Store } from 'express-session';
  import { Request, Response, NextFunction } from 'express';

  interface SessionData {
    cookie: SessionCookieData;
    [key: string]: any;
  }

  interface SessionCookieData {
    originalMaxAge: number | null;
    path: string;
    maxAge: number | null;
    secure?: boolean;
    httpOnly: boolean;
    domain?: string;
    expires: Date | boolean;
    sameSite?: boolean | string;
  }

  interface SessionCookieOptions {
    path?: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    domain?: string;
    expires?: Date | boolean;
    sameSite?: boolean | string;
  }

  interface SessionOptions {
    secret: string | string[];
    name?: string;
    store?: Store;
    cookie?: SessionCookieOptions;
    genid?: (req: Request) => string;
    rolling?: boolean;
    resave?: boolean;
    proxy?: boolean;
    saveUninitialized?: boolean;
    unset?: string;
  }

  export interface Session extends SessionData {
    regenerate(callback: (err: any) => void): void;
    destroy(callback: (err: any) => void): void;
    reload(callback: (err: any) => void): void;
    save(callback: (err: any) => void): void;
    touch(callback: (err: any) => void): void;
    id: string;
  }

  export interface Store {
    get(sid: string, callback: (err: any, session?: SessionData | null) => void): void;
    set(sid: string, session: SessionData, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    touch?(sid: string, session: SessionData, callback?: (err?: any) => void): void;
  }

  export class MemoryStore extends Store {
    get(sid: string, callback: (err: any, session?: SessionData | null) => void): void;
    set(sid: string, session: SessionData, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    all(callback: (err: any, obj?: { [sid: string]: SessionData; } | null) => void): void;
    length(callback: (err: any, length?: number) => void): void;
    clear(callback?: (err?: any) => void): void;
  }

  export function session(options: SessionOptions): (req: Request, res: Response, next: NextFunction) => void;

  export default session;
}