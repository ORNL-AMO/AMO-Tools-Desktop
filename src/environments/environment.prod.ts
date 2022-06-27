import packageInfo from '../../package.json';


export const environment = {
  production: true,
  version: packageInfo.version,
  weatherApiUrl: 'https://weather.ornl.gov/'
};
