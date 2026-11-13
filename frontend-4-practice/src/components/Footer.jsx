export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <a className="logo logo--footer" href="#" aria-label="На главную">
            <img className="logo__img" src="/images/logo.png" alt="Логотип барбершопа" />
          </a>
        </div>

        <div className="footer__info">
          <section className="footer__block">
            <h3 className="footer__heading">Контакты</h3>
            <p className="footer__text">📍 г. Москва, ул. Садовая, 15</p>
            <a className="footer__phone" href="tel:+74951234567">
              📞 +7 495 123 45 67
            </a>
          </section>

          <section className="footer__block">
            <h3 className="footer__heading">Режим работы</h3>
            <p className="footer__text">Пн–Пт: 9:00–21:00</p>
            <p className="footer__text">Сб–Вс: 10:00–19:00</p>
          </section>
        </div>
      </div>

      <p className="footer__tagline">
        Предоставляем услуги и немного стрижём
      </p>

      <div className="footer__bottom">
        <p className="footer__copy">© 2026. Все права защищены.</p>
        <a className="footer__link" href="#">Политика конфиденциальности</a>
      </div>
    </footer>
  );
}
