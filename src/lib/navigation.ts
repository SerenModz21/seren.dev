export const navbarLinks = [
	{
		href: "/",
		name: "Home",
	},
	{
		href: "/projects/",
		name: "Projects",
	},
	{
		href: "/referrals/",
		name: "Referrals",
	},
] as const satisfies NavbarLink[];

interface NavbarLink {
	href: string;
	name: string;
}
