import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-dedicated-storage-help',
    templateUrl: './dedicated-storage-help.component.html',
    styleUrls: ['./dedicated-storage-help.component.css'],
    standalone: false
})
export class DedicatedStorageHelpComponent implements OnInit {
  @Input()
  currentField: string;
  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

}
