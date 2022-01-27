type float = number;
type bool = boolean;
type duration = string;

interface RequestInfo {
  data: FormData;
  path: string;
}

interface ChromiumOptions {
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

interface LibreOfficeOptions {
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

interface mergeOptions {
  /**
   * The PDF format of the resulting PDF
   */
  pdfFormat: string;
}

interface WebHookOptions {
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

interface headers {
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

type Asset = {
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
  obj: Record<string, bool | duration | number | string>
) {
  Object.entries(obj).forEach(([key, value]) => {
    f.append(key, value.toString());
  });
}

export function chromiumUrl(
  url: string,
  options: Partial<ChromiumOptions>,
  files: Asset[]
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  data.append("url", url);
  appendFilesToFormdata(data, files);

  return { path: "/forms/chromium/convert/url", data };
}

export function chromiumHTML(
  indexHTML: Asset,
  files: Asset[] = [],
  options: Partial<ChromiumOptions> = {}
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);
  if (!indexHTML.filename.endsWith("index.html"))
    indexHTML.filename = "index.html";

  appendFilesToFormdata(data, [indexHTML]);

  return { path: "/forms/chromium/convert/html", data };
}

export function chromiumMarkdown(
  indexHTML: Asset,
  files: Asset[] = [],
  options: Partial<ChromiumOptions> = {}
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);
  if (!indexHTML.filename.endsWith("index.html"))
    indexHTML.filename = "index.html";

  appendFilesToFormdata(data, [indexHTML]);

  return { path: "/forms/chromium/convert/markdown", data };
}

export function office(
  files: Asset[] = [],
  options: Partial<LibreOfficeOptions> = {}
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);

  return { path: "/forms/libreoffice/convert", data };
}

export function merge(
  files: Asset[],
  options: Partial<mergeOptions> = {}
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);

  return { path: "/forms/pdfengines/merge", data };
}

export function convert(
  files: Asset[],
  options: Partial<mergeOptions> = {}
): RequestInfo {
  const data = new FormData();

  appendToFormData(data, options);

  appendFilesToFormdata(data, files);

  return { path: "/forms/pdfengines/convert", data };
}

export function executor(url: string, headers: Partial<headers> = {}) {
  return (info: RequestInfo) => {
    const reqUrl = new URL(info.path, url);

    const extraHeaders: Record<string, string> = {};

    if (headers.outputFilename)
      extraHeaders["Gotenberg-Output-Filename"] = headers.outputFilename;

    if (headers.trace) extraHeaders["Gotenberg-Trace"] = headers.trace;

    return fetch(reqUrl, {
      body: info.data,
      headers: {
        "Content-Type": "multipart/form-data",
        ...extraHeaders,
      },
      method: "POST",
    });
  };
}

export function webhookExecutor(
  url: string,
  options: WebHookOptions,
  headers: Partial<headers> = {}
) {
  return (info: RequestInfo) => {
    const reqUrl = new URL(info.path, url);

    const extraHeaders: Record<string, string> = {};

    if (options.errorMethod)
      extraHeaders["Gotenberg-Webhook-Error-Method"] = options.errorMethod;

    if (options.errorUrl)
      extraHeaders["Gotenberg-Webhook-Error-Url"] = options.errorUrl;

    if (options.extraHttpHeaders)
      extraHeaders["Gotenberg-Webhook-Extra-Http-Headers"] =
        options.extraHttpHeaders;

    if (options.method)
      extraHeaders["Gotenberg-Webhook-Method"] = options.method;

    if (options.url) extraHeaders["Gotenberg-Webhook-Url"] = options.url;

    if (headers.outputFilename)
      extraHeaders["Gotenberg-Output-Filename"] = headers.outputFilename;

    if (headers.trace) extraHeaders["Gotenberg-Trace"] = headers.trace;

    return fetch(reqUrl, {
      body: info.data,
      headers: {
        "Content-Type": "multipart/form-data",
        ...extraHeaders,
      },
      method: "POST",
    });
  };
}

export async function readFile(file: string, filename = ''): Promise<Asset> {
  if(!filename) filename = file

  return {
    filename,
    content: new Blob([await Deno.readFile(file)])
  }
}




// export function handleZipResponse(r: Response): any[] {
//   return [];
// }

// executor("http://gotenberg:3000")(
//   office([] as any[], {
//     landscape: true,
//   })
// );