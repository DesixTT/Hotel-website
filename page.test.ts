const request = require("supertest");
const express = require("express");
const app = require("./page"); 


describe("Room API Tests", () => {
  let initialRooms: any[];

  beforeEach(() => {
    // Reset the in-memory rooms array before each test
    initialRooms = [
      { id: 1, name: "Deluxe Suite", price: 150, totalAvailable: 5, booked: 2 },
      { id: 2, name: "Standard Room", price: 90, totalAvailable: 8, booked: 3 },
      { id: 3, name: "Family Room", price: 200, totalAvailable: 3, booked: 1 },
      { id: 4, name: "Executive Room", price: 120, totalAvailable: 4, booked: 4 },
    ];
    app.locals.rooms = [...initialRooms];
  });

  test("GET /api/rooms - Fetch all rooms", async () => {
    const res = await request(app).get("/api/rooms");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(initialRooms);
  });

  test("GET /api/rooms/:id - Fetch a specific room by ID", async () => {
    const res = await request(app).get("/api/rooms/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(initialRooms[0]);
  });

  test("GET /api/rooms/:id - Room not found", async () => {
    const res = await request(app).get("/api/rooms/999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Room not found" });
  });

  test("POST /api/rooms - Create a new room", async () => {
    const newRoom = {
      name: "Luxury Suite",
      price: 300,
      totalAvailable: 10,
      booked: 0,
    };
    const res = await request(app).post("/api/rooms").send(newRoom);
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject(newRoom);
    expect(res.body.id).toBeDefined();
  });

  test("POST /api/rooms - Missing fields", async () => {
    const res = await request(app).post("/api/rooms").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "All fields (name, price, totalAvailable, booked) are required",
    });
  });

  test("PUT /api/rooms/:id - Update an existing room", async () => {
    const updatedRoom = {
      name: "Updated Room",
      price: 180,
      totalAvailable: 6,
      booked: 1,
    };
    const res = await request(app).put("/api/rooms/1").send(updatedRoom);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject(updatedRoom);
  });

  test("PUT /api/rooms/:id - Room not found", async () => {
    const res = await request(app).put("/api/rooms/999").send({
      name: "Non-existent Room",
      price: 100,
      totalAvailable: 1,
      booked: 0,
    });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Room not found" });
  });

  test("DELETE /api/rooms/:id - Delete a room", async () => {
    const res = await request(app).delete("/api/rooms/1");
    expect(res.statusCode).toBe(204);
    const getRes = await request(app).get("/api/rooms/1");
    expect(getRes.statusCode).toBe(404);
  });

  test("DELETE /api/rooms/:id - Room not found", async () => {
    const res = await request(app).delete("/api/rooms/999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Room not found" });
  });
});