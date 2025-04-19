import { v4 as uuidv4 } from 'uuid';
import asyncLocalStorage from 'src/services/helper/context-helper';
import { AxiosRequestConfig } from 'axios';

export function TraceId() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const checkTraceId = asyncLocalStorage.getStore()?.get('trace-id');
    const traceId = checkTraceId ?? uuidv4();
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const [options] = args;
      const config: AxiosRequestConfig = options.config ? options.config : {};

      config.headers = {
        ...(config?.headers ?? {}),
        ['trace-id']: traceId,
      };

      const result = await originalMethod.apply(this, args);
      return result;
    };
  };
}
