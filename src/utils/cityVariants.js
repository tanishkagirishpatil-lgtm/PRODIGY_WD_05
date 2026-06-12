const CITY_VARIANTS = {
  mumbai: 'mumbai',
  delhi: 'delhi',
  kolkata: 'kolkata',
  chennai: 'coastal',
  pune: 'hills',
  bangalore: 'hills',
  bengaluru: 'hills',
};

export function getCityVariant(cityName = '') {
  return CITY_VARIANTS[cityName.toLowerCase()] || 'hills';
}
