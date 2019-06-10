import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-system-curve-help',
  templateUrl: './system-curve-help.component.html',
  styleUrls: ['./system-curve-help.component.css']
})
export class SystemCurveHelpComponent implements OnInit {
  @Input()
  isFan: boolean;
  constructor() { }

  ngOnInit() {
  }

}
