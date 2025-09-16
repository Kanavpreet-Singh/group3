const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "24/7 AI Chatbot",
      description: "Instant support and guidance through our intelligent chatbot system",
      icon: "💬",
      buttonText: "Start Chat",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Professional Appointments",
      description: "Schedule sessions with qualified mental health professionals",
      icon: "📅",
      buttonText: "Book Appointment",
      color: "from-green-500 to-green-600"
    },
    {
      id: 3,
      title: "Learning Resources",
      description: "Comprehensive library of videos, audio resources, and wellness guides in multiple regional languages",
      icon: "📚",
      buttonText: "Explore Resources",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 4,
      title: "Peer Support Network",
      description: "Connect with trained peer volunteers and fellow students for mutual support",
      icon: "👥",
      buttonText: "Join Community",
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 5,
      title: "Insights & Analytics",
      description: "Anonymous data insights enabling administrators to identify trends and plan targeted interventions",
      icon: "📊",
      buttonText: "View Dashboard",
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Mental Health Support
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform offers five key services designed to support your mental health journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100">
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <button className={`w-full py-3 px-4 bg-gradient-to-r ${feature.color} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}>
                {feature.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
