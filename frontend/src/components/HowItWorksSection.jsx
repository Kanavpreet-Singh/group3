export default function HowItWorksSection() {
  const steps = [
    { step: "1", title: "Sign Up Securely", description: "Create your confidential account with university verification", color: "yellow" },
    { step: "2", title: "Choose Your Support", description: "Access AI chat, book counseling, or join peer communities", color: "yellow" },
    { step: "3", title: "Get Help 24/7", description: "Receive immediate support whenever you need it most", color: "yellow" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">How It Works</h2>
        <p className="text-gray-400 text-xl">Getting support is simple and confidential</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className={`bg-${step.color}-500 text-${step.color === 'yellow' ? 'black' : 'white'} w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6`}>
              {step.step}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
