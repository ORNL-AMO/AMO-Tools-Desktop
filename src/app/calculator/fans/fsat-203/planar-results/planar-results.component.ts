import { Component, OnInit, Input } from '@angular/core';
import { Fan203Inputs } from '../../../../shared/models/fans';

@Component({
  selector: 'app-planar-results',
  templateUrl: './planar-results.component.html',
  styleUrls: ['./planar-results.component.css']
})
export class PlanarResultsComponent implements OnInit {
  @Input()
  planarResults: any;
  @Input()
  showFull: boolean;
  @Input()
  inputs: Fan203Inputs;
  constructor() { }

  ngOnInit() {
    console.log(this.inputs)
  }

}
