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
import { createAxiosTransport, type HttpTransport } from './http-transport';

export interface UpdateUserRequest {
  /**
   * @minLength 0
   * @maxLength 100
   */
  username: string;
  /**
   * @format email
   * @minLength 0
   * @maxLength 254
   */
  email: string;
  roleId?: string;
}

export interface RoleResponse {
  id: string;
  code: string;
  name: string;
}

export interface UserResponse {
  id?: string;
  username?: string;
  email?: string;
  role?: RoleResponse;
  enabled: boolean;
}

export interface UpdateRoleRequest {
  /**
   * @minLength 0
   * @maxLength 100
   */
  name: string;
  /**
   * @minLength 0
   * @maxLength 2000
   */
  description?: string;
  /**
   * @maxItems 100
   * @minItems 0
   */
  permissionCodes: string[];
  /**
   * @format int64
   * @exclusiveMin 0
   */
  expectedRevision: number;
}

export interface RoleDetailResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  system: boolean;
  /** @format int64 */
  userCount: number;
  /** @format int32 */
  permissionCount: number;
  /** @format int64 */
  revision: number;
  quotePermissionMigrationRequired: boolean;
  legacyQuotePermissionCodes: string[];
  permissionCodes: string[];
}

export interface QuoteLineRequest {
  id?: string;
  /** @minLength 1 */
  productId: string;
  /** @exclusiveMin 0 */
  quantity: number;
  /** @min 0 */
  unitPrice: number;
  /**
   * @min 0
   * @max 100
   */
  discountPercent: number;
  /**
   * @min 0
   * @max 100
   */
  taxPercent: number;
}

export interface UpdateQuoteRequest {
  /**
   * @minLength 0
   * @maxLength 255
   */
  name: string;
  /** @minLength 1 */
  customerId: string;
  /** @minLength 1 */
  opportunityId: string;
  /** @format date */
  validUntil: string;
  /**
   * @maxItems 200
   * @minItems 0
   */
  lines: QuoteLineRequest[];
  /**
   * @minLength 0
   * @maxLength 10000
   */
  paymentTerms?: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  deliveryTerms?: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  warranty?: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  notes?: string;
  /**
   * @format int64
   * @exclusiveMin 0
   */
  expectedRevision: number;
}

export interface QuoteAuditResponse {
  id?: string;
  /** @format date-time */
  at?: string;
  actorId?: string;
  actorName?: string;
  action?: string;
  /** @format int32 */
  version?: number;
  detail?: string;
}

export interface QuoteLineResponse {
  id?: string;
  productId?: string;
  productName?: string;
  sku?: string;
  catalogPrice?: number;
  quantity?: number;
  unitPrice?: number;
  discountPercent?: number;
  taxPercent?: number;
}

export interface QuoteResponse {
  id: string;
  number: string;
  versions: QuoteVersionResponse[];
  audit: QuoteAuditResponse[];
  orderId?: string;
}

export interface QuoteTotals {
  /** @format int64 */
  subtotalCents?: number;
  /** @format int64 */
  discountCents?: number;
  /** @format int64 */
  taxCents?: number;
  /** @format int64 */
  totalCents?: number;
}

export interface QuoteVersionResponse {
  id: string;
  /** @format int32 */
  version: number;
  /** @format int64 */
  revision: number;
  name: string;
  customerId: string;
  opportunityId?: string;
  /** @format date */
  validUntil: string;
  lines: QuoteLineResponse[];
  totals: QuoteTotals;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  warranty: string;
  notes: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  approval: 'NotRequired' | 'Required' | 'Pending' | 'Approved' | 'Rejected';
  requiresReapproval: boolean;
  /** @format date-time */
  createdAt: string;
  createdBy: string;
  /** @format date-time */
  sentAt?: string;
  approvalBy?: string;
  /** @format date-time */
  approvalAt?: string;
  approvalReason?: string;
  /** @format date-time */
  decisionAt?: string;
  decisionBy?: string;
  decisionReason?: string;
  reviewerId?: string;
  reviewerName?: string;
  approvalRequestedBy?: string;
  /** @format date-time */
  approvalRequestedAt?: string;
  allowedActions: string[];
}

export interface UpdateProductRequest {
  /**
   * @minLength 0
   * @maxLength 255
   */
  name: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  sku: string;
  /** @min 0 */
  price: number;
  /**
   * @minLength 1
   * @pattern 啟用|停用
   */
  status: string;
}

