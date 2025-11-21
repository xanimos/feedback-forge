/**
 * Logger interface abstraction for framework-agnostic logging
 */
export interface Logger {
  log(message: string, ...optionalParams: any[]): void;
  error(message: string, ...optionalParams: any[]): void;
  warn?(message: string, ...optionalParams: any[]): void;
  debug?(message: string, ...optionalParams: any[]): void;
}

/**
 * Default console logger implementation
 */
export class ConsoleLogger implements Logger {
  constructor(private readonly context?: string) {}

  log(message: string, ...optionalParams: any[]): void {
    const prefix = this.context ? `[${this.context}]` : '';
    console.log(`${prefix} ${message}`, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    const prefix = this.context ? `[${this.context}]` : '';
    console.error(`${prefix} ${message}`, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    const prefix = this.context ? `[${this.context}]` : '';
    console.warn(`${prefix} ${message}`, ...optionalParams);
  }

  debug(message: string, ...optionalParams: any[]): void {
    const prefix = this.context ? `[${this.context}]` : '';
    console.debug(`${prefix} ${message}`, ...optionalParams);
  }
}
