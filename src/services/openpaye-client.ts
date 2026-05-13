import { Buffer } from "node:buffer";
import pino from "pino";
import { DEFAULT_BASE_URL, DEFAULT_HTTP_TIMEOUT_MS } from "../constants.js";
import { OpenPayeConfig, OpenPayeRequestInput } from "../types.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" }, pino.destination(2));

export class OpenPayeClient {
  private readonly config: OpenPayeConfig;
  private readonly authHeader: string;

  constructor(config?: Partial<OpenPayeConfig>) {
    const username = config?.username ?? process.env.OPENPAYE_API_USER ?? "";
    const password = config?.password ?? process.env.OPENPAYE_API_KEY ?? "";
    const baseUrlRaw = config?.baseUrl ?? process.env.OPENPAYE_BASE_URL;
    const baseUrl =
      typeof baseUrlRaw === "string" && baseUrlRaw.trim() !== "" ? baseUrlRaw.trim() : DEFAULT_BASE_URL;
    const timeoutMs = config?.timeoutMs ?? Number(process.env.OPENPAYE_HTTP_TIMEOUT_MS ?? DEFAULT_HTTP_TIMEOUT_MS);

    this.config = { username, password, baseUrl, timeoutMs };
    this.authHeader =
      username && password
        ? `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
        : "";
  }

  async request({ path, method, query, body }: OpenPayeRequestInput): Promise<unknown> {
    if (!this.config.username || !this.config.password) {
      throw new Error(
        "OpenPaye credentials are missing. Set OPENPAYE_API_USER and OPENPAYE_API_KEY in the MCP server environment (extension settings or host env).",
      );
    }

    const url = new URL(path, `${this.config.baseUrl}/`);

    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined) {
          url.searchParams.set(k, String(v));
        }
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      logger.debug({ method, path: url.pathname }, "OpenPaye API request");
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await response.text();
      const payload = text ? tryParseJson(text) : null;

      if (!response.ok) {
        throw new Error(`OpenPaye request failed (${response.status}): ${text || response.statusText}`);
      }

      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
