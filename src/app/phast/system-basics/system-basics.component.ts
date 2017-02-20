import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { FormBuilder }  from '@angular/forms';
@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  phast: Assessment;

  sourcesForm: any;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.sourcesForm = this.initForm();
  }

  initForm(){
    return this.formBuilder.group({
      'heatSource': [''],
      'energySource': ['']
    })
  }
}
