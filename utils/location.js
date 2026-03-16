export const getLocationFromPostalCode = async (postalCode) => {
  if (!postalCode) {
    return null;
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
    const data = await response.json();

    if (data && data[0] && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const { Name, District, State } = data[0].PostOffice[0];
      return `${Name}, ${District}, ${State}`;
    } else {
      return 'Location not found';
    }
  } catch (error) {
    console.error('Error fetching location from postal code:', error);
    return 'Error fetching location';
  }
};