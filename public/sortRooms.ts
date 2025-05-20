export function sortRooms(rooms: any[], sortBy: string, sortOrder: string) {
    return [...rooms].sort((a, b) => {
      if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortBy === "capacity") {
        return sortOrder === "asc" ? a.capacity - b.capacity : b.capacity - a.capacity;
      } else if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return 0;
    });
  }
  