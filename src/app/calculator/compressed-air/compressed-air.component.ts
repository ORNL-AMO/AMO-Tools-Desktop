import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-compressed-air',
  templateUrl: './compressed-air.component.html',
  styleUrls: ['./compressed-air.component.css']
})
export class CompressedAirComponent implements OnInit {
  @Input()
  selectedTool: string;
  @Input()
  goCalcHome: boolean;

  firstChange: boolean = true;
  constructor() { }

  ngOnInit() {
    if (!this.selectedTool) {
      this.selectedTool = 'none';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      this.selectedTool = 'none';
    } else {
      this.firstChange = false;
    }
  }

  showTool(str: string) {
    this.selectedTool = str;
  }

  hideTool() {
    this.selectedTool = 'none'
  }


  getSelectedTool() {
    if (this.selectedTool != undefined) {
      return this.selectedTool;
    }
  }

}
