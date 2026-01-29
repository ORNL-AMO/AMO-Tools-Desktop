## Weather Data Module Documentation

### Module Origin and Purpose

Adapted from the VERIFI application, this module provides real-time and TMY3 weather data. The UI and logic were initially kept similar to VERIFI for consistency.

**Note:** Temporary changes exist for process cooling assessment integration and will be refined as requirements are finalized.

### Future Intent

This module will eventually replace the weather lookup in process-cooling calculators, unifying weather data handling and reducing code duplication.

### Key Features

- Accesses real-time and TMY3 weather data via the [ORNL LCD Weather API](https://weather.ornl.gov/api/)
- Integrates easily with other modules, especially process cooling assessment

### External Resources

- [ORNL LCD Weather API Documentation](https://weather.ornl.gov/api/)

### Integration Notes

This module works with the `WeatherContext` token to create custom weather services for specific features. For example, `ProcessCoolingWeatherContextService` implements `WeatherContext` to manage and validate weather data for process cooling assessment.



