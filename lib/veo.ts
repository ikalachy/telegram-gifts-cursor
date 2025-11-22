import axios from 'axios';
import { put } from '@vercel/blob';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

/**
 * Generates an image using Gemini Nano Banana (image generation)
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */
export async function generateAnimation(prompt: string): Promise<{
  videoUrl: string;
  thumbnailUrl: string;
}> {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set');
  }

  try {
    // Call Gemini API for image generation
    // Using REST API format as per: https://ai.google.dev/gemini-api/docs/image-generation
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: prompt }
          ]
        }],
        generationConfig: {
          imageConfig: {
            aspectRatio: '1:1'
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract image data from response
    let imageData: string | null = null;
    
    for (const candidate of response.data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          break;
        }
      }
      if (imageData) break;
    }

    if (!imageData) {
      throw new Error('No image data returned from Gemini API');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Upload to Vercel Blob
    const BLOB_WRITE_TOKEN = process.env.BLOB_WRITE_TOKEN;
    if (!BLOB_WRITE_TOKEN) {
      throw new Error('BLOB_WRITE_TOKEN is not set');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const imagePath = `images/${timestamp}-${randomId}.png`;

    // Upload image to blob (using same URL for both videoUrl and thumbnailUrl since it's a static image)
    const blob = await put(imagePath, imageBuffer, {
      access: 'public',
      token: BLOB_WRITE_TOKEN,
      contentType: 'image/png',
    });

    return {
      videoUrl: blob.url,
      thumbnailUrl: blob.url, // Same URL for thumbnail since it's a static image
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Fallback: Return placeholder URLs for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using placeholder URLs in development mode');
      return {
        videoUrl: 'https://via.placeholder.com/1024?text=Generated+Image',
        thumbnailUrl: 'https://via.placeholder.com/1024?text=Generated+Image',
      };
    }
    
    throw error;
  }
}

/**
 * @deprecated This function is no longer used. Images are generated directly.
 * Kept for backwards compatibility.
 */
export async function extractThumbnail(imageUrl: string): Promise<string> {
  // For static images, the URL is already the thumbnail
  return imageUrl;
}
