import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Input()
  psatForm: any;

  constructor() { }

  ngOnInit() {
  }

  addNum(str: string) {
    if (str == 'viscosity') {
      this.psatForm.value.viscosity++;
    } else if (str == 'stages') {
      this.psatForm.value.stages++;
    }
  }

  subtractNum(str: string) {
    if (str == 'viscosity') {
      if (this.psatForm.value.viscosity != 0) {
        this.psatForm.value.viscosity--;
      }
    } else if (str == 'stages') {
      if (this.psatForm.value.stages != 0) {
        this.psatForm.value.stages--;
      }
    }
  }

}
