import { Octokit } from "@octokit/rest";
import { env } from "cloudflare:workers";

const octokit = new Octokit({
	auth: import.meta.env.GITHUB_TOKEN,
});

export type UserRepo = Awaited<
	ReturnType<typeof octokit.rest.repos.listForUser>
>["data"][number];
export type OrgRepo = Awaited<
	ReturnType<typeof octokit.rest.repos.listForOrg>
>["data"][number];
export type Repo = UserRepo | OrgRepo;

export const fetchUserRepos = (username: string) =>
	cacheJson(`user_repos:${username}`, async () => {
		const repos = await octokit.rest.repos.listForUser({
			username,
			type: "owner",
		});
		return repos.data.filter(
			(repo) => !repo.fork && repo.name !== username,
		);
	});

export const fetchOrgRepos = (org: string) =>
	cacheJson(`org_repos:${org}`, async () => {
		const repos = await octokit.rest.repos.listForOrg({
			org,
			type: "public",
		});
		return repos.data.filter(
			(repo) => !repo.fork && repo.name !== ".github",
		);
	});

async function cacheJson<Data>(
	key: string,
	fetcher: () => Promise<Data>,
): Promise<Data> {
	const cached = await env.GITHUB_CACHE.get<Data>(key, { type: "json" });
	if (cached) return cached;

	const data = await fetcher();
	await env.GITHUB_CACHE.put(key, JSON.stringify(data), {
		expirationTtl: 3_600, // 1 hour in seconds
	});
	return data;
}
