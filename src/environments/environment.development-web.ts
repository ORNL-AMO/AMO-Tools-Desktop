import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'development-web',
  version: packageInfo.version,
  useServiceWorker: true,
  measurWeatherApi: 'https://lcd.ornl.gov/api',
  measurWeatherApiLegacy: 'https://dev.weather.ornl.gov/',
  measurUtilitiesApi: 'https://dev.ir-utilities.ornl.gov/',
  measurDocsUrl: 'https://dev.industrialresources.ornl.gov/measur/suite/docs/'
};
