import { auth } from "@/lib/auth"
import LogOut from "./logout";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function UserProfile (){
    const user =  await auth();
    return(
        <>
            {!user ? (
                <Link href="/login">
                    <Button>
                        Login
                    </Button>
                </Link>
            ): (<div className="flex justify-center items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar>
                                <AvatarImage src={user?.user?.image} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>

                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>{user?.user?.name}</DropdownMenuItem>
                            <DropdownMenuItem>{user?.user?.email}</DropdownMenuItem>
                            <DropdownMenuItem>
                                <LogOut/>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>)}
        </>
    )
}
