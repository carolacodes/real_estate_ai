import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AIPropertyAssistant from '../components/chat/AIPropertyAssistant.jsx';
import Home from '../pages/Home.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import Properties from '../pages/Properties.jsx';
import PropertyDetail from '../pages/PropertyDetail.jsx';
import NotFound from '../pages/NotFound.jsx';
export default function AppRouter() {
  return <BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/properties" element={<Properties />} /><Route path="/properties/:slug" element={<PropertyDetail />} /><Route path="*" element={<NotFound />} /></Routes><AIPropertyAssistant /></BrowserRouter>;
}
