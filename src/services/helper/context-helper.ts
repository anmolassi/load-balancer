import { AsyncLocalStorage } from 'async_hooks';
const asyncLocalStorage: AsyncLocalStorage<any> = new AsyncLocalStorage();

export default asyncLocalStorage;
