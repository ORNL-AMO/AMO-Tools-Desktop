import { Component, OnInit, Input } from '@angular/core';
import { FieldMeasurementOutputs } from '../percent-load-estimation.component';

@Component({
  selector: 'app-field-measurement-table',
  templateUrl: './field-measurement-table.component.html',
  styleUrls: ['./field-measurement-table.component.css']
})
export class FieldMeasurementTableComponent implements OnInit {
  @Input()
  fieldMeasurementResults: FieldMeasurementOutputs;

  constructor() { }

  ngOnInit() {
  }

}
