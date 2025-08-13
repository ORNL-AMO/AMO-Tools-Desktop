import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'production-web',
  version: packageInfo.version,
  useServiceWorker: true,
  measurWeatherApi: 'https://ir-utilities.ornl.gov/',
  measurUtilitiesApi: 'https://ir-utilities.ornl.gov/'
};
