const baseUrl = new URL(
	process.env.WORKER_BASE_URL || "https://tokinonagi.dpdns.org/",
);

async function request(path, expectedStatus) {
	const url = new URL(path, baseUrl);
	const response = await fetch(url, { redirect: "error" });
	if (response.status !== expectedStatus) {
		throw new Error(`${url} returned ${response.status}, expected ${expectedStatus}`);
	}
	return response;
}

const home = await request("/", 200);
if (!home.headers.get("content-type")?.includes("text/html")) {
	throw new Error("The production root did not return HTML");
}

for (const path of ["/api/health", "/api/version"]) {
	const response = await request(path, 200);
	if (!response.headers.get("content-type")?.includes("application/json")) {
		throw new Error(`${path} did not return JSON`);
	}
	const body = await response.json();
	if (typeof body.version !== "string" || body.version.length === 0) {
		throw new Error(`${path} did not return a deployment version`);
	}
}

const missing = await request("/api/not-exist", 404);
if ((await missing.json()).error !== "not_found") {
	throw new Error("Unknown API route did not return the expected JSON error");
}

console.log(`Worker deployment verified at ${baseUrl.origin}`);
