'use client';



interface EmulatorProps {
  romPath: string | null;
}

export function Emulator({ romPath }: EmulatorProps) {
  if (!romPath) {
     return (
        <div className="aspect-[4/3] bg-c64-bg border-8 border-c64-border flex items-center justify-center text-c64-text font-c64">
           INSERT CARTRIDGE (ROM MISSING)
        </div>
     );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="aspect-[4/3] w-full border-8 border-c64-border bg-black">
        <iframe 
            src={`/emulator.html?rom=${encodeURIComponent(romPath)}`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad"
            title="C64 Emulator"
        />
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Powered by EmulatorJS. Controls: Arrow Keys + Z (Fire) + Enter (Start).
        <br/>
        Click inside the screen to enable audio/input.
      </div>
    </div>
  );
}
