export default function StatsSection({ stats }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2">{stat.number}</div>
            <div className="text-gray-400 text-lg">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
