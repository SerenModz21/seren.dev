import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { navbarLinks } from "~/lib/navigation";

export default function MobileNav() {
	return (
		<Popover>
			<PopoverTrigger className="group" asChild>
				<Button variant="ghost" className="w-max md:hidden">
					<MenuIcon className="transition-transform duration-300 group-data-[state=open]:rotate-90" />
					<span className="sr-only">Toggle mobile nav</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="bg-popover/80 w-screen rounded-none border-x-0 backdrop-blur-lg">
				<nav className="flex flex-col gap-2">
					{navbarLinks.map((link) => (
						<Button
							key={link.href}
							variant="ghost"
							className="text-lg"
							asChild
						>
							<a href={link.href}>{link.name}</a>
						</Button>
					))}
				</nav>
			</PopoverContent>
		</Popover>
	);
}
