import assert from "node:assert/strict";
import test from "node:test";

import { handleApiRequest } from "../src/worker.ts";

const env = {
	CF_VERSION_METADATA: {
		id: "test-version-id",
		tag: "test-commit-sha",
		timestamp: "2026-08-29T00:00:00.000Z",
	},
} satisfies Pick<Env, "CF_VERSION_METADATA">;

async function jsonRequest(path: string, method = "GET") {
	const response = handleApiRequest(
		new Request(`https://example.com${path}`, { method }),
		env,
	);
	assert.match(
		response.headers.get("content-type") ?? "",
		/^application\/json/,
	);
	return {
		response,
		body: (await response.json()) as Record<string, unknown>,
	};
}

test("GET /api/health returns a safe health document", async () => {
	const { response, body } = await jsonRequest("/api/health");
	assert.equal(response.status, 200);
	assert.equal(body.ok, true);
	assert.equal(body.service, "mizuki-publication");
	assert.equal(body.version, "test-commit-sha");
	assert.equal(new Date(body.timestamp).toISOString(), body.timestamp);
	assert.doesNotMatch(JSON.stringify(body), /secret|token|password/i);
});

test("GET /api/version returns deployment metadata", async () => {
	const { response, body } = await jsonRequest("/api/version");
	assert.equal(response.status, 200);
	assert.deepEqual(body, {
		version: "test-commit-sha",
		environment: "production",
	});
});

test("GET /api/unknown returns JSON 404", async () => {
	const { response, body } = await jsonRequest("/api/unknown");
	assert.equal(response.status, 404);
	assert.deepEqual(body, { error: "not_found" });
});

test("POST /api/health returns 405 with Allow", async () => {
	const { response, body } = await jsonRequest("/api/health", "POST");
	assert.equal(response.status, 405);
	assert.equal(response.headers.get("allow"), "GET");
	assert.deepEqual(body, { error: "method_not_allowed" });
});
