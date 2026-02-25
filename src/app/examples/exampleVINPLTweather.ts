import { WeatherContextData } from "../shared/modules/weather-data/weather-context.token";

const weatherData: WeatherContextData = {
    "addressString": "Madison, wi",
    "selectedStation": {
        "name": "MADISON DANE CO REGIONAL ARPT [ISIS]",
        "lat": 43.12992,
        "long": -89.329145,
        "distance": 4.7,
        "country": "US",
        "state": "WI",
        "stationId": "72641000000",
        "beginDate": new Date("1500-01-01T00:00:00.000Z"),
        "endDate": new Date("2000-12-31T00:00:00.000Z"),
        "isTMYData": true,
        "ratingPercent": 100
    },
    "weatherDataPoints": Array.from({ length: 8760 }, (_, i) => ({
        time: `2000-01-01 00:00:00.0`,
        dry_bulb_temp: require("./CWSATExampleVINPLTConstants").drybulbValues[i],
        wet_bulb_temp: require("./CWSATExampleVINPLTConstants").wetbulbValues[i]
    }))

};

export default weatherData;