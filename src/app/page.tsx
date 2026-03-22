
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  const isAdmin = !!adminToken;

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-8">
      <div className="text-center">
        <p className="mb-4">**** COMMODORE 64 BASIC V2 ****</p>
        <p className="mb-8">64K RAM SYSTEM  38911 BASIC BYTES FREE</p>
        
        <div className="mt-12 text-left w-full max-w-lg mx-auto">
          <p>READY.</p>
          <div className="animate-pulse inline-block w-4 h-4 bg-c64-text align-middle mt-2"></div>
        </div>
      </div>

      <div className="nes-container is-dark with-title is-rounded max-w-2xl w-full mt-12 mb-4">
        <p className="title">Credits</p>
        <div className="flex flex-col gap-2 text-sm text-gray-300">
           <p><span className="text-c64-text">Site Developer:</span> Christian Carminati</p>
           <p><span className="text-c64-text">Game Developer:</span> Luca Carminati</p>
           <p><span className="text-c64-text">Tester:</span> Stefano Carminati</p>
        </div>
      </div>

      <div className="nes-container is-dark with-title is-rounded max-w-2xl w-full mt-4">
        <p className="title">Project Initialization</p>
        <p>LC-Games Archive loaded successfully.</p>
        <div className="mt-4 flex gap-4 justify-center">
           <Link href="/games" className="nes-btn is-primary">START GAME</Link>
           {isAdmin && (
             <Link href="/admin" className="nes-btn is-error">ADMIN PANEL</Link>
           )}
        </div>
      </div>
    </div>
  );
}
