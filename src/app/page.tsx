"use client";

import { useState, useEffect, useRef } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { POETRY_VAULT, Poem } from "@/lib/poems";

export default function PremiumEbookEngine() {
  // ============================================================================
  // CORE SYSTEMS & UI LIFECYCLE STATE MATRIX
  // ============================================================================
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Authenticated State Session Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    
    // Mount user bookmarks cleanly from local hardware storage
    const savedFavs = localStorage.getItem("orivexa_fav_poems");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Failed parsing browser local storage bookmarks", e);
      }
    }

    return () => unsubscribe();
  }, []);

  // Sync Bookmarks to Local Storage Memory
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop overlay modal from launching unintentionally
    let updated = [...favorites];
    if (updated.includes(id)) {
      updated = updated.filter(favId => favId !== id);
    } else {
      updated.push(id);
    }
    setFavorites(updated);
    localStorage.setItem("orivexa_fav_poems", JSON.stringify(updated));
  };

  // HTML5 Ambient Audio Systems Management
  const toggleMusicEngine = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          console.warn("User landing interaction gesture needed to authorize loop stream.");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handshake Authenticator Gate
  const handleSecureGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Secure login operation closed or aborted:", err);
    }
  };

  // High-Performance Search and Filter Processing Sub-Routine
  const filteredPoems = POETRY_VAULT.filter(poem => {
    const normalizeQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      poem.titleNep.toLowerCase().includes(normalizeQuery) ||
      poem.titleRom.toLowerCase().includes(normalizeQuery) ||
      poem.id.toString() === normalizeQuery;
    
    if (filterMode === "favorites") {
      return matchesSearch && favorites.includes(poem.id);
    }
    return matchesSearch;
  });

  // Global Terminal Authentication Loading Layout
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
        Verifying Security Vault Handshake...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 relative selection:bg-zinc-800 selection:text-white antialiased">
      {/* Persistent Invisible Background Audio Layer node linking public assets */}
      <audio ref={audioRef} src="/bg-music.mp3" loop />

      {/* ============================================================================
          PERSISTENT CONTROL CONTROLLER HUD (Fixed Placement Across All Views)
         ============================================================================ */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-3">
        <button 
          onClick={toggleMusicEngine}
          className="p-3 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-900 shadow-2xl hover:border-zinc-700 hover:text-white transition-all duration-300 flex items-center space-x-2 text-[10px] font-mono tracking-widest text-zinc-400 group"
        >
          <span className="relative flex h-2 w-2">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-amber-500' : 'bg-zinc-700'}`}></span>
          </span>
          <span className="group-hover:text-zinc-200">{isPlaying ? "AMBIENT LIVE" : "AMBIENT MUTED"}</span>
        </button>

        {user && (
          <button 
            onClick={() => signOut(auth)}
            className="px-4 py-2 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-900 text-[10px] font-mono tracking-widest text-zinc-500 hover:text-red-400 hover:border-red-900/40 transition-all duration-300 uppercase"
          >
            Lock Vault
          </button>
        )}
      </div>

      {/* ============================================================================
          INTERFACE CONDITIONAL RENDERING LAYERS (Landing vs Library Workspace)
         ============================================================================ */}
      {!user ? (
        /* ============================================================================
           A. THE PREMIUM CINEMATIC DIGITAL BOOK COVER & ENTRANCE SCREEN
           ============================================================================ */
        <div className="min-h-screen flex flex-col justify-center items-center px-4 py-16 lg:px-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Cover Art Box Layout Container */}
          <div className="w-full flex justify-center order-2 md:order-1">
            <div className="relative aspect-[3/4] w-full max-w-[320px] rounded-2xl overflow-hidden shadow-[0_0_100px_-20px_rgba(255,255,255,0.06)] border border-zinc-900/80 group bg-zinc-950">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-70" />
              <img 
                src="/cover.jpg" 
                alt="लुकेका शब्दहरू - Premium Literary Front Cover Cover Art" 
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              />
            </div>
          </div>

          {/* Book Information & Metadata Presentation Sidebar */}
          <div className="space-y-8 flex flex-col justify-center order-1 md:order-2 text-center md:text-left">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-amber-500 font-bold block">Digital Artistry Space</span>
              <h1 className="text-5xl lg:text-6xl font-bold font-serif tracking-tight text-white leading-tight">लुकेका शब्दहरू</h1>
              <p className="text-[11px] font-mono text-zinc-600 tracking-[0.2em] uppercase">"Lukeka Sabdaharu" • A Gallery of 100+ Verses</p>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0 font-light">
              Welcome to a completely custom, responsive digital canvas preserving your deepest, unspoken thoughts. Authenticate securely to unlock continuous listening and full indexing access.
            </p>

            {/* Micro Author Biography Identity Widget */}
            <div className="flex items-center space-x-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 max-w-xs mx-auto md:mx-0 text-left backdrop-blur-md">
              <img 
                src="/author.jpg" 
                alt="Ayush Sigdel Portrait Picture" 
                className="w-11 h-11 rounded-full object-cover border border-zinc-800 shadow-inner filter grayscale saturate-50" 
              />
              <div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Creative Architect</p>
                <p className="text-sm font-semibold text-zinc-200 tracking-wide">Ayush Sigdel</p>
              </div>
            </div>

            {/* Google Authentication Handshake System Access Button */}
            <div className="pt-2">
              <button 
                onClick={handleSecureGoogleLogin}
                className="w-full max-w-sm mx-auto md:mx-0 py-4 bg-white text-black font-semibold rounded-xl text-[10px] font-mono uppercase tracking-[0.2em] shadow-2xl hover:bg-zinc-200 active:scale-[0.99] transition-all duration-300"
              >
                Access Poetry Vault with Gmail
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================================
           B. THE AUTHENTICATED CUSTOM SHELF LIBRARY ARCHITECTURE
           ============================================================================ */
        <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 min-h-screen flex flex-col animate-fadeIn">
          
          {/* Library Sub-Header Navigation Controller Systems Row */}
          <header className="border-b border-zinc-900 pb-8 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                <span>Authorized Vault Access</span>
                <span>•</span>
                <span className="text-zinc-400 max-w-[140px] truncate">{user.email}</span>
              </div>
              <h2 className="text-3xl font-bold font-serif text-white tracking-tight">The Literary Index</h2>
            </div>

            {/* Dynamic UI Filters, Search Arrays, and Input Groups */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <input 
                type="text"
                placeholder="Search indexing keywords or sequence numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 placeholder-zinc-800 min-w-[240px] transition-all"
              />

              <div className="flex bg-zinc-950 p-1 border border-zinc-900 rounded-lg shadow-inner">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-4 py-2 text-[9px] uppercase font-mono tracking-widest rounded-md transition-all duration-200 ${filterMode === "all" ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  All ({POETRY_VAULT.length})
                </button>
                <button
                  onClick={() => setFilterMode("favorites")}
                  className={`px-4 py-2 text-[9px] uppercase font-mono tracking-widest rounded-md transition-all duration-200 ${filterMode === "favorites" ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Bookmarks ({favorites.length})
                </button>
              </div>
            </div>
          </header>

          {/* Empty Search Fallback State Grid Framework */}
          {filteredPoems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/10">
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-[0.2em]">No verses match your custom filter terms</p>
            </div>
          ) : (
            /* Main Interactive Architecture Library Card Matrix Grid */
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-start">
              {filteredPoems.map((poem) => (
                <article 
                  key={poem.id}
                  onClick={() => setSelectedPoem(poem)}
                  className="group relative p-6 bg-zinc-950/30 border border-zinc-900/60 rounded-xl hover:border-zinc-800 hover:bg-zinc-950/60 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-zinc-600 tracking-widest group-hover:text-amber-500 transition-colors">
                        # {poem.id.toString().padStart(3, '0')}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(poem.id, e)}
                        className={`p-1 transition-colors text-xs ${favorites.includes(poem.id) ? 'text-amber-500' : 'text-zinc-800 hover:text-zinc-400'}`}
                        title="Save reference bookmark"
                      >
                        {favorites.includes(poem.id) ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold font-serif text-zinc-200 group-hover:text-white transition-colors tracking-wide">
                        {poem.titleNep}
                      </h3>
                      <p className="text-[10px] font-mono text-zinc-600 italic tracking-wider">
                        {poem.titleRom}
                      </p>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-3 whitespace-pre-line leading-relaxed pt-1 font-light">
                      {poem.lines}
                    </p>
                  </div>
                </article>
              ))}
            </main>
          )}
        </div>
      )}

      {/* ============================================================================
          CINEMATIC DETAILED IMMERSIVE FOCUS LAYER OVERLAY (Modal Viewport Popup)
         ============================================================================ */}
      {selectedPoem && (
        <div 
          onClick={() => setSelectedPoem(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()} // Safe loop execution handler block
            className="w-full max-w-xl bg-zinc-950 border border-zinc-900/80 rounded-2xl p-8 lg:p-12 relative space-y-8 shadow-[0_0_120px_rgba(0,0,0,0.9)]"
          >
            {/* Modal Heading Actions Ribbon */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600 border-b border-zinc-900 pb-4 tracking-widest">
              <span>CANVAS REGISTRY ELEMENT # {selectedPoem.id.toString().padStart(3, '0')}</span>
              <button 
                onClick={() => setSelectedPoem(null)}
                className="hover:text-white text-[9px] uppercase tracking-[0.2em] font-semibold transition-colors"
              >
                DISMISS [X]
              </button>
            </div>

            {/* Main Immersive Reader Typography Layout */}
            <div className="space-y-6 text-center py-2">
              <div className="space-y-1.5">
                <h2 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-wide">
                  {selectedPoem.titleNep}
                </h2>
                <p className="text-[11px] font-mono text-zinc-500 italic tracking-widest">
                  {selectedPoem.titleRom}
                </p>
              </div>
              
              <div className="h-[1px] w-10 bg-zinc-900 mx-auto" />

              <p className="text-base sm:text-lg text-zinc-200 whitespace-pre-line leading-[2.2] tracking-wide font-serif py-4 max-w-md mx-auto font-medium">
                {selectedPoem.lines}
              </p>
            </div>

            {/* Footnote Metadata Appendix Section Blocks */}
            {selectedPoem.note && (
              <div className="bg-black/60 p-4 rounded-xl border border-zinc-900 text-center animate-fadeIn">
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed tracking-wide">
                  <span className="text-zinc-600 uppercase tracking-widest block text-[8px] mb-1 font-bold">Author Index Appendix</span>
                  "{selectedPoem.note}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}