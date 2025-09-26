export default function FeaturesSection({ features }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Five Core Components</h2>
        <p className="text-gray-400 text-xl max-w-3xl mx-auto">
          Our comprehensive platform addresses every aspect of student mental health with cutting-edge technology and human compassion.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-800/30"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-yellow-500 mb-4">{feature.title}</h3>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
