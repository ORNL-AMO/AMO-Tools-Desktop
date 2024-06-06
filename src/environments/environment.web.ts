import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'web',
  version: packageInfo.version,
  useServiceWorker: true,
  measurWeatherApi: 'https://weather.ornl.gov/',
  measurUtilitiesApi: 'https://weather.ornl.gov/'
};
