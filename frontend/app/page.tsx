export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 ghost-cursor">
      <div className="text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-creepster text-ghost-green mb-8 text-glow-intense animate-pulse-glow">
          Haunted Greenhouse
        </h1>
        <p className="text-lg md:text-xl font-vt323 text-bone-white mb-12">
          Spooky Smart Greenhouse Monitoring System
        </p>
        
        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="retro-card">
            <div className="text-3xl mb-2">🌡️</div>
            <h3 className="font-press-start text-xs text-ghost-green mb-2">Temperature</h3>
            <p className="font-vt323 text-2xl text-bone-white">24.5°C</p>
          </div>
          
          <div className="retro-card fog-overlay">
            <div className="text-3xl mb-2">💧</div>
            <h3 className="font-press-start text-xs text-toxic-purple mb-2">Humidity</h3>
            <p className="font-vt323 text-2xl text-bone-white">65%</p>
          </div>
          
          <div className="retro-card">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-press-start text-xs text-pumpkin-orange mb-2">Light</h3>
            <p className="font-vt323 text-2xl text-bone-white">850 lux</p>
          </div>
        </div>

        {/* Demo Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button className="retro-button">
            Start Monitoring
          </button>
          <button className="px-6 py-3 bg-bg-dark text-blood-red font-bold border-4 border-blood-red pixel-border-glow transition-all duration-200 hover:scale-105 hover:text-pumpkin-orange">
            Alert Mode
          </button>
        </div>

        {/* Animated Icons */}
        <div className="flex justify-center gap-8 text-4xl mb-8">
          <div className="animate-float">👻</div>
          <div className="animate-float" style={{ animationDelay: '0.5s' }}>🎃</div>
          <div className="animate-float" style={{ animationDelay: '1s' }}>🦇</div>
          <div className="animate-float" style={{ animationDelay: '1.5s' }}>🕷️</div>
        </div>

        {/* Demo Pixel Borders */}
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="pixel-border-sm px-4 py-2 text-ghost-green font-vt323">
            Small Border
          </div>
          <div className="pixel-border-md px-4 py-2 text-toxic-purple font-vt323">
            Medium Border
          </div>
          <div className="pixel-border-lg px-4 py-2 text-blood-red font-vt323">
            Large Border
          </div>
          <div className="pixel-border-glow px-4 py-2 text-slime-green font-vt323">
            Glowing Border
          </div>
        </div>
      </div>
    </main>
  );
}
