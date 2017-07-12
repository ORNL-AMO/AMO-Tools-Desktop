import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-head-tool-help',
  templateUrl: './head-tool-help.component.html',
  styleUrls: ['./head-tool-help.component.css']
})
export class HeadToolHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  headToolType: string;
  constructor() { }

  ngOnInit() {
  }

}
