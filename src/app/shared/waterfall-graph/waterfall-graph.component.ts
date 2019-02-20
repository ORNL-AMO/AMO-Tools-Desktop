import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-waterfall-graph',
  templateUrl: './waterfall-graph.component.html',
  styleUrls: ['./waterfall-graph.component.css']
})
export class WaterfallGraphComponent implements OnInit {
  @Input()
  waterfallInput1: WaterfallInput;
  @Input()
  waterfallInput2: WaterfallInput;
  @Input()
  focusInput1: boolean;
  @Input()
  containerWidth: number;
  @Input()
  printView: boolean;
  constructor() { }

  ngOnInit() {
  }

}

export interface WaterfallItem {
  value: number,
  label: string,
  isStartValue: boolean,
  isNetValue: boolean
};

export interface WaterfallInput {
  name: string,
  inputObjects: Array<WaterfallItem>,
  startColor: string,
  lossColor: string,
  netColor: string
}

/*

  design notes:

    Need a single defined maximum magnitude to represent the 100% mark
    - must distinguish values as a source of loss or a net result and color accordingly


    Allowing Overlay:


    Coloring:
      need to provide color scheme 
*/
