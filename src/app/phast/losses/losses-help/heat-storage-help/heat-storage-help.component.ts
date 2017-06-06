import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-heat-storage-help',
  templateUrl: './heat-storage-help.component.html',
  styleUrls: ['./heat-storage-help.component.css']
})
export class HeatStorageHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
