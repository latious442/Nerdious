import React, { useEffect, useState } from 'react';
import Card from './Card';
import { tagLabel } from '../bookTags';
import { apiUrl } from '../api';

const PAGE_SIZE = 8;

export default function Body({ onInfoClick, tagFilter = 'all', searchTerm = '' }) {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBooks = books.filter((book) =>
    (book.title || '').toLowerCase().includes(normalizedSearch)
  );

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [filteredBooks.length, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [tagFilter, searchTerm]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const q = tagFilter && tagFilter !== 'all' ? `?tag=${encodeURIComponent(tagFilter)}` : '';
        const response = await fetch(apiUrl(`/api/books${q}`));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setBooks(data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch books:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [tagFilter]);

  const start = (page - 1) * PAGE_SIZE;
  const pageBooks = filteredBooks.slice(start, start + PAGE_SIZE);

  const filterSubtitle =
    tagFilter === 'all'
      ? 'Every genre in one place.'
      : `Books tagged ${tagLabel(tagFilter)}.`;
  const subtitle = normalizedSearch
    ? `${filterSubtitle} Matching title: "${searchTerm.trim()}".`
    : filterSubtitle;

  return (
    <main className="body-catalog">
      <div className="container px-3 px-md-4 py-4 py-md-5" style={{ maxWidth: 1280 }}>
        <header className="body-catalog__header mb-4 mb-md-5">
          <div className="row align-items-end g-3">
            <div className="col-lg-8">
              <h1 className="h2 fw-semibold mb-2 text-body" style={{ letterSpacing: '-0.02em' }}>
                Library
              </h1>
              <p className="text-muted mb-0 lh-base">{subtitle}</p>
            </div>
            {!loading && !error && (
              <div className="col-lg-4 text-lg-end">
                <span className="body-catalog__stat d-inline-block rounded-pill px-3 py-2 small fw-medium">
                  {filteredBooks.length} title{filteredBooks.length !== 1 ? 's' : ''}
                  {totalPages > 1 && (
                    <span className="text-muted fw-normal"> · page {page} / {totalPages}</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </header>

        {loading && (
          <div className="body-catalog__loading d-flex flex-column align-items-center justify-content-center py-5 my-4 gap-3">
            <div className="spinner-border text-primary" role="status" aria-label="Loading">
              <span className="visually-hidden">Loading books…</span>
            </div>
            <p className="text-muted small mb-0">Loading books…</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger shadow-sm border-0 rounded-3" role="alert">
            <strong>Could not load books.</strong> {error}
          </div>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <div className="body-catalog__empty text-center py-5 px-3 rounded-4">
            <p className="fw-medium text-body mb-1">No results</p>
            <p className="text-muted small mb-0">
              {normalizedSearch
                ? `No titles match "${searchTerm.trim()}". Try another keyword.`
                : tagFilter === 'all'
                  ? 'Add books from the admin page to see them listed.'
                  : `No books with the “${tagLabel(tagFilter)}” tag. Try “All” or another tag.`}
            </p>
          </div>
        )}

        {!loading && !error && pageBooks.length > 0 && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4 body-catalog__grid">
            {pageBooks.map((item) => (
              <div className="col d-flex" key={item._id}>
                <Card onInfoClick={onInfoClick} book={item} className="flex-fill" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredBooks.length > PAGE_SIZE && (
          <footer className="body-catalog__footer mt-5 pt-4 border-top border-secondary border-opacity-25">
            <nav aria-label="Book pages">
              <ul className="pagination pagination-sm justify-content-center flex-wrap gap-1 mb-3">
                <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link rounded-2 px-3"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <li key={n} className={`page-item${n === page ? ' active' : ''}`}>
                    <button
                      type="button"
                      className="page-link rounded-2 px-3"
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </li>
                ))}
                <li className={`page-item${page >= totalPages ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link rounded-2 px-3"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </li>
              </ul>
              <p className="text-center text-muted small mb-0">
                Showing <strong className="text-body fw-medium">{start + 1}</strong>
                –
                <strong className="text-body fw-medium">{Math.min(start + PAGE_SIZE, filteredBooks.length)}</strong>
                {' '}of <strong className="text-body fw-medium">{filteredBooks.length}</strong>
              </p>
            </nav>
          </footer>
        )}

        {!loading && !error && filteredBooks.length > 0 && filteredBooks.length <= PAGE_SIZE && (
          <p className="text-center text-muted small mt-4 mb-0">
            Showing all {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
            {tagFilter !== 'all' && ` in ${tagLabel(tagFilter)}`}
          </p>
        )}
      </div>
    </main>
  );
}
