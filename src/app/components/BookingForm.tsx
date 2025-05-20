"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import router
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingForm() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const router = useRouter(); // Initialize router

  const handleBooking = () => {
    if (!startDate || !endDate) {
      alert("Please select a valid date range.");
      return;
    }

    // Redirect to `/rooms` with query parameters
    router.push(
      `/Rooms?checkin=${startDate.toISOString()}&checkout=${endDate.toISOString()}&adults=${adults}&children=${children}`
    );
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-md text-center max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">Book a Room</h2>
      <p className="text-gray-600">Discover the perfect space for you!</p>

      <div className="flex justify-between items-center mt-6 space-x-4">
        <div className="flex flex-col bg-white p-3 rounded-lg shadow-md w-1/3">
          <label className="font-semibold text-gray-700 mb-1">Date</label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            className="border border-gray-300 rounded-lg p-2 text-center w-full"
            placeholderText="Select Period"
            isClearable
          />
        </div>

        <div className="flex flex-col bg-white p-3 rounded-lg shadow-md w-1/3">
          <label className="font-semibold text-gray-700 mb-1">Person</label>
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span className="text-lg">👤</span>
              <span>Adults</span>
            </span>
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md p-1"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center space-x-1">
              <span className="text-lg">⏳</span>
              <span>Children</span>
            </span>
            <select
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md p-1"
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
          onClick={handleBooking}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          BOOK NOW
        </button>
      </div>
    </div>
  );
}
