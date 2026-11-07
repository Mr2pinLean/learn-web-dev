import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import BookingScreen from "./BookingScreen.jsx";

export default function App() {
  return (
    <div className="page">
      <Header />

      <main className="main">
        <section className="hero" aria-label="Выбор даты и времени">
          <h1 className="visually-hidden">Выбор даты и времени</h1>
          <img
            className="hero__image"
            src="/images/date-time.png"
            alt="Выберите удобную дату и время визита"
          />
        </section>

        <BookingScreen />
      </main>

      <Footer />
    </div>
  );
}
