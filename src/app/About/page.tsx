"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/about-luxury-hotel.jpg')", // Ensure this file exists in /public
        backgroundColor: "#EDEDED", // Light gray fallback
      }}
    >
      {/* Stronger Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div> {/* Increased opacity */}

      {/* Glassmorphism Container */}
      <div className="relative max-w-4xl mx-auto p-10 bg-white bg-opacity-90 backdrop-blur-lg shadow-lg rounded-3xl border border-gray-300">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-6">About Our Hotel</h1>
        
        <p className="text-lg text-gray-800 leading-relaxed text-center">
          Experience world-class luxury with breathtaking views, premium amenities, and exceptional
          service. Whether for business or leisure, we redefine elegance and comfort.
        </p>

        {/* Horizontal Divider */}
        <div className="w-24 h-1 bg-blue-500 mx-auto my-6"></div>

        {/* Commitment Section */}
        <h2 className="text-3xl font-semibold text-gray-900 text-center">Our Commitment</h2>
        <p className="text-lg text-gray-800 leading-relaxed text-center mt-2">
          We are dedicated to providing an unforgettable experience. From exquisite dining to
          high-end room services, we strive for excellence at every step.
        </p>

        {/* Why Choose Us Section */}
        <h2 className="text-3xl font-semibold text-gray-900 text-center mt-6">Why Choose Us?</h2>
        <ul className="text-lg text-gray-800 mt-4 space-y-3 text-left list-none">
          <li className="flex items-center gap-3">
            <span className="text-blue-500 text-2xl">✔️</span> <span>Luxurious & spacious rooms</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-blue-500 text-2xl">✔️</span> <span>Prime location with stunning views</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-blue-500 text-2xl">✔️</span> <span>24/7 concierge and premium services</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-blue-500 text-2xl">✔️</span> <span>High-speed Wi-Fi & conference facilities</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-blue-500 text-2xl">✔️</span> <span>Gourmet dining & luxury spa</span>
          </li>
        </ul>

        {/* Back to Home Button */}
        <div className="mt-8 flex justify-center">
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
