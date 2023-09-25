import packageInfo from '../../package.json';


export const environment = {
  production: true,
  version: packageInfo.version,
  useServiceWorker: false,
  measurWeatherApi: 'https://weather.ornl.gov/',
  measurUtilitiesApi: 'https://weather.ornl.gov/'
};
