/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
    reactStrictMode: true,
    basePath: isGithubPages ? '/horarios' : undefined,
    output: isGithubPages ? 'export' : undefined,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
