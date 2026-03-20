/*
  Global site config for Mechascopic
  Update these values to configure site name, URL, social links, monetization, etc.
*/
export const SITE = {
  name: "Mechascopic",
  url: "https://mechascopic.com", // Update to your deployed URL
  description: "Mechascopic: games, guides, and creator updates.",
  gaMeasurementId: import.meta.env.PUBLIC_GA_MEASUREMENT_ID || "", // Google Analytics (GA4) measurement ID
  twitter: "mechascopic", // Twitter username (no @)
  youtube: "https://youtube.com/@mechascopic",
  youtubeHandle: "mechascopic", // Your @handle without @
  youtubeChannelId: "UCijxxlP9VQfs7LpsjVRAnjA", // Your channel ID
  twitch: "https://twitch.tv/mechascopic", // Optional
  discord: "", // Optional
  email: "contact@mechascopic.com", // Update as needed
  monetization: {
    provider: "Monetag",
    enabled: true,
  },
  newsletter: {
    beehiivSubscribeUrl: "https://mechascopic.beehiiv.com",
    beehiivRssUrl: "https://rss.beehiiv.com/feeds/zIVcS5KXl9.xml",
  },
};
