import { Component } from "react";

// Without this, any uncaught error in a component unmounts the whole tree
// and staff get a blank white screen with no way out. This catches it and
// offers a way back.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Left in deliberately — it's the only diagnostic trail we have if a
    // staff member reports "the app broke".
    console.error("App crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="grid min-h-[100dvh] place-items-center px-6">
        <div className="w-full max-w-sm text-center">
          <img
            src="/brand/logo-mark.png"
            alt=""
            className="mx-auto mb-5 h-14 w-auto opacity-80"
            draggable="false"
          />
          <h1 className="font-display text-lg font-bold text-ink">
            Something went wrong
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            The app hit an unexpected error. Reloading usually fixes it — your
            customer data is safe.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-2xl bg-ink py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.98]"
          >
            Reload the app
          </button>

          <button
            onClick={() => {
              // Last resort: clear the cached list and reload from scratch.
              try {
                localStorage.clear();
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
            className="mt-2 w-full rounded-2xl border border-hairline bg-white py-3 text-[13px] font-semibold text-muted transition active:scale-[0.98]"
          >
            Still broken? Clear saved data and sign in again
          </button>
        </div>
      </div>
    );
  }
}
