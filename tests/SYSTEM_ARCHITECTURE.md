# Roblox Research Tool - System Architecture

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MARKET SCANNING LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │  /api/emerging  │     │  /api/discover  │     │ /api/ai-discover│       │
│  │                 │     │                 │     │                 │       │
│  │ Roblox Explore  │     │ Curated Lists   │     │ AI-Powered      │       │
│  │ "Up-and-Coming" │     │ + Search        │     │ Discovery       │       │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘       │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│                                   ▼                                         │
│                        ┌─────────────────────┐                              │
│                        │   EMERGING GAMES    │                              │
│                        │   (with metrics)    │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────────────┐
│        /api/save-game         │   │            /api/analyze               │
│                               │   │                                       │
│  Save individual games to     │   │  Analyze multiple games as a          │
│  track over time              │   │  competitor group                     │
│                               │   │                                       │
│  → Upserts to `games` table   │   │  → Classifies: genre, theme, template │
│  → Creates `game_metrics`     │   │  → Calculates qualification score     │
│                               │   │  → Identifies emerging stars          │
└───────────────┬───────────────┘   └─────────────────┬─────────────────────┘
                │                                     │
                │                                     ▼
                │                   ┌───────────────────────────────────────┐
                │                   │          /api/save-group              │
                │                   │                                       │
                │                   │  Save entire competitor group with    │
                │                   │  extracted patterns                   │
                │                   │                                       │
                │                   │  → Creates `competitor_groups`        │
                │                   │  → Links games via `group_games`      │
                │                   │  → Extracts patterns to `game_patterns│
                │                   └─────────────────┬─────────────────────┘
                │                                     │
                └──────────────┬──────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE DATABASE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │     games       │────▶│  game_metrics   │     │ competitor_groups│       │
│  │                 │     │                 │     │                 │       │
│  │ place_id        │     │ game_id (FK)    │     │ group_name      │       │
│  │ universe_id     │     │ visits          │     │ qualification   │       │
│  │ name            │     │ current_players │     │ score           │       │
│  │ genre           │     │ like_ratio      │     │ is_qualified    │       │
│  │ creator_name    │     │ est_revenue     │     │ classification  │       │
│  └────────┬────────┘     └─────────────────┘     └────────┬────────┘       │
│           │                                               │                 │
│           └───────────────────────┬───────────────────────┘                 │
│                                   │                                         │
│                                   ▼                                         │
│                        ┌─────────────────────┐                              │
│                        │    group_games      │                              │
│                        │                     │                              │
│                        │ group_id (FK)       │                              │
│                        │ game_id (FK)        │                              │
│                        │ is_emerging_star    │                              │
│                        │ quality_score       │                              │
│                        └─────────────────────┘                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        game_patterns                                 │   │
│  │                                                                      │   │
│  │  pattern_name          │ pattern_classification │ replication_guide  │   │
│  │  ─────────────         │ ────────────────────── │ ─────────────────  │   │
│  │  Collect→Upgrade→...   │ {type: "core_loop"}    │ {mechanics: [...]} │   │
│  │  Gacha/Crate System    │ {type: "monetization"} │ {avgRevenue: ...}  │   │
│  │  Anime IP/Style        │ {type: "theme"}        │ {elements: [...]}  │   │
│  │  Daily Rewards         │ {type: "retention"}    │ {impact: "15-30%"} │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RETRIEVAL LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   /api/games    │     │   /api/groups   │     │  /api/patterns  │       │
│  │                 │     │                 │     │                 │       │
│  │ List all saved  │     │ List all saved  │     │ Get proven      │       │
│  │ games + metrics │     │ competitor grps │     │ pattern library │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/emerging` | GET | Fetch emerging games from Roblox's "Up-and-Coming" list |
| `/api/discover` | GET | Search games by keyword/category |
| `/api/analyze` | POST | Analyze Place IDs → classification + qualification |
| `/api/save-game` | POST | Save individual game to database |
| `/api/save-group` | POST | Save competitor group with pattern extraction |
| `/api/patterns` | GET | Retrieve all patterns (stored + proven library) |
| `/api/patterns` | POST | Seed proven patterns into database |
| `/api/games` | GET | List all tracked games |
| `/api/groups` | GET | List all competitor groups |

## Pattern Types

### Core Loops
- **Collect → Upgrade → Prestige** (Simulators)
- **Place → Upgrade → Defend** (Tower Defense)
- **Fight → Loot → Level** (Action RPG)

### Monetization
- **Gacha/Crate System** - Random rewards with rarity tiers
- **Gamepass Multipliers** - Permanent boost purchases
- **Battle Pass** - Time-limited progression tracks

### Themes
- **Anime IP/Style** - Japanese animation aesthetics
- **Pet/Creature Collection** - Collectible companions

### Retention
- **Daily Rewards** - Consecutive login bonuses
- **Limited-Time Events** - FOMO-driven seasonal content
- **Social Hooks** - Trading, guilds, co-op

## User Workflow

### 1. Discover Emerging Opportunities
```
/emerging page → Filter by category/age/CCU → Find new games gaining traction
```

### 2. Analyze Competitor Groups
```
Select games → /analyze page → See qualification score + classification
```

### 3. Save to Research Library
```
Click "Save to Research Library" → Patterns extracted → Stored in Supabase
```

### 4. Reference Proven Patterns
```
/patterns page → Browse core loops, monetization, retention strategies
```

### 5. Qualify Your Ideas
```
/idea page → AI validates your concept against proven patterns
```

## Database Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `games` | 5+ | Tracked Roblox games with metadata |
| `game_metrics` | 5+ | Historical metrics snapshots |
| `competitor_groups` | 2+ | Analyzed niche groupings |
| `group_games` | Junction | Links games to groups |
| `game_patterns` | 13+ | Proven + extracted patterns |

## Revenue Estimation Formula

```javascript
// More realistic than industry-wide averages
const estimatedDailyVisits = CCU * 15  // CCU to daily visits multiplier

let revenuePerThousand = 0.50  // base rate
if (likeRatio > 95) revenuePerThousand = 2.00
else if (likeRatio > 90) revenuePerThousand = 1.50
else if (likeRatio > 80) revenuePerThousand = 1.00
else if (likeRatio < 70) revenuePerThousand = 0.25

monthlyRevenue = (estimatedDailyVisits / 1000) * revenuePerThousand * 30
```

## Qualification Criteria

A niche is **QUALIFIED** when:
1. ✓ At least 1 game earning $10k+/month (Revenue Check)
2. ✓ At least 1 game created in last 6 months (Recency Check)
3. ✓ At least 2 recent games are successful (Recent Success Check)
4. ✓ Total score ≥ 60

## What Gets Extracted When Saving Groups

1. **Core Loop Pattern** - Template + mechanics description
2. **Theme Pattern** - Visual/gameplay theme elements
3. **Monetization Pattern** - Revenue estimate + likely strategies
4. **Genre Success Pattern** - Success rate in this category
5. **Emerging Signals** - Growth indicators + recommendations
