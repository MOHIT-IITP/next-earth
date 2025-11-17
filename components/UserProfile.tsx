import { auth } from "@/lib/auth"
import LogOut from "./logout";
import Link from "next/link";
import { Button } from "./ui/button";

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
            ): (<div>
                    <div>
                        {user?.user?.name}
                    </div>
                    <div>
                        <img src={user?.user?.image}/> 
                    </div>
                    <div>{user?.user?.email}</div>
                    <LogOut/>
                </div>)}
        </>
    )
}
