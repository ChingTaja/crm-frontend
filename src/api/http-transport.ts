import axios, { type AxiosInstance } from 'axios';

// Keep the existing generated API's request/response contract while Axios owns all network I/O.
export type HttpTransport = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function createAxiosTransport(client: AxiosInstance = axios.create({ adapter: ['xhr', 'http'] })): HttpTransport {
  return async (input, init = {}) => {
    const request = input instanceof Request ? input : undefined;
    const method = (init.method ?? request?.method ?? 'GET').toUpperCase();
    const headers = new Headers(init.headers ?? request?.headers);
    const signal = init.signal ?? request?.signal ?? undefined;
    const credentials = init.credentials ?? request?.credentials ?? 'same-origin';
    const url = request?.url ?? String(input);
    const data = init.body !== undefined ? init.body : request && !['GET', 'HEAD'].includes(method) ? await request.arrayBuffer() : undefined;
    signal?.throwIfAborted();
    try {
      const response = await client.request<ArrayBuffer>({
        url,
        method,
        data: ['GET', 'HEAD'].includes(method) ? undefined : data,
        headers: Object.fromEntries(headers.entries()),
        signal,
        withCredentials: credentials === 'include',
        responseType: 'arraybuffer',
        validateStatus: () => true,
        transformResponse: [value => value],
      });
      signal?.throwIfAborted();
      const responseHeaders = new Headers();
      for (const [key, value] of Object.entries(response.headers)) {
        if (value != null) responseHeaders.set(key, Array.isArray(value) ? value.join(', ') : String(value));
      }
      const body = method === 'HEAD' || [204, 205, 304].includes(response.status)
        ? null
        : typeof response.data === 'string' ? response.data : new Uint8Array(response.data).buffer;
      return new Response(body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
    } catch (cause) {
      if (axios.isCancel(cause)) throw new DOMException('請求已取消。', 'AbortError');
      throw cause;
    }
  };
}
