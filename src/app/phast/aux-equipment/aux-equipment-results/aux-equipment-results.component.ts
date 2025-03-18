import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-aux-equipment-results',
    templateUrl: './aux-equipment-results.component.html',
    styleUrls: ['./aux-equipment-results.component.css'],
    standalone: false
})
export class AuxEquipmentResultsComponent implements OnInit {
  @Input()
  results: Array<{name: string, totalPower: number, motorPower: string}>;
  @Input()
  resultsSum: number;
  constructor() { }

  ngOnInit() {
  }



}
