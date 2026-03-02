import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

export class InstrumentationService implements IInstrumentationService {
  startSpan<T>(
    options: { name: string; op?: string; attributes?: Record<string, any> },
    callback: () => T
  ): T {
    // Mock span execution since Sentry is removed
    return callback();
  }

  async instrumentServerAction<T>(
    name: string,
    options: Record<string, any>,
    callback: () => T
  ): Promise<T> {
    // Mock server action instrumentation since Sentry is removed
    return await callback();
  }
}
