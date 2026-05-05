import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { TAG_FILTER_OPTIONS } from '../bookTags';

export default function Navbar({
  onAboutClick,
  bookTagFilter,
  onBookTagChange,
  searchTerm,
  onSearchTermChange,
}) {
  return (
    <header className="app-navbar border-bottom border-primary-subtle">
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-7">
            

            <h1 className="display-1 text-primary">NERDIOUS</h1>
          
            <div className="d-flex">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search by title"
                aria-label="Search by title"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
              <button type="button" className="btn btn-outline-primary"><i className="bi bi-browser-safari"></i></button>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="d-flex flex-column align-items-start align-items-xl-end gap-1">
              <div className="d-flex align-items-center gap-2 w-100 justify-content-between justify-content-xl-end">
                <span className="small text-white-50 mb-0">Browse by tag</span>
                <button className="btn btn-primary btn-sm" onClick={onAboutClick}>About</button>
              </div>
              <div className="d-flex flex-wrap justify-content-start justify-content-xl-end gap-1" role="group" aria-label="Filter by book tag">
                {TAG_FILTER_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`btn btn-sm ${bookTagFilter === value ? 'btn-primary' : 'btn-outline-light'}`}
                    onClick={() => onBookTagChange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
