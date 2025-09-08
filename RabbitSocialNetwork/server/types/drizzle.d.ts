// Type definitions for drizzle-orm

declare module 'drizzle-orm' {
  export function eq(column: any, value: any): any;
  export function and(...conditions: any[]): any;
  export function or(...conditions: any[]): any;
  export function not(condition: any): any;
  export function gt(column: any, value: any): any;
  export function gte(column: any, value: any): any;
  export function lt(column: any, value: any): any;
  export function lte(column: any, value: any): any;
  export function isNull(column: any): any;
  export function isNotNull(column: any): any;
  export function inArray(column: any, values: any[]): any;
  export function notInArray(column: any, values: any[]): any;
  export function like(column: any, value: string): any;
  export function ilike(column: any, value: string): any;
  export function between(column: any, min: any, max: any): any;
  export function sql(strings: TemplateStringsArray, ...values: any[]): any;
  export function asc(column: any): any;
  export function desc(column: any): any;
}