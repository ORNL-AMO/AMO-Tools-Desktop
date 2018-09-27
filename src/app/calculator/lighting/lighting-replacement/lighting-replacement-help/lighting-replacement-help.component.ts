import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-lighting-replacement-help',
  templateUrl: './lighting-replacement-help.component.html',
  styleUrls: ['./lighting-replacement-help.component.css']
})
export class LightingReplacementHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
