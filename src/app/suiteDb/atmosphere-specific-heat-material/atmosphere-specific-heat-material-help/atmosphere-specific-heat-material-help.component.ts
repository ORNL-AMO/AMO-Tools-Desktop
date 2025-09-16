import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-atmosphere-specific-heat-material-help',
    templateUrl: './atmosphere-specific-heat-material-help.component.html',
    styleUrls: ['./atmosphere-specific-heat-material-help.component.css'],
    standalone: false
})
export class AtmosphereSpecificHeatMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
