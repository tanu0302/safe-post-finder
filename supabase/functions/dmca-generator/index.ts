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
    const formData = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a legal document expert specializing in DMCA takedown notices. Generate a professional, legally sound DMCA takedown notice based on the provided information. The notice should be formal, clear, and include all legally required elements.

Format the notice as a complete, ready-to-send document with proper structure and professional language.`
          },
          {
            role: 'user',
            content: `Generate a DMCA takedown notice with the following information:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Address: ${formData.address}

Original Work Description: ${formData.workDescription}
Original Work Location: ${formData.originalLocation}

Infringing Content URL: ${formData.infringingUrl}
Platform: ${formData.platform}
Description of Infringement: ${formData.infringementDescription}

Additional Information: ${formData.additionalInfo || 'None provided'}

Please generate a complete, professional DMCA takedown notice that includes:
1. A clear subject line
2. Proper greeting
3. Identification of the copyrighted work
4. Identification of the infringing material
5. Contact information
6. Good faith statement
7. Statement of accuracy under penalty of perjury
8. Physical or electronic signature
9. Professional closing

Make it legally sound and ready to send to the platform.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate DMCA notice');
    }

    const data = await response.json();
    const generatedNotice = data.choices[0].message.content;
    
    console.log('DMCA notice generated successfully');

    return new Response(
      JSON.stringify({ notice: generatedNotice }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in dmca-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
