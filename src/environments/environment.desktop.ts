import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'desktop',
  version: packageInfo.version,
  useServiceWorker: false,
  measurWeatherApi: 'https://weather.ornl.gov/',
  measurUtilitiesApi: 'https://weather.ornl.gov/'
};
