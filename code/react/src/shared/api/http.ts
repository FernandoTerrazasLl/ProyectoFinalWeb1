import { env } from "@shared/config/env";
import { HttpClient } from "@shared/api/HttpClient";

export const http = new HttpClient(env.apiBaseUrl);
