import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'production-web',
  version: packageInfo.version,
  useServiceWorker: true,
  measurWeatherApi: 'https://weather.ornl.gov/',
  measurUtilitiesApi: 'https://weather.ornl.gov/'
};
