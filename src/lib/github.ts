import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

export type UserRepo = Awaited<
	ReturnType<typeof octokit.rest.repos.listForUser>
>["data"][number];
export type OrgRepo = Awaited<
	ReturnType<typeof octokit.rest.repos.listForOrg>
>["data"][number];
export type Repo = UserRepo | OrgRepo;

const userCache = new Map<string, UserRepo[]>();
const orgCache = new Map<string, OrgRepo[]>();

export async function fetchUserRepos(username: string) {
	if (userCache.has(username)) return userCache.get(username)!;

	const repos = await octokit.rest.repos.listForUser({
		username,
		type: "owner",
	});
	const filtered = repos.data.filter(
		(repo) => !repo.fork && repo.name !== username,
	);

	userCache.set(username, filtered);
	return filtered;
}

export async function fetchOrgRepos(org: string) {
	if (orgCache.has(org)) return orgCache.get(org)!;

	const repos = await octokit.rest.repos.listForOrg({ org, type: "public" });
	const filtered = repos.data.filter(
		(repo) => !repo.fork && repo.name !== ".github",
	);

	orgCache.set(org, filtered);
	return filtered;
}
