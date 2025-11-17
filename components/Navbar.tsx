import { ModeToggle } from "@/components/ModeToggle";
import UserProfile from "@/components/UserProfile";

export default function Navbar(){
    return (
    <div>
            <nav className="flex justify-around items-center pt-2">
                <h1 className="text-2xl text-amber-500 font-semibold">Ocean</h1> 
                <div className="flex justify-center items-center gap-8">
                    <ModeToggle/>
                    <UserProfile/>
                </div>
            </nav>
        </div>
    )
}
