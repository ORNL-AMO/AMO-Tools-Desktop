import { Component, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
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
  constructor(private formBuilder: FormBuilder, private router: Router) { }

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
