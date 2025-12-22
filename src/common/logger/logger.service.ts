import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {
  log(message: string, context?: string) {
    console.log(`[${new Date().toISOString()}] [LOG] ${context ? `[${context}] ` : ''}${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${new Date().toISOString()}] [ERROR] ${context ? `[${context}] ` : ''}${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string) {
    console.warn(`[${new Date().toISOString()}] [WARN] ${context ? `[${context}] ` : ''}${message}`);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] ${context ? `[${context}] ` : ''}${message}`);
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] [VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
    }
  }
}