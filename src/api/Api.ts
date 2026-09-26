/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Lead {
  id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  owner?: string;
  /** @pattern 待聯繫|聯繫中|已合格|不合格 */
  status?: string;
  qualification?: LeadQualification;
}

export interface LeadQualification {
  /**
   * @minLength 1
   * @pattern approved|rejected
   */
  decision: string;
  /** @minLength 1 */
  reviewedAt: string;
  reason?: string;
  note?: string;
  customerId?: string;
  contactId?: string;
  opportunityId?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
}

export interface CustomerResponse {
  id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
}

export interface UpdateContactRequest {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
  customerId?: string;
}

export interface ContactResponse {
  id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
  customerId?: string;
}

export interface CreateLeadRequest {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  owner?: string;
  status?: Option;
  qualification?: LeadQualificationDto;
}

export interface LeadQualificationDto {
  /**
   * @minLength 1
   * @pattern approved|rejected
   */
  decision: string;
  /** @minLength 1 */
  reviewedAt: string;
  reason?: string;
  note?: string;
  customerId?: string;
  contactId?: string;
  opportunityId?: string;
}

export interface Option {
  key?: string;
  value?: string;
}

export interface CreateLeadResponse {
  id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  owner?: string;
  status?: Option;
  qualification?: LeadQualificationDto;
}

export interface CreateCustomerRequest {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
}

export interface CreateContactRequest {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
  customerId?: string;
}

export interface PageResponseLead {
  content?: Lead[];
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
  first?: boolean;
  last?: boolean;
}

export interface FieldMetadata {
  name?: string;
  displayName?: string;
  type?: string;
  apiFieldName?: string;
  readOnly?: boolean;
  options?: Option[];
  relatedEntityName?: string;
  relatedFiledName?: string;
}

export interface PageResponseCustomerResponse {
  content?: CustomerResponse[];
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
  first?: boolean;
  last?: boolean;
}

export interface PageResponseContactResponse {
  content?: ContactResponse[];
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
  first?: boolean;
  last?: boolean;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:8080";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title OpenAPI definition
 * @version v0
 * @baseUrl http://localhost:8080
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags lead-controller
     * @name FindByIdLead
     * @request GET:/api/leads/{id}
     */
    findByIdLead: (id: string, params: RequestParams = {}) =>
      this.request<Lead, any>({
        path: `/api/leads/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name UpdateLeads
     * @request PUT:/api/leads/{id}
     */
    updateLeads: (id: string, data: Lead, params: RequestParams = {}) =>
      this.request<Lead, any>({
        path: `/api/leads/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name DeleteLeads
     * @request DELETE:/api/leads/{id}
     */
    deleteLeads: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/leads/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name FindByIdCustomer
     * @request GET:/api/customers/{id}
     */
    findByIdCustomer: (id: string, params: RequestParams = {}) =>
      this.request<CustomerResponse, any>({
        path: `/api/customers/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name UpdateCustomers
     * @request PUT:/api/customers/{id}
     */
    updateCustomers: (
      id: string,
      data: UpdateCustomerRequest,
      params: RequestParams = {},
    ) =>
      this.request<CustomerResponse, any>({
        path: `/api/customers/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name DeleteCustomers
     * @request DELETE:/api/customers/{id}
     */
    deleteCustomers: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/customers/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name FindByIdContact
     * @request GET:/api/contacts/{id}
     */
    findByIdContact: (id: string, params: RequestParams = {}) =>
      this.request<ContactResponse, any>({
        path: `/api/contacts/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name UpdateContacts
     * @request PUT:/api/contacts/{id}
     */
    updateContacts: (
      id: string,
      data: UpdateContactRequest,
      params: RequestParams = {},
    ) =>
      this.request<ContactResponse, any>({
        path: `/api/contacts/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name DeleteContacts
     * @request DELETE:/api/contacts/{id}
     */
    deleteContacts: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/contacts/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name FindAllLeads
     * @request GET:/api/leads
     */
    findAllLeads: (
      query?: {
        /**
         * @format int32
         * @default 0
         */
        page?: number;
        /**
         * @format int32
         * @default 20
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PageResponseLead, any>({
        path: `/api/leads`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name CreateLeads
     * @request POST:/api/leads
     */
    createLeads: (data: CreateLeadRequest, params: RequestParams = {}) =>
      this.request<CreateLeadResponse, any>({
        path: `/api/leads`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name FindAllCustomers
     * @request GET:/api/customers
     */
    findAllCustomers: (
      query?: {
        /**
         * @format int32
         * @default 0
         */
        page?: number;
        /**
         * @format int32
         * @default 20
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PageResponseCustomerResponse, any>({
        path: `/api/customers`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name CreateCustomers
     * @request POST:/api/customers
     */
    createCustomers: (
      data: CreateCustomerRequest,
      params: RequestParams = {},
    ) =>
      this.request<CustomerResponse, any>({
        path: `/api/customers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name FindAllContacts
     * @request GET:/api/contacts
     */
    findAllContacts: (
      query?: {
        /**
         * @format int32
         * @default 0
         */
        page?: number;
        /**
         * @format int32
         * @default 20
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PageResponseContactResponse, any>({
        path: `/api/contacts`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name CreateContacts
     * @request POST:/api/contacts
     */
    createContacts: (data: CreateContactRequest, params: RequestParams = {}) =>
      this.request<ContactResponse, any>({
        path: `/api/contacts`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags entity-metadata-controller
     * @name FindFieldsByEntityName
     * @request GET:/api/entities/{entityName}/fields
     */
    findFieldsByEntityName: (entityName: string, params: RequestParams = {}) =>
      this.request<FieldMetadata[], any>({
        path: `/api/entities/${entityName}/fields`,
        method: "GET",
        ...params,
      }),
  };
}
