'use client';

import Link from 'next/link';

export default function Header() {
return (
<header className="site-header">
<Link href="/video" className="logo">🎬 BenFube</Link>
<nav>
<Link href="/video">Головна</Link>
<Link href="/upload">Завантажити</Link>
<Link href="/profile">Профіль</Link>
</nav>
</header>
);
}