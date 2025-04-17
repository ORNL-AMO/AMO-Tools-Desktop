import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from "../../../../shared/models/phast/phast";
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-operation-data',
    templateUrl: './operation-data.component.html',
    styleUrls: ['./operation-data.component.css'],
    standalone: false
})
export class OperationDataComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  collapse: boolean = true;

  constructor() { }

  ngOnInit() {

  }
  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
