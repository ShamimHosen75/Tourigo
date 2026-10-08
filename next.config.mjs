/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors still fail the build; linting is left to your editor.
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Photos can come from Supabase Storage or any https host you paste into the admin data.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
