import { Toaster } from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className=" mx-auto border-r border-l  w-4xl">
            <main>
                {children}
                <Toaster/>
            </main>
        </div>
    )
}
