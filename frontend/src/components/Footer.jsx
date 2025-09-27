export default function Footer() {
  return (
    <footer className="bg-[#1E2A47] py-12 mt-12 border-t border-[#0B0C10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-[#FCA311] mb-4">CalmConnect</h3>
            <p className="text-[#A0AEC0] mb-4">
              Empowering students with comprehensive mental health support through technology and human connection.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-[#A0AEC0] hover:text-[#FCA311] transition-colors">
                Email
              </a>
              <a href="#" className="text-[#A0AEC0] hover:text-[#FCA311] transition-colors">
                Phone
              </a>
              <a href="#" className="text-[#A0AEC0] hover:text-[#FCA311] transition-colors">
                Website
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#E5E5E5] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-[#A0AEC0]">
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  Crisis Resources
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#E5E5E5] mb-4">Support</h4>
            <ul className="space-y-2 text-[#A0AEC0]">
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  Emergency Hotline
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FCA311] transition-colors">
                  University Partners
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#0B0C10] mt-8 pt-8 text-center text-[#A0AEC0]">
          <p>
            &copy; {new Date().getFullYear()} NeuroCare. All rights reserved. | Made with care for student wellbeing
          </p>
        </div>
      </div>
    </footer>
  )
}