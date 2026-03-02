import { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';

export class CrashReporterService implements ICrashReporterService {
  report(error: any): string {
    console.error('[CrashReporterService]', error);
    // Return a mock error ID since Sentry is removed
    return `error-${Date.now()}`;
  }
}
