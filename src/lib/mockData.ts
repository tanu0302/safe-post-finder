export interface MockLogo {
  id: string;
  name: string;
  file: string;
}

export interface MockTagline {
  id: string;
  text: string;
}

export interface MockAudio {
  id: string;
  name: string;
  file: string;
}

export interface MockImage {
  id: string;
  name: string;
  file: string;
}

export interface MockText {
  id: string;
  content: string;
}

export interface MockURL {
  id: string;
  url: string;
}

export interface CheckResult {
  id: string;
  type: 'logo' | 'tagline' | 'audio' | 'image' | 'text' | 'url';
  verdict: 'copyrighted' | 'possibly' | 'clear';
  confidence: number;
  matchedItem?: string;
  timestamp: Date;
  content: string;
}

export const mockDatabase = {
  logos: [
    { id: "l1", name: "Vinttra", file: "vinttra_logo.png" },
    { id: "l2", name: "TechFlow", file: "techflow_logo.png" },
    { id: "l3", name: "NexaCore", file: "nexacore_logo.png" },
  ] as MockLogo[],
  
  taglines: [
    { id: "t1", text: "Connecting the Future" },
    { id: "t2", text: "Innovation at Your Fingertips" },
    { id: "t3", text: "Think Different" },
    { id: "t4", text: "Just Do It" },
  ] as MockTagline[],
  
  audios: [
    { id: "a1", name: "Brand Jingle 1", file: "brand_jingle.mp3" },
    { id: "a2", name: "Startup Sound", file: "startup_sound.mp3" },
    { id: "a3", name: "Corporate Theme", file: "corporate_theme.mp3" },
  ] as MockAudio[],
  
  images: [
    { id: "i1", name: "Meme Template", file: "meme1.png" },
    { id: "i2", name: "Viral Image", file: "viral_image.png" },
    { id: "i3", name: "Stock Photo A", file: "stock_a.png" },
  ] as MockImage[],
  
  texts: [
    { id: "x1", content: "Just Do It" },
    { id: "x2", content: "I'm Lovin' It" },
    { id: "x3", content: "The Ultimate Driving Machine" },
  ] as MockText[],
  
  urls: [
    { id: "u1", url: "https://socialmedia.com/post/12345" },
    { id: "u2", url: "https://socialmedia.com/post/67890" },
  ] as MockURL[],
};

export const checkContent = (
  type: CheckResult['type'],
  content: string
): CheckResult => {
  const id = `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let verdict: CheckResult['verdict'] = 'clear';
  let confidence = 0;
  let matchedItem: string | undefined;

  switch (type) {
    case 'logo':
      const logoMatch = mockDatabase.logos.find(l => 
        content.toLowerCase().includes(l.name.toLowerCase())
      );
      if (logoMatch) {
        verdict = 'copyrighted';
        confidence = 95;
        matchedItem = logoMatch.name;
      } else {
        confidence = 5;
      }
      break;

    case 'tagline':
      const taglineMatch = mockDatabase.taglines.find(t => 
        t.text.toLowerCase() === content.toLowerCase()
      );
      if (taglineMatch) {
        verdict = 'copyrighted';
        confidence = 98;
        matchedItem = taglineMatch.text;
      } else {
        const similarTagline = mockDatabase.taglines.find(t =>
          content.toLowerCase().includes(t.text.toLowerCase().split(' ')[0])
        );
        if (similarTagline) {
          verdict = 'possibly';
          confidence = 65;
          matchedItem = similarTagline.text;
        } else {
          confidence = 8;
        }
      }
      break;

    case 'audio':
      const audioMatch = mockDatabase.audios.find(a =>
        content.toLowerCase().includes(a.name.toLowerCase())
      );
      if (audioMatch) {
        verdict = 'copyrighted';
        confidence = 92;
        matchedItem = audioMatch.name;
      } else {
        confidence = 12;
      }
      break;

    case 'image':
      const imageMatch = mockDatabase.images.find(i =>
        content.toLowerCase().includes(i.name.toLowerCase())
      );
      if (imageMatch) {
        verdict = 'copyrighted';
        confidence = 89;
        matchedItem = imageMatch.name;
      } else {
        confidence = 15;
      }
      break;

    case 'text':
      const textMatch = mockDatabase.texts.find(t =>
        t.content.toLowerCase() === content.toLowerCase()
      );
      if (textMatch) {
        verdict = 'copyrighted';
        confidence = 97;
        matchedItem = textMatch.content;
      } else {
        const similarText = mockDatabase.texts.find(t =>
          content.toLowerCase().includes(t.content.toLowerCase())
        );
        if (similarText) {
          verdict = 'possibly';
          confidence = 72;
          matchedItem = similarText.content;
        } else {
          confidence = 10;
        }
      }
      break;

    case 'url':
      const urlMatch = mockDatabase.urls.find(u =>
        u.url === content
      );
      if (urlMatch) {
        verdict = 'copyrighted';
        confidence = 94;
        matchedItem = urlMatch.url;
      } else {
        confidence = 6;
      }
      break;
  }

  return {
    id,
    type,
    verdict,
    confidence,
    matchedItem,
    timestamp: new Date(),
    content,
  };
};
