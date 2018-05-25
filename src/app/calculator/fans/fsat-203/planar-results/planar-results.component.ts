import { Component, OnInit, Input } from '@angular/core';
import { Fan203Inputs, PlaneResults } from '../../../../shared/models/fans';

@Component({
  selector: 'app-planar-results',
  templateUrl: './planar-results.component.html',
  styleUrls: ['./planar-results.component.css']
})
export class PlanarResultsComponent implements OnInit {
  @Input()
  planeResults: PlaneResults;
  @Input()
  showFull: boolean;
  @Input()
  inputs: Fan203Inputs;
  @Input()
  inModal: boolean;
  constructor() { }

  ngOnInit() {
  }

}
