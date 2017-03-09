import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-water-cooling-losses-form',
  templateUrl: './water-cooling-losses-form.component.html',
  styleUrls: ['./water-cooling-losses-form.component.css']
})
export class WaterCoolingLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  constructor() { }

  ngOnInit() {
  }

}
