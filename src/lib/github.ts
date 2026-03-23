import { Octokit } from "@octokit/rest";
import { env } from "cloudflare:workers";

const octokit = new Octokit({
	auth: import.meta.env.GITHUB_TOKEN,
});

type CacheEntry = { etag: string | undefined; response: unknown };

function formatOptionsUrl<O extends { baseUrl: string; url: string }>(
	options: O,
) {
	let url = `${options.baseUrl}${options.url}`;

	if ("username" in options && typeof options.username === "string") {
		url = url.replace("{username}", options.username);
	}

	if ("org" in options && typeof options.org === "string") {
		url = url.replace("{org}", options.org);
	}

	if ("type" in options && typeof options.type === "string") {
		url = `${url}?type=${options.type}`;
	}

	return url;
}

octokit.hook.before("request", async (options) => {
	const entry = await env.GITHUB_CACHE.get<CacheEntry>(
		formatOptionsUrl(options),
		{ type: "json" },
	);

	if (entry?.etag) {
		options.headers["if-none-match"] = entry.etag;
	}
});

octokit.hook.after("request", async (response, options) => {
	await env.GITHUB_CACHE.put(
		formatOptionsUrl(options),
		JSON.stringify({ etag: response.headers.etag, response }),
		{ expirationTtl: 86_400 }, // 86,400 is 24 hours in seconds
	);
});

octokit.hook.error("request", async (error, options) => {
	if ("status" in error && error.status === 304) {
		const entry = await env.GITHUB_CACHE.get<CacheEntry>(
			formatOptionsUrl(options),
			{ type: "json" },
		);
		if (entry) return entry.response;
	}
	throw error;
});

export type UserRepo = Awaited<
	ReturnType<typeof octokit.rest.repos.listForUser>
>["data"][number];
export type OrgRepo = Awaited<
	ReturnType<typeof octokit.rest.repos.listForOrg>
>["data"][number];
export type Repo = UserRepo | OrgRepo;

export async function fetchUserRepos(username: string) {
	const repos = await octokit.rest.repos.listForUser({
		username,
		type: "owner",
	});
	const filtered = repos.data.filter(
		(repo) => !repo.fork && repo.name !== username,
	);

	return filtered;
}

export async function fetchOrgRepos(org: string) {
	const repos = await octokit.rest.repos.listForOrg({ org, type: "public" });
	const filtered = repos.data.filter(
		(repo) => !repo.fork && repo.name !== ".github",
	);

	return filtered;
}
