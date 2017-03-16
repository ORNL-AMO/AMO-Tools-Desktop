import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-head-tool-form',
  templateUrl: './head-tool-form.component.html',
  styleUrls: ['./head-tool-form.component.css']
})
export class HeadToolFormComponent implements OnInit {
  @Input()
  headToolForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  calc() {
    if (this.headToolForm.valid) {
      this.calculate.emit(true);
    }
  }

}
