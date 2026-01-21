# Roblox Game Research Methodology

This document explains how to use the research tool following the competitor grouping methodology adapted from digital media research.

## Overview

The methodology consists of two complementary systems:

1. **Competitor Grouping** - Identify and qualify niches worth entering
2. **Trend Discovery** - Reverse engineer successful game patterns

---

## Part 1: Competitor Grouping

### What is a Competitor Group?

A competitor group is a collection of Roblox games that share similar **structural characteristics**:

| Characteristic | Description | Examples |
|---------------|-------------|----------|
| **Genre** | Primary Roblox category | Simulation, Strategy, RPG |
| **Sub-Genre** | Specific game type | Incremental Simulator, Tower Defense, Tycoon |
| **Theme** | Visual/narrative setting | Anime, Horror, Military, Food |
| **Core Loop** | Primary gameplay pattern | Collect → Upgrade → Prestige |
| **Monetization** | Revenue strategy | Gamepass Heavy, Gacha, Hybrid |
| **Art Style** | Visual aesthetic | Anime, Realistic, Low-Poly |
| **Demographics** | Target audience | Age 10-12, Male-Leaning |

### The Qualification Flowchart

```
                    ┌─────────────────────┐
                    │  Search & Filter    │
                    │      Games          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Find a Game       │
                    └──────────┬──────────┘
                               │
              ┌────────────────▼────────────────┐
              │ Was it created in the last      │
              │        6 months?                │
              └────────────────┬────────────────┘
                     │                  │
                    YES                 NO
                     │                  │
                     │         ┌────────▼────────┐
                     │         │ Can you find    │
                     │         │ other recent    │
                     │         │ successful      │
                     │         │ games?          │
                     │         └────────┬────────┘
                     │                  │
                     │          YES ────┘
                     │
              ┌──────▼───────┐
              │ Is it making │
              │ $10k+/month? │
              └──────┬───────┘
                     │
                    YES
                     │
              ┌──────▼───────────────────┐
              │ Are there 2-3 games in   │
              │ this group that started  │
              │ recently and succeeded?  │
              └──────┬───────────────────┘
                     │
                    YES
                     │
              ┌──────▼───────────────────┐
              │ Can you beat the current │
              │ quality level by 20%?    │
              └──────┬───────────────────┘
                     │
                    YES
                     │
              ┌──────▼───────────────────┐
              │   ✓ QUALIFIED GROUP      │
              │   Document competitors   │
              └──────────────────────────┘
```

### Using the Tool for Competitor Grouping

#### Step 1: Discover Games

```bash
# Search by keyword
npm run discover -- --search "anime simulator, pet simulator"

# Interactive mode (recommended for exploration)
npm run discover -- --interactive

# Filter by genre
npm run discover -- --genre "Simulation" --search "pet"
```

#### Step 2: Analyze a Competitor Group

Once you've identified 3-5 potential competitors:

```bash
# Analyze using Place IDs
npm run analyze -- --games "4996049426,4587034896,14255526359"

# Save the analysis
npm run analyze -- --games "4996049426,4587034896,14255526359" -o data/groups/anime-td.json
```

#### Step 3: Qualify and Compare Groups

```bash
# Compare all saved groups
npm run qualify -- --groups "data/groups/*.json"

# Custom qualification criteria
npm run qualify -- --criteria '{"minMonthlyRevenue": 5000, "maxAgeMonths": 12}'
```

---

## Part 2: Trend Discovery (Game Patterns)

### What is a Game Pattern?

A game pattern is the "formula" that successful games follow. Like video series in digital media, patterns have:

| Level | Description | Example |
|-------|-------------|---------|
| **Template** | The high-level game formula | "Anime + Tower Defense" |
| **Mechanic** | The core gameplay loop | "Place characters → Upgrade → Defend waves" |
| **Variation** | The specific theme/twist | "One Piece characters" vs "Naruto characters" |

### Known Successful Patterns

The tool includes analysis of proven patterns:

1. **Anime Tower Defense**
   - Template: Anime + Tower Defense
   - Key mechanics: Gacha, character placement, wave defense
   - Examples: Anime Adventures, All Star Tower Defense

