import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-head-tool-suction-form',
  templateUrl: './head-tool-suction-form.component.html',
  styleUrls: ['./head-tool-suction-form.component.css']
})
export class HeadToolSuctionFormComponent implements OnInit {
  @Input()
  headToolSuctionForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  calc() {
    if (this.headToolSuctionForm.valid) {
      this.calculate.emit(true);
    }
  }
}
