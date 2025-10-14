import React from "react";
import { Link } from "react-router-dom";
import Blog2 from "/blog-2.jpg";
import Blog3 from "/blog-3.jpg";

interface TeamMember {
  name: string;
  position: string;
  image: string;
  description: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "John Doe",
    position: "CEO & Founder",
    image: Blog2,
    description:
      "John is a visionary leader with over 15 years of experience in the industry.",
  },
  {
    name: "Jane Smith",
    position: "Head Chef",
    image: Blog3,
    description:
      "Jane crafts extraordinary culinary experiences with her passion for food.",
  },
  {
    name: "Emily Davis",
    position: "Marketing Manager",
    image: Blog3,
    description:
      "Emily drives our marketing strategies with her innovative ideas.",
  },
  {
    name: "Michael Brown",
    position: "Operations Manager",
    image: Blog3,
    description:
      "Michael ensures seamless operations for our customers and team.",
  },
];

const AboutUs: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">About Us</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">About Us</li>
        </ol>
      </div>
      {/* End of Page Header */}

      {/* About Us Section */}
      <section className="about-us-section">
        <div className="about-us-images">
          <img
            src={Blog3}
            alt="Our restaurant interior"
            className="about-us-image upper-left"
          />
          <img
            src={Blog3}
            alt="Our delicious dishes"
            className="about-us-image lower-right"
          />
        </div>
        <div className="about-us-text">
          <h2>About Us</h2>
          <p>
            Welcome to our restaurant! We are committed to delivering a culinary
            journey that excites your taste buds and warms your heart. Our
            dishes are crafted using the freshest, locally-sourced ingredients,
            prepared with passion by our expert chefs. We aim to create
            memorable dining experiences that combine exceptional flavors with
            outstanding service.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="about-us-section">
        <div className="about-us-text">
          <h2>Our Mission</h2>
          <p>
            At our core, our mission is to bring people together through the
            love of food. We aim to provide a dining experience that celebrates
            the finest ingredients, exceptional craftsmanship, and the joy of
            sharing meals with loved ones.
          </p>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="about-us-section">
        <div className="about-us-text">
          <h2>Our Commitment</h2>
          <p>
            We are committed to excellence in every aspect of our restaurant.
            From sourcing the freshest ingredients to delivering outstanding
            service, our goal is to exceed your expectations. Sustainability is
            at the heart of what we do, and we take pride in supporting local
            farmers and reducing waste. Your satisfaction is our top priority,
            and we strive to create experiences that keep you coming back.
          </p>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="our-team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">
            Our dedicated team works tirelessly to bring you exceptional service
            and unforgettable experiences.
          </p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-image"
                />
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-position">{member.position}</p>
                  <p className="team-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
