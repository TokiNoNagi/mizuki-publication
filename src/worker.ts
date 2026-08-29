const JSON_HEADERS = {
	"content-type": "application/json; charset=utf-8",
	"cache-control": "no-store",
} as const;

const STATIC_API_ASSETS = new Set([
	"/api/allPostMeta.json",
	"/api/calendar-data.json",
]);

function json(
	body: unknown,
	status = 200,
	extraHeaders?: HeadersInit,
): Response {
	const headers = new Headers(JSON_HEADERS);
	if (extraHeaders) {
		for (const [name, value] of new Headers(extraHeaders)) {
			headers.set(name, value);
		}
	}

	return new Response(JSON.stringify(body), { status, headers });
}

type VersionEnvironment = Pick<Env, "CF_VERSION_METADATA">;

function deployedVersion(env: VersionEnvironment): string {
	return env.CF_VERSION_METADATA.tag || env.CF_VERSION_METADATA.id;
}

export function handleApiRequest(
	request: Request,
	env: VersionEnvironment,
): Response {
	const { pathname } = new URL(request.url);
	const knownRoute = pathname === "/api/health" || pathname === "/api/version";

	if (knownRoute && request.method !== "GET") {
		return json({ error: "method_not_allowed" }, 405, { allow: "GET" });
	}

	if (request.method === "GET" && pathname === "/api/health") {
		return json({
			ok: true,
			service: "mizuki-publication",
			version: deployedVersion(env),
			timestamp: new Date().toISOString(),
		});
	}

	if (request.method === "GET" && pathname === "/api/version") {
		return json({
			version: deployedVersion(env),
			environment: "production",
		});
	}

	return json({ error: "not_found" }, 404);
}

export default {
	fetch(request, env) {
		const pathname = new URL(request.url).pathname;
		if (STATIC_API_ASSETS.has(pathname)) {
			return env.ASSETS.fetch(request);
		}

		if (pathname === "/api" || pathname.startsWith("/api/")) {
			return handleApiRequest(request, env);
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
