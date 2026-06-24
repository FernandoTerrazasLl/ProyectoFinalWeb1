import { Router } from "@shared/lib/router/Router";
import { env } from "@shared/config/env";

export const routerInstance = new Router(env.basePath);
