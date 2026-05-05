import React, { useState } from 'react';
import { TAG_FORM_OPTIONS } from '../bookTags';

const API_ORIGIN = 'http://localhost:3001';

export default function Adding_post({ onSuccess ,handleClose}) {
  const [form, setForm] = useState({
    author: '',
    title: '',
    description: '',
    tag: TAG_FORM_OPTIONS[0].value,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const fd = new FormData();
    fd.append('author', form.author);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('tag', form.tag);
    if (photoFile) {
      fd.append('photo', photoFile);
    }
    if (pdfFile) {
      fd.append('pdf', pdfFile);
    }

    try {
      const res = await fetch(`${API_ORIGIN}/books`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
      setForm({ author: '', title: '', description: '', tag: TAG_FORM_OPTIONS[0].value });
      setPhotoFile(null);
      setPdfFile(null);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <>
      
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <form className="form-control w-30" onSubmit={handleSubmit}>
          <label className="caption">Author</label>
          <input name="author" value={form.author} onChange={handleChange} className="form-control" required />

          <label className="caption">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="form-control" required />

          <label className="caption">Description</label>
          <input name="description" value={form.description} onChange={handleChange} className="form-control" />

          <label className="caption">Tag</label>
          <select name="tag" value={form.tag} onChange={handleChange} className="form-select" required>
            {TAG_FORM_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <label className="caption">Cover photo</label>
          <input
            name="photo"
            className="form-control"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />

          <label className="caption">Book (PDF)</label>
          <input
            name="pdf"
            className="form-control"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
          />

          {submitError && <p className="text-danger small mt-2 mb-0">{submitError}</p>}
<div className="d-flex justify-content-center align-items-center gap-3">

          <button type="submit" className="btn btn-primary w-100 mt-3"><i className="bi bi-arrow-up-circle"></i></button>
          <button type="button" className="btn btn-danger w-100 mt-3" onClick={handleClose}>close</button>
</div>
        </form>
      </div>
    </>
  );
}
