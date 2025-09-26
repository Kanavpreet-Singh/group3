export default function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-gradient-to-r from-blue-900/50 to-yellow-500/10 rounded-3xl p-12 text-center border border-blue-800/30">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Start Your Journey?</h2>
        <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of students who have found support, community, and healing through CalmConnect.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
            Start Free Today
          </button>
          <button className="border-2 border-white hover:bg-white hover:text-black text-white font-bold py-4 px-8 rounded-full transition-all duration-300">
            Contact Support
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-6">✓ Free for all students ✓ 100% Confidential ✓ Available 24/7</p>
      </div>
    </section>
  );
}
