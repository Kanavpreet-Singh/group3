export default function TestimonialsSection({ testimonials }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Student Voices</h2>
        <p className="text-gray-400 text-xl">Real stories from students who found support through CalmConnect</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-yellow-500/30 transition-all duration-300"
          >
            <div className="text-yellow-400 text-2xl mb-4">"</div>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{testimonial.quote}</p>
            <div className="border-t border-gray-800 pt-4">
              <div className="font-bold text-yellow-500">{testimonial.author}</div>
              <div className="text-gray-400 text-sm">{testimonial.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
