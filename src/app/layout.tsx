import './globals.css'
import { ReactNode } from 'react'
import Providers from '../components/Providers'

export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="uk">
<body>
<Providers>{children}</Providers>
</body>
</html>
)
}