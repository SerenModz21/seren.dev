/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    redirect("/github", "https://github.com/SerenModz21"),
    redirect("/twitter", "https://twitter.com/SerenModz21"),
  ],
};

const redirect = (source, destination, permanent = true) => {
  return { source, destination, permanent };
};

module.exports = nextConfig;
