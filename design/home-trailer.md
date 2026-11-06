# Home and server information

The homepage presents the existing orc hero, the trailer space, a short server overview, Discord and the account-only contribution entry point. Detailed classes, spells, systems, progression and customization live on `/servidor`.

The hero introduces WoW 3.3.5a at level 255, three custom classes and T1–T35 gear progression. The overview presents classes, custom systems and customization before the PvE/PvP cards. The 19 custom raids are part of the 35 total raids; the 30+ custom maps are a separate feature. The public support section contains no VIP/Donor catalog or pricing. Public copy describes class rebalancing without making an unqualified No Pay to Win claim.

Server information follows the player's journey: the three additional classes, the ten original WotLK classes and their spells, gear and legendary progression, PvE/PvP challenges, systems, customization and a short FAQ. Section links follow that same order. The final block leads to registration, the connection guide and Discord. The mobile class selector appears before its artwork; the Evoker uses a lower vertical offset so its lower silhouette sits closer to the caption. Detailed guide copy lives in `src/lib/server-guide-copy.ts` in ES/EN/PT. Specific custom-class roles, spell names, raid names and starting routes still require owner-confirmed details; do not invent them.

## Publish the YouTube trailer

The [official Blackout-WoW 255 trailer](https://www.youtube.com/watch?v=06t4KdlMcRI) is the default. Its thumbnail is served locally. Clicking Play opens the privacy-enhanced player in place. The close button restores the poster, and the adjacent YouTube link opens the same video directly.

To change the trailer, set `NEXT_PUBLIC_YOUTUBE_TRAILER_ID` to a valid 11-character video ID and rebuild. An empty or invalid override uses the official trailer.

The connection guide offers the required patches and WoW.exe through MEGA and Google Drive in both installation paths. The optional `NEXT_PUBLIC_PATCH_DOWNLOAD_URL` adds another HTTPS download source.

Text for this section and the homepage overview is maintained in `src/lib/home-overview-copy.ts` for Spanish, English and Brazilian Portuguese. All original artwork and the orc video remain local assets.
