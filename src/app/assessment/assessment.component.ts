import { Component, OnInit } from '@angular/core';
import { ModelService } from '../shared/model.service';
import { Directory } from '../shared/models/directory';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
})
export class AssessmentComponent implements OnInit {
  directory: Directory;

  constructor(private _modelService: ModelService) { }

  ngOnInit() {
  }

  getDirectory(){
    let tmpDir = localStorage.getItem('rootDirectory');

    if(!tmpDir){
      this.directory = this._modelService.initDirectory();
      let tmp = JSON.stringify(this.directory);
      localStorage.setItem('rootDirectory', tmp);
      console.log(this.directory);
    }else{
      this.directory = JSON.parse(tmpDir);
      console.log(this.directory);
    }
  }

  clearLocal(){
    localStorage.clear();
  }

  addPSAT(){
    if(this.directory){
      if(this.directory.assessments) {
        this.directory.assessments.push(this._modelService.getNewPsat());
      }else{
        this.directory.assessments = new Array();
        this.directory.assessments.push(this._modelService.getNewPsat());
      }
    }
  }

  addDirectory(){
    if(this.directory){
      if(this.directory.subDirectory) {
        this.directory.subDirectory.push(this._modelService.getNewDirectory('New Directory'));
      }else {
        this.directory.subDirectory = new Array();
        this.directory.subDirectory.push(this._modelService.getNewDirectory('New Directory'));
      }
    }
  }

  save(){
    if(this.directory){
      localStorage.setItem('rootDirectory', JSON.stringify(this.directory));
      console.log(JSON.parse(localStorage.getItem('rootDirectory')));
    }
  }

}
