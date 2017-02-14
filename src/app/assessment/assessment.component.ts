import { Component, OnInit } from '@angular/core';
import { ModelService } from '../shared/model.service';
import { Directory } from '../shared/models/directory';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
})
export class AssessmentComponent implements OnInit {
  _directory: Directory;

  constructor(private _modelService: ModelService) { }

  ngOnInit() {
  }

  getDirectory(){
    let tmpDir = localStorage.getItem('rootDirectory');

    if(!tmpDir){
      this._directory = this._modelService.initDirectory();
      let tmp = JSON.stringify(this._directory);
      localStorage.setItem('rootDirectory', tmp);
      console.log(this._directory);
    }else{
      this._directory = JSON.parse(tmpDir);
      console.log(this._directory);
    }
  }

  clearLocal(){
    localStorage.clear();
  }

  addPSAT(){
    if(this._directory){
      if(this._directory.psat) {
        this._directory.psat.push(this._modelService.getNewPsat());
      }else{
        this._directory.psat = new Array();
        this._directory.psat.push(this._modelService.getNewPsat());
      }
    }
  }

  addDirectory(){
    if(this._directory){
      if(this._directory.directories) {
        this._directory.directories.push(this._modelService.getNewDirectory('New Directory'));
      }else {
        this._directory.directories = new Array();
        this._directory.directories.push(this._modelService.getNewDirectory('New Directory'));
      }
    }
  }

  save(){
    if(this._directory){
      localStorage.setItem('rootDirectory', JSON.stringify(this._directory));
      console.log(JSON.parse(localStorage.getItem('rootDirectory')));
    }
  }

}
