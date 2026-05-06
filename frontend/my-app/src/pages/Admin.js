import React, { useState, useEffect } from "react";
import AddingPost from "../components/AddingPost";
import { tagLabel } from "../bookTags";
import ChangePw from "../components/ChangePw";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api";
const PAGE_SIZE = 8;
const glassBoxStyle = {
  background: "rgba(255, 255, 255, 0.18)",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "18px",
  boxShadow: "0 10px 24px rgba(13, 110, 253, 0.18)",
  padding: "18px",
  minWidth: "240px",
  display: "flex",
  justifyContent: "center",
};

export default function Admin() {
  const navigate = useNavigate();
  const [pw_power, setPw_power] = useState(false);
  const [power, setPower] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));

  const handlePw_power = () => {
    setPw_power(true);
    setPower(false);
  };

  const handlePower = () => {
    setPower(true);
    setPw_power(false);
  };
  const handleClose = () => {
    setPower(false);
    setPw_power(false);
  };

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [books.length, totalPages]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(apiUrl("/api/auth/session"), {
          credentials: "include",
        });
        if (!response.ok) {
          navigate("/identity");
          return;
        }
        setIsAuthorized(true);
      } catch {
        navigate("/identity");
      }
    };
    checkSession();
  }, [navigate]);

  const refetchBooks = async () => {
    try {
      const response = await fetch(apiUrl("/api/books?tag=all"));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setBooks(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
   
  const delBook = async (id) => {
    try {
      const response = await fetch(apiUrl(`/api/books/${id}`), {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${response.status}`);
      }
      setBooks((prev) => prev.filter((b) => b._id !== id));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchBooks = async () => {
      try {
        const response = await fetch(apiUrl("/api/books"));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setBooks(data);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [isAuthorized]);

  const handleLogout = () => {
    fetch(apiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).finally(() => navigate("/"));
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <p className="text-center text-muted mt-3 mb-0">
        This is the admin page of Nerdious. You can add and delete books here.
      </p>
      <div className="container py-4">
        <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
          <div style={glassBoxStyle}>
            <h2 className="text-primary"><i className="bi bi-plus"></i></h2>
            <button
              type="button"
              className="btn btn-primary btn-lg px-4 py-2"
              onClick={handlePower}
            >
              Add Book
            </button>
          </div>
          <div style={glassBoxStyle}>
            <h2 className="text-primary">
              <i className="bi bi-lock"></i>
            </h2>
            <button
              type="button"
              className="btn btn-primary btn-lg px-4 py-2"
              onClick={handlePw_power}
            >
              Change Password
            </button>
          </div>
        </div>
        {power && <AddingPost onSuccess={refetchBooks} handleClose={handleClose} />}
        {pw_power && <ChangePw handleClose={handleClose} />}
      </div>
      
      <div className="container">
        <h1>Book List<i className="bi bi-book"></i></h1>
        {loading && <p className="text-center">Loading books…</p>}
        {!loading && error && (
          <p className="text-center text-danger">Failed to fetch books: {error}</p>
        )}
        {!loading && !error && books.length === 0 && (
          <p className="text-center">No books yet.</p>
        )}
        <ul className="list-group">
          {books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => (
            <li key={item._id} className="list-group-item">
              {item.title} — {item.author}
              <span className="badge bg-secondary ms-2">{tagLabel(item.tag)}</span>
              <button
                type="button"
                className="btn btn-danger ms-2"
                onClick={() => delBook(item._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {!loading && !error && books.length > PAGE_SIZE && (
          <nav aria-label="Admin book pages" className="mt-3">
            <ul className="pagination justify-content-center flex-wrap mb-0">
              <li className={`page-item${page <= 1 ? " disabled" : ""}`}>
                <button
                  type="button"
                  className="page-link"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li key={n} className={`page-item${n === page ? " active" : ""}`}>
                  <button type="button" className="page-link" onClick={() => setPage(n)}>
                    {n}
                  </button>
                </li>
              ))}
              <li className={`page-item${page >= totalPages ? " disabled" : ""}`}>
                <button
                  type="button"
                  className="page-link"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
        <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
}
