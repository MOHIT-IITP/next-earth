"use client"
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";


export default  function LogOut() {

    const logout =  async () => {
        await signOut();
    }

    return (
        <Button onClick={logout} >Logout</Button>
    )
}

