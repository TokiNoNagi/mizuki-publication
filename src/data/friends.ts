export interface FriendItem {
	id: number;
	title: string;
	imgurl?: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "Mizuki",
		desc: "本出版版使用的开源主题底座",
		siteurl: "https://github.com/matsuzaka-yuki/Mizuki",
		tags: ["项目", "主题底座"],
	},
];

export function getFriendsList(): FriendItem[] {
	return friendsData;
}

export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
