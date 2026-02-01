import { signIn } from "@/auth"

export default function UserLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212529] font-['Press_Start_2P']">
      <div className="nes-container is-dark with-title max-w-md w-full text-center">
        <p className="title">User Login</p>
        
        <div className="py-8">
            <p className="text-sm mb-8 text-gray-400">Join the High Score Board</p>
            
            <form
              action={async () => {
                "use server"
                await signIn("google", { redirectTo: "/" })
              }}
            >
              <button type="submit" className="nes-btn is-primary w-full flex items-center justify-center gap-2">
                 Sign in with Google
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
