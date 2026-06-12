/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'crests.football-data.org' }
    ]
  }
}

export default config
