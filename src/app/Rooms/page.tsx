"use client";
import RoomsComponent from "../components/RoomsComponent"; // Import the RoomsComponent

export default function RoomsPage() {
  return (
    <div className="max-w-7xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-800 text-center">Browse Available Rooms</h1>
      <p className="text-gray-600 text-center mt-2">Find the best room for your stay.</p>

      {/* Render the Rooms Component */}
      <RoomsComponent />
    </div>
  );
}
