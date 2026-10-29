import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-fan-field-data-help',
    templateUrl: './fan-field-data-help.component.html',
    styleUrls: ['./fan-field-data-help.component.css'],
    standalone: false
})
export class FanFieldDataHelpComponent implements OnInit {
  docsLink: string = environment.measurDocsUrl;

  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
