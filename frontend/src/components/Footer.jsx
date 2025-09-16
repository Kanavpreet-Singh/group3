const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">MindBridge</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Providing comprehensive mental health support for university students through innovative technology and compassionate care.
            </p>
            <div className="bg-red-600 text-white p-4 rounded-lg">
              <p className="font-semibold">Emergency Crisis Helpline</p>
              <p className="text-xl">988</p>
              <p className="text-sm">Available 24/7</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div>
                <p className="text-gray-300">Email:</p>
                <p className="text-white">support@mentalhealth-platform.edu</p>
              </div>
              <div>
                <p className="text-gray-300">Phone:</p>
                <p className="text-white">+1 (555) 123-HELP</p>
              </div>
              <div>
                <p className="text-gray-300">Address:</p>
                <p className="text-white">University Health Center<br/>Student Services Building</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 MindBridge Mental Health Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
