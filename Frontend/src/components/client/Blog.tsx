import { motion } from "framer-motion";
import Blog1 from "/blog-1.jpg";
import Blog2 from "/blog-2.jpg";
import Blog3 from "/blog-3.jpg";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "What Do You Think About Cheese Pizza Recipes?",
      image: Blog1,
      category: "Pizza",
      date: "Jan 01 2022",
      author: "Jonathan Smith",
      excerpt:
        "Financial experts support or help you to find out which way you can raise your funds more...",
      link: "#",
    },
    {
      id: 2,
      title: "Making Chicken Strips With New Delicious Ingredients.",
      image: Blog2,
      category: "Burger",
      date: "Jan 01 2022",
      author: "Jonathan Smith",
      excerpt:
        "Financial experts support or help you to find out which way you can raise your funds more...",
      link: "#",
    },
    {
      id: 3,
      title: "Innovative Hot Cheesy Raw Pasta Make Creator Fact.",
      image: Blog3,
      category: "Chicken",
      date: "Jan 01 2022",
      author: "Jonathan Smith",
      excerpt:
        "Financial experts support or help you to find out which way you can raise your funds more...",
      link: "#",
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Animates children one by one
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <main className="py-16 w-full bg-gray-50">
      <section className="container mx-auto">
        <header className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800">
            All About Delicious Foods
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            Explore our latest blog posts to learn more about delicious recipes,
            food trends, and more.
          </p>
        </header>

        {/* Blog Posts */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} // Animate on scroll every time in view
        >
          {blogPosts.map((post) => (
            <motion.div
              key={post.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              variants={cardVariants}
              whileHover="hover"
            >
              {/* Blog Banner */}
              <div className="relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-semibold py-1 px-3 rounded">
                  {post.category}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">
                  <time>{post.date}</time> · <span>{post.author}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 hover:text-orange-500 transition-colors">
                  <a href={post.link}>{post.title}</a>
                </h3>
                <p className="text-gray-600 mt-4">{post.excerpt}</p>
                <a
                  href={post.link}
                  className="inline-flex items-center text-orange-500 mt-4 font-semibold hover:underline"
                >
                  Read More <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
};

export default Blog;
