# ⚽ EFI

<p align="center">
  <img src="/frontend/src/app/apple-icon.png" width="40" alt="EFI logo">
</p>

Club football match predictions, power rankings, and season projections, updated
daily.

EFI currently supports the Big Five European leagues: Premier League (England),
LaLiga (Spain), Serie A (Italy), Bundesliga (Germany), and Ligue 1 (France).

Visit [plfi.vercel.app](https://plfi.vercel.app) to see how this year's league
races are shaping up.

See [CHANGELOG.md](/CHANGELOG.md) for the latest updates and planned releases.

EFI is a simplified version of FiveThirtyEight's discontinued
[Soccer Power Index (SPI) prediction model](https://fivethirtyeight.com/methodology/how-our-club-soccer-predictions-work/).

## Methodology

Read about the methodology and implementation here. Currently, only league match
results factor into the model (no European or cup matches). EFI ratings begin in
the 2017/18 season, when expected goals stats are first available via FBref.

## Performance

EFI had an average ranked probability score of **0.2035** (sd 0.1429, median
0.1651) across 12,607 matches over 7 seasons (2017/18 - 2023/24).

### Accuracy

**Model comparison across 10,855 Big Five matches from 2017/18 - 2022/23**\
_Lower is better_

| Model                                                                       | Average RPS | Median RPS | Average IGN | Median IGN | Average BS | Median BS |
| --------------------------------------------------------------------------- | ----------- | ---------- | ----------- | ---------- | ---------- | --------- |
| Baseline model                                                              | 0.2305      | 0.1962     | 1.5470      | 1.7466     | 0.6488     | 0.7584    |
| [Bet365 betting odds](https://www.football-data.co.uk/englandm.php)         | 0.1984      | 0.1567     | 1.3273      | 1.3219     | 0.5775     | 0.5736    |
| [FiveThirtyEight](https://projects.fivethirtyeight.com/soccer-predictions/) | 0.1988      | 0.1630     | 1.4131      | 1.3955     | 0.5827     | 0.5794    |
| EFI                                                                         | 0.2050      | 0.1659     | 1.4481      | 1.3955     | 0.5969     | 0.5835    |

The scoring metrics used in this table are described in detail in
[Metrics](#metrics).

For comparison purposes, I've also included a baseline model. This model simply
uses average home win, draw, and loss probabilities for all predictions. Since
2010, Big Five home teams have won ~44.9% of their matches, drawn 25.3%, and
lost 29.8% since 2010. The baseline model places these probabilities on every
match, regardless of the two teams playing.

### Discrimination

These metrics alone don't say much (at least directly) about each model's
ability to discriminate wins from draws and losses, and vice versa. For example,
the baseline model's accuracy metrics don't look too bad, but the model is not
very useful, since it places the same probabilities on every match.

A model that places higher win probabilities on wins, higher draw probabilities
on draws, and higher loss probabilities on losses is clearly better than one
that doesn't. To visualize each model's ability to discriminate between these
outcomes, we use the receiver operating characteristic (ROC) curve, which
parametrically plots true positive rate against false positive rate across all
possible thresholds. Better models have ROC curves that bend closer toward the
upper left corner, and correspondingly have higher area under the curve (AUC).

**Model comparison across 10,855 Big Five matches from 2017/18 - 2022/23**\
_Higher AUC is better_

<p align="center">
  <img src="/assets/roc.png" width="500" alt="Plot of micro-averaged One-vs-Rest ROC curves for all models.">
</p>

<!--

avg, sd, median, count

baseline:

- rps 0.230529  0.081155  0.196202  10855
- ign 1.546984  0.356622  1.746616  10855
- bs 0.648806  0.172996  0.758414  10855

bet365:

- rps 0.198425  0.148231  0.156733  10850
- ign 1.327256  0.688915  1.321928  10850
- bs 0.577497  0.348275  0.573581  10850

FiveThirtyEight:

- rps 0.198822  0.130955  0.162958  10855
- ign 1.413145  0.678021  1.395549  10855
- bs 0.582673  0.324491  0.579432  10855

EFI:

- rps 0.204996  0.144177  0.165873  10855
- ign 1.448087  0.813902  1.39552  10855
- bs 0.59685  0.358386  0.583547  10855

-->

### Metrics

The following metrics apply to a single match.

#### Ranked probability score (RPS)

$$\text{RPS} = \frac{1}{r-1} \sum\limits_{i=1}^{r}\Biggl(\sum\limits_{j=1}^{i}\bigl(p_j - o_j\bigr)\Biggr)^2$$

where\
&emsp; $r$ is the number of possible outcomes (3),\
&emsp; $p_j$ is the probability placed on outcome $j$, and\
&emsp; $o_j$ is 1 if outcome $j$ actually occurred, else 0

Ranked probability score (RPS) is sensitive to distance between match outcomes;
i.e., a win is considered closer to a draw than to a loss. For a match that
results in a win, a forecast that predicted 50% win, 40% draw, and 10% loss has
a lower (better) RPS than one that predicted 50% win, 10% draw, and 40% loss.
RPS ranges from 0 (perfect) to 1 (entirely wrong).

#### Ignorance score (IGN)

$$\text{IGN} = -\log_2(p_y)$$

where\
&emsp; $p_y$ is the probability placed on the outcome that actually occurred

Ignorance score (IGN) is not sensitive to distance, and only considers the
probability placed on the actual outcome. For a match that results in a win, a
forecast that predicted 50% win, 40% draw, and 10% loss has the same IGN as one
that predicted 50% win, 10% draw, and 40% loss. IGN ranges from 0 (perfect) to
infinity.

#### Brier score (BS)

$$\text{BS} = \sum\limits_{i=1}^{r}\bigl(p_i - o_i\bigr)^2$$

where\
&emsp; $r$ is the number of possible outcomes (3),\
&emsp; $p_i$ is the probability placed on outcome $i$, and\
&emsp; $o_i$ is 1 if outcome $i$ actually occurred, else 0

Brier score (BS) is not sensitive to distance, but still considers all
probabilities. For a match that results in a win, a forecast that predicted 50%
win, 40% draw, and 10% loss has the same BS as one that predicted 50% win, 10%
draw, and 40% loss. BS ranges from 0 (perfect) to 2 (entirely wrong).

<!-- ## Implementation

At a high level, a daily cron job retrieves the latest scores and stats, then
updates a local DuckDB database. The model updates each club's ratings and makes
predictions for upcoming fixtures. This information is then written to MongoDB
Atlas in the cloud, where the EFI website fetches data from. -->

## Data sources

- [FBRef](https://fbref.com/)
- [FotMob](https://www.fotmob.com/)
- [Transfermarkt](https://www.transfermarkt.us/)
- [Premier League](https://www.premierleague.com/)

## Tools Used

**Backend**: Python, DuckDB, MongoDB

**Frontend**: Typescript, Next.js, Tailwind CSS, shadcn/ui
