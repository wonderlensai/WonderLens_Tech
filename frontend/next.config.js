/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize ffmpeg/ffprobe packages for server-side
      config.externals = config.externals || []
      config.externals.push({
        'ffmpeg-static': 'commonjs ffmpeg-static',
        'ffprobe-static': 'commonjs ffprobe-static',
      })
    }
    return config
  },
}

module.exports = nextConfig
