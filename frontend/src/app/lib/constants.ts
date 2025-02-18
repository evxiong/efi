interface League {
  name: string;
  slug: string;
  icon_link: string;
  competition_id: number;
}

export const LEAGUES: League[] = [
  {
    name: "Premier League",
    slug: "premier-league",
    icon_link:
      "https://www.premierleague.com/resources/rebrand/v7.153.44/i/elements/pl-main-logo.png",
    competition_id: 1,
  },
  {
    name: "LaLiga",
    slug: "laliga",
    icon_link:
      "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
    competition_id: 2,
  },
  {
    name: "Serie A",
    slug: "serie-a",
    icon_link:
      "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
    competition_id: 3,
  },
  {
    name: "Bundesliga",
    slug: "bundesliga",
    icon_link:
      "https://images.fotmob.com/image_resources/logo/leaguelogo/54.png",
    competition_id: 4,
  },
  {
    name: "Ligue 1",
    slug: "ligue-1",
    icon_link:
      "https://images.fotmob.com/image_resources/logo/leaguelogo/53.png",
    competition_id: 5,
  },
];
