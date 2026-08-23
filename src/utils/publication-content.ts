export interface PublicationPost {
	id: string;
	data: {
		published: Date;
	};
}

export interface ArchiveMonth<T extends PublicationPost> {
	month: number;
	label: string;
	posts: T[];
}

export interface ArchiveYear<T extends PublicationPost> {
	year: number;
	count: number;
	months: ArchiveMonth<T>[];
}

export interface ArchiveModel<T extends PublicationPost> {
	total: number;
	spanDays: number;
	currentMonthCount: number;
	years: ArchiveYear<T>[];
}

const DAY_IN_MILLISECONDS = 86_400_000;

function utcDay(date: Date): number {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export interface YearProgress {
	year: number;
	goal: number;
	count: number;
	percent: number;
	remaining: number;
	remainingMonths: number;
	monthlyNeeded: number;
	onTrack: boolean;
}

export function buildYearProgress<T extends PublicationPost>(
	posts: T[],
	now: Date,
	goal: number,
): YearProgress {
	const year = now.getUTCFullYear();
	const count = posts.filter(
		(post) => post.data.published.getUTCFullYear() === year,
	).length;
	const remaining = Math.max(goal - count, 0);
	const remainingMonths = Math.max(12 - (now.getUTCMonth() + 1), 1);
	// 按时间进度应有 goal * (已过去月数 / 12)，低于则视为落后
	const expected = (goal * (now.getUTCMonth() + 1)) / 12;
	return {
		year,
		goal,
		count,
		percent: Math.min(Math.round((count / goal) * 100), 999),
		remaining,
		remainingMonths,
		monthlyNeeded: Math.ceil(remaining / remainingMonths),
		onTrack: count >= expected,
	};
}

export function buildArchiveModel<T extends PublicationPost>(
	posts: T[],
	now: Date,
): ArchiveModel<T> {
	if (posts.length === 0) {
		return { total: 0, spanDays: 0, currentMonthCount: 0, years: [] };
	}

	const sortedPosts = [...posts].sort(
		(a, b) => b.data.published.getTime() - a.data.published.getTime(),
	);
	const latest = sortedPosts[0].data.published;
	const earliest = sortedPosts.at(-1)?.data.published ?? latest;
	const currentYear = now.getUTCFullYear();
	const currentMonth = now.getUTCMonth() + 1;
	const grouped = new Map<number, Map<number, T[]>>();

	for (const post of sortedPosts) {
		const year = post.data.published.getUTCFullYear();
		const month = post.data.published.getUTCMonth() + 1;
		const months = grouped.get(year) ?? new Map<number, T[]>();
		const monthPosts = months.get(month) ?? [];
		monthPosts.push(post);
		months.set(month, monthPosts);
		grouped.set(year, months);
	}

	const years = [...grouped.entries()]
		.sort(([left], [right]) => right - left)
		.map(([year, months]) => ({
			year,
			count: [...months.values()].reduce(
				(total, monthPosts) => total + monthPosts.length,
				0,
			),
			months: [...months.entries()]
				.sort(([left], [right]) => right - left)
				.map(([month, monthPosts]) => ({
					month,
					label: `${month} 月`,
					posts: monthPosts,
				})),
		}));

	return {
		total: posts.length,
		spanDays:
			Math.floor((utcDay(latest) - utcDay(earliest)) / DAY_IN_MILLISECONDS) + 1,
		currentMonthCount: grouped.get(currentYear)?.get(currentMonth)?.length ?? 0,
		years,
	};
}
