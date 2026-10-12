import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-nema-energy-efficiency-help',
    templateUrl: './nema-energy-efficiency-help.component.html',
    styleUrls: ['./nema-energy-efficiency-help.component.css'],
    standalone: false
})
export class NemaEnergyEfficiencyHelpComponent implements OnInit {
  @Input()
  currentField: string;

  docsLink: string = environment.measurDocsUrl;

  constructor() { }

  ngOnInit() {
  }

}
