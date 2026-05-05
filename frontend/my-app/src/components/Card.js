import React from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { tagLabel } from '../bookTags';

const API_ORIGIN = 'http://localhost:3001';

export default function Card({ onInfoClick, book, className = '' }) {
  const coverSrc = book.photo
    ? `${API_ORIGIN}/photos/${encodeURIComponent(book.photo)}`
    : '/photos/romeo.jpg';

  return (
    <div
      className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${className}`.trim()}
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="card-img-wrap position-relative">
        <img
          src={coverSrc}
          className="card-img-top"
          alt={book.title ? `Cover: ${book.title}` : 'Book cover'}
          loading="lazy"
        />
        <span className="position-absolute top-0 end-0 m-2 badge rounded-pill bg-dark bg-opacity-75 text-white fw-normal border-0">
          {tagLabel(book.tag)}
        </span>
      </div>
      <div className="card-body d-flex flex-column pt-3 pb-3 px-3">
        <h2 className="card-title h6 fw-semibold mb-0 lh-sm text-truncate" title={book.title}>
          {book.title}
        </h2>
        <p className="card-text small text-muted mb-3 mt-1 text-truncate" title={book.author}>
          {book.author}
        </p>
        <div className="mt-auto d-grid gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill"
            value={book._id}
            onClick={(e) => onInfoClick(e.currentTarget.value)}
          >
            Details
          </button>
          <div className="btn-group" role="group" aria-label="Download">
            {book.pdf ? (
              <a
                className="btn btn-outline-primary btn-sm rounded-pill"
                href={`${API_ORIGIN}/download/pdf/${encodeURIComponent(book.pdf)}`}
                download
                title="Download PDF"
              >
                <i className="bi bi-download me-1" aria-hidden="true" />
                PDF
              </a>
            ) : (
              <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" disabled>
                No PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
