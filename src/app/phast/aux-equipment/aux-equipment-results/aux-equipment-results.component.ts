import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-aux-equipment-results',
  templateUrl: './aux-equipment-results.component.html',
  styleUrls: ['./aux-equipment-results.component.css']
})
export class AuxEquipmentResultsComponent implements OnInit {
  @Input()
  results: any[];
  @Input()
  resultsSum: number;
  constructor() { }

  ngOnInit() {
  }



}
