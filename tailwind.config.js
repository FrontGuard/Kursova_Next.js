/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
'./src/**/.{js,ts,jsx,tsx}', // обовʼязково, щоб Tailwind працював у /src
],
theme: {
extend: {},
},
plugins: [
require('@tailwindcss/aspect-ratio'), // ✅ потрібен для aspect-video
],
}