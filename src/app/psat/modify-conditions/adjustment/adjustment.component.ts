import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-adjustment',
  templateUrl: './adjustment.component.html',
  styleUrls: ['./adjustment.component.css']
})
export class AdjustmentComponent implements OnInit {
  @Input()
  adjustment: PSAT;

  constructor() { }

  ngOnInit() {
  }
}
