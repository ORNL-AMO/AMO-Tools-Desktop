import packageInfo from '../../package.json';


export const environment = {
  production: true,
  name: 'desktop',
  version: packageInfo.version,
  useServiceWorker: false,
  measurWeatherApi: 'https://lcd.ornl.gov/api',
  measurUtilitiesApi: 'https://ir-utilities.ornl.gov/',
  measurDocsUrl: 'https://industrialresources.ornl.gov/measur/suite/docs/'
};
