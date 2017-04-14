import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Assessment } from '../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../assessment/assessment.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Output('selectCalculator')
  selectCalculator = new EventEmitter<string>();
  @Input()
  directory: Directory;
  @Input()
  workingDirectory: Directory;

  selectedDirectory: Directory;
  constructor(private assessmentService: AssessmentService, private router: Router) { }

  ngOnInit() {
    this.selectedDirectory = this.directory;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workingDirectory) {
      console.log(this.workingDirectory)
      this.toggleSelected(this.workingDirectory);
    }
  }

  toggleDirectoryCollapse(dir: Directory) {
    dir.collapsed = !dir.collapsed;
  }

  toggleSelected(dir: Directory) {
    if (dir.collapsed == true) {
      dir.collapsed = false;
    }
    this.selectedDirectory = dir;
    this.directoryChange.emit(dir);
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.setWorkingAssessment(assessment);
    if (assessment.type == 'PSAT') {
      this.router.navigateByUrl('/psat');
    } else if (assessment.type == 'PHAST') {
      this.router.navigateByUrl('/phast');
    }
  }

  chooseCalculator(str: string) {
    this.selectCalculator.emit(str);
  }


}
