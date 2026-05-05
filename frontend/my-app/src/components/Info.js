import React, { useEffect, useState } from 'react'
import { tagLabel } from '../bookTags';

const API_ORIGIN = 'http://localhost:3001';

export default function Info({ onCloseClick, bookId }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookById = async () => {
      if (!bookId) {
        setError('Missing book id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/books/${bookId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setBook(data);
        setError('');
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookById();
  }, [bookId]);

  if (loading) {
    return <p className="text-center mt-4">Loading book info...</p>;
  }

  if (error) {
    return <p className="text-center mt-4">Failed to fetch book: {error}</p>;
  }

  if (!book) {
    return <p className="text-center mt-4">No book found.</p>;
  }

  const coverSrc = book.photo
    ? `${API_ORIGIN}/photos/${encodeURIComponent(book.photo)}`
    : '/photos/romeo.jpg';

  const pdfDownloadUrl = book.pdf
    ? `${API_ORIGIN}/download/pdf/${encodeURIComponent(book.pdf)}`
    : null;

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4 g-lg-5 align-items-start">
        <div className="col-12 col-lg-5">
          <div className="text-center">
            <img className="info-cover img-fluid rounded-4 shadow-sm" src={coverSrc} alt={book.title || 'Book cover'} />
            <div className="d-grid gap-2 mt-3 mx-auto info-actions">
              {pdfDownloadUrl ? (
                <a href={pdfDownloadUrl} download className="btn btn-primary">
                  Download <i className="bi bi-arrow-down-circle-fill"></i>
                </a>
              ) : (
                <button type="button" className="btn btn-secondary" disabled>
                  No PDF uploaded
                </button>
              )}
              <button onClick={onCloseClick} type="button" className="btn btn-danger">
                Close <i className="bi bi-backspace-fill"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <h2 className="mb-1">{book.title}</h2>
          <h5 className="text-muted mb-2">{book.author}</h5>
          <h6 className="mb-3">Tag: {tagLabel(book.tag)}</h6>
          <div className="card-text lh-base">
            {book.description}
          </div>
        </div>
      </div>
    </div>
  )
}
