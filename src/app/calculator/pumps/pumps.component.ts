import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-pumps',
  templateUrl: './pumps.component.html',
  styleUrls: ['./pumps.component.css']
})
export class PumpsComponent implements OnInit {
  @Input()
  selectedTool: string;
  @Input()
  goCalcHome: boolean;
  @Input()
  pumpForm: any;
  firstChange: boolean = true;
  exponentError: string = null;

  @Output('changeField')
  changeField = new EventEmitter<string>();
  ///@Output('saveEmit')constructor() { }

  ngOnInit() {
    if (!this.selectedTool) {
      this.selectedTool = 'none';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      this.selectedTool = 'none';
    }else{
      this.firstChange = false;
    }
  }

  showTool(str: string) {
    this.selectedTool = str;
  }

  hideTool() {
    this.selectedTool = 'none';
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }

  getSelectedTool() {
    if (this.selectedTool != undefined) {
      return this.selectedTool;
    }
  }
  checkLossExponent() {
    if (this.pumpForm.value.systemLossExponent > 2.5) {
      this.exponentError = 'System Loss Exponent needs to be between 1 - 2.5';
      return false;
    }
    else if (this.pumpForm.value.systemLossExponent < 0) {
      this.exponentError = 'Cannot have negative System Loss Exponent';
      return false;
    }
    else {
      this.exponentError = null;
      return true;
    }
  }
}
