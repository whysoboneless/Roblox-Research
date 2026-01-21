# Roblox Game Research Tool

A market research tool for identifying qualified competitor groups and emerging game trends on Roblox, following the Nicole Search methodology.

## Purpose

This tool helps you:
1. **Competitor Grouping** - Classify games by structural characteristics to find your competitive landscape
2. **Trend Discovery** - Identify successful game patterns and mechanics to reverse engineer
3. **Niche Qualification** - Filter for emerging opportunities with growth potential and beatable competition
4. **Historical Tracking** - Track metrics over time to identify emerging stars early

## Installation

```bash
cd roblox-research-tool
npm install
```

## Database Setup (Supabase)

The tool uses Supabase for storing historical data and enabling trend analysis.

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for it to initialize (~2 minutes)

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials (from Project Settings → API):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migration

1. Go to your Supabase dashboard → SQL Editor
2. Copy contents of `src/db/migrations/001_initial_schema.sql`
3. Paste and click "Run"

### 4. Test Connection

```bash
npm run db:test
```

## Quick Start

```bash
# 1. Discover trending games (interactive mode)
npm run discover -- --interactive

# 2. Analyze a competitor group
npm run analyze -- --games "4996049426,4587034896,14255526359"

# 3. Sync local data to database
npm run sync -- --groups "data/groups/*.json"

# 4. Track metrics over time (run daily)
npm run track

# 5. Compare and qualify groups
npm run qualify -- --groups "data/groups/*.json"
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run discover` | Search and explore Roblox games |
| `npm run analyze` | Analyze a competitor group from Place IDs |
| `npm run qualify` | Compare and rank competitor groups |
| `npm run sync` | Sync local JSON data to Supabase |
| `npm run track` | Collect fresh metrics for all tracked games |
| `npm run db:test` | Test database connection |

## Methodology

Based on the digital media research framework adapted for Roblox:

### Competitor Group Selection Process

```
Search & Filter Games
        ↓
    Find a Game
        ↓
Was it created in the last 6 months? ──No──→ Can you find other games started
        │                                      recently with this format?
       Yes                                            │
        ↓                                           Yes/No
Is the game making ~$10k+/month? ──No──→ Has this game pattern been successful
        │                                 on other platforms or as one-offs?
       Yes                                            │
        ↓                                           Yes/No
Are there 2-3 games in this group                     │
that started recently and succeeded? ←────────────────┘
        │
       Yes
        ↓
Can you beat the current quality by 20%?
        │
       Yes
        ↓
✓ Qualified Competitor Group
```

## Data Sources

- **Roblox Games API** - Player counts, visits, favorites, votes
- **Roblox Discovery API** - Trending, top charts, genre sorts
- **Supabase** - Historical data storage and trend analysis
- **Rolimon's** - Historical analytics (optional)
- **RoMonitor Stats** - Engagement metrics (optional)

## Project Structure

```
roblox-research-tool/
├── src/
│   ├── collectors/        # Data collection from Roblox APIs
│   ├── classifiers/       # Game classification logic
│   ├── analyzers/         # Trend and pattern analysis
│   ├── qualifiers/        # Niche qualification logic
│   ├── db/                # Supabase database layer
│   │   ├── supabase.js    # Database client
│   │   ├── models.js      # CRUD operations
│   │   └── migrations/    # SQL schema files
│   └── cli/               # Command line tools
├── data/
│   └── groups/            # Competitor group JSON files
├── config/
│   └── schemas/           # Classification taxonomies
├── docs/
│   ├── QUICKSTART.md      # Getting started guide
│   └── METHODOLOGY.md     # Full methodology documentation
└── output/
    └── reports/           # Generated reports
```

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md) - Get up and running in 5 minutes
- [Methodology Guide](docs/METHODOLOGY.md) - Full research methodology and best practices

## Scheduling Automatic Tracking

To build historical data, run the track command on a schedule:

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task → "Roblox Research Tracker"
3. Trigger: Daily
4. Action: Start a program
   - Program: `node`
   - Arguments: `src/cli/track.js`
   - Start in: `C:\path\to\roblox-research-tool`

**Linux/Mac (cron):**
```bash
crontab -e
# Add: Run every 6 hours
0 */6 * * * cd /path/to/roblox-research-tool && npm run track >> /var/log/roblox-tracker.log 2>&1
```

## License

MIT
