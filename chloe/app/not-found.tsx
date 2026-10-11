import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <p className="eyebrow">404</p>
      <h1 className="section__title">Nothing crystallized here.</h1>
      <Link className="button button--quiet" href="/">
        Back home
      </Link>
    </main>
  );
}
