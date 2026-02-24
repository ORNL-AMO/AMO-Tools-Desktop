import packageInfo from '../../package.json';


export const environment = {
  production: false,
  name: 'development',
  version: packageInfo.version,
  useServiceWorker: false,
  measurWeatherApi: 'https://lcd.ornl.gov/api',
  // swap in localhost:3000 with local measurUtilitiesApi ('weather') build if needed
  measurUtilitiesApi: 'https://dev.ir-utilities.ornl.gov/',
  measurDocsUrl: 'https://dev.industrialresources.ornl.gov/measur/suite/docs/',
};
