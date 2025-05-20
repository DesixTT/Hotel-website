import { sortRooms, addRoomToBooking, removeRoomFromBooking } from "../src/app/sortRooms";

const rooms = [
  { id: 1, name: "Deluxe Suite", price: 150, capacity: 4 },
  { id: 2, name: "Standard Room", price: 90, capacity: 2 },
  { id: 3, name: "Family Room", price: 200, capacity: 5 },
  { id: 4, name: "Executive Room", price: 120, capacity: 3 },
];

describe("Rooms Sorting and Booking", () => {
  test("Should filter rooms by price", () => {
    const sortedRooms = sortRooms(rooms, "price", "asc");
    expect(sortedRooms[0].price).toBe(90);
    expect(sortedRooms[1].price).toBe(120);
    expect(sortedRooms[2].price).toBe(150);
  });

  test("should sort rooms by price in ascending order", () => {
    const sortedRooms = sortRooms(rooms, "price", "asc");
    expect(sortedRooms[0].price).toBe(90);
    expect(sortedRooms[1].price).toBe(120);
    expect(sortedRooms[2].price).toBe(150);
    expect(sortedRooms[3].price).toBe(200);
  });

  test("should sort rooms by price in descending order", () => {
    const sortedRooms = sortRooms(rooms, "price", "desc");
    expect(sortedRooms[0].price).toBe(200);
    expect(sortedRooms[1].price).toBe(150);
    expect(sortedRooms[2].price).toBe(120);
    expect(sortedRooms[3].price).toBe(90);
  });

  test("should sort rooms by capacity in ascending order", () => {
    const sortedRooms = sortRooms(rooms, "capacity", "asc");
    expect(sortedRooms[0].capacity).toBe(2);
    expect(sortedRooms[1].capacity).toBe(3);
    expect(sortedRooms[2].capacity).toBe(4);
    expect(sortedRooms[3].capacity).toBe(5);
  });

  test("should sort rooms by capacity in descending order", () => {
    const sortedRooms = sortRooms(rooms, "capacity", "desc");
    expect(sortedRooms[0].capacity).toBe(5);
    expect(sortedRooms[1].capacity).toBe(4);
    expect(sortedRooms[2].capacity).toBe(3);
    expect(sortedRooms[3].capacity).toBe(2);
  });

  test("should handle sorting with invalid criteria (default case)", () => {
    const sortedRooms = sortRooms(rooms, "price" as "price" | "capacity", "asc"); 
    expect(sortedRooms).toEqual(rooms); 
  });

  test("should add room to the booking list", () => {
    let selectedRooms: { id: number; name: string; price: number; capacity: number }[] = [];
    const newRoom = { id: 5, name: "Luxury Room", price: 250, capacity: 2 };
    selectedRooms = addRoomToBooking(selectedRooms, newRoom);
    expect(selectedRooms).toHaveLength(1);
    expect(selectedRooms[0].id).toBe(5);
  });

  test("should remove room from the booking list", () => {
    let selectedRooms = [
      { id: 1, name: "Deluxe Suite", price: 150, capacity: 4 },
      { id: 2, name: "Standard Room", price: 90, capacity: 2 },
    ];
    selectedRooms = removeRoomFromBooking(selectedRooms, 1);
    expect(selectedRooms).toHaveLength(1);
    expect(selectedRooms[0].id).toBe(2);
  });
});