2. **Pet Simulator**
   - Template: X Simulator + Pet Collection
   - Key mechanics: Click to collect, pets multiply earnings, rebirth
   - Examples: Pet Simulator X, Pet Simulator 99

3. **Horror Multiplayer**
   - Template: Horror + Asymmetric Multiplayer
   - Key mechanics: One player hunts, others survive
   - Examples: Doors, Apeirophobia

4. **Incremental Tycoon**
   - Template: Tycoon + Automation + Incremental
   - Key mechanics: Droppers, automation, prestige
   - Examples: Strongman Simulator, Mining Simulator 2

5. **Roleplay Life Sim**
   - Template: Life Simulation + Social Roleplay
   - Key mechanics: House customization, social features
   - Examples: Brookhaven RP, Bloxburg

### Reverse Engineering a Pattern

When analyzing a successful game, document:

1. **Retention Drivers** - What keeps players coming back?
   - Daily rewards
   - Limited-time events
   - Collection/completion goals
   - Social features

2. **Monetization Hooks** - What do players pay for?
   - Gamepasses (VIP, 2x earnings, auto-features)
   - In-game currency (Robux shop)
   - Exclusive items/characters

3. **Viral Mechanics** - What drives organic growth?
   - Trading systems
   - Leaderboards/competition
   - Shareable moments (UGC, screenshots)
   - Group/social features

---

## Workflow Example

### Finding Your Niche

```
Week 1: Exploration
├── Day 1-2: Run discover in interactive mode across all genres
├── Day 3-4: Identify 5-10 potential competitor groups
├── Day 5-7: Collect detailed data on each group

Week 2: Qualification
├── Day 1-3: Analyze each group (npm run analyze)
├── Day 4-5: Run qualification comparison
├── Day 6-7: Deep-dive on top 2-3 qualified groups

Week 3: Pattern Analysis
├── Day 1-3: Play top games in chosen group
├── Day 4-5: Document the game pattern
├── Day 6-7: Identify differentiation opportunities
```

### Documentation Template

For each qualified competitor group, create a document with:

```markdown
# [Group Name] Analysis

## Structural Characteristics
- Genre:
- Sub-Genre:
- Theme:
- Core Loop:
- Target Demo:

## Competitors
| Game | CCU | Revenue | Quality | Notes |
|------|-----|---------|---------|-------|
|      |     |         |         |       |

## Emerging Stars
- [Game 1]: Why they're succeeding
- [Game 2]: Why they're succeeding

## Pattern Analysis
- Template:
- Key Mechanics:
- Retention Drivers:
- Monetization:

## Opportunity Assessment
- Market gaps:
- Differentiation approach:
- Required quality bar:
- Estimated dev complexity:

## Decision
[ ] Pursue this niche
[ ] Pass - reason:
```

---

## Key Metrics

### Revenue Estimation

The tool estimates monthly revenue based on:

```
Monthly Revenue ≈ Average CCU × Revenue Factor × 30

Revenue Factor:
- Low (70% like ratio): $0.50/CCU
- Medium (70-85% like ratio): $2.00/CCU
- High (85%+ like ratio): $5.00/CCU
```

This is a rough estimate. Actual revenue varies based on:
- Monetization design
- Update frequency
- Premium/subscription features
- Seasonal events

### Quality Score (Manual)

Rate games 1-10 on:
- Visual quality (art, UI)
- Gameplay smoothness
- Content depth
- Polish/bugs
- Monetization balance

To "beat by 20%", aim for at least 1.2× the top competitor's average score.

---

## Best Practices

1. **Don't just copy** - Understand WHY mechanics work, not just WHAT they are
2. **Quality matters** - In competitive niches, quality is table stakes
3. **Updates win** - Consistent updates beat one-time quality
4. **Test assumptions** - Play the top games yourself, don't rely solely on metrics
5. **Niche down** - "Anime TD" is competitive; "Spy x Family TD with story mode" might not be
6. **Mobile first** - Many Roblox players are on mobile; optimize accordingly
