'use client'

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export default function RecordViewClient({ videoId }: { videoId: string }) {
const { data: session } = useSession()

useEffect(() => {
if (!session) return
fetch("/api/views", {
method: "POST",
body: JSON.stringify({ videoId }),
headers: {
"Content-Type": "application/json",
},
})
}, [videoId, session])

return null
}