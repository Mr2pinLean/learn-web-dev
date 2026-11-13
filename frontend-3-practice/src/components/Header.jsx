export default function Header() {
  return (
    <header className="header">
      <a className="logo" href="#" aria-label="На главную">
        <img className="logo__img" src="/images/logo.png" alt="Логотип барбершопа" />
      </a>

      <nav className="nav" aria-label="Главная навигация">
        <button className="burger" type="button" aria-label="Меню">
          <span className="burger__line" />
          <span className="burger__line" />
          <span className="burger__line" />
        </button>
      </nav>
    </header>
  );
}
