import { ModeToggle } from "@/components/ModeToggle";
import UserProfile from "@/components/UserProfile";
import Link from "next/link";

export default function Navbar() {
    return (
        <div className=" w-full bg-transparent absolute  z-20 flex justify-center items-center">
            <nav className="flex backdrop-blur-lg justify-around items-center border gap-[30vw] dark:border-gray-100/10 dark:bg-gray-100/10 bg-gray-500/10 border-gray-500/10 rounded-full m-4 py-4 px-8">
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
