"use client";
import { useState, useEffect, useCallback } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"; // Import the BarElement
import { faker } from '@faker-js/faker';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, // Register the BarElement
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const allRooms = [
  { id: 1, name: "Deluxe Suite", capacity: 4, price: 150, totalAvailable: 5, booked: 2 },
  { id: 2, name: "Standard Room", capacity: 2, price: 90, totalAvailable: 8, booked: 3 },
  { id: 3, name: "Family Room", capacity: 5, price: 200, totalAvailable: 3, booked: 1 },
  { id: 4, name: "Executive Room", capacity: 3, price: 120, totalAvailable: 4, booked: 4 },
];

export default function MainPage() {
  const [rooms, setRooms] = useState(allRooms);
  const [numberOfRooms, setNumberOfRooms] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chartData, setChartData] = useState({
    bookings: [0, 0, 0, 0],
    prices: [150, 90, 200, 120],
    availability: [5, 8, 3, 4],
  });

  // WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');
    
    websocket.onopen = () => {
      console.log('WebSocket Connected');
      setWs(websocket);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);
        if (data.type === 'ROOMS_UPDATE') {
          setRooms(data.data);
          setChartData({
            bookings: data.data.map((room: any) => room.booked),
            prices: data.data.map((room: any) => room.price),
            availability: data.data.map((room: any) => room.totalAvailable),
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket Disconnected');
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const toggleDataGeneration = async () => {
    try {
      console.log('Current generation state:', isGenerating);
      const endpoint = !isGenerating ? 'start-generation' : 'stop-generation';
      console.log('Making request to:', `http://localhost:5000/api/${endpoint}`);
      
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setIsGenerating(!isGenerating);
        console.log('Generation state updated to:', !isGenerating);
      } else {
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('Error toggling data generation:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log('File uploaded successfully:', data);
          setUploadProgress(100);
          setSelectedFile(null);
        } else {
          console.error('Upload failed:', xhr.statusText);
          setUploadProgress(0);
        }
      };

      xhr.onerror = () => {
        console.error('Upload error');
        setUploadProgress(0);
      };

      xhr.open('POST', 'http://localhost:5000/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
    }
  };

  const handleRoomsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newNumber = parseInt(event.target.value);
    setNumberOfRooms(newNumber);
  };

  const bookingsChartData = {
    labels: rooms.map((room) => room.name),
    datasets: [
      {
        label: "Bookings",
        data: chartData.bookings,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  const pricesChartData = {
    labels: rooms.map((room) => room.name),
    datasets: [
      {
        label: "Price",
        data: chartData.prices,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  const availabilityChartData = {
    labels: rooms.map((room) => room.name),
    datasets: [
      {
        label: "Availability",
        data: chartData.availability,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="relative min-h-screen p-8 pb-20">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Welcome to the Hotel Booking System</h1>

      {/* Controls Section */}
      <div className="flex justify-center items-center gap-4 mt-6 mb-8">
        <button
          onClick={toggleDataGeneration}
          className={`${
            isGenerating 
              ? 'bg-red-500 hover:bg-red-700' 
              : 'bg-purple-500 hover:bg-purple-700'
          } text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105`}
        >
          {isGenerating ? 'Stop Generating' : 'Start Generating'}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="numberOfRooms" className="text-gray-700 font-semibold">
            Number of Rooms:
          </label>
          <select
            id="numberOfRooms"
            value={numberOfRooms}
            onChange={handleRoomsChange}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
          </select>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="flex flex-col items-center gap-4 mt-6 mb-8">
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100"
          />
          <button
            onClick={handleFileUpload}
            disabled={!selectedFile}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Upload File
          </button>
        </div>
        {uploadProgress > 0 && (
          <div className="w-full max-w-md">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-center mb-4">Bookings</h3>
          <Line data={bookingsChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-center mb-4">Prices</h3>
          <Bar data={pricesChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-center mb-4">Availability</h3>
          <Bar data={availabilityChartData} />
        </div>
      </div>

      {/* Room Search Section */}
      {/* Add search functionality here based on your existing form */}
    </div>
  );
}
