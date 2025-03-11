import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'development-web',
  version: packageInfo.version,
  useServiceWorker: true,
  measurWeatherApi: 'https://dev.weather.ornl.gov/',
  measurUtilitiesApi: 'https://dev.weather.ornl.gov/'
};
