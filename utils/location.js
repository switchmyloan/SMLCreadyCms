const pinCodeCache = {};

export const getLocationFromPostalCode = async (postalCode) => {
  if (!postalCode) {
    return null;
  }

  if (pinCodeCache[postalCode]) {
    return pinCodeCache[postalCode];
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
    const data = await response.json();

    let location = 'Location not found';
    if (data && data[0] && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const { Name, District, State } = data[0].PostOffice[0];
      location = `${Name}, ${District}, ${State}`;
    }

    pinCodeCache[postalCode] = location;
    return location;
  } catch (error) {
    console.error('Error fetching location from postal code:', error);
    return 'Error fetching location';
  }
};
