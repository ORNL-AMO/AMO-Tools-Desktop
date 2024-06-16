import { environment } from "../../../environments/environment";

export class MeasurError extends Error {
  originalError?: Error;
    constructor(message:string, originalError?: Error) {
      super(message)
      originalError = originalError;
    }
}
export class MeasurAppError extends MeasurError {}
export class MeasurHttpError extends MeasurError  {}

export function getPlatformDebugInfo() {
  const measurEnv: MeasurEnvironment = environment.name as MeasurEnvironment;
  console.log('measurEnv', measurEnv);
  console.log('version', environment.version);
  console.log('agent', getBrowserName());
}

function getBrowserName() {
  const agent = window.navigator.userAgent.toLowerCase();
  const browser = agent.indexOf('edge') > -1 ? 'Microsoft Edge'
      : agent.indexOf('edg') > -1 ? 'Chromium-based Edge'
      : agent.indexOf('opr') > -1 ? 'Opera'
      : agent.indexOf('chrome') > -1 ? 'Chrome'
      : agent.indexOf('trident') > -1 ? 'Internet Explorer'
      : agent.indexOf('firefox') > -1 ? 'Firefox'
      : agent.indexOf('safari') > -1 ? 'Safari'
      : 'other';

  return browser;
}

export type MeasurEnvironment = 'web' | 'desktop' | 'development'