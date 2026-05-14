// @ts-ignore
import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-electricity-reduction-help',
    templateUrl: './electricity-reduction-help.component.html',
    styleUrls: ['./electricity-reduction-help.component.css'],
    standalone: false
})
export class ElectricityReductionHelpComponent implements OnInit {
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

}
