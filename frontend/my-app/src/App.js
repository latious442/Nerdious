import React, { useState } from 'react'
import Body from './components/Body';
import Info from './components/Info';
import About from './components/About';
import Navbar from './components/Navbar';

export default function App() {
  const [view, setView] = useState("body");
  const [selectedBookId, setSelectedBookId] = useState('');
  const [bookTagFilter, setBookTagFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div style={{backgroundColor: '#F5F3EF',width: '100%'}}>
      <Navbar
        onAboutClick={() => setView("about")}
        bookTagFilter={bookTagFilter}
        onBookTagChange={setBookTagFilter}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />

      {view === "body" && (
        <Body
          tagFilter={bookTagFilter}
          searchTerm={searchTerm}
          onInfoClick={(bookId) => {
            setSelectedBookId(bookId);
            setView("info");
          }}
        />
      )}

      {view === "info" && (
        <Info
          bookId={selectedBookId}
          onCloseClick={() => setView("body")}
        />
      )}

      {view === "about" && (
        <About onAboutClick={() => setView("body")} />
      )}
    </div>
  );
}