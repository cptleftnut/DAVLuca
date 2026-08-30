with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("""export default function App() {
  return (
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || (firebaseConfig as any).oAuthClientId || '';
  if (!clientId) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Error: Missing Google OAuth Client ID. Please configure OAuth.</div>;

  return (
    <GoogleOAuthProvider clientId={clientId}>""", """export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || (firebaseConfig as any).oAuthClientId || '';
  if (!clientId) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Error: Missing Google OAuth Client ID. Please configure OAuth.</div>;

  return (
    <GoogleOAuthProvider clientId={clientId}>""")

with open('src/App.tsx', 'w') as f:
    f.write(content)
