export default function HeroSection() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent rounded-3xl"></div>
      <div className="relative z-10">
        <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-2 mb-6">
          <span className="text-yellow-300 text-sm font-medium">🌟 Trusted by 50+ Universities</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-yellow-500 mb-6 leading-tight">
          Welcome to <br />
          <span className="text-yellow-400">NeuroCare</span>
        </h1>
        <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed">
          Your trusted mental health companion on campus. AI-guided support, peer networks, and professional help — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
            Get Started Today
          </button>
          <button className="border-2 border-blue-500 hover:bg-blue-500 text-blue-400 hover:text-white font-bold py-4 px-8 rounded-full transition-all duration-300">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}
