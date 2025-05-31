import Link from 'next/link';
import styles from '../styles/page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Вітаємо у нашому відео-проєкті!</h1>

        <p className={styles.description}>
          Тут ви зможете знайти та переглянути різноманітні цікаві відео.
          Перейдіть на сторінку відео, щоб побачити всю колекцію.
        </p>

        <div className={styles.buttonContainer}>
          <Link href="/video" className={styles.videoButton}>
            Перейти до відео
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        {/* Додайте сюди свій футер, якщо потрібно */}
      </footer>
    </div>
  );
}