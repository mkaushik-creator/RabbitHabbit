// Type definitions for missing modules

declare module 'passport' {
  import express from 'express';
  
  export interface Profile {
    id: string;
    displayName: string;
    username?: string;
    name?: {
      familyName: string;
      givenName: string;
      middleName?: string;
    };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
    provider: string;
    _raw: string;
    _json: any;
  }

  export interface StrategyOptions {
    [key: string]: any;
  }

  export interface VerifyFunction {
    (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): void;
  }

  export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
  }

  export class Strategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: express.Request, options?: any): void;
  }

  export function use(strategy: Strategy): void;
  export function initialize(options?: any): express.RequestHandler;
  export function session(options?: any): express.RequestHandler;
  export function authenticate(strategy: string | string[], options?: any): express.RequestHandler;
  export function authorize(strategy: string | string[], options?: any): express.RequestHandler;
  export function serializeUser(fn: (user: any, done: (err: any, id?: any) => void) => void): void;
  export function deserializeUser(fn: (id: any, done: (err: any, user?: any) => void) => void): void;

  const passport: {
    use: typeof use;
    initialize: typeof initialize;
    session: typeof session;
    authenticate: typeof authenticate;
    authorize: typeof authorize;
    serializeUser: typeof serializeUser;
    deserializeUser: typeof deserializeUser;
  };
  
  export default passport;
}


declare module 'passport-google-oauth20' {
  import passport from 'passport';
  
  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    userProfileURL?: string;
    passReqToCallback?: boolean;
  }

  export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
  }

  export interface VerifyFunction {
    (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): void;
  }

  export class Strategy extends passport.Strategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: any, options?: any): void;
  }

  export interface Profile extends passport.Profile {
    id: string;
    displayName: string;
    name?: {
      familyName: string;
      givenName: string;
      middleName?: string;
    };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
    provider: 'google';
    _raw: string;
    _json: any;
  }
}

declare module 'passport-twitter' {
  import passport from 'passport';
  
  export interface StrategyOptions {
    consumerKey: string;
    consumerSecret: string;
    callbackURL: string;
    passReqToCallback?: boolean;
    includeEmail?: boolean;
  }

  export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
  }

  export interface VerifyFunction {
    (token: string, tokenSecret: string, profile: Profile, done: VerifyCallback): void;
  }

  export class Strategy extends passport.Strategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: any, options?: any): void;
  }

  export interface Profile extends passport.Profile {
    id: string;
    displayName: string;
    username?: string;
    emails?: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
    provider: 'twitter';
    _raw: string;
    _json: any;
  }
}

declare module 'passport-local' {
  import passport from 'passport';
  
  export interface StrategyOptions {
    usernameField?: string;
    passwordField?: string;
    passReqToCallback?: boolean;
  }

  export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
  }

  export interface VerifyFunction {
    (username: string, password: string, done: VerifyCallback): void;
  }

  export interface VerifyFunctionWithRequest {
    (req: any, username: string, password: string, done: VerifyCallback): void;
  }

  export class Strategy extends passport.Strategy {
    constructor(options: StrategyOptions, verify: VerifyFunction | VerifyFunctionWithRequest);
    name: string;
    authenticate(req: any, options?: any): void;
  }
}

declare module 'connect-pg-simple' {
  import session from 'express-session';
  import { Pool } from 'pg';
  
  interface Options {
    pool?: Pool;
    tableName?: string;
    schemaName?: string;
    ttl?: number;
    createTableIfMissing?: boolean;
    pruneSessionInterval?: number;
    errorLog?: (error: Error) => void;
  }
  
  function connectPgSimple(session: typeof import('express-session')): new (options: Options) => session.Store;
  
  export = connectPgSimple;
}

declare module 'passport-oauth2' {
  export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
  }
}