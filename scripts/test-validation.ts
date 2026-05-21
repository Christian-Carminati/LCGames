import { GameSchema } from '../src/lib/validations';

const samplePayload = {
  title: 'My Game',
  platform: 'C64 LC-Games',
  genre: '',
  description: '',
  url: '',
  imageUrl: '',
  romPath: '',
  youtubeUrl: '',
  published: true,
  difficultyConfig: null,
  palNtscConfig: null,
  scoreConfig: null
};

const result = GameSchema.safeParse(samplePayload);
console.log("=== Test 1: Empty configs (null) ===");
console.log("Validation Success:", result.success);
if (!result.success) {
  console.log("Validation Errors:", JSON.stringify(result.error.format(), null, 2));
} else {
  console.log("OK\n");
}

// Test 2: Filled configs
const filledPayload = {
  title: 'My Game',
  platform: 'C64 LC-Games',
  difficultyConfig: {
    address: '0x2299',
    baseOffset: '0x0000',
    numLevels: 3,
    levelNames: ['Easy', 'Medium', 'Hard']
  },
  palNtscConfig: {
    address: '0x2300',
    baseOffset: '0x0000',
    numStandards: 2
  },
  scoreConfig: {
    address: '0x0800',
    type: 'byte',
    length: 1,
    multiplier: 1,
    baseOffset: '0x0000',
    endianness: 'big'
  }
};

const result2 = GameSchema.safeParse(filledPayload);
console.log("=== Test 2: Filled configs ===");
console.log("Validation Success:", result2.success);
if (!result2.success) {
  console.log("Validation Errors:", JSON.stringify(result2.error.format(), null, 2));
} else {
  console.log("OK\n");
}
