import './App.css'

import HeaderC from './components/HeaderSection';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import FloatingChatbot from './components/FloatingChatbot';

function App() {
  return (
    <div className="App">
      <HeaderC />
      <HeroSection />
      <FeaturesSection />
      <Footer />
      <FloatingChatbot />
    </div>
  );
}

export default App;
