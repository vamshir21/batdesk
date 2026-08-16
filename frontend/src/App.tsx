import "./App.css";

function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">BATDESK</div>
        <div className="pc-status">
          <span className="dot" />
          PC
        </div>
      </header>

      <main className="dashboard">
        <section className="metrics">
          <article className="tile">
            <span className="tile-label">CPU</span>
            <span className="tile-value">--%</span>
          </article>
          <article className="tile">
            <span className="tile-label">RAM</span>
            <span className="tile-value">--%</span>
          </article>
          <article className="tile">
            <span className="tile-label">DISK</span>
            <span className="tile-value">--%</span>
          </article>
          <article className="tile">
            <span className="tile-label">TEMP</span>
            <span className="tile-value">--°</span>
          </article>
          <article className="tile">
            <span className="tile-label">BAT</span>
            <span className="tile-value">--%</span>
          </article>
          <article className="tile">
            <span className="tile-label">UP</span>
            <span className="tile-value">--</span>
          </article>
        </section>

        <section className="quick-row">
          <button type="button" className="quick">
            LOCK
          </button>
          <button type="button" className="quick">
            SLEEP
          </button>
          <button type="button" className="quick">
            MUTE
          </button>
        </section>
      </main>

      <nav className="bottom-nav">
        <button type="button" className="nav-btn active">
          Dash
        </button>
        <button type="button" className="nav-btn">
          Controls
        </button>
        <button type="button" className="nav-btn">
          Network
        </button>
        <button type="button" className="nav-btn">
          System
        </button>
        <button type="button" className="nav-btn">
          Settings
        </button>
      </nav>
    </div>
  );
}

export default App;
