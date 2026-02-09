import * as y from "yup";
import type { Schema, InferType } from "yup";

export const SerializedApiClientErrorSchema = y.object({
  code: y.string().required(),
  ts: y.number().required(),
  status: y.number().required().integer().positive(),
  msg: y.string().required(),
  loc: y.string().optional(),
  detail: y.string().optional(),
  data: y.object().optional(),
});

export declare type SerializedApiClientError = InferType<typeof SerializedApiClientErrorSchema>;

export class ApiClientError extends Error {
  declare location?: string;
  declare detail?: string;
  declare data?: object;
  timestamp: number;

  isError = (e: ApiClientError) => this.code === e.code;
  isSerialized = (e: SerializedApiClientError) => this.code === e.code;
  serialize(): SerializedApiClientError {
    return {
      code: this.code,
      msg: this.message,
      status: this.httpStatus,
      loc: this.location,
      detail: this.detail,
      data: this.data,
      ts: this.timestamp,
    };
  }

  constructor(
    readonly code: string,
    readonly httpStatus: number,
    readonly message: string,
    optionalArgs?: {
      readonly detail?: string;
      readonly location?: string;
      readonly data?: object;
      readonly timestamp?: number;
    },
  ) {
    super(message);
    this.code = code;
    this.name = "ApiClientError";
    this.httpStatus = httpStatus;
    this.message = message;
    this.detail = optionalArgs?.detail;
    this.location = optionalArgs?.location;
    this.data = optionalArgs?.data;
    this.timestamp = optionalArgs?.timestamp ?? Math.floor(Date.now() / 1000);
  }

  static fromSerialized(e: SerializedApiClientError) {
    return new ApiClientError(e.code, e.status, e.msg, {
      detail: e.detail,
      location: e.loc,
      data: e.data,
      timestamp: e.ts,
    });
  }
}

// ======================================== Api Client ========================================

declare type RequestMethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Define an object with different properties
declare type ResponseVariants<T extends Schema> = {
  OK: boolean;
  CONTRACT: InferType<T>;
  RESPONSE: Response;
  DATA: any;
  TEXT: string;
  ERR: ApiClientError | undefined;
};

type ApiResponseType<J extends Schema, T extends keyof ResponseVariants<J>> = ResponseVariants<J>[T];

// Used to extract route params from an endpoint
type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<Rest>
  : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type RequestQuery = { [k: string]: number | boolean | string | null | undefined };

interface ApiClientArgs<
  Endpoint extends string,
  ResponseContract extends Schema,
  RequestContract extends Schema,
  ResponseType extends keyof ResponseVariants<ResponseContract>,
> {
  // Main HTTP information
  apiBase?: string;
  requestMethod?: RequestMethodType;
  endpoint?: Endpoint; // Remapped to endpointStatic in the class

  // Contracts & Responses
  responseType?: ResponseType;
  requestContract?: RequestContract;
  responseContract?: ResponseContract;
  requestContractStrict?: boolean;
  responseContractStrict?: boolean;

  // Error Handling

  // Additional Configurations
  requestQuery?: { [k: string]: string };
  requestHeaders?: HeadersInit;
  requestBody?: BodyInit | null;
  requestParams?: ExtractParams<Endpoint>;
  authMethod?: () => { [k: string]: string } | Promise<{ [k: string]: string }>;
}

type ApiClientOverloadOptions<
  Endpoint extends string,
  ResponseContract extends Schema,
  RequestContract extends Schema,
  ResponseType extends keyof ResponseVariants<ResponseContract> = "RESPONSE",
> = Endpoint | ApiClientArgs<Endpoint, ResponseContract, RequestContract, ResponseType>;

class ApiClient<
  Endpoint extends string,
  ResponseContract extends Schema,
  RequestContract extends Schema,
  ResponseType extends keyof ResponseVariants<ResponseContract> = "RESPONSE",
