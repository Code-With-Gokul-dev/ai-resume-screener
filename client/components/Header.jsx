import Link from 'next/link'
import React from 'react'

const Header = () => {
    return (
        <header className="border-b border-line bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    Resume Screener
                </Link>
                <span className="text-sm font-medium text-teal-500">Upload resumes, get a ranked shortlist</span>
            </div>
        </header>
    )
}

export default Header