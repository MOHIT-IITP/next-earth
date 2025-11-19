import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import RoundedButton from "@/components/ui/rounded-button";

export default async function Login () {
    const user = await auth();
    if(user){
        redirect("/");
    }
    const Login =  async() => {
        "use server"
        await signIn("github")
    }
    return <>
        <div className="min-h-screen dark:bg-neutral-600 flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white dark:bg-neutral-700 shadow-lg rounded-xl p-6">
                <h2 className="text-xl mb-5 text-gray-900 dark:text-gray-100">Login to your Account</h2>
                <p className="text-gray-400 text-lg">Use Github button to login to your account</p>
                <div className="flex mt-10 justify-center items-center gap-3">
                    <Link
                        href="/">
                        <RoundedButton
                        >
                            Home
                        </RoundedButton>
                    </Link>
                    <Button
                        onClick={Login}
                    >
                        Login with <FaGithub/>
                    </Button>
                </div>
            </div>
        </div>
    </>
}
