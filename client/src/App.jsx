import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SearchPhotoPage from './pages/SearchPhotoPage';
import AddDesignPage from './pages/AddDesignPage';
import DesignListPage from './pages/DesignListPage';
import DesignDetailPage from './pages/DesignDetailPage';
import EditDesignPage from './pages/EditDesignPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search-photo" element={<SearchPhotoPage />} />
          <Route path="/add-design" element={<AddDesignPage />} />
          <Route path="/designs" element={<DesignListPage />} />
          <Route path="/designs/:id" element={<DesignDetailPage />} />
          <Route path="/designs/:id/edit" element={<EditDesignPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
