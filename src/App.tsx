/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from './contexts/LanguageContext';
import { CaseDataProvider } from './contexts/CaseDataContext';
import { CaseDashboardPage } from './pages/CaseDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { Navigation } from './components/Navigation';

import firebaseConfig from '../firebase-applet-config.json';

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || (firebaseConfig as any).oAuthClientId || 'demo-google-oauth-client-id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LanguageProvider>
        <CaseDataProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-950 flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<CaseDashboardPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </CaseDataProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}
