import axios from 'axios';
import FormData from 'form-data';
import { put } from '@vercel/blob';

const VEO_API_KEY = process.env.VEO_API_KEY;
const VEO_API_URL = 'https://api.veo.ai/v1'; // Update with actual Veo 3.1 API URL

/**
 * Generates an animation using Veo 3.1 API
 */
export async function generateAnimation(prompt: string): Promise<{
  videoUrl: string;
  thumbnailUrl: string;
}> {
  if (!VEO_API_KEY) {
    throw new Error('VEO_API_KEY is not set');
  }

  try {
    // Step 1: Create generation job
    const createResponse = await axios.post(
      `${VEO_API_URL}/generations`,
      {
        prompt: prompt,
        duration: 2, // 2 seconds
        loop: true,
        style: '3d_plush',
        quality: 'high',
      },
      {
        headers: {
          'Authorization': `Bearer ${VEO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const jobId = createResponse.data.id;

    // Step 2: Poll for completion
    let status = 'processing';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s intervals)

    while (status === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await axios.get(
        `${VEO_API_URL}/generations/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${VEO_API_KEY}`,
          },
        }
      );

      status = statusResponse.data.status;

      if (status === 'completed') {
        const videoUrl = statusResponse.data.video_url;
        const thumbnailUrl = statusResponse.data.thumbnail_url || videoUrl;

        // Step 3: Upload to Vercel Blob
        const videoBlobUrl = await uploadToBlob(videoUrl, `animations/${jobId}.mp4`);
        const thumbnailBlobUrl = await uploadToBlob(thumbnailUrl, `thumbnails/${jobId}.jpg`);

        return {
          videoUrl: videoBlobUrl,
          thumbnailUrl: thumbnailBlobUrl,
        };
      }

      if (status === 'failed') {
        throw new Error(`Veo generation failed: ${statusResponse.data.error}`);
      }

      attempts++;
    }

    throw new Error('Veo generation timed out');
  } catch (error: any) {
    console.error('Veo API error:', error);
    
    // Fallback: Return placeholder URLs for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using placeholder URLs in development mode');
      return {
        videoUrl: 'https://example.com/placeholder-video.mp4',
        thumbnailUrl: 'https://example.com/placeholder-thumbnail.jpg',
      };
    }
    
    throw error;
  }
}

/**
 * Uploads a file from URL to Vercel Blob
 */
async function uploadToBlob(url: string, path: string): Promise<string> {
  const BLOB_WRITE_TOKEN = process.env.BLOB_WRITE_TOKEN;

  if (!BLOB_WRITE_TOKEN) {
    throw new Error('BLOB_WRITE_TOKEN is not set');
  }

  try {
    // Download the file
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Upload to Vercel Blob
    const blob = await put(path, buffer, {
      access: 'public',
      token: BLOB_WRITE_TOKEN,
    });

    return blob.url;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw error;
  }
}

/**
 * Extracts a thumbnail frame from video (placeholder - would need actual video processing)
 */
export async function extractThumbnail(videoUrl: string): Promise<string> {
  // In a real implementation, you would:
  // 1. Download the video
  // 2. Use ffmpeg or similar to extract a frame
  // 3. Upload the frame to blob
  
  // For now, return the video URL as placeholder
  // In production, implement actual frame extraction
  return videoUrl;
}

