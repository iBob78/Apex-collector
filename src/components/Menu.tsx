'use client'

import Link from 'next/link'

export default function Menu() {
  return (
    <nav>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/marche">March&eacute;</Link></li>
        <li><Link href="/settings">Settings</Link></li>
      </ul>
    </nav>
  )
}
