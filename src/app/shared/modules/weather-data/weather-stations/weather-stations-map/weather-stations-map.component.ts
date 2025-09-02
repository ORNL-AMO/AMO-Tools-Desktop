import { Component, SimpleChanges, ElementRef, ViewChild, Input } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import * as _ from 'lodash';
import { WeatherStation } from '../../../../weather-api.service';

@Component({
  selector: 'app-weather-stations-map',
  templateUrl: './weather-stations-map.component.html',
  styleUrls: ['./weather-stations-map.component.css'],
  standalone: false
})
export class WeatherStationsMapComponent {
  @Input()
  stations: Array<WeatherStation>
  @Input()
  zipCode: string;
  @Input()
  furthestDistance: number;
  @Input()
  addressLatLong: {
    latitude: number,
    longitude: number,
  };
  @Input()
  stateLines = {
    type: 'scattergeo',
    mode: 'lines',
    lat: [],
    lon: [],
    line: {
      color: 'gray',
      width: 1
    },
    showlegend: false
  };

  @ViewChild('weatherStationMap', { static: false }) weatherStationMap: ElementRef;

  mapData: Array<{
    lng: number,
    lat: number,
    name: string,
    isZip: boolean
  }>;
  scope: string;
  constructor(private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.setMapData();
  }


  ngAfterViewInit() {
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.stations && !changes.stations.isFirstChange())) {
      this.setMapData();
      this.drawChart();
    }
  }

  drawChart() {
    if (this.weatherStationMap && this.mapData && this.mapData.length != 0) {
      var data = [{
        type: 'scattergeo',
        mode: 'markers',
        lat: this.mapData.map(item => { return item.lat }),
        lon: this.mapData.map(item => { return item.lng }),
        hoverinfo: 'text',
        text: this.mapData.map(item => { return item.name }),
        marker: {
          text: this.mapData.map(item => { return item.name }),
          size: this.mapData.map(item => {
            if (item.isZip) {
              return 15;
            } else {
              return 10;
            }
          }),
          color: this.mapData.map(item => {
            if (item.isZip) {
              return 'red';
            } else {
              return 'blue';
            }
          }),
          line: {
            color: 'black'
          },
        },
      }];


      // Layout configuration
      const layout = {
        geo: {
          scope: 'world',
          showland: true,
          landcolor: 'lightgray',
          showocean: true,
          oceancolor: 'lightblue',
          showcountries: true,
          countrycolor: 'black',
          showlakes: true,
          lakecolor: 'lightblue',
          projection: {
            type: 'natural earth'
          },
          lonaxis: {},
          lataxis: {}
        },
        showlegend: false,
        margin: { "t": 0, "b": 50, "l": 0, "r": 50 },
      };

      let config = {
        displaylogo: false,
        responsive: true,
      }
      // Combine data and state lines
      const allData = [this.stateLines, ...data];

      // Create the plot
      this.plotlyService.newPlot(this.weatherStationMap.nativeElement, allData, layout, config);
    }
  }

  setMapData() {
    this.mapData = this.stations.map(station => {
      return {
        lat: station.lat,
        lng: station.long,
        name: station.name,
        isZip: false
      }
    });
    if (this.addressLatLong) {
      this.mapData.push({
        lat: this.addressLatLong.latitude,
        lng: this.addressLatLong.longitude,
        name: "Search Location",
        isZip: true
      })
    }
    let countries: Array<string> = this.stations.flatMap(station => {
      return station.country
    });
    countries = _.uniq(countries);
  }
}
