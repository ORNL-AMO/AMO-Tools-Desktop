import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-metered-storage-help',
    templateUrl: './metered-storage-help.component.html',
    styleUrls: ['./metered-storage-help.component.css'],
    standalone: false
})
export class MeteredStorageHelpComponent implements OnInit {
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  
  constructor() { }

  ngOnInit() {
  }

}
