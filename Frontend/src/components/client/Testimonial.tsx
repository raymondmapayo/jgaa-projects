import axios from "axios";
import { useEffect, useState } from "react";
import { FaQuoteRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Define an interface for the Testimonial data structure
interface Testimonial {
  text: string;
  name: string;
  profile_pic?: string; // Optional field for profile picture
}

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch testimonials from the backend
  useEffect(() => {
    axios
      .get(`${apiUrl}/Testimonial`)
      .then((response) => {
        // Format the testimonials to include the full name (fname + lname)
        const formattedTestimonials: Testimonial[] = response.data.map(
          (testimonial: any) => ({
            text: testimonial.testimonial_text,
            name: `${testimonial.fname} ${testimonial.lname}`, // Combine fname and lname
            profile_pic: testimonial.profile_pic, // Include profile picture if available
          })
        );

        setTestimonials(formattedTestimonials); // Update the state with the formatted testimonials
      })
      .catch((error) => {
        console.error("Error fetching testimonials:", error);
      });
  }, []);

  return (
    <section className="w-full my-32 py-10 bg-gray-100">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h4 className="font-core text-yellow-500 text-xl font-medium uppercase">
            Our Testimonial
          </h4>
          <h1 className="font-core text-gray-800 text-3xl md:text-4xl font-bold">
            What Our Customers Say
          </h1>
        </div>

        {/* Swiper Section */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1} // Default for smaller screens
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            1024: {
              slidesPerView: 2,
            },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-lg shadow-lg p-6 relative mx-2">
                {/* Quote Icon */}
                <FaQuoteRight className="text-gray-400 text-3xl absolute bottom-4 right-4" />

                {/* Testimonial Text */}
                <p className="text-gray-600 italic mb-6">
                  "{testimonial.text}"
                </p>

                {/* Client Details */}
                <div className="flex items-center">
                  <img
                    src={
                      testimonial.profile_pic
                        ? `${apiUrl}/uploads/images/${testimonial.profile_pic}` // Use profile picture if it exists
                        : "/avatar.jpg" // Fallback image
                    }
                    alt={testimonial.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-yellow-500"
                  />
                  {/* Client Info */}
                  <div className="ml-4">
                    <h4 className="text-gray-800 font-bold text-lg">
                      {testimonial.name}
                    </h4>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialSection;
