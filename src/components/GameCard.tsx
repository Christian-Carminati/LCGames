import Link from 'next/link';
import Image from 'next/image';

interface GameCardProps {
  title: string;
  imageUrl: string;
  url: string; // This was "url" prop from JSON, but essentially unused in Link except if it's external?
  // Wait, in usage: <GameCard key={index} title={game.title} imageUrl={game.imageUrl} url={game.url} />
  // Inside: <Link href={`/games/${slug}`} ...>
  // So "url" prop was NOT used for internal routing, but maybe for external link? 
  // No, the code had `href={'/games/${slug}'}`. 
  // I should add `slug` prop explicitly.
  slug: string;
}

export function GameCard({ title, imageUrl, slug }: GameCardProps) {
  // const slug = slugify(title); // REMOVED dependency on slugify
  
  return (
    <div className="nes-container is-rounded is-dark with-title h-full flex flex-col">
      <p className="title text-xs w-[95%] block break-words leading-tight bg-c64-bg pr-2">{title}</p>
      
      <div className="relative w-full aspect-[315/250] mb-4 bg-black border-4 border-c64-border">
        {imageUrl ? (
            <Image 
                src={imageUrl} 
                alt={title}
                fill
                className="object-cover rendering-pixelated"
                unoptimized
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-c64-text">
                NO IMAGE
            </div>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <Link href={`/games/${slug}`} className="nes-btn is-primary w-full text-xs">
            DETAILS
        </Link>
      </div>
    </div>
  );
}
