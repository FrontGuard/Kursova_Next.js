export default function Footer() {
return (
<footer className="footer">
<p>
© {new Date().getFullYear()} VideoHub. Всі права захищено.
<br />
<a href="/privacy">Політика конфіденційності</a> | <a href="/terms">Умови користування</a>
</p>
</footer>
)
}