import { BlobReader, BlobWriter, ZipReader } from "./deps/zip.ts";

type float = number;
type bool = boolean;
type duration = string;

/**
 * Contains all data for the request. (Only headers and hostname are missing)
 */
export interface RequestInfo {
  data: FormData;
  path: string;
}

/**
 * Options for Chromium Module
 */
export interface ChromiumOptions {
  /**
   * Paper width, in inches (default 8.5)
   */
  paperWidth: float;
  /**
   * Paper height, in inches (default 11)
   */
  paperHeight: float;
  /**
   * Top margin, in inches (default 0.39)
   */
  marginTop: float;
  /**
   * Bottom margin, in inches (default 0.39)
   */
  marginBottom: float;
  /**
   * Left margin, in inches (default 0.39)
   */
  marginLeft: float;
  /**
   * Right margin, in inches (default 0.39)
   */
  marginRight: float;
  /**
   * Define whether to prefer page size as defined by CSS (default false)
   */
  preferCssPageSize: bool;
  /**
   * Print the background graphics (default false)
   */
  printBackground: bool;
  /**
   * Set the paper orientation to landscape (default false)
   */
  landscape: bool;
  /**
   * The scale of the page rendering (default 1.0)
   */
  scale: float;
  /**
   * Page ranges to print, e.g., '1-5, 8, 11-13' - empty means all pages
   */
  nativePageRanges: string;
  /**
   * Duration to wait when loading an HTML document before converting it to PDF
   */
  waitDelay: duration;
  /**
   * The JavaScript expression to wait before converting an HTML document to PDF until it returns true
   */
  waitForExpression: string;
  /**
   * Override the default User-Agent header
   */
  userAgent: string;
  /**
   * HTTP headers to send by Chromium while loading the HTML document (JSON format)
   */
  extraHttpHeaders: string;
  /**
   * Return a 409 Conflict response if there are exceptions in the Chromium console (default false)
   */
  failOnConsoleExceptions: bool;
  /**
   * The media type to emulate, either "screen" or "print" - empty means "print"
   */
  emulatedMediaType: string;
  /**
   * The PDF format of the resulting PDF
   */
  pdfFormat: string;
}

/**
 * Options for LibreOffice Module
 */
export interface LibreOfficeOptions {
  /**
   * Set the paper orientation to landscape (default false)
   */
  landscape: bool;
  /**
   * Page ranges to print, e.g., '1-4' - empty means all pages
   */
  nativePageRanges: string;
  /**
   * Use unoconv to convert the resulting PDF to the 'PDF/A-1a' format
   */
  nativePdfA1aFormat: bool;
  /**
   * The PDF format of the resulting PDF
   */
  pdfFormat: string;
  /**
   * Merge all PDF files into an individual PDF file
   */
  merge: bool;
}

/**
 * Options for merge Endpoint
 */
export interface mergeOptions {
  /**
   * The PDF format of the resulting PDF
   */
  pdfFormat: string;
}

/**
 * Options to configure Webhook
 */
export interface WebHookOptions {
  /**
   * the callback to use
   */
  url: string;
  /**
   * the callback to use if error
   */
  errorUrl: string;
  /**
   * the HTTP method to use
   */
  method?: "POST" | "PATCH" | "PUT";
  /**
   *  the HTTP method to use if error
   */
  errorMethod?: "POST" | "PATCH" | "PUT";
  /**
   *  the extra HTTP headers to send to both URLs (JSON format).
   */
  extraHttpHeaders?: string;
}

/**
 * Request headers
 */
export interface headers {
  /**
   * The trace, or request ID, identifies a request in the logs.

  By default, the API generates a UUID trace for each request. However, you may also specify the trace per request, thanks to the Gotenberg-Trace header.
 */
  trace: string;

  /**
   * By default, the API generates a UUID filename. However, you may also specify the filename per request, thanks to the Gotenberg-Output-Filename header.
   */
  outputFilename: string;
}

/**
 * A simple File object
 */
export type Asset = {
  filename: string;
  content: Blob;
};

function appendFilesToFormdata(data: FormData, files: Asset[]) {
  files.forEach((f) => {
    data.append("files", f.content, f.filename);
  });
}

function appendToFormData(
  f: FormData,
  obj: Record<string, bool | duration | number | string>,
) {
  Object.entries(obj).forEach(([key, value]) => {
    f.append(key, value.toString());
  });
}

/**
 * Creates a RequestInfo for converting a webpage (url) to a pdf.
 *
 * @param url url that should be loaded by gotenberg
 * @param options layout and design options
 * @param files additional filles allways loaded into the page
 * @returns RequestInfo to be passed to an executor
 */
export function url(
  url: string,
  options: Partial<ChromiumOptions> = {},
  files: Asset[] = [],
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  data.append("url", url);
  appendFilesToFormdata(data, files);

  return { path: "/forms/chromium/convert/url", data };
}

/**
 * Creates a RequestInfo for converting a html file to a pdf
 *
 * @param indexHTML index.html file that should be rendered to pdf
 * @param files Additional Assets that are refrenced by indexHTML
 * @param options layout and design options
 * @returns ReqiestInfo to be passed to an executor
 */
export function html(
  indexHTML: Asset,
  files: Asset[] = [],
  options: Partial<ChromiumOptions> = {},
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);
  if (!indexHTML.filename.endsWith("index.html")) {
    indexHTML.filename = "index.html";
  }

  appendFilesToFormdata(data, [indexHTML]);

  return { path: "/forms/chromium/convert/html", data };
}

/**
 * Creates a RequestInfo for converting a html file that can import markdown to a pdf
 *
 * @param indexHTML index.html file that should be rendered to pdf
 * @param files Additional Assets that are refrenced by indexHTML (including markdownfile)
 * @param options layout and design options
 * @returns RequestInfo to be passed to an executor
 */
export function markdown(
  indexHTML: Asset,
  files: Asset[] = [],
  options: Partial<ChromiumOptions> = {},
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);
  if (!indexHTML.filename.endsWith("index.html")) {
    indexHTML.filename = "index.html";
  }

  appendFilesToFormdata(data, [indexHTML]);

  return { path: "/forms/chromium/convert/markdown", data };
}

/**
 * Creates a RequestInfo for converting (near) all office files to a pdf
 *
 * @param files Files to be converted
 * @param options layout and design options
 * @returns RequestInfo to be passed to an executor
 */
export function office(
  files: Asset[] = [],
  options: Partial<LibreOfficeOptions> = {},
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);

  return { path: "/forms/libreoffice/convert", data };
}

/**
 * Creates a RequestInfo for merging multiple pdf files
 *
 * @param files PDF files to be merged together
 * @param options Merge Options
 * @returns RequestInfo to be passed to an executor
 */
export function merge(
  files: Asset[],
  options: Partial<mergeOptions> = {},
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);

  return { path: "/forms/pdfengines/merge", data };
}

/**
 * Creates a RequestInfo for converting pdf files to different pdf-formats
 *
 * @param files PDF files to be converted
 * @param options Convert Options
 * @returns RequestInfo to be passed to an executor
 */
export function convert(
  files: Asset[],
  options: Partial<mergeOptions> = {},
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);

  return { path: "/forms/pdfengines/convert", data };
}

/**
 * Simple executor with no webhook
 *
 * @param url Hostname / Origin of gotenberg
 * @param headers Options for all Request created with this executor
 * @returns Functions that gets RequestInfo and returns a Promise of a Request
 */
export function executor(url: string, headers: Partial<headers> = {}) {
  const extraHeaders: Record<string, string> = {};

  if (headers.outputFilename) {
    extraHeaders["Gotenberg-Output-Filename"] = headers.outputFilename;
  }

  if (headers.trace) extraHeaders["Gotenberg-Trace"] = headers.trace;

  return (info: RequestInfo) => {
    const reqUrl = new URL(info.path, url);

    return fetch(reqUrl, {
      body: info.data,
      headers: {
        // "Content-Type": "multipart/form-data",
        ...extraHeaders,
      },
      method: "POST",
    });
  };
}

/**
 * Executor with webhook
 *
 * @param url Hostname / Origin of gotenberg
 * @param options Options to configure webhooks
 * @param headers Options for all Request created with this executor
 * @returns Functions that gets RequestInfo and returns a Promise of a Request
 */
export function webhookExecutor(
  url: string,
  options: WebHookOptions,
  headers: Partial<headers> = {},
) {
  const extraHeaders: Record<string, string> = {};

  if (options.errorMethod) {
    extraHeaders["Gotenberg-Webhook-Error-Method"] = options.errorMethod;
  }

  if (options.errorUrl) {
    extraHeaders["Gotenberg-Webhook-Error-Url"] = options.errorUrl;
  }

  if (options.extraHttpHeaders) {
    extraHeaders["Gotenberg-Webhook-Extra-Http-Headers"] =
      options.extraHttpHeaders;
  }

  if (options.method) {
    extraHeaders["Gotenberg-Webhook-Method"] = options.method;
  }

  if (options.url) extraHeaders["Gotenberg-Webhook-Url"] = options.url;

  if (headers.outputFilename) {
    extraHeaders["Gotenberg-Output-Filename"] = headers.outputFilename;
  }

  if (headers.trace) extraHeaders["Gotenberg-Trace"] = headers.trace;

  return (info: RequestInfo) => {
    const reqUrl = new URL(info.path, url);

    return fetch(reqUrl, {
      body: info.data,
      headers: {
        // "Content-Type": "multipart/form-data",
        ...extraHeaders,
      },
      method: "POST",
    });
  };
}

/**
 * Helper to read a file (async)
 *
 * @param file Path to file
 * @param filename filename passed to gotenberg
 * @returns Asset that can be used in RequestInfo creatoren
 */
export async function readFile(file: string, filename = ""): Promise<Asset> {
  if (!filename) filename = file;

  return {
    filename,
    content: new Blob([await Deno.readFile(file)]),
  };
}

/**
 * Response handler to handle responses that are a zip file
 *
 * @param r Response or Promise of Response to the Request to the gotenberg API
 * @returns All files in the zip Archive are extracted to the Asset data-type
 */
export async function handleZipResponse(
  r: Response | Promise<Response>,
): Promise<Asset[]> {
  const zipFile = await handleResponse(r);

  const reader = new ZipReader(new BlobReader(zipFile.content));

  const files = await reader.getEntries();

  const ret: Asset[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    ret.push({
      filename: file.filename,
      content: await file.getData!(new BlobWriter()),
    });
  }

  return ret;
}

/**
 * Response handler to handle responses that are a pdf file
 *
 * **_NOTE: if used for a response that returns a zip file you might encounter errors in your code as this function assumes you know that you don't get a zip file_**
 *
 * @param r Response or Promise of Response to the Request to the gotenberg API
 * @returns Asset file
 */
export async function handleResponse(
  r: Response | Promise<Response>,
): Promise<Asset> {
  const res = await r;

  if (res.status !== 200 || !res.ok) {
    const err = await res.text().catch(() => "No Error message!");

    throw new Error(
      "API responded with a status code other than 200. And error message: " +
        err,
    );
  }

  const blob = await res.blob();

  return {
    filename: "output.pdf",
    content: blob,
  };
}
