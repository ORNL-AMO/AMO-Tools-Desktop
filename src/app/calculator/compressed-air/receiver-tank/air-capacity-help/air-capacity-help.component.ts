import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-air-capacity-help',
    templateUrl: './air-capacity-help.component.html',
    styleUrls: ['./air-capacity-help.component.css'],
    standalone: false
})
export class AirCapacityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

}
