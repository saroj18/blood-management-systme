export const getLatLong = async (query: string) => {
  try {
    if (!query) return null;
    
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "BloodBankManagementSystem/1.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    const data = await res.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { success: true, data: { lat, lon } };
    } else {
      console.log("Location not found");
      return { success: false, message: "Location not found" };
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
    return { success: false, message: "Error fetching location data" };
  }
}