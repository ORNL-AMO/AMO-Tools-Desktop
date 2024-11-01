import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-power-factor-triangle-help',
  templateUrl: './power-factor-triangle-help.component.html',
  styleUrls: ['./power-factor-triangle-help.component.css']
})
export class PowerFactorTriangleHelpComponent {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
