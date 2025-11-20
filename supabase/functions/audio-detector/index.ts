import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, filename } = await req.json();
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('API keys are not configured');
    }

    console.log('Starting audio transcription...');
    
    // First, transcribe the audio using OpenAI Whisper
    const binaryAudio = processBase64Chunks(audio);
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, filename || 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('Transcription error:', errorText);
      throw new Error(`Failed to transcribe audio: ${errorText}`);
    }

    const transcription = await transcriptionResponse.json();
    const audioText = transcription.text;
    
    console.log('Transcription completed:', audioText.substring(0, 100) + '...');
    console.log('Analyzing for copyright...');

    // Then, analyze the transcription for copyright using Lovable AI
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a copyright detection expert specializing in audio content analysis. Analyze transcribed audio content and detect if it contains copyrighted material such as:
- Song lyrics or music compositions
- Movie/TV show dialogue or scripts
- Podcast content
- Audio book narration
- Commercial jingles or branded audio
- Voice performances from known personalities

Respond with a JSON object containing:
- isCopyrighted: boolean (true if copyrighted content detected)
- confidence: number (0-100, confidence percentage)
- contentType: string (e.g., "song lyrics", "movie dialogue", "podcast", "original content")
- suspectedOwner: string (copyright owner name or "Unknown")
- details: string (brief explanation of what was detected)
- reasoning: string (why you think it's copyrighted or not)

Be conservative - if uncertain, mark as "possibly copyrighted" with medium confidence.`
          },
          {
            role: 'user',
            content: `Analyze this audio transcription for copyright:\n\n${audioText}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!analysisResponse.ok) {
      if (analysisResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (analysisResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await analysisResponse.text();
      console.error('AI analysis error:', analysisResponse.status, errorText);
      throw new Error('Failed to analyze audio');
    }

    const analysisData = await analysisResponse.json();
    const aiResponse = analysisData.choices[0].message.content;
    
    // Parse JSON response from AI
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    console.log('Audio copyright detection result:', result);

    return new Response(
      JSON.stringify({
        ...result,
        transcription: audioText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in audio-detector:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
