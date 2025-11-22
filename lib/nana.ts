// This file handles prompt generation for Gemini Nano Banana image generation
// No external API calls needed - prompts are generated directly

interface PromptResult {
  prompt: string;
  animals: string[];
  accessories: string[];
}

/**
 * Generates a prompt for daily plush gift (image generation)
 */
export async function generateDailyPrompt(
  animal: string,
  accessory: string,
  userStyle: string = 'kawaii'
): Promise<PromptResult> {
  const basePrompt = `Create a high-quality image of a cute 3D plush ${animal}. 
Soft fluffy texture, pastel colors, big shiny eyes. 
Accessory: ${accessory}. 
Style: ${userStyle}. 
Studio lighting, clean background, professional photography style.`;

  // Direct prompt generation - no external API needed
  // Gemini Nano Banana will handle the image generation directly

  return {
    prompt: basePrompt,
    animals: [animal],
    accessories: [accessory],
  };
}

/**
 * Generates a prompt for fusion plush (2 gifts)
 */
export async function generateFusionPrompt(
  animal1: string,
  animal2: string,
  accessories1: string[],
  accessories2: string[],
  legendaryTrait: string = 'sparkles'
): Promise<PromptResult> {
  const allAccessories = [...new Set([...accessories1, ...accessories2])].join(', ');
  
  const basePrompt = `Create a high-quality image of a plush hybrid of ${animal1} and ${animal2}, kawaii proportions, pastel colors.  
Rare trait: ${legendaryTrait}.  
Add floating particles + glow.
Accessories: ${allAccessories}.
Studio lighting, magical atmosphere, professional photography style.`;

  // Direct prompt generation - no external API needed

  return {
    prompt: basePrompt,
    animals: [animal1, animal2],
    accessories: allAccessories.split(', ').filter(Boolean),
  };
}

/**
 * Generates a prompt for legendary fusion (3 gifts)
 */
export async function generateLegendaryPrompt(
  animal1: string,
  animal2: string,
  animal3: string,
  accessories: string[]
): Promise<PromptResult> {
  const allAccessories = accessories.join(', ');
  
  const basePrompt = `Create a high-quality image of a legendary plush merging ${animal1}, ${animal2}, and ${animal3}.  
Golden glow, magical sparkles, levitation effect.  
Kawaii style.
Accessories: ${allAccessories}.
Epic proportions, divine aura, studio lighting, professional photography style.`;

  // Direct prompt generation - no external API needed

  return {
    prompt: basePrompt,
    animals: [animal1, animal2, animal3],
    accessories: accessories,
  };
}

/**
 * Random animal generator for daily gifts
 */
export function getRandomAnimal(): string {
  const animals = [
    'cat', 'dog', 'bunny', 'bear', 'panda', 'fox', 'owl', 
    'penguin', 'koala', 'sloth', 'hedgehog', 'raccoon'
  ];
  return animals[Math.floor(Math.random() * animals.length)];
}

/**
 * Random accessory generator
 */
export function getRandomAccessory(): string {
  const accessories = [
    'bow tie', 'crown', 'scarf', 'glasses', 'hat', 'flower',
    'ribbon', 'bell', 'star', 'heart', 'wings', 'halo'
  ];
  return accessories[Math.floor(Math.random() * accessories.length)];
}

/**
 * Random legendary trait generator
 */
export function getRandomLegendaryTrait(): string {
  const traits = [
    'sparkles', 'rainbow aura', 'crystal wings', 'magical glow',
    'stardust trail', 'cosmic patterns', 'prismatic shine'
  ];
  return traits[Math.floor(Math.random() * traits.length)];
}

