
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  const isAdmin = !!adminToken;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-4 gap-6">
      <div className="text-center">
        <p className="mb-2 text-sm md:text-base">**** COMMODORE 64 BASIC V2 ****</p>
        <p className="mb-4 text-sm md:text-base">64K RAM SYSTEM  38911 BASIC BYTES FREE</p>
        
        <div className="mt-4 text-left w-full max-w-lg mx-auto">
          <p>READY.</p>
          <div className="animate-pulse inline-block w-4 h-4 bg-c64-text align-middle mt-2"></div>
        </div>
      </div>

      {/* Welcome Text Section */}
      <div className="nes-container is-dark with-title is-rounded max-w-2xl w-full">
        <p className="title">Welcome to LC-Games Archive!</p>
        <div className="flex flex-col gap-3 text-gray-200">
          <p className="text-sm md:text-base">
            Relive the golden age of gaming with the online Commodore 64 emulator. No downloads required—just pure retro fun directly in your browser!
          </p>
          <div className="mt-1">
            <p className="text-yellow-400 font-bold text-sm md:text-base">🏆 High Score Challenge:</p>
            <p className="text-sm md:text-base">Log in to save your scores and compete with players worldwide. Can you reach the top of the leaderboard?</p>
          </div>
          <div className="mt-2 text-center">
            <p className="text-green-400 font-bold mb-2 text-sm md:text-base">👇 PLAY NOW:</p>
            <p className="text-sm md:text-base">Click below to start your journey back to the 80s!</p>
            <Link href="/games" className="nes-btn is-primary mt-3">PLAY NOW</Link>
            {isAdmin && (
             <Link href="/admin" className="nes-btn is-error">ADMIN PANEL</Link>
           )}
          </div>
        </div>
      </div>

      {/* Credits - Bottom of page */}
      <div className="nes-container is-dark with-title is-rounded max-w-2xl w-full">
        <p className="title">Credits</p>
        <div className="flex flex-col gap-2 text-xs md:text-sm text-gray-300">
           <p><span className="text-c64-text">Site Developer:</span> Christian Carminati</p>
           <p><span className="text-c64-text">Tester:</span> Luca Carminati</p>
           <p><span className="text-c64-text">Tester:</span> Stefano Carminati</p>
        </div>
      </div>
    </div>
  );
}
