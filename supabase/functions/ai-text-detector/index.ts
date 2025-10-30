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
    const { text } = await req.json();
    
    if (!text || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Text must be at least 50 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are an expert AI text detector. Analyze the given text and determine if it's AI-generated or human-written.

Consider these factors:
- AI text often has perfect grammar, repetitive patterns, lacks personal anecdotes
- Human text has natural imperfections, varied sentence structures, personal voice
- AI may use formal language, generic phrases, predictable structure
- Humans show emotion, use colloquialisms, make typos occasionally

Respond ONLY with a JSON object in this exact format:
{"isAI": boolean, "confidence": number}

Where confidence is 0-100. Be accurate but humble in your assessment.` 
          },
          { role: "user", content: `Analyze this text:\n\n${text}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI Response:", aiResponse);

    // Parse the JSON response from AI
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      // Fallback: try to extract confidence from text
      const confidenceMatch = aiResponse.match(/(\d+)%?/);
      const hasAI = aiResponse.toLowerCase().includes('ai');
      result = {
        isAI: hasAI,
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50
      };
    }

    // Ensure confidence is within bounds
    result.confidence = Math.max(0, Math.min(100, result.confidence));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-text-detector function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
