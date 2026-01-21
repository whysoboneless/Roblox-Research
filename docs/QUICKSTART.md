# Quick Start Guide

Get up and running with the Roblox Research Tool in 5 minutes.

## Installation

```bash
cd roblox-research-tool
npm install
```

## Basic Usage

### 1. Discover Games

Find games in a niche you're interested in:

```bash
# Interactive mode (recommended for first-time users)
npm run discover -- --interactive

# Search for specific keywords
npm run discover -- --search "anime simulator"

# Search multiple terms
npm run discover -- --search "pet sim, anime pets, simulator"
```

**Output:** A list of games with their Place IDs, CCU, visits, and like ratios.

### 2. Analyze a Competitor Group

Take 3-5 Place IDs from your discovery and analyze them as a group:

```bash
npm run analyze -- --games "4996049426,4587034896,14255526359"
```

**Output:**
- Structural characteristics (genre, theme, core loop)
- Qualification status (QUALIFIED or NOT QUALIFIED)
- Metrics table for all competitors
- Emerging stars (recent successful games)
- Pattern analysis (what makes these games tick)

### 3. Save and Compare Groups

Save your analysis to build a library of competitor groups:

```bash
# Save analysis to file
npm run analyze -- --games "123,456,789" -o data/groups/my-niche.json

# Compare all saved groups
npm run qualify -- --groups "data/groups/*.json"
```

**Output:** Ranked list of all your competitor groups, showing which are worth pursuing.

## Example Workflow

```bash
# Step 1: Explore the simulation genre
npm run discover -- --genre "Simulation" --interactive

# Step 2: You find interesting pet simulators. Grab their IDs and analyze.
npm run analyze -- --games "6284583030,9872472334,17350538692" -o data/groups/pet-sims.json

# Step 3: Explore another niche - anime games
npm run discover -- --search "anime rpg, anime adventure"
npm run analyze -- --games "4996049426,4587034896" -o data/groups/anime-games.json

# Step 4: Compare your niches
npm run qualify -- --groups "data/groups/*.json"

# Result: See which niche has the best opportunity for you
```

## Understanding the Output

### Qualification Status

- **✓ QUALIFIED** - This niche has recent success stories and meets revenue criteria
- **✗ NOT QUALIFIED** - Either too competitive, no recent successes, or low revenue potential

### Key Metrics

| Metric | What It Means |
|--------|---------------|
| CCU | Concurrent users (players online now) |
| Visits | Total visits (lifetime) |
| Like % | Like ratio (higher = better received) |
| Est. Rev | Estimated monthly revenue |

### Emerging Stars

Games that started recently (last 6 months) and are already successful. These prove the niche is still viable for new entrants.

## Tips

1. **Start broad, then narrow** - Begin with genre exploration, then drill into specific sub-niches

2. **Look for emerging stars** - If a niche has games started in the last 6 months making good money, that's a good sign

3. **Play the games** - Numbers only tell part of the story. Play the top 3 games in any niche you're considering

4. **Quality threshold** - Can you make something 20% better? If not, keep looking

5. **Update your groups** - Re-run analysis periodically to track changes in the market

## Next Steps

- Read the full [Methodology Guide](./METHODOLOGY.md) for detailed research processes
- Check the [Classification Schema](../config/schemas/competitor-group.schema.json) for all structural characteristics
- Review the [Example Group](../data/groups/example-anime-tower-defense.json) for a complete analysis
