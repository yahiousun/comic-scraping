import { v4 } from 'uuid';

export interface ErrorObject {
  code: number;
  message: string;
  data?: any;
}

export interface RequestObject {
  id: string;
  method: string;
  params: any;
}

export interface ResponseObject {
  id: string;
  result?: any;
  error?: ErrorObject;
}

export interface EvalWorkerOptions {
  timeout?: number;
}

export const DEFAULT_OPTIONS: EvalWorkerOptions = {
  timeout: 5000 // set 0 to disable timeout
};

const workerSource = `function() {
  function onmessage(ev) {
    if (!ev.data || ! ev.data.id) {
      return;
    }
    const { id, method, params } = ev.data;
    let result, error;

    if (method === 'eval') {
      try {
        if (!params.context) {
          result = eval(params.code);
        } else {
          result = function(input){
            return eval(input);
          }.call(params.context, params.code);
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          error = { code: -32602, message: 'Invalid params', data: err.toString() };
        } else {
          error = { code: -32603, message: 'Internal error', data: err.toString() };
        }
      }
    } else if (!method) {
      error = { code: -32600, message: 'Invalid Request' };
    } else {
      error = { code: -32601, message: 'Method not found' };
    }

    self.postMessage({ id, result, error });
  }
  self.onmessage = onmessage;
}`;

export class EvalWorker {
  private options: EvalWorkerOptions;
  private worker: Worker;
  private url: string;
  public callbacks: Map<string, (response: ResponseObject) => void>;
  static request(method: string, params): RequestObject {
    const id = v4();
    return {
      id,
      method,
      params
    };
  }
  constructor(options?: EvalWorkerOptions) {
    this.options = {...DEFAULT_OPTIONS, ...options};

    const blob = new Blob([`(${workerSource})()`], { type: 'text/javascript' });
    this.worker = new Worker(window.URL.createObjectURL(blob));
    this.worker.onmessage = this.onmessage;
    this.callbacks = new Map();
  }
  onmessage = (e: MessageEvent) => {
    if (!e.data || ! e.data.id) {
      return;
    }
    const { id, result, error } = e.data;
    const callback = this.callbacks.get(id);

    this.abort(id);
    if (callback && typeof callback === 'function') {
      callback.call(this, { id, result, error });
    }
  }
  abort(id: string) {
    return this.callbacks.delete(id);
  }
  clear() {
    this.callbacks.clear();
    return this;
  }
  terminate() {
    if (this.worker) {
      this.clear();
      this.worker.terminate();
      // release blob;
      window.URL.revokeObjectURL(this.url);
      delete this.worker;
    }
  }
  eval(code: string, context?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = EvalWorker.request('eval', {
        code,
        context
      });
      this.send(request, (response) => {
        const { result, error } = response;
        if (!error) {
          resolve(result);
        } else {
          reject(error);
        }
      });
      return this;
    });
  }
  send(message: RequestObject, callback: (response: ResponseObject) => void) {
    this.callbacks.set(message.id, callback);
    this.worker.postMessage(message);
    if (this.options.timeout) {
      setTimeout(() => {
        this.abort(message.id);
      }, this.options.timeout);
    }
    return this;
  }
}
