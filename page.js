const express = require("express");
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit
    files: 1
  }
});

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON requests
app.use('/uploads', express.static('uploads'));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Room API", // Title of the API
      version: "1.0.0", // Version
      description: "API for managing hotel rooms", // Description of the API
    },
    servers: [
      {
        url: "http://localhost:5000", // URL of the server where your API is running
      },
    ],
  },
  apis: ["page.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// In-memory storage for rooms
let rooms = [
  { id: 1, name: "Deluxe Suite", price: 150, totalAvailable: 5, booked: 2 },
  { id: 2, name: "Standard Room", price: 90, totalAvailable: 8, booked: 3 },
  { id: 3, name: "Family Room", price: 200, totalAvailable: 3, booked: 1 },
  { id: 4, name: "Executive Room", price: 120, totalAvailable: 4, booked: 4 },
];

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Function to broadcast updates to all connected clients
const broadcastUpdate = (data) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Background thread for generating random data
let dataGenerationInterval;
const startDataGeneration = () => {
  if (!dataGenerationInterval) {
    dataGenerationInterval = setInterval(() => {
      const updatedRooms = rooms.map(room => ({
        ...room,
        booked: Math.floor(Math.random() * 10),
        price: Math.floor(Math.random() * (300 - 80) + 80),
        totalAvailable: Math.floor(Math.random() * 10)
      }));
      rooms = updatedRooms;
      broadcastUpdate({ type: 'ROOMS_UPDATE', data: updatedRooms });
    }, 1000);
  }
};

const stopDataGeneration = () => {
  if (dataGenerationInterval) {
    clearInterval(dataGenerationInterval);
    dataGenerationInterval = null;
  }
};

// New endpoints for controlling data generation
app.post('/api/start-generation', (req, res) => {
  startDataGeneration();
  res.json({ message: 'Data generation started' });
});

app.post('/api/stop-generation', (req, res) => {
  stopDataGeneration();
  res.json({ message: 'Data generation stopped' });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// File download endpoint
app.get('/api/download/:filename', (req, res) => {
  const file = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(file)) {
    res.download(file);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Room API");
});

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms
 *     description: Fetch all available rooms with optional filtering and sorting.
 *     parameters:
 *       - name: available
 *         in: query
 *         description: Filter rooms by available count
 *         required: false
 *         schema:
 *           type: integer
 *       - name: minPrice
 *         in: query
 *         description: Filter rooms by minimum price
 *         required: false
 *         schema:
 *           type: integer
 *       - name: maxPrice
 *         in: query
 *         description: Filter rooms by maximum price
 *         required: false
 *         schema:
 *           type: integer
 *       - name: sortBy
 *         in: query
 *         description: Sort rooms by a specific field (price or booked)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [price, booked]
 *       - name: sortOrder
 *         in: query
 *         description: Sort order (asc or desc)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: A list of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   price:
 *                     type: integer
 *                   totalAvailable:
 *                     type: integer
 *                   booked:
 *                     type: integer
 */
app.get("/api/rooms", (req, res) => {
  let filteredRooms = [...rooms];

  // Filter rooms by availability
  if (req.query.available) {
    filteredRooms = filteredRooms.filter(
      (room) => room.totalAvailable >= parseInt(req.query.available)
    );
  }

  // Filter rooms by price range
  if (req.query.minPrice || req.query.maxPrice) {
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : Infinity;
    filteredRooms = filteredRooms.filter(
      (room) => room.price >= minPrice && room.price <= maxPrice
    );
  }

  // Sorting
  if (req.query.sortBy && req.query.sortOrder) {
    const { sortBy, sortOrder } = req.query;
    filteredRooms = filteredRooms.sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] - b[sortBy];
      } else {
        return b[sortBy] - a[sortBy];
      }
    });
  }

  res.json(filteredRooms);
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get a specific room by ID
 *     description: Fetch a specific room using its unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the room
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: A specific room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price:
 *                   type: integer
 *                 totalAvailable:
 *                   type: integer
 *                 booked:
 *                   type: integer
 *       404:
 *         description: Room not found
 */
app.get("/api/rooms/:id", (req, res) => {
  const room = rooms.find((r) => r.id === parseInt(req.params.id));
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  res.json(room);
});

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room
 *     description: Add a new room to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Luxury Suite"
 *               price:
 *                 type: integer
 *                 example: 300
 *               totalAvailable:
 *                 type: integer
 *                 example: 10
 *               booked:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: The newly created room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 name:
 *                   type: string
 *                   example: "Luxury Suite"
 *                 price:
 *                   type: integer
 *                   example: 300
 *                 totalAvailable:
 *                   type: integer
 *                   example: 10
 *                 booked:
 *                   type: integer
 *                   example: 0
 *       400:
 *         description: Bad request, missing required fields
 */
app.post("/api/rooms", (req, res) => {
  console.log("POST /api/rooms - Request Body:", req.body); // Debugging log

  const { name, price, totalAvailable, booked } = req.body;

  if (!name || !price || !totalAvailable || booked === undefined) {
    return res.status(400).json({ message: "All fields (name, price, totalAvailable, booked) are required" });
  }

  const newRoom = {
    id: rooms.length + 1,
    name,
    price,
    totalAvailable,
    booked,
  };

  rooms.push(newRoom);
  res.status(201).json(newRoom);
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update an existing room
 *     description: Update the details of a specific room by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the room to update
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Room"
 *               price:
 *                 type: integer
 *                 example: 250
 *               totalAvailable:
 *                 type: integer
 *                 example: 5
 *               booked:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: The updated room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price:
 *                   type: integer
 *                 totalAvailable:
 *                   type: integer
 *                 booked:
 *                   type: integer
 *       400:
 *         description: Bad request, missing required fields
 *       404:
 *         description: Room not found
 */
app.put("/api/rooms/:id", (req, res) => {
  console.log("PUT /api/rooms/:id - Request Body:", req.body); // Debugging log

  const { name, price, totalAvailable, booked } = req.body;

  if (!name || !price || !totalAvailable || booked === undefined) {
    return res.status(400).json({ message: "All fields (name, price, totalAvailable, booked) are required" });
  }

  const roomIndex = rooms.findIndex((r) => r.id === parseInt(req.params.id));
  if (roomIndex === -1) {
    return res.status(404).json({ message: "Room not found" });
  }

  rooms[roomIndex] = { id: parseInt(req.params.id), name, price, totalAvailable, booked };
  res.json(rooms[roomIndex]);
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete an existing room
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the room to delete
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 */
app.delete("/api/rooms/:id", (req, res) => {
  const roomIndex = rooms.findIndex((r) => r.id === parseInt(req.params.id));
  if (roomIndex === -1) {
    return res.status(404).json({ message: "Room not found" });
  }

  rooms.splice(roomIndex, 1);
  res.status(204).send();
});

// Add error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 1GB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 1 file at a time'
      });
    }
  }
  next(error);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});