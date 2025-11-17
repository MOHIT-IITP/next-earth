import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignIn(){
    const user = await auth();
    if(user){
        redirect("/home")
    }
    return (
        <form
            action={async () => {
                "use server"
                await signIn("github")
            }}
        >
            <button type="submit">
                SignIn with Github
            </button>
        </form>
    )
}