export interface ProductResponse {
  id?: string;
  name?: string;
  sku?: string;
  price?: number;
  status?: string;
}

export interface UpdateOpportunityRequest {
  /**
   * @minLength 0
   * @maxLength 255
   */
  name: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  customerId: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  leadId?: string;
  /** @min 0 */
  amount: number;
  /** @format date */
  expectedCloseDate?: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  owner?: string;
}

export interface OpportunityResponse {
  id?: string;
  name?: string;
  customerId?: string;
  leadId?: string;
  amount?: number;
  /** @format date */
  expectedCloseDate?: string;
  owner?: string;
  stage: '需求討論中' | '需求成交' | '失單';
  closeDescription?: string;
  /** @format date-time */
  closedAt?: string;
  closedByName?: string;
}

export interface Lead {
  id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  owner?: string;
  /** @pattern 待聯繫|已合格|不合格 */
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

export interface EntitySearchRequest {
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
  keyword?: string;
  filter?: any;
  sort?: SortRule[];
}

export interface SortRule {
  field?: string;
  direction?: string;
}

export interface PageResponseObject {
  content: any[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface RegisterRequest {
  /**
   * @minLength 0
   * @maxLength 100
   */
  username: string;
  /**
   * @format email
   * @minLength 0
   * @maxLength 254
   */
  email: string;
  /**
   * @minLength 8
   * @maxLength 72
   */
  password: string;
  roleId?: string;
}

export interface CreateRoleRequest {
  /**
   * @minLength 1
   * @pattern [A-Za-z][A-Za-z0-9_]{1,49}
   */
  code: string;
  /**
   * @minLength 0
   * @maxLength 100
   */
  name: string;
  /**
   * @minLength 0
   * @maxLength 2000
   */
  description?: string;
  /**
   * @maxItems 100
   * @minItems 0
   */
  permissionCodes: string[];
}

export interface CreateQuoteRequest {
  /**
   * @minLength 0
   * @maxLength 255
   */
  name: string;
  /** @minLength 1 */
  customerId: string;
  /** @minLength 1 */
  opportunityId: string;
  /** @format date */
  validUntil: string;
  /**
   * @maxItems 200
   * @minItems 0
   */
  lines: QuoteLineRequest[];
  /**
   * @minLength 0
   * @maxLength 10000
   */
  paymentTerms?: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  deliveryTerms?: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  warranty?: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  notes?: string;
}

export interface QuoteActionRequest {
  /**
   * @format int64
   * @exclusiveMin 0
   */
  expectedRevision: number;
}

export interface ReviewQuoteRequest {
  /**
   * @format int64
   * @exclusiveMin 0
   */
  expectedRevision: number;
  /**
   * @minLength 1
   * @pattern approved|rejected
   */
  decision: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  reason?: string;
}

export interface RequestQuoteApprovalRequest {
  /**
   * @format int64
   * @exclusiveMin 0
   */
  expectedRevision: number;
  /** @minLength 1 */
  reviewerId: string;
}

export interface DecideQuoteRequest {
  /**
   * @format int64
   * @exclusiveMin 0
   */
  expectedRevision: number;
  /**
   * @minLength 1
   * @pattern accepted|rejected
   */
  decision: string;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  reason?: string;
}

export interface ConvertQuoteToOrderResponse {
  orderId?: string;
  quote?: QuoteResponse;
}

export interface CreateProductRequest {
  /**
   * @minLength 0
   * @maxLength 255
   */
  name: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  sku: string;
  /** @min 0 */
  price: number;
  /**
   * @minLength 1
   * @pattern 啟用|停用
   */
  status: string;
}

export interface CreateOpportunityRequest {
  /**
   * @minLength 0
   * @maxLength 255
   */
  name: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  customerId: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  leadId?: string;
  /** @min 0 */
  amount: number;
  /** @format date */
  expectedCloseDate?: string;
  /**
   * @minLength 0
   * @maxLength 255
   */
  owner?: string;
}

export interface CloseOpportunityRequest {
  /**
   * @minLength 1
   * @pattern won|lost
   */
  outcome: string;
  /**
   * @minLength 0
   * @maxLength 2000
   */
  description?: string;
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

export interface QualifyLeadRequest {
  /**
   * @minLength 1
   * @pattern approved|rejected
   */
  decision: string;
  /** @pattern customer_contact|customer_contact_opportunity */
  conversionType?: string;
  reason?: string;
  note?: string;
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

export interface ResetPasswordRequest {
  /**
   * @minLength 1
   * @pattern [A-Za-z0-9_-]{43}
   */
  token: string;
  /**
   * @minLength 8
   * @maxLength 72
   */
  newPassword: string;
}

export interface LoginRequest {
  /**
   * @minLength 0
   * @maxLength 100
   */
  username: string;
  /**
   * @minLength 0
   * @maxLength 72
   */
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  tokenType?: string;
  /** @format int64 */
  expiresIn?: number;
  user?: UserResponse;
}

export interface ForgotPasswordRequest {
  /**
   * @format email
   * @minLength 0
   * @maxLength 254
   */
  email: string;
}

export interface UpdateUserStatusRequest {
  enabled: boolean;
}

export interface UpdateOrderStatusRequest {
  status: 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled';
  /**
   * @format int64
   * @exclusiveMin 0
   */
  expectedRevision: number;
  /**
   * @minLength 0
   * @maxLength 10000
   */
  reason?: string;
}

export interface OrderAudit {
  id?: string;
  /** @format date-time */
  at?: string;
  actorId?: string;
  actorName?: string;
  action?: string;
  fromStatus?: string;
  toStatus?: string;
  reason?: string;
}

export interface OrderLineResponse {
  id?: string;
  productId?: string;
  productName?: string;
  sku?: string;
  catalogPrice?: number;
  quantity?: number;
  unitPrice?: number;
  discountPercent?: number;
  taxPercent?: number;
  /** @format int64 */
  subtotalCents?: number;
  /** @format int64 */
  discountCents?: number;
  /** @format int64 */
  taxCents?: number;
  /** @format int64 */
  totalCents?: number;
}

export interface OrderResponse {
  id?: string;
  number?: string;
  name?: string;
  status?: string;
  /** @format int64 */
  revision?: number;
  customerId?: string;
  customerName?: string;
  opportunityId?: string;
  quoteSource?: QuoteSource;
  currency?: string;
  lines?: OrderLineResponse[];
  totals?: QuoteTotals;
  paymentTerms?: string;
  deliveryTerms?: string;
  warranty?: string;
  notes?: string;
  /** @format date-time */
  createdAt?: string;
  createdBy?: string;
  /** @format date-time */
  updatedAt?: string;
  /** @format date-time */
  processingAt?: string;
  /** @format date-time */
  completedAt?: string;
  /** @format date-time */
  cancelledAt?: string;
  cancellationReason?: string;
  audit?: OrderAudit[];
  allowedTransitions?: ('Confirmed' | 'Processing' | 'Completed' | 'Cancelled')[];
}

export interface QuoteSource {
  quoteId?: string;
  quoteNumber?: string;
  quoteVersionId?: string;
  /** @format int32 */
  quoteVersion?: number;
}

export interface PageResponseUserResponse {
  content: UserResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageResponseRoleSummaryResponse {
  content: RoleSummaryResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface RoleSummaryResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  system: boolean;
  /** @format int64 */
  userCount: number;
  /** @format int32 */
  permissionCount: number;
  /** @format int64 */
  revision: number;
  quotePermissionMigrationRequired: boolean;
  legacyQuotePermissionCodes: string[];
}

export interface RoleOptionResponse {
  id: string;
  code: string;
  name: string;
}

export interface PageResponseQuoteSummaryResponse {
  content: QuoteSummaryResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface QuoteSummaryResponse {
  id: string;
  number: string;
  name: string;
  customerId: string;
  customerName: string;
  opportunityId?: string;
  /** @format int32 */
  version: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  approval: 'NotRequired' | 'Required' | 'Pending' | 'Approved' | 'Rejected';
  /** @format date */
  validUntil: string;
  /** @format int64 */
  totalCents: number;
  currency: string;
  orderId?: string;
}

export interface ReviewerOption {
  id: string;
  username: string;
}

export interface PageResponseProductResponse {
  content: ProductResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PermissionResponse {
  code: string;
  name: string;
  entity: string;
  groupName: string;
  description?: string;
}

export interface OrderSummaryResponse {
  id?: string;
  number?: string;
  name?: string;
  customerId?: string;
  customerName?: string;
  quoteNumber?: string;
  /** @format int32 */
  quoteVersion?: number;
  /** @format int32 */
  lineCount?: number;
  /** @format int64 */
  totalCents?: number;
  currency?: string;
  status?: string;
  /** @format date-time */
  createdAt?: string;
}

export interface PageResponseOrderSummaryResponse {
  content: OrderSummaryResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageResponseOpportunityResponse {
  content: OpportunityResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageResponseLead {
  content: Lead[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
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
  content: CustomerResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageResponseContactResponse {
  content: ContactResponse[];
  /** @format int32 */
  page: number;
  /** @format int32 */
  size: number;
  /** @format int64 */
  totalElements: number;
  /** @format int32 */
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CurrentUserResponse {
  id: string;
  username: string;
  email: string;
  role: RoleResponse;
  permissionCodes: string[];
}

export interface DeleteQuotesRequest {
  /**
   * @maxItems 100
   * @minItems 0
   */
  ids: string[];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
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

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customRequest?: HttpTransport;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'http://localhost:8080';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customRequest: HttpTransport = createAxiosTransport();

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
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
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
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

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
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
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customRequest(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
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
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags user-controller
     * @name FindByIdUser
     * @request GET:/api/users/{id}
     * @secure
     */
    findByIdUser: (id: string, params: RequestParams = {}) =>
      this.request<UserResponse, any>({
        path: `/api/users/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-controller
     * @name UpdateUsers
     * @request PUT:/api/users/{id}
     * @secure
     */
    updateUsers: (id: string, data: UpdateUserRequest, params: RequestParams = {}) =>
      this.request<UserResponse, any>({
        path: `/api/users/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-controller
     * @name DeleteUsers
     * @request DELETE:/api/users/{id}
     * @secure
     */
    deleteUsers: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/users/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags role-controller
     * @name FindByIdRole
     * @request GET:/api/roles/{id}
     * @secure
     */
    findByIdRole: (id: string, params: RequestParams = {}) =>
      this.request<RoleDetailResponse, any>({
        path: `/api/roles/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags role-controller
     * @name UpdateRoles
     * @request PUT:/api/roles/{id}
     * @secure
     */
    updateRoles: (id: string, data: UpdateRoleRequest, params: RequestParams = {}) =>
      this.request<RoleDetailResponse, any>({
        path: `/api/roles/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags role-controller
     * @name DeleteRoles
     * @request DELETE:/api/roles/{id}
     * @secure
     */
    deleteRoles: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/roles/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.update。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name UpdateQuotes
     * @request PUT:/api/quotes/{id}/versions/{versionId}
     * @secure
     */
    updateQuotes: (id: string, versionId: string, data: UpdateQuoteRequest, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes/${id}/versions/${versionId}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name FindByIdProduct
     * @request GET:/api/products/{id}
     * @secure
     */
    findByIdProduct: (id: string, params: RequestParams = {}) =>
      this.request<ProductResponse, any>({
        path: `/api/products/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name UpdateProducts
     * @request PUT:/api/products/{id}
     * @secure
     */
    updateProducts: (id: string, data: UpdateProductRequest, params: RequestParams = {}) =>
      this.request<ProductResponse, any>({
        path: `/api/products/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name DeleteProducts
     * @request DELETE:/api/products/{id}
     * @secure
     */
    deleteProducts: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/products/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags opportunity-controller
     * @name FindByIdOpportunity
     * @request GET:/api/opportunities/{id}
     * @secure
     */
    findByIdOpportunity: (id: string, params: RequestParams = {}) =>
      this.request<OpportunityResponse, any>({
        path: `/api/opportunities/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags opportunity-controller
     * @name UpdateOpportunities
     * @request PUT:/api/opportunities/{id}
     * @secure
     */
    updateOpportunities: (id: string, data: UpdateOpportunityRequest, params: RequestParams = {}) =>
      this.request<OpportunityResponse, any>({
        path: `/api/opportunities/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags opportunity-controller
     * @name DeleteOpportunities
     * @request DELETE:/api/opportunities/{id}
     * @secure
     */
    deleteOpportunities: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/opportunities/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name FindByIdLead
     * @request GET:/api/leads/{id}
     * @secure
     */
    findByIdLead: (id: string, params: RequestParams = {}) =>
      this.request<Lead, any>({
        path: `/api/leads/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name UpdateLeads
     * @request PUT:/api/leads/{id}
     * @secure
     */
    updateLeads: (id: string, data: Lead, params: RequestParams = {}) =>
      this.request<Lead, any>({
        path: `/api/leads/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name DeleteLeads
     * @request DELETE:/api/leads/{id}
     * @secure
     */
    deleteLeads: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/leads/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name FindByIdCustomer
     * @request GET:/api/customers/{id}
     * @secure
     */
    findByIdCustomer: (id: string, params: RequestParams = {}) =>
      this.request<CustomerResponse, any>({
        path: `/api/customers/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name UpdateCustomers
     * @request PUT:/api/customers/{id}
     * @secure
     */
    updateCustomers: (id: string, data: UpdateCustomerRequest, params: RequestParams = {}) =>
      this.request<CustomerResponse, any>({
        path: `/api/customers/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name DeleteCustomers
     * @request DELETE:/api/customers/{id}
     * @secure
     */
    deleteCustomers: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/customers/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name FindByIdContact
     * @request GET:/api/contacts/{id}
     * @secure
     */
    findByIdContact: (id: string, params: RequestParams = {}) =>
      this.request<ContactResponse, any>({
        path: `/api/contacts/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name UpdateContacts
     * @request PUT:/api/contacts/{id}
     * @secure
     */
    updateContacts: (id: string, data: UpdateContactRequest, params: RequestParams = {}) =>
      this.request<ContactResponse, any>({
        path: `/api/contacts/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name DeleteContacts
     * @request DELETE:/api/contacts/{id}
     * @secure
     */
    deleteContacts: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/contacts/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags entity-search-controller
     * @name SearchEntities
     * @request POST:/api/{entity}/search
     * @secure
     */
    searchEntities: (entity: string, data: EntitySearchRequest, params: RequestParams = {}) =>
      this.request<PageResponseObject, any>({
        path: `/api/${entity}/search`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-controller
     * @name FindAllUsers
     * @request GET:/api/users
     * @secure
     */
    findAllUsers: (
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
      params: RequestParams = {}
    ) =>
      this.request<PageResponseUserResponse, any>({
        path: `/api/users`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-controller
     * @name CreateUsers
     * @request POST:/api/users
     * @secure
     */
    createUsers: (data: RegisterRequest, params: RequestParams = {}) =>
      this.request<UserResponse, any>({
        path: `/api/users`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags role-controller
     * @name FindAllRoles
     * @request GET:/api/roles
     * @secure
     */
    findAllRoles: (
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
        keyword?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PageResponseRoleSummaryResponse, any>({
        path: `/api/roles`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags role-controller
     * @name CreateRoles
     * @request POST:/api/roles
     * @secure
     */
    createRoles: (data: CreateRoleRequest, params: RequestParams = {}) =>
      this.request<RoleDetailResponse, any>({
        path: `/api/roles`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.read。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name FindAllQuotes
     * @request GET:/api/quotes
     * @secure
     */
    findAllQuotes: (
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
        opportunityId?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PageResponseQuoteSummaryResponse, any>({
        path: `/api/quotes`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.create。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name CreateQuotes
     * @request POST:/api/quotes
     * @secure
     */
    createQuotes: (data: CreateQuoteRequest, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.delete。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name DeleteQuotesBatch
     * @request DELETE:/api/quotes
     * @secure
     */
    deleteQuotesBatch: (data: DeleteQuotesRequest, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/quotes`,
        method: 'DELETE',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.update。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name Send
     * @request POST:/api/quotes/{id}/versions/{versionId}/send
     * @secure
     */
    send: (id: string, versionId: string, data: QuoteActionRequest, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes/${id}/versions/${versionId}/send`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description JWT 登入；由業務層驗證指定審核人、版本、狀態與 revision，不要求報價 CRUD 權限。
     *
     * @tags quote-controller
     * @name Review
     * @request POST:/api/quotes/{id}/versions/{versionId}/review
     * @secure
     */
    review: (id: string, versionId: string, data: ReviewQuoteRequest, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes/${id}/versions/${versionId}/review`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.update。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name RequestApproval
     * @request POST:/api/quotes/{id}/versions/{versionId}/request-approval
     * @secure
     */
    requestApproval: (id: string, versionId: string, data: RequestQuoteApprovalRequest, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes/${id}/versions/${versionId}/request-approval`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.update。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name NewVersion
     * @request POST:/api/quotes/{id}/versions/{versionId}/new-version
     * @secure
     */
    newVersion: (id: string, versionId: string, data: QuoteActionRequest, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes/${id}/versions/${versionId}/new-version`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.update。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name Decision
     * @request POST:/api/quotes/{id}/versions/{versionId}/decision
     * @secure
     */
    decision: (id: string, versionId: string, data: DecideQuoteRequest, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes/${id}/versions/${versionId}/decision`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.update。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name ConvertToOrder
     * @request POST:/api/quotes/{id}/versions/{versionId}/convert-to-order
     * @secure
     */
    convertToOrder: (id: string, versionId: string, data: QuoteActionRequest, params: RequestParams = {}) =>
      this.request<ConvertQuoteToOrderResponse, any>({
        path: `/api/quotes/${id}/versions/${versionId}/convert-to-order`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name FindAllProducts
     * @request GET:/api/products
     * @secure
     */
    findAllProducts: (
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
      params: RequestParams = {}
    ) =>
      this.request<PageResponseProductResponse, any>({
        path: `/api/products`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags product-controller
     * @name CreateProducts
     * @request POST:/api/products
     * @secure
     */
    createProducts: (data: CreateProductRequest, params: RequestParams = {}) =>
      this.request<ProductResponse, any>({
        path: `/api/products`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags opportunity-controller
     * @name FindAllOpportunities
     * @request GET:/api/opportunities
     * @secure
     */
    findAllOpportunities: (
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
      params: RequestParams = {}
    ) =>
      this.request<PageResponseOpportunityResponse, any>({
        path: `/api/opportunities`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags opportunity-controller
     * @name CreateOpportunities
     * @request POST:/api/opportunities
     * @secure
     */
    createOpportunities: (data: CreateOpportunityRequest, params: RequestParams = {}) =>
      this.request<OpportunityResponse, any>({
        path: `/api/opportunities`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 需要 opportunities.update；不使用 revision，已結案不可重複結案。
     *
     * @tags opportunity-controller
     * @name CloseOpportunity
     * @summary 商機結案
     * @request POST:/api/opportunities/{id}/close
     * @secure
     */
    closeOpportunity: (id: string, data: CloseOpportunityRequest, params: RequestParams = {}) =>
      this.request<OpportunityResponse, any>({
        path: `/api/opportunities/${id}/close`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name FindAllLeads
     * @request GET:/api/leads
     * @secure
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
      params: RequestParams = {}
    ) =>
      this.request<PageResponseLead, any>({
        path: `/api/leads`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-controller
     * @name CreateLeads
     * @request POST:/api/leads
     * @secure
     */
    createLeads: (data: CreateLeadRequest, params: RequestParams = {}) =>
      this.request<CreateLeadResponse, any>({
        path: `/api/leads`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags lead-qualification-controller
     * @name QualifyLead
     * @request POST:/api/leads/{id}/qualification
     * @secure
     */
    qualifyLead: (id: string, data: QualifyLeadRequest, params: RequestParams = {}) =>
      this.request<Lead, any>({
        path: `/api/leads/${id}/qualification`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name FindAllCustomers
     * @request GET:/api/customers
     * @secure
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
      params: RequestParams = {}
    ) =>
      this.request<PageResponseCustomerResponse, any>({
        path: `/api/customers`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags customer-controller
     * @name CreateCustomers
     * @request POST:/api/customers
     * @secure
     */
    createCustomers: (data: CreateCustomerRequest, params: RequestParams = {}) =>
      this.request<CustomerResponse, any>({
        path: `/api/customers`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name FindAllContacts
     * @request GET:/api/contacts
     * @secure
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
      params: RequestParams = {}
    ) =>
      this.request<PageResponseContactResponse, any>({
        path: `/api/contacts`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags contact-controller
     * @name CreateContacts
     * @request POST:/api/contacts
     * @secure
     */
    createContacts: (data: CreateContactRequest, params: RequestParams = {}) =>
      this.request<ContactResponse, any>({
        path: `/api/contacts`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name ResetPassword
     * @request POST:/api/auth/reset-password
     */
    resetPassword: (data: ResetPasswordRequest, params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/api/auth/reset-password`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Register
     * @request POST:/api/auth/register
     */
    register: (data: RegisterRequest, params: RequestParams = {}) =>
      this.request<UserResponse, any>({
        path: `/api/auth/register`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Logout
     * @request POST:/api/auth/logout
     * @secure
     */
    logout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/logout`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Login
     * @request POST:/api/auth/login
     */
    login: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, any>({
        path: `/api/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name ForgotPassword
     * @request POST:/api/auth/forgot-password
     */
    forgotPassword: (data: ForgotPasswordRequest, params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/api/auth/forgot-password`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 需要 users.update；不使用 revision。停用會撤銷既有 Token，重新啟用後須重新登入。
     *
     * @tags user-controller
     * @name UpdateUserStatus
     * @summary 停用或重新啟用帳號
     * @request PATCH:/api/users/{id}/status
     * @secure
     */
    updateUserStatus: (id: string, data: UpdateUserStatusRequest, params: RequestParams = {}) =>
      this.request<UserResponse, any>({
        path: `/api/users/${id}/status`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags order-controller
     * @name UpdateOrderStatus
     * @request PATCH:/api/orders/{id}/status
     * @secure
     */
    updateOrderStatus: (id: string, data: UpdateOrderStatusRequest, params: RequestParams = {}) =>
      this.request<OrderResponse, any>({
        path: `/api/orders/${id}/status`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags role-controller
     * @name RoleOptions
     * @request GET:/api/roles/options
     * @secure
     */
    roleOptions: (
      query?: {
        keyword?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<RoleOptionResponse[], any>({
        path: `/api/roles/options`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.read。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name FindByIdQuote
     * @request GET:/api/quotes/{id}
     * @secure
     */
    findByIdQuote: (id: string, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quotes/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.delete。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name DeleteQuotes
     * @request DELETE:/api/quotes/{id}
     * @secure
     */
    deleteQuotes: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/quotes/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description 功能權限：quotes.update。仍驗證資料範圍、狀態、revision、自我審批限制與其他業務規則。
     *
     * @tags quote-controller
     * @name ReviewerOptions
     * @request GET:/api/quotes/{id}/reviewer-options
     * @secure
     */
    reviewerOptions: (
      id: string,
      query?: {
        keyword?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<ReviewerOption[], any>({
        path: `/api/quotes/${id}/reviewer-options`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags quote-review-controller
     * @name FindMyQuoteReviews
     * @request GET:/api/quote-reviews
     * @secure
     */
    findMyQuoteReviews: (
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
      params: RequestParams = {}
    ) =>
      this.request<PageResponseQuoteSummaryResponse, any>({
        path: `/api/quote-reviews`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags quote-review-controller
     * @name FindMyQuoteReview
     * @request GET:/api/quote-reviews/{quoteId}
     * @secure
     */
    findMyQuoteReview: (quoteId: string, params: RequestParams = {}) =>
      this.request<QuoteResponse, any>({
        path: `/api/quote-reviews/${quoteId}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags permission-controller
     * @name FindAllPermissions
     * @request GET:/api/permissions
     * @secure
     */
    findAllPermissions: (params: RequestParams = {}) =>
      this.request<PermissionResponse[], any>({
        path: `/api/permissions`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags order-controller
     * @name FindAllOrders
     * @request GET:/api/orders
     * @secure
     */
    findAllOrders: (
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
        keyword?: string;
        status?: 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled';
        customerId?: string;
        /** @format date */
        createdFrom?: string;
        /** @format date */
        createdTo?: string;
        /** @default "createdAt" */
        sort?: string;
        /** @default "desc" */
        direction?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PageResponseOrderSummaryResponse, any>({
        path: `/api/orders`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags order-controller
     * @name FindByIdOrder
     * @request GET:/api/orders/{id}
     * @secure
     */
    findByIdOrder: (id: string, params: RequestParams = {}) =>
      this.request<OrderResponse, any>({
        path: `/api/orders/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags entity-metadata-controller
     * @name FindFieldsByEntityName
     * @request GET:/api/entities/{entityName}/fields
     * @secure
     */
    findFieldsByEntityName: (entityName: string, params: RequestParams = {}) =>
      this.request<FieldMetadata[], any>({
        path: `/api/entities/${entityName}/fields`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name CurrentUser
     * @request GET:/api/auth/me
     * @secure
     */
    currentUser: (params: RequestParams = {}) =>
      this.request<CurrentUserResponse, any>({
        path: `/api/auth/me`,
        method: 'GET',
        secure: true,
        ...params,
      }),
  };
}
