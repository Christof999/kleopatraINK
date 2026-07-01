export const STUDIO_ADDRESS = {
  street: 'Industriestraße 2',
  zip: '91710',
  city: 'Gunzenhausen',
  country: 'Deutschland',
};

export const STUDIO_MOBILE = {
  display: '+49 176 60957400',
  displayCompact: '0176 60957400',
  tel: '+4917660957400',
};

export const STUDIO_ADDRESS_LINE = `${STUDIO_ADDRESS.street}, ${STUDIO_ADDRESS.zip} ${STUDIO_ADDRESS.city}`;

export const STUDIO_MAP_QUERY = `${STUDIO_ADDRESS.street}, ${STUDIO_ADDRESS.zip} ${STUDIO_ADDRESS.city}`;
