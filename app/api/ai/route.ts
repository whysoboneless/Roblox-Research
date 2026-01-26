import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// System prompt for Roblox game analysis
const SYSTEM_PROMPT = `You are an expert Roblox game developer and market analyst. You understand:
- The Nicole Search methodology: Find games <6 months old making $10k+/month with 2+ recent successes in the niche
- Roblox monetization: Gamepasses, Developer Products, Premium Payouts, Trading systems
- Retention mechanics: Rebirth/prestige systems, daily rewards, collection mechanics, social features
- Viral growth: YouTube content, trading communities, tier lists, update hype cycles
- Game patterns: Simulators, Tower Defense, Horror, Tycoons, Roleplay, Fighting games

When helping users:
1. Be specific and actionable - not generic advice
2. Reference real successful Roblox games as examples
3. Focus on what actually makes money on Roblox
4. Help them articulate ideas they're struggling to explain
5. Identify potential problems before they build

Keep responses concise but comprehensive. Use bullet points for lists.`

export async function POST(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const { allowed, resetIn } = checkRateLimit(clientId, 'ai')
  if (!allowed) {
    return rateLimitResponse(resetIn)
  }

  try {
    const { action, data } = await request.json()

    if (!anthropic) {
      return NextResponse.json({ error: 'AI features not configured' }, { status: 503 })
    }

    let prompt = ''

    switch (action) {
      case 'help-articulate':
        // Help user explain their game loop better
        prompt = `A Roblox developer is trying to describe their game idea but struggling to articulate it clearly.

Their attempt: "${data.coreLoop}"
Game template: ${data.template}
Theme: ${data.theme}

Help them articulate their core gameplay loop better. Provide:
1. A clearer, more specific description of what they might be trying to say (2-3 sentences)
2. The key loop elements they should include (action → reward → progression)
3. One example of a similar successful game's loop for reference

Be encouraging but specific. Help them see their idea more clearly.`
        break

      case 'qualify-idea':
        // Full idea qualification and game plan generation
        // Build market research context if available
        const marketContext = data.marketResearch ? `
REAL MARKET DATA (from emerging games research):
- Competitors Found: ${data.marketResearch.competitorCount} emerging games in this space
- Example Competitors: ${data.marketResearch.competitorNames?.join(', ') || 'None found'}
- What's Working: ${data.marketResearch.whatsWorking?.join('; ') || 'Unknown'}
- Market Gaps (20% better opportunities): ${data.marketResearch.gaps?.join('; ') || 'Unknown'}
- Proven Retention Patterns: ${data.marketResearch.suggestedPatterns?.retention?.join(', ') || 'Standard patterns'}
- Proven Monetization: ${data.marketResearch.suggestedPatterns?.monetization?.join(', ') || 'Standard patterns'}
- Viral Mechanics: ${data.marketResearch.suggestedPatterns?.viral?.join(', ') || 'Standard patterns'}
` : ''

        prompt = `Analyze this Roblox game idea and create a complete game plan:

IDEA:
- Name: ${data.name || 'Untitled'}
- Template: ${data.template}
- Theme: ${data.theme}
- Core Loop: ${data.coreLoop}
- Unique Hook: ${data.uniqueHook || 'Not specified'}
- Monetization: ${data.monetization?.join(', ') || 'Not specified'}
${data.baseFormula ? `- Based on Formula: ${data.baseFormula}` : ''}
${marketContext}

IMPORTANT: Use the real market data above to make your analysis data-driven. Reference the actual competitors found. Recommend patterns that are PROVEN to work in this space. Focus on how they can be 20% better than existing games.

Provide a comprehensive analysis in this EXACT JSON format:
{
  "score": <number 0-100>,
  "verdict": "<PROMISING or NEEDS_WORK or HIGH_RISK>",
  "summary": "<2 sentence summary based on real market data>",
  "coreMechanics": ["<mechanic 1>", "<mechanic 2>", ...],
  "monetizationPlan": ["<strategy from proven patterns>", "<strategy 2>", ...],
  "retentionHooks": ["<proven hook 1>", "<proven hook 2>", ...],
  "viralStrategy": ["<tactic based on what works>", "<tactic 2>", ...],
  "weekByWeekPlan": ["Week 1-2: <task>", "Week 3-4: <task>", ...],
  "risks": ["<risk 1>", "<risk 2>", ...],
  "competitors": ["<real competitor from data>", "<game 2>", ...],
  "uniqueAdvice": "<Specific advice on how to be 20% better than the competitors found>"
}

Be specific to their actual idea and the real market data. Don't give generic advice - reference the actual competitors and proven patterns.
Return ONLY valid JSON, no other text.`
        break

      case 'analyze-game':
        // Analyze an existing game's strategy
        prompt = `Analyze this Roblox game and reverse-engineer its success strategy:

Game: ${data.name}
Genre: ${data.genre || 'Unknown'}
CCU: ${data.ccu?.toLocaleString() || 'Unknown'}
Visits: ${data.visits?.toLocaleString() || 'Unknown'}
Like Ratio: ${data.likeRatio || 'Unknown'}%

Provide analysis in this EXACT JSON format:
{
  "pattern": "<detected game pattern>",
  "whyItWorks": "<2-3 sentences on why this game succeeds>",
  "retention": ["<mechanic 1>", "<mechanic 2>", ...],
  "monetization": ["<method 1>", "<method 2>", ...],
  "viralHooks": ["<hook 1>", "<hook 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "howToCompete": "<1-2 sentences on how to build something better>"
}

Return ONLY valid JSON, no other text.`
        break

      case 'brainstorm':
        // Generate game ideas based on criteria
        prompt = `Generate 3 unique Roblox game ideas based on:

Criteria: ${data.criteria || 'trending niches with proven demand'}
Preferences: ${data.preferences || 'any'}

For each idea, provide in this EXACT JSON format:
{
  "ideas": [
    {
      "name": "<catchy game name>",
      "template": "<Simulator/TD/Horror/etc>",
      "theme": "<theme>",
      "pitch": "<1 sentence elevator pitch>",
      "coreLoop": "<the gameplay loop>",
      "whyNow": "<why this would work right now>",
      "competitors": ["<existing game 1>", "<existing game 2>"],
      "difficulty": "<Low/Medium/High>"
    }
  ]
}

Focus on ideas that:
- Have proven demand (similar games exist and are successful)
- Have room for a 20% better version
- Match current Roblox trends

Return ONLY valid JSON, no other text.`
        break

      case 'generate-from-formula':
        // Auto-generate complete game ideas from a proven formula
        const formulaContext = `
PROVEN FORMULA DATA:
- Template: ${data.formula.template}
- Theme: ${data.formula.theme}
- Core Loop: ${data.formula.coreLoop}
- Avg Revenue: $${(data.formula.avgRevenue / 1000).toFixed(0)}K/month
- Emerging Stars: ${data.formula.emergingCount}
- Core Mechanics: ${data.formula.mechanics?.join(', ') || 'Standard mechanics'}
- Proven Monetization: ${data.formula.monetization?.join(', ') || 'Standard monetization'}
- Proven Retention: ${data.formula.retention?.join(', ') || 'Standard retention'}
- Example Games: ${data.formula.exampleGames?.join(', ') || 'None'}
${data.formula.pitfalls ? `- Known Pitfalls: ${data.formula.pitfalls.join(', ')}` : ''}

EMERGING STARS DATA (live trending games):
${data.emergingGames?.map((g: any) => `- ${g.name} (${g.metrics?.currentPlayers || 0} CCU, ${g.metrics?.likeRatio || 0}% likes)`).join('\n') || 'No live data available'}
`

        prompt = `You are a Roblox game idea generator. Generate 3 COMPLETE, READY-TO-USE game concepts based on this proven formula and current market trends.

${formulaContext}

For each game idea, you MUST:
1. Create a unique, catchy game name (use brainrot/trending themes when appropriate)
2. Design a specific unique hook that makes it 20% better than existing games
3. Specify all core mechanics (be detailed, not generic)
4. Use the proven monetization from the formula
5. Include the proven retention hooks
6. Make it feel FRESH and exciting, not a clone

Generate ideas that:
- Are inspired by the formula but NOT copies of the example games
- Use current trending themes (brainrot, anime, etc.) when relevant
- Have a clear unique selling point
- Would appeal to Roblox players RIGHT NOW

Return in this EXACT JSON format:
{
  "ideas": [
    {
      "name": "<catchy, trending game name>",
      "uniqueHook": "<what makes THIS version special - be specific, 2-3 sentences>",
      "coreLoop": "<detailed gameplay loop>",
      "mechanics": ["<specific mechanic 1>", "<specific mechanic 2>", ...],
      "monetization": ["<proven strategy 1>", "<proven strategy 2>", ...],
      "retention": ["<proven hook 1>", "<proven hook 2>", ...],
      "viral": ["<viral tactic 1>", "<viral tactic 2>", ...],
      "whyNow": "<why this would work right now - reference emerging trends>",
      "difficulty": "<Low/Medium/High>"
    }
  ]
}

Make each idea COMPLETE and READY TO BUILD. Be creative but grounded in what actually works on Roblox.
Return ONLY valid JSON, no other text.`
        break

      case 'generate-hybrid':
        // Auto-generate complete hybrid game ideas
        const hybridContext = `
BASE MECHANIC (Proven gameplay):
- Template: ${data.baseMechanic.template}
- Core Loop: ${data.baseMechanic.coreLoop}
- Core Mechanics: ${data.baseMechanic.mechanics?.join(', ') || 'Standard mechanics'}
- Qualification Score: ${data.baseMechanic.qualificationScore}/100

TRENDING THEME:
- Theme: ${data.theme.theme}
- Description: ${data.theme.description || data.theme.theme}

EMERGING STARS DATA (live trending games):
${data.emergingGames?.map((g: any) => `- ${g.name} (${g.metrics?.currentPlayers || 0} CCU, ${g.metrics?.likeRatio || 0}% likes)`).join('\n') || 'No live data available'}
`

        prompt = `You are a Roblox hybrid game idea generator. Create 3 COMPLETE, INNOVATIVE game concepts that blend this proven mechanic with this trending theme.

${hybridContext}

You're creating HYBRID games - blend the mechanic and theme in creative ways. Examples:
- "Skibidi Toilet Escape" = Escape mechanic + Brainrot theme
- "Anime Tower Defense" = TD mechanic + Anime theme
- "Horror Simulator" = Simulator mechanic + Horror theme

For each hybrid idea, you MUST:
1. Create a catchy name that combines both elements
2. Design a unique hook that blends mechanic + theme in an interesting way
3. Specify exactly HOW the theme changes the base mechanic
4. Include all necessary mechanics for the base template
5. Add theme-specific features that make it unique

Generate ideas that:
- Feel FRESH and innovative, not generic
- Actually blend the mechanic and theme (don't just reskin)
- Would stand out on Roblox TODAY
- Have viral potential

Return in this EXACT JSON format:
{
  "ideas": [
    {
      "name": "<catchy hybrid game name>",
      "uniqueHook": "<how this hybrid is special - 2-3 sentences>",
      "coreLoop": "<gameplay loop with theme integration>",
      "mechanics": ["<base mechanic 1>", "<theme-specific mechanic>", ...],
      "monetization": ["<strategy 1>", "<strategy 2>", ...],
      "retention": ["<hook 1>", "<hook 2>", ...],
      "viral": ["<tactic 1>", "<tactic 2>", ...],
      "themeIntegration": "<how the theme changes the base mechanic>",
      "whyNow": "<why this hybrid would work right now>",
      "difficulty": "<Low/Medium/High>"
    }
  ]
}

Make each idea COMPLETE and EXCITING. Show how the hybrid creates something new.
Return ONLY valid JSON, no other text.`
        break

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const message = await anthropic!.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: SYSTEM_PROMPT,
    })

    // Extract text content
    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    // Try to parse as JSON if applicable
    let result = content.text
    if (action !== 'help-articulate') {
      try {
        result = JSON.parse(content.text)
      } catch {
        // If JSON parsing fails, return raw text
        console.error('Failed to parse AI response as JSON:', content.text)
      }
    }

    return NextResponse.json({ result })

  } catch (error: unknown) {
    console.error('AI API error:', error)
    const message = error instanceof Error ? error.message : 'AI request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
