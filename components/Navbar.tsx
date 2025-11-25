import { ModeToggle } from "@/components/ModeToggle";
import UserProfile from "@/components/UserProfile";
import Link from "next/link";

export default function Navbar() {
    return (
        <div className="w-2xl mx-auto">
            <nav className="  flex gap-[10vw] backdrop-blur-lg justify-around items-center border dark:border-gray-100/10 dark:bg-gray-100/10 bg-gray-500/10 border-gray-500/10 rounded-full m-4 py-4 px-2">
                <Link href="/">
                    <h1 style={{ fontFamily: "cinzel" }} className="text-2xl dark:text-white  text-black font-semibold">Ocean</h1>
                </Link>
                <div className="flex justify-center items-center gap-8">
                    <ModeToggle />
                    <UserProfile />
                </div>
            </nav>
        </div>
    )
}
