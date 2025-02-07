# ⚽ PLFI

Premier League match predictions, power rankings, and season projections,
updated daily.

PLFI is a simplified version of FiveThirtyEight's discontinued
[Soccer Power Index (SPI) prediction model](https://fivethirtyeight.com/methodology/how-our-club-soccer-predictions-work/).

## Methodology

Read about the methodology here. Currently, only Premier League match results
factor into the model (no European or cup matches). PLFI ratings begin in the
2017/18 season, when expected goals stats are first available via FBRef.

## Accuracy

Across 2,660 matches over 7 seasons (2017/18 - 2023/24), PLFI had an average
ranked probability score of 0.2010 (sd 0.1479, median 0.1627).

### Metrics

#### Ranked probability score (RPS)

$\text{RPS} = \frac{1}{n-1} \sum\limits_{i=1}^{n}\Bigl(\sum\limits_{j=1}^{i} (p_j - o_j)\Bigr)^2$\
where\
&emsp;$n$ is the number of possible outcomes (3),\
&emsp;$p_j$ is the probability placed on outcome $j$, and\
&emsp;$o_j$ is 1 if outcome $j$ actually occurred, else 0

Ranked probability score (RPS) is sensitive to distance between match outcomes;
i.e., a win is considered closer to a draw than to a loss. For a match that
results in a win, a forecast that predicted 50% win, 40% draw, and 10% loss has
a lower (better) RPS than one that predicted 50% win, 10% draw, and 40% loss.
RPS ranges from 0 (perfect) to 1 (entirely wrong).

#### Ignorance score (IGN)

$\text{IGN} = -\log_2(p_y)$ &emsp; where $p_y$ is the probability placed on the
outcome that actually occurred

Ignorance score (IGN) is not sensitive to distance, and only considers the
probability placed on the actual outcome. For a match that results in a win, a
forecast that predicted 50% win, 40% draw, and 10% loss has the same IGN as one
that predicted 50% win, 10% draw, and 40% loss. IGN ranges from 0 (perfect) to
infinity.

#### Brier score (BS)

$\text{BS} = \frac{1}{n} \sum\limits_{i=1}^{n}(p_i - o_i)^2$\
where\
&emsp;$n$ is the number of possible outcomes (3),\
&emsp;$p_i$ is the probability placed on outcome $i$, and\
&emsp;$o_i$ is 1 if outcome $i$ actually occurred, else 0

Brier score (BS) is not sensitive to distance, but still considers all
probabilities. For a match that results in a win, a forecast that predicted 50%
win, 40% draw, and 10% loss has the same BS as one that predicted 50% win, 10%
draw, and 40% loss. BS ranges from 0 (perfect) to 1 (entirely wrong).

### Model comparison

**Model performance across 2,280 matches from 2017/18 - 2022/23**\
_Lower is better_

| Model                                                                       | Average RPS | Median RPS | Average IGN | Median IGN | Average BS | Median BS |
| --------------------------------------------------------------------------- | ----------- | ---------- | ----------- | ---------- | ---------- | --------- |
| Baseline model                                                              | 0.2334      | 0.1976     | 1.534       | 1.699      | 0.2144     | 0.2469    |
| [Bet365 betting odds](https://www.football-data.co.uk/englandm.php)         | 0.2410      | 0.1669     | 1.3153      | 1.2630     | 0.1869     | 0.1782    |
| [FiveThirtyEight](https://projects.fivethirtyeight.com/soccer-predictions/) | 0.1970      | 0.1633     | 1.3818      | 1.3414     | 0.1890     | 0.1843    |
| PLFI                                                                        | 0.2023      | 0.1627     | 1.4087      | 1.3409     | 0.1932     | 0.1841    |

For comparison purposes, I've also included a baseline model. This model simply
uses league-average home win, draw, and loss probabilities for all predictions.
Since 2010, home teams have won around 45.2% of their matches, drawn 24.0%, and
lost 30.8%. The model places these probabilities on every match, regardless of
the two teams playing.

<!-- avg, sd, median, count

baseline:

- rps 0.233563 0.077402 0.197584 2280
- ign 1.534237 0.372903 1.698998 2280
- bs 0.214441 0.05938 0.246923 2280

bet365:

- rps 0.241042 0.213181 0.166884 2280
- ign 1.315298 0.757025 1.263034 2280
- bs 0.186878 0.118918 0.17823 2280

FiveThirtyEight:

- rps 0.196954 0.138706 0.163296 2280
- ign 1.381826 0.729923 1.341356 2280
- bs 0.189048 0.11531 0.184306 2280

PLFI:

- rps 0.202296 0.149054 0.162715 2280
- ign 1.40868 0.786266 1.340862 2280
- bs 0.193228 0.12381 0.184085 2280 -->

## Implementation

At a high level, a daily cron job retrieves the latest scores and stats, then
updates a local DuckDB database. The model updates each club's ratings and makes
predictions for upcoming fixtures. This information is then written to MongoDB
Atlas in the cloud, where the PLFI website fetches data from.

## Data sources

- [FBRef](https://fbref.com/)
- [FotMob](https://www.fotmob.com/)
- [Transfermarkt](https://www.transfermarkt.us/)
- [Premier League](https://www.premierleague.com/)

## Tools Used

**Backend**: Python, requests, DuckDB, MongoDB

**Frontend**: Typescript, Next.js, Tailwind CSS, shadcn/ui
