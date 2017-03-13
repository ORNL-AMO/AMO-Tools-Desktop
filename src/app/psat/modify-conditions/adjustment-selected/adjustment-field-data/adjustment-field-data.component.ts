import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-adjustment-field-data',
  templateUrl: './adjustment-field-data.component.html',
  styleUrls: ['./adjustment-field-data.component.css']
})
export class AdjustmentFieldDataComponent implements OnInit {
  @Input()
  adjustmentForm: any;

  constructor() { }

  ngOnInit() {
  }

}
