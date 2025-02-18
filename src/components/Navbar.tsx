'use client'

import { User } from 'next-auth'
import { signOut, useSession } from 'next-auth/react'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

function Navbar() {
    const {data: session} = useSession()
    const user: User = session?.user as User

    return (
        <nav className='p-4 md:p-6 shadow-md bg-black text-white'>
            <div className='container mx-auto flex flex-col md:flex-row items-center justify-between'>
                <Link href='/' className='text-xl font-bold mb-2 md:mb-0'>Stealth Speak</Link>
                {
                    session ? (
                        <>
                            <Link href={"/dashboard"}>
                                <span className='mr-4 font-bold text-xl mb-2 md:mb-0'>Welcome, {user.username || user.email}!!</span>
                            </Link>
                            <Button onClick={() => signOut()} className='w-full md:w-auto bg-white text-black font-bold' variant={"outline"}>Logout</Button>
                        </>
                    ) : (
                        <Link href={'/sign-in'}>
                            <Button className='w-full md:w-auto bg-white text-black font-bold' variant={"outline"}>Sign In</Button>
                        </Link>
                    )
                }
            </div>
        </nav>    
    )
}

export default Navbar