import { Component, OnInit } from "@angular/core";


@Component({
  selector: 'app-compressed-air-sankey',
  templateUrl: './compressed-air-sankey.component.html',
  styleUrls: ['./compressed-air-sankey.component.css']
})
export class CompressedAirSankeyComponent implements OnInit {

  sankeyTab: 'airflow' | 'power' = 'power';
  constructor(
  ) { }

  ngOnInit() {
  }

  changeSankeyTab(sankeyTab: 'airflow' | 'power') {
    this.sankeyTab = sankeyTab;
  }

}
