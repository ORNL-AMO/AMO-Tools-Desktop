import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-operating-cost-help',
    templateUrl: './operating-cost-help.component.html',
    styleUrls: ['./operating-cost-help.component.css'],
    standalone: false
})
export class OperatingCostHelpComponent implements OnInit {
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

}
