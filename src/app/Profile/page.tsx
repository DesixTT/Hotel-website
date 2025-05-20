"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Room = {
  id: number;
  name: string;
  capacity: number;
  price: number;
  image: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [checkin, setCheckin] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [nights, setNights] = useState(1);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      router.push("/login"); // Redirect to login if not logged in
      return;
    }

    // Load check-in and check-out dates
    const storedCheckin = localStorage.getItem("checkin");
    const storedCheckout = localStorage.getItem("checkout");
    let calculatedNights = 1;

    if (storedCheckin && storedCheckout) {
      setCheckin(new Date(storedCheckin).toLocaleDateString());
      setCheckout(new Date(storedCheckout).toLocaleDateString());

      // Calculate number of nights
      const checkinDate = new Date(storedCheckin);
      const checkoutDate = new Date(storedCheckout);
      const diffTime = checkoutDate.getTime() - checkinDate.getTime();
      calculatedNights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
      setNights(calculatedNights);
    }

    // Load selected rooms from localStorage
    const storedRooms = localStorage.getItem("selectedRooms");
    const parsedRooms: Room[] = storedRooms ? JSON.parse(storedRooms) : [];

    setSelectedRooms(parsedRooms);

    // Calculate correct total amount (price per night * number of nights)
    const total = parsedRooms.reduce((sum: number, room: Room) => sum + room.price * calculatedNights, 0);
    setTotalAmount(total);
  }, [router]);

  const removeRoom = (roomId: number) => {
    const updatedRooms = selectedRooms.filter((room) => room.id !== roomId);
    setSelectedRooms(updatedRooms);
    localStorage.setItem("selectedRooms", JSON.stringify(updatedRooms));

    // Increase room availability
    let storedAvailability = localStorage.getItem("roomAvailability");
    let roomAvailability: Record<number, number> = storedAvailability ? JSON.parse(storedAvailability) : {};

    roomAvailability[roomId] = (roomAvailability[roomId] || 0) + 1;
    localStorage.setItem("roomAvailability", JSON.stringify(roomAvailability));

    // Recalculate total amount after removing a room
    const total = updatedRooms.reduce((sum: number, room: Room) => sum + room.price * nights, 0);
    setTotalAmount(total);
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/hotel-background.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Content Wrapper */}
      <div className="relative max-w-4xl mx-auto mt-10 p-8 bg-white bg-opacity-95 shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-gray-800 text-center">User Profile</h1>
        {user && (
          <p className="text-center mt-2 text-gray-700">
            Welcome, <span className="font-bold">{user.email}</span>!
          </p>
        )}

        {/* Reservation Details */}
        <div className="bg-blue-100 p-6 mt-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Your Reservation Details</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold">Check-in:</span> {checkin || "Not selected"}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Check-out:</span> {checkout || "Not selected"}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Total Nights:</span> {nights}
          </p>
          <p className="text-gray-800 text-lg font-semibold mt-3">
            Total Amount: <span className="text-green-600">${totalAmount}</span>
          </p>
        </div>

        {/* Selected Rooms Section */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-8">Your Selected Rooms</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {selectedRooms.length > 0 ? (
            selectedRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <img src={room.image} alt={room.name} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800">{room.name}</h2>
                  <p className="text-gray-600">Capacity: {room.capacity} people</p>
                  <p className="text-gray-900 font-bold mt-2 text-lg">${room.price} / night</p>
                  <p className="text-gray-800 font-bold mt-2">Total: ${room.price * nights}</p>
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="mt-4 w-full bg-red-500 hover:bg-red-700 text-white py-3 px-5 rounded-lg font-semibold shadow-md transition duration-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-4">No rooms selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
