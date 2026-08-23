import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	buildArchiveModel,
	buildYearProgress,
} from "../src/utils/publication-content.ts";

const posts = [
	{
		id: "august-start",
		data: { title: "August start", published: new Date("2026-08-01") },
	},
	{
		id: "august-latest",
		data: { title: "August latest", published: new Date("2026-08-12") },
	},
	{
		id: "december",
		data: { title: "December", published: new Date("2025-12-02") },
	},
];

describe("buildArchiveModel", () => {
	it("builds inclusive publication totals and descending groups", () => {
		const model = buildArchiveModel(posts, new Date("2026-08-18T08:00:00Z"));

		assert.equal(model.total, 3);
		assert.equal(model.currentMonthCount, 2);
		assert.equal(model.spanDays, 254);
		assert.deepEqual(
			model.years.map((group) => group.year),
			[2026, 2025],
		);
		assert.deepEqual(
			model.years[0].months.map((group) => group.month),
			[8],
		);
		assert.deepEqual(
			model.years[0].months[0].posts.map((post) => post.id),
			["august-latest", "august-start"],
		);
	});

	it("returns zeroed metrics for an empty publication", () => {
		assert.deepEqual(buildArchiveModel([], new Date("2026-08-18T08:00:00Z")), {
			total: 0,
			spanDays: 0,
			currentMonthCount: 0,
			years: [],
		});
	});
});

describe("buildYearProgress", () => {
	it("counts current-year posts against the yearly goal", () => {
		const progress = buildYearProgress(
			posts,
			new Date("2026-08-18T08:00:00Z"),
			50,
		);

		assert.equal(progress.year, 2026);
		assert.equal(progress.count, 2);
		assert.equal(progress.percent, 4);
		assert.equal(progress.remaining, 48);
		assert.equal(progress.remainingMonths, 4);
		assert.equal(progress.monthlyNeeded, 12);
		assert.equal(progress.onTrack, false);
	});

	it("reports on-track and completed goals", () => {
		const manyPosts = Array.from({ length: 50 }, (_, index) => ({
			id: `p${index}`,
			data: { published: new Date(Date.UTC(2026, 0, index + 1)) },
		}));
		const done = buildYearProgress(
			manyPosts,
			new Date("2026-08-18T08:00:00Z"),
			50,
		);
		assert.equal(done.remaining, 0);
		assert.equal(done.percent, 100);
		assert.equal(done.onTrack, true);

		const empty = buildYearProgress([], new Date("2026-01-10T08:00:00Z"), 50);
		assert.equal(empty.count, 0);
		assert.equal(empty.remaining, 50);
	});
});
