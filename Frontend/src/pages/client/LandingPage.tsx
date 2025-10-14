import Banner from "../../components/client/Banner";
import Bestseller from "../../components/client/BestSeller";
import Fact from "../../components/client/Fact";
import PromoBanner from "../../components/client/Faqs";
import Features from "../../components/client/Features";
import Footer from "../../components/client/Footer";
import MainPage from "../../components/client/MainPage";
import Menus from "../../components/client/Menus";
import Testimonial from "../../components/client/Testimonial";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center overflow-x-hidden">
      <MainPage />
      <Features />
      <Menus />
      <Banner />
      <Bestseller />
      <PromoBanner />
      <Fact />
      <Testimonial />
      <Footer />
    </div>
  );
};

export default LandingPage;
