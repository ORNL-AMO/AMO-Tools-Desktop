import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-dedicated-storage-help',
    templateUrl: './dedicated-storage-help.component.html',
    styleUrls: ['./dedicated-storage-help.component.css'],
    standalone: false
})
export class DedicatedStorageHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
