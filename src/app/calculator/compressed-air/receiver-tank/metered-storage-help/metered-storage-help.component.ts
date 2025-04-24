import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-metered-storage-help',
    templateUrl: './metered-storage-help.component.html',
    styleUrls: ['./metered-storage-help.component.css'],
    standalone: false
})
export class MeteredStorageHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}
