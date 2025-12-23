/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    images: {
        unoptimized: true,
    },
};

if (isGithubPages) {
    nextConfig.basePath = '/horarios';
}

export default nextConfig;
