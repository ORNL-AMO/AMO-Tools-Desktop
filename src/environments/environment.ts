// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.
// 
// import packageInfo from '../../package.json';
// import * as packageInfo from '../../package.json';
import packageInfo from '../../package.json';


export const environment = {
  production: false,
  name: 'development',
  version: packageInfo.version,
  useServiceWorker: false,
  measurWeatherApi: 'https://lcd.ornl.gov/api',
  measurWeatherApiLegacy: 'https://dev.weather.ornl.gov/',
  measurUtilitiesApi: 'http://127.0.0.1:3000/',
  measurDocsUrl: 'https://dev.industrialresources.ornl.gov/measur/suite/docs/'
};
