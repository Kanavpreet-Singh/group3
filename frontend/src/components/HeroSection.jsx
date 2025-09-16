const HeroSection = () => {
  return (
    <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Mental Health <span className="text-primary">Matters</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            A comprehensive digital platform designed to provide immediate, accessible, and personalised mental health support for university students. This innovative system combines artificial intelligence, peer support networks, and professional resources to create a holistic approach to student wellbeing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg">
              Get Started
            </button>
            <button className="px-8 py-4 border-2 border-primary text-primary text-lg font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