> {
  // Main HTTP information
  apiBase?: string;
  requestMethod: RequestMethodType;
  endpointStatic: Endpoint; // Base Endpoint

  // Contracts & Responses
  responseType: ResponseType;
  requestContract?: RequestContract;
  responseContract?: ResponseContract;
  requestContractStrict?: boolean;
  responseContractStrict?: boolean;

  // Error Handling

  // Additional Configurations
  requestQuery?: { [k: string]: string };
  requestHeaders: HeadersInit;
  requestBody?: BodyInit | null;
  requestParams?: ExtractParams<Endpoint>;
  authMethod?: () => { [k: string]: string } | Promise<{ [k: string]: string }>;

  constructor(options?: ApiClientOverloadOptions<Endpoint, ResponseContract, RequestContract, ResponseType>) {
    if (typeof options === "string") {
      this.endpointStatic = options;
      this.requestMethod = "GET";
      this.requestHeaders = {};
      this.responseType = "RESPONSE" as ResponseType;
      return;
    }
    // Main HTTP information
    this.apiBase = options?.apiBase;
    this.requestMethod = options?.requestMethod ?? "GET";
    this.endpointStatic = options?.endpoint ?? ("" as Endpoint);

    // Contracts & Responses
    this.responseType = (options?.responseType ?? "RESPONSE") as ResponseType;
    this.requestContract = options?.requestContract;
    this.requestContractStrict = options?.requestContractStrict;
    this.responseContract = options?.responseContract;
    this.responseContractStrict = options?.responseContractStrict;

    // Error Handling

    // Additional Configurations
    this.requestHeaders = options?.requestHeaders ?? {};
    this.requestBody = options?.requestBody;
    this.requestParams = options?.requestParams;
    this.authMethod = options?.authMethod;
    this.requestQuery = options?.requestQuery;
  }

  config(): ApiClientArgs<Endpoint, ResponseContract, RequestContract, ResponseType> {
    // Main HTTP information
    return {
      apiBase: this.apiBase,
      requestMethod: this.requestMethod,
      endpoint: this.endpointStatic,

      // Contracts & Responses
      responseType: this.responseType,
      requestContract: this.requestContract,
      responseContract: this.responseContract,
      requestContractStrict: this.requestContractStrict,
      responseContractStrict: this.responseContractStrict,

      // Additional Configurations
      requestHeaders: this.requestHeaders,
      requestQuery: this.requestQuery,
      requestBody: this.requestBody,
      requestParams: this.requestParams,
      authMethod: this.authMethod,
    };
  }

  // Method mutations

  /**
   * @returns A new API client with the specified request method
   */
  private _methodChange = (method: RequestMethodType) => new ApiClient({ ...this.config(), requestMethod: method });

  get = () => this._methodChange("GET");
  post = () => this._methodChange("POST");
  put = () => this._methodChange("PUT");
  patch = () => this._methodChange("PATCH");
  delete = () => this._methodChange("DELETE");

  // Contracts

  /** Require a specific JSON payload for the request
   * @param requestContract A YUP object schema for validating the data
   * @param enforce Whehter or not to forcibly check the data or just type check it
   * @returns A new APi Client that validates a JSON body before making a request
   */
  reqContract = <RequestContract extends Schema>(requestContract: RequestContract, strict: boolean = true) =>
    new ApiClient({ ...this.config(), requestContract, requestContractStrict: strict });

  /** Require a specific JSON payload for the response
   * @param requestContract A YUP object schema for validating the data
   * @param strict Whether or not to strip unknown data
   * @returns A new APi Client that validates a JSON body after making a request
   */
  resContract<ResponseContract extends Schema>(responseContract: ResponseContract, strict: boolean = true) {
    return new ApiClient<Endpoint, ResponseContract, RequestContract, "CONTRACT">({
      ...this.config(),
      responseContract,
      responseContractStrict: strict,
      responseType: "CONTRACT",
    });
  }

  // Response Mutations

  /** Set the response type to be true or false
   * @returns A new APi Client whose execution will return a boolean
   */
  ok() {
    return new ApiClient<Endpoint, ResponseContract, RequestContract, "OK">({
      ...this.config(),
      responseType: "OK",
    });
  }

  /** Set the response type to be the response object
   * @returns A new APi Client whose execution will return a `Response` object
   */
  raw() {
    return new ApiClient<Endpoint, ResponseContract, RequestContract, "RESPONSE">({
      ...this.config(),
      responseType: "RESPONSE",
    });
  }

  /** Set the response type to be an "any" type, this will call the `.json()` method on the Response object
   * @returns A new APi Client whose execution will return an any type from the decoded JSON
   */
  any() {
    return new ApiClient<Endpoint, ResponseContract, RequestContract, "DATA">({
      ...this.config(),
      responseType: "DATA",
    });
  }
  /** Set the response type to be a string promise, this will call the `.text()` method on the Response object
   * @returns A new APi Client whose execution will return a string from the decoded string
   */
  text() {
    return new ApiClient<Endpoint, ResponseContract, RequestContract, "TEXT">({
      ...this.config(),
      responseType: "TEXT",
    });
  }

  /** Set the response type to be an error promise, this will return undefined if there is not an error, otherwise the error object
   * @returns A new APi Client whose execution will return a undefined or an ApiClientError
   */
  err() {
    return new ApiClient<Endpoint, ResponseContract, RequestContract, "ERR">({
      ...this.config(),
      responseType: "ERR",
    });
  }

  // Request Mutations

  /**
   * Set the content type to `application/json` and attach the stringified JSON object
   * @param data Either the corresponding type of the schema or any object if no request contract is being used
   * @returns A new APi Client
   */
  json(data?: InferType<RequestContract>) {
    if (!data) return new ApiClient({ ...this.config() });
    if (!!this.requestContract)
      this.requestContract.validateSync(data, { stripUnknown: this.requestContractStrict, abortEarly: false });
    const requestHeaders = { ...this.requestHeaders, "Content-Type": "application/json" };
    const config = { ...this.config(), requestHeaders, requestBody: JSON.stringify(data) };
    return new ApiClient(config);
  }
  /**
   * Set the route parameters to replace sections of the endpoint
   * @example
   * const getUser = "/api/v2/:myApp/users/:userId";
   * const getSpecificUser = getUser.params({myApp: "app1", userId: "myUser"});
   * await getSpecificUser.exec(); // Will make the request to /api/v2/app1/users/myUser
   * @param params The route parameters that can be replaced
   * @returns A new APi Client
   */
  params(params?: ExtractParams<Endpoint>) {
    if (!params) return new ApiClient({ ...this.config() });
    for (const p in params) {
      const paramName = `:${p}`;
      if (!this.endpointStatic.includes(paramName)) throw new Error(`Param '${paramName}' in ${this.endpointStatic}`);
    }
    return new ApiClient({ ...this.config(), requestParams: params });
  }

  /** Set a new endpoint for the request and reset the request route parameters
   * @param endpoint New endpoint for the request
   * @returns A new APi Client
   */
  endpoint = <Endpoint extends string>(endpoint: Endpoint) =>
    new ApiClient({ ...this.config(), endpoint, requestParams: {} as ExtractParams<Endpoint> });

  /** Set a new base for the request
   * @param endpoint New endpoint for the request
   * @returns A new APi Client
   */
  base = (apiBase: string) => new ApiClient({ ...this.config(), apiBase });

  /**
   * Additional headers to be passed to the request
   *
   * NOTE: This will not remove headers that may already be present
   * in the API client but it will overwrite identically named ones.
   * @param requestHeaders Headers to be included in the request
   * @returns A new APi Client
   */
  headers = (requestHeaders: HeadersInit) =>
    new ApiClient({ ...this.config(), requestHeaders: { ...this.config().requestHeaders, ...requestHeaders } });

  /**
   * Query Parameters that should be added to the request
   * @param query
   * @returns A new APi Client with the query parameters
   */
  query(query?: RequestQuery) {
    if (!query) return new ApiClient({ ...this.config() });
    const requestQuery: { [k: string]: string } = {};
    for (const k in query) if (query[k] !== null && query[k] !== undefined) requestQuery[k] = `${query[k]}`;
    return new ApiClient({
      ...this.config(),
      requestQuery: { ...this.config().requestQuery, ...requestQuery },
    });
  }

  /**
   * Set the Auth method for requests
   * @param authMethod A function that will return a promise of headers that should be added to the request
   * @returns A new APi Client with
   */
  auth(authMethod: () => { [k: string]: string } | Promise<{ [k: string]: string }>) {
    return new ApiClient({ ...this.config(), authMethod });
  }

  // Shorthand Aliases

  cReq = this.reqContract;
  cRes = this.resContract;

  // Executions

  /**
   *
   * @returns A function that will require the JSON function but will then be immediately executed
   * @see {@link json}
   */
  jsonExec(): (data?: InferType<RequestContract>) => ReturnType<typeof this.exec> {
    return (data?: InferType<RequestContract>) => this.json(data).exec();
  }

  /**
   *
   * @returns A function that will require the params function but will then be immediately executed
   * @see {@link params}
   */
  paramsExec(): (params?: ExtractParams<Endpoint>) => ReturnType<typeof this.exec> {
    return (params?: ExtractParams<Endpoint>) => this.params(params).exec();
  }

  /**
   *
   * @returns A function that will require the query function but will then be immediately executed
   * @see {@link query}
   */
  queryExec(): (query?: RequestQuery) => ReturnType<typeof this.exec> {
    return (query?: RequestQuery) => this.query(query).exec();
  }

  /**
   *
   * @returns Function that will set the requestParams and json data and then immediately execute
   * @see {@link params} and {@link json} and {@link query}
   */
  api(): (apiOptions?: {
    params?: ExtractParams<Endpoint>;
    data?: InferType<RequestContract>;
    query?: RequestQuery;
  }) => ReturnType<typeof this.exec> {
    return (apiOptions?: {
      params?: ExtractParams<Endpoint>;
      data?: InferType<RequestContract>;
      query?: RequestQuery;
    }) => this.params(apiOptions?.params).json(apiOptions?.data).query(apiOptions?.query).exec();
  }

  private _prepareRequestUrl() {
    let requestUrl = `${this.apiBase ?? ""}${this.endpointStatic}`;
    for (const p in this.requestParams) {
      const paramName = `:${p}`;
      requestUrl = requestUrl.replaceAll(paramName, this.requestParams[p as keyof typeof this.params]);
    }
    if (!!this.requestQuery) requestUrl = `${requestUrl}?${new URLSearchParams(this.requestQuery).toString()}`;
    return requestUrl;
  }

  /**
   * Execute the API request and return the requested response
   * @returns A designated response from an API request. This is customized by chaining various options
   */
  async exec(): Promise<ApiResponseType<ResponseContract, ResponseType>> {
    const requestUrl = this._prepareRequestUrl();

    // Ensure authHeader is resolved before usage
    const authHeader = this.authMethod ? await this.authMethod() : {};
    const headers = { ...this.requestHeaders, ...authHeader } as HeadersInit;
    const res = await fetch(requestUrl, { method: this.requestMethod, headers, body: this.requestBody });

    if (this.responseType === "OK") return res.ok as ApiResponseType<ResponseContract, ResponseType>;
    if (this.responseType === "RESPONSE") return res as ApiResponseType<ResponseContract, ResponseType>;
    if (this.responseType === "TEXT") return res.text() as Promise<ApiResponseType<ResponseContract, ResponseType>>;
    if (this.responseType === "ERR" && res.ok) return undefined as ApiResponseType<ResponseContract, ResponseType>;
    if (this.responseType === "ERR")
      return this.handleErrorResponse(requestUrl, res).catch((e: ApiClientError) => e) as ApiResponseType<
        ResponseContract,
        ResponseType
      >;
    if (!res.ok) await this.handleErrorResponse(requestUrl, res);
    const data = await res.json();
    if (this.responseType === "DATA") return data as ApiResponseType<ResponseContract, ResponseType>;
    if (!this.responseContract) return data as ApiResponseType<ResponseContract, ResponseType>;
    const validationOptions = { stripUnknown: this.responseContractStrict, abortEarly: false };
    return this.responseContract.validate(data, validationOptions) as ApiResponseType<ResponseContract, ResponseType>;
  }

  // Error Handling

  /**
   * Determines what type of APIClient Error to throw. If possible, it will load an api client error from the server
   * @param location Location of the request
   * @param res Response object
   */
  private async handleErrorResponse(location: string, res: Response) {
    const { status, statusText } = res;
    const parsedJson: object | undefined = await res.json().catch(() => undefined);
    const parsedData = parsedJson ?? (await res.text().catch(() => undefined));
    if (!parsedData) throw new ApiClientError(`HTTP:${status}`, status, statusText, { location });
    const detail = typeof parsedData === "string" ? parsedData : undefined;
    const data = !!parsedData && typeof parsedData !== "string" ? parsedData : undefined;
    if (!!detail) throw new ApiClientError(`HTTP:${status}`, status, statusText, { data, detail, location });
    const casted = await SerializedApiClientErrorSchema.validate(data).catch(() => undefined);
    if (!casted) throw new ApiClientError(`HTTP:${status}`, status, statusText, { data, detail, location });
    throw ApiClientError.fromSerialized(casted);
  }
}

export const apiClient = <
  Endpoint extends string,
  ResponseContract extends Schema,
  RequestContract extends Schema,
  ResponseType extends keyof ResponseVariants<ResponseContract> = "RESPONSE",
>(
  options?: ApiClientOverloadOptions<Endpoint, ResponseContract, RequestContract, ResponseType>,
) => new ApiClient(options);
