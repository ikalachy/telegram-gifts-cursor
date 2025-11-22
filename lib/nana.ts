import axios from 'axios';

const NANA_API_KEY = process.env.NANA_KEY;
const NANA_API_URL = 'https://api.nanabanana.ai/v1'; // Update with actual API URL

interface PromptResult {
  prompt: string;
  animals: string[];
  accessories: string[];
}

/**
 * Generates a prompt for daily plush gift
 */
export async function generateDailyPrompt(
  animal: string,
  accessory: string,
  userStyle: string = 'kawaii'
): Promise<PromptResult> {
  const basePrompt = `Generate a 2-second loopable animation of a cute 3D plush ${animal}. 
Soft fluffy texture, pastel colors, big shiny eyes. 
Accessory: ${accessory}. 
Movement: blinking, breathing, tiny bounce. 
Loop seamlessly. 
Style: ${userStyle}.`;

  // If NanaBanana API is available, use it to enhance the prompt
  if (NANA_API_KEY) {
    try {
      const response = await axios.post(
        `${NANA_API_URL}/generate`,
        {
          base_prompt: basePrompt,
          style: userStyle,
          type: 'plush',
        },
        {
          headers: {
            'Authorization': `Bearer ${NANA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        prompt: response.data.enhanced_prompt || basePrompt,
        animals: [animal],
        accessories: [accessory],
      };
    } catch (error) {
      console.error('NanaBanana API error, using base prompt:', error);
    }
  }

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
  
  const basePrompt = `Create a loopable plush hybrid of ${animal1} and ${animal2}, kawaii proportions, pastel colors.  
Rare trait: ${legendaryTrait}.  
Add floating particles + glow.
Accessories: ${allAccessories}.
Loop seamlessly for 2 seconds.`;

  if (NANA_API_KEY) {
    try {
      const response = await axios.post(
        `${NANA_API_URL}/generate`,
        {
          base_prompt: basePrompt,
          style: 'kawaii',
          type: 'fusion',
          animals: [animal1, animal2],
        },
        {
          headers: {
            'Authorization': `Bearer ${NANA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        prompt: response.data.enhanced_prompt || basePrompt,
        animals: [animal1, animal2],
        accessories: allAccessories.split(', '),
      };
    } catch (error) {
      console.error('NanaBanana API error, using base prompt:', error);
    }
  }

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
  
  const basePrompt = `Legendary plush merging ${animal1}, ${animal2}, and ${animal3}.  
Golden glow, magical sparkles, levitation.  
Kawaii style. Loop 2 seconds.
Accessories: ${allAccessories}.
Epic proportions, divine aura.`;

  if (NANA_API_KEY) {
    try {
      const response = await axios.post(
        `${NANA_API_URL}/generate`,
        {
          base_prompt: basePrompt,
          style: 'legendary',
          type: 'legendary_fusion',
          animals: [animal1, animal2, animal3],
        },
        {
          headers: {
            'Authorization': `Bearer ${NANA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        prompt: response.data.enhanced_prompt || basePrompt,
        animals: [animal1, animal2, animal3],
        accessories: accessories,
      };
    } catch (error) {
      console.error('NanaBanana API error, using base prompt:', error);
    }
  }

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

