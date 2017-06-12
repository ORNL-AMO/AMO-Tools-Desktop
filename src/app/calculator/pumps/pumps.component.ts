import { Component, OnInit, Input, SimpleChanges} from '@angular/core';


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

  firstChange: boolean = true;


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


  getSelectedTool() {
    if (this.selectedTool != undefined) {
      return this.selectedTool;
    }
  }

}
