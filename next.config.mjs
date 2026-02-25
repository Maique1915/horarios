/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
    reactStrictMode: true,
    // Note: output: 'export' is disabled because this app has:
    // - API routes that need server-side execution
    // - Dynamic admin pages requiring authentication
    // - Real-time database connections
    // Deploy to Vercel instead for full functionality
    // output: isGithubPages ? 'export' : undefined,
    images: {
        unoptimized: true,
    },
};

if (isGithubPages) {
    nextConfig.basePath = '/horarios';
}

export default nextConfig;
