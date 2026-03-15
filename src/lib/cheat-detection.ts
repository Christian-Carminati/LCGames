export function checkCheatsEnabled(romPath: string): { hasCheats: boolean; cheatCount: number } {
  if (typeof window === 'undefined' || !romPath) {
    return { hasCheats: false, cheatCount: 0 };
  }
  
  const settingsKey = `ejs-1-c64-${romPath}-settings`;
  try {
    const settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    const cheats = settings.cheats || [];
    return { hasCheats: cheats.length > 0, cheatCount: cheats.length };
  } catch {
    return { hasCheats: false, cheatCount: 0 };
  }
}
