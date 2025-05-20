// src/app/sortRooms.ts

export const sortRooms = (
    rooms: { price: number; capacity: number }[],
    sortBy: "price" | "capacity",
    sortOrder: "asc" | "desc"
  ) => {
    return rooms.sort((a, b) => {
      if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortBy === "capacity") {
        return sortOrder === "asc" ? a.capacity - b.capacity : b.capacity - a.capacity;
      }
      return 0;
    });
  };
  
  // src/app/RoomsComponent.tsx (Backend Logic Only)
  export const addRoomToBooking = (selectedRooms: any[], room: any) => {
    selectedRooms.push(room);
    return selectedRooms;
  };
  
  export const removeRoomFromBooking = (selectedRooms: any[], roomId: number) => {
    return selectedRooms.filter((room) => room.id !== roomId);
  };
  