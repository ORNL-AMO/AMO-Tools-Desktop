import { Component, OnInit, Input } from '@angular/core';
import { Co2SavingsData } from '../co2-savings.service';

@Component({
  selector: 'app-co2-savings-results',
  templateUrl: './co2-savings-results.component.html',
  styleUrls: ['./co2-savings-results.component.css']
})
export class Co2SavingsResultsComponent implements OnInit {
  @Input()
  baselineData: Array<Co2SavingsData>;
  @Input()
  modificationData: Array<Co2SavingsData>;
  @Input()
  baselineTotal: number;
  @Input()
  modificationTotal: number;
  
  constructor() { }

  ngOnInit() {
  }

}
