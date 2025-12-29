import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';
@Component({
    selector: 'app-slag-help',
    templateUrl: './slag-help.component.html',
    styleUrls: ['./slag-help.component.css'],
    standalone: false
})
export class SlagHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
    
  }

}
