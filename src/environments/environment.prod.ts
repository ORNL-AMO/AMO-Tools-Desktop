import packageInfo from '../../package.json';


export const environment = {
  production: true,
  version: packageInfo.version,
  measurWeatherApi: 'https://weather.ornl.gov/',
  measurUtilitiesApi: 'https://weather.ornl.gov/'
};
