"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { faker } from '@faker-js/faker';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const allRooms = [
  { id: 1, name: "Deluxe Suite", price: 150, totalAvailable: 5, booked: 2, image: "room1.jpeg" },
  { id: 2, name: "Standard Room", price: 90, totalAvailable: 8, booked: 3, image: "room2.jpeg" },
  { id: 3, name: "Family Room", price: 200, totalAvailable: 3, booked: 1, image: "room3.jpeg" },
  { id: 4, name: "Executive Room", price: 120, totalAvailable: 4, booked: 4, image: "room4.jpeg" },
  { id: 5, name: "Presidential Suite", price: 300, totalAvailable: 2, booked: 1, image: "room1.jpeg" },
  { id: 6, name: "Luxury Suite", price: 250, totalAvailable: 3, booked: 1, image: "room2.jpeg" },
  { id: 7, name: "Ocean View", price: 180, totalAvailable: 5, booked: 1, image: "room3.jpeg" },
  { id: 8, name: "Mountain View", price: 140, totalAvailable: 6, booked: 2, image: "room4.jpeg" },
];

export default function RoomsComponent() {
  const [rooms, setRooms] = useState(allRooms);
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage, setRoomsPerPage] = useState(3);
  const [chartData, setChartData] = useState({
    bookings: rooms.map((room) => room.booked),
    prices: rooms.map((room) => room.price),
    availability: rooms.map((room) => room.totalAvailable),
  });

  const generateRandomData = () => {
    const updatedRooms = rooms.map(room => ({
      ...room,
      name: faker.helpers.arrayElement([
        "Deluxe Suite",
        "Standard Room",
        "Family Room",
        "Executive Room",
        "Presidential Suite",
        "Luxury Suite",
        "Ocean View",
        "Mountain View"
      ]),
      booked: faker.number.int({ min: 0, max: 10 }),
      price: faker.number.int({ min: 80, max: 300 }),
      totalAvailable: faker.number.int({ min: 0, max: 10 }),
      image: faker.helpers.arrayElement(["room1.jpeg", "room2.jpeg", "room3.jpeg", "room4.jpeg"])
    }));

    setRooms(updatedRooms);
    setChartData({
      bookings: updatedRooms.map(room => room.booked),
      prices: updatedRooms.map(room => room.price),
      availability: updatedRooms.map(room => room.totalAvailable),
    });
  };

  const mostExpensiveRoom = rooms.reduce((max, room) => (room.price > max.price ? room : max), rooms[0]);
  const leastExpensiveRoom = rooms.reduce((min, room) => (room.price < min.price ? room : min), rooms[0]);
  const averagePrice = rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length;

  // Highlight logic for cells
  const getCellStyle = (room: any) => {
    if (room.price === mostExpensiveRoom.price) {
      return "bg-blue-100 border-blue-500"; // Soft blue for the most expensive room
    }
    if (room.price === leastExpensiveRoom.price) {
      return "bg-green-100 border-green-500"; // Soft green for the least expensive room
    }
    if (room.price === averagePrice) {
      return "bg-yellow-100 border-yellow-500"; // Soft yellow for the average price room
    }
    return "";
  };

  const handleRoomSelection = (roomId: number) => {
    const updatedRooms = rooms.map((room) => {
      if (room.id === roomId && room.totalAvailable > 0) {
        room.totalAvailable -= 1; // Decrease availability
        room.booked += 1; // Increase booked count
      }
      return room;
    });

    setRooms(updatedRooms); // Update the rooms state

    // Save the room to localStorage (the user's profile)
    let selectedRooms = JSON.parse(localStorage.getItem("selectedRooms") || "[]");
    const selectedRoom = rooms.find((room) => room.id === roomId);
    if (selectedRoom) {
      selectedRooms.push(selectedRoom); // Add the selected room
      localStorage.setItem("selectedRooms", JSON.stringify(selectedRooms)); // Save it to localStorage
    }

    // Update the chart data with the new room availability
    setChartData({
      bookings: updatedRooms.map((room) => room.booked),
      prices: updatedRooms.map((room) => room.price),
      availability: updatedRooms.map((room) => room.totalAvailable),
    });
  };

  const bookingsChartData = {
    labels: rooms.map((room) => room.name),
    datasets: [
      {
        label: "Bookings",
        data: rooms.map((room) => room.booked),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pricesChartData = {
    labels: rooms.map((room) => room.name),
    datasets: [
      {
        label: "Price",
        data: rooms.map((room) => room.price),
        backgroundColor: "rgba(235, 81, 54, 0.84)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const availabilityChartData = {
    labels: rooms.map((room) => room.name),
    datasets: [
      {
        label: "Availability",
        data: rooms.map((room) => room.totalAvailable),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  const handlePageChange = (direction: string) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRoomsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoomsPerPage = parseInt(event.target.value);
    setRoomsPerPage(newRoomsPerPage);
    setCurrentPage(1); // Reset to first page when changing rooms per page
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Available Rooms</h1>
      
      <div className="flex justify-center items-center gap-4 mt-6 mb-8">
        <button
          onClick={generateRandomData}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
        >
          Generate Random Data
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="roomsPerPage" className="text-gray-700 font-semibold">
            Rooms per page:
          </label>
          <select
            id="roomsPerPage"
            value={roomsPerPage}
            onChange={handleRoomsPerPageChange}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="12">12</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {rooms.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage).map((room) => (
          <div key={room.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300">
            <img
              src={`${room.image}`} // Assuming images are in public/images folder
              alt={room.name}
              className="w-full h-56 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800">{room.name}</h2>
            <p className={`text-gray-700 ${getCellStyle(room)}`}>Price: ${room.price} / night</p>
            <p className="text-gray-700">Available: {room.totalAvailable}</p>
            <button
              onClick={() => handleRoomSelection(room.id)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
              disabled={room.totalAvailable <= 0}
            >
              {room.totalAvailable <= 0 ? "Out of Stock" : "Book Room"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => handlePageChange("prev")}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-lg font-semibold">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange("next")}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold text-center">Room Bookings</h3>
        <Bar data={bookingsChartData} />

        <h3 className="text-xl font-semibold text-center mt-10">Room Prices</h3>
        <Bar data={pricesChartData} />

        <h3 className="text-xl font-semibold text-center mt-10">Room Availability</h3>
        <Bar data={availabilityChartData} />
      </div>
    </div>
  );
}
