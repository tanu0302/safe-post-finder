import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload image to storage
    const filename = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logo-images')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('logo-images')
      .getPublicUrl(filename);

    // Convert file to base64 for AI analysis
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Analyze image with Lovable AI
    console.log('Analyzing image with AI...');
    const startTime = Date.now();
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and detect all company logos, brand marks, or recognizable brand symbols. 

For each logo detected, provide detailed analysis:
1. Logo/brand name
2. Confidence score (0-1)
3. Bounding box coordinates as percentages (x, y, width, height)
4. Dominant colors in the logo (hex codes)
5. Logo quality assessment (clarity, resolution, visibility)
6. Potential trademark concerns (generic vs distinctive)

Also provide overall image analysis:
- Total logos detected
- Image quality assessment
- Recommended actions

Return ONLY a JSON object in this exact format:
{
  "detections": [
    {
      "logo_name": "Brand Name",
      "confidence": 0.95,
      "bbox": {"x": 10.5, "y": 20.3, "width": 15.2, "height": 8.7},
      "colors": ["#FF0000", "#0000FF"],
      "quality": "High clarity, well-positioned",
      "trademark_risk": "Distinctive brand mark"
    }
  ],
  "metadata": {
    "total_logos": 2,
    "image_quality": "High resolution, good lighting",
    "recommendations": ["Consider trademark search", "High commercial value"]
  }
}

If no logos detected, return: {"detections": [], "metadata": {"total_logos": 0, "image_quality": "assessed", "recommendations": []}}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.3
      }),
    });
    
    const processingTime = Date.now() - startTime;

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = await aiResponse.json();
    let detections = [];
    let metadata = {};
    
    try {
      const content = aiResult.choices?.[0]?.message?.content || '{}';
      console.log('AI response:', content);
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        detections = parsed.detections || [];
        metadata = parsed.metadata || {};
      } else {
        detections = [];
        metadata = {};
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      detections = [];
      metadata = {};
    }

    // Save detection result to database
    const { data: detectionData, error: dbError } = await supabase
      .from('logo_detections')
      .insert({
        filename: file.name,
        image_url: publicUrl,
        detections: detections,
        analysis_metadata: metadata,
        processing_time_ms: processingTime,
        status: 'completed'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to save detection results' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      id: detectionData.id,
      filename: file.name,
      image_url: publicUrl,
      detections: detections,
      metadata: metadata,
      processing_time_ms: processingTime,
      timestamp: detectionData.created_at
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in logo-detector function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});