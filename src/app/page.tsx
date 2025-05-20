"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MainPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const handleSearch = () => {
    if (!user) {
      alert("You must log in to search for rooms!");
      return;
    }
    if (!dateRange[0] || !dateRange[1]) {
      alert("Please select a valid date range.");
      return;
    }

    router.push(
      `/Rooms?checkin=${dateRange[0]?.toISOString()}&checkout=${dateRange[1]?.toISOString()}&adults=${adults}&children=${children}`
    );
  };

  return (
    <div
      className="relative min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]"
      style={{
        backgroundImage: "url('/hoteltest3.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Navigation Bar */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Link href="/Rooms">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            View Rooms
          </button>
        </Link>
        <Link href="/About">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            About
          </button>
        </Link>
        {user ? (
          <>
            <Link href="/Profile">
              <button className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded">
                {user.email} {/* Show the user's email */}
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/Login">
            <button className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded">
              Login
            </button>
          </Link>
        )}
      </div>

      {/* Main Search Section */}
      {user ? (
        <div className="bg-blue-100 p-6 rounded-lg shadow-md text-center max-w-4xl mx-auto mt-10">
          <h2 className="text-2xl font-semibold text-gray-800">Search for Available Rooms</h2>
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Date</label>
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => setDateRange(update)}
                className="border border-gray-300 rounded-lg p-2 text-center text-gray-900 bg-white"
                placeholderText="Select Period"
                isClearable
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Adults</label>
              <select
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Children</label>
              <select
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
              >
                {[0, 1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            Search Available Rooms
          </button>
        </div>
      ) : (
        <p className="text-center mt-4 text-red-600 font-semibold">
          🔒 You must log in to search and book a room.
        </p>
      )}
    </div>
  );
}
