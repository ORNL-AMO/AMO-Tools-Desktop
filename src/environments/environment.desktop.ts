import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'desktop',
  version: packageInfo.version,
  useServiceWorker: false,
  measurWeatherApi: 'https://ir-utilities.ornl.gov/',
  measurUtilitiesApi: 'https://ir-utilities.ornl.gov/'
};
