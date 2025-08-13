import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'development-web',
  version: packageInfo.version,
  useServiceWorker: true,
  measurWeatherApi: 'https://dev.ir-utilities.ornl.gov/',
  measurUtilitiesApi: 'https://dev.ir-utilities.ornl.gov/'
};
