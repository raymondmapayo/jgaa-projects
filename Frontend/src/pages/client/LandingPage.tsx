import Banner from "../../components/client/Banner";
import Bestseller from "../../components/client/BestSeller";
import Faqs from "../../components/client/Faqs";
import Footer from "../../components/client/Footer";
import MainPage from "../../components/client/MainPage";
import Menus from "../../components/client/Menus";
import Testimonial from "../../components/client/Testimonial";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center overflow-x-hidden">
      <MainPage />
      <Bestseller />
      <Menus />
      <Banner />
      <Testimonial />
      <Faqs />
      <Footer />
    </div>
  );
};

export default LandingPage;
