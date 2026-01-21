import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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
  try {
    const { action, data } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
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

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
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
