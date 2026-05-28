import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-general-method-help',
    templateUrl: './general-method-help.component.html',
    styleUrls: ['./general-method-help.component.css'],
    standalone: false
})
export class GeneralMethodHelpComponent implements OnInit {
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

}
