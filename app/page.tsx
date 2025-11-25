import RoundedButton from '@/components/ui/rounded-button';
import Link from 'next/link';

export default async function Home() {
    return (
        <div className="relative w-full h-screen min-h-screen overflow-hidden">
            <div className="absolute w-full h-full inset-0 z-0">
                {/* add background here  */}
            </div>

            <div className="relative z-10 flex gap-10 flex-col items-center justify-center h-full w-full">
                <h1 style={{ fontFamily: "cinzel" }} className="text-4xl dark:text-white text-black font-semibold text-center px-4">
                    Ocean - Explore the <br /> Depths of Knowledge
                </h1>
                <div className='flex justify-center items-center gap-8'>
                    <Link href="/profile">
                    <RoundedButton>Get Started</RoundedButton>
                    </Link>
                    <Link href="/project">
                    <RoundedButton>Create Project</RoundedButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}



