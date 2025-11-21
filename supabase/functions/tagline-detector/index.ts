import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tagline } = await req.json();

    if (!tagline || typeof tagline !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Tagline text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Analyze tagline with Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a trademark and tagline copyright detection AI. Analyze taglines for potential trademark violations or similarity to existing famous brand slogans. 

Return a JSON object with:
{
  "verdict": "copyrighted" | "possibly" | "clear",
  "confidence": number (0-100),
  "matchedBrand": string (if copyrighted or possibly),
  "matchedTagline": string (if copyrighted or possibly),
  "similarity": number (0-100, if copyrighted or possibly),
  "explanation": string
}

Rules:
- "copyrighted": Exact match or nearly identical to a known registered trademark slogan
- "possibly": Suspiciously similar or contains key trademark phrases
- "clear": Original or sufficiently different from known trademarks`
          },
          {
            role: 'user',
            content: `Analyze this tagline for trademark violations: "${tagline}"`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Parse AI response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI analysis');
    }

    return new Response(
      JSON.stringify({
        verdict: analysis.verdict || 'clear',
        confidence: analysis.confidence || 0,
        matchedBrand: analysis.matchedBrand || null,
        matchedTagline: analysis.matchedTagline || null,
        similarity: analysis.similarity || null,
        explanation: analysis.explanation || 'Analysis complete',
        analyzedText: tagline,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in tagline-detector function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
