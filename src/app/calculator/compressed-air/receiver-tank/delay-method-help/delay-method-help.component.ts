import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-delay-method-help',
    templateUrl: './delay-method-help.component.html',
    styleUrls: ['./delay-method-help.component.css'],
    standalone: false
})
export class DelayMethodHelpComponent implements OnInit {
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

}
