import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DirectoryDbRef, Directory } from '../shared/models/directory';
import { MockDirectory } from '../shared/mocks/mock-directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allDirectories: Directory;
  workingDirectory: Directory;
  showCalculators: boolean = false;
  selectedCalculator: string;

  newDirectory: any;

  constructor(private indexedDbService: IndexedDbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.newDirectory = this.formBuilder.group({
      directoryName: ['', Validators.required]
    });

    //open DB and get directories
    this.indexedDbService.initDb().then(
      results => {
        this.indexedDbService.getDirectory(1).then(
          results => {
            if (results) {

              this.allDirectories = this.populateDirectories(results);
              this.workingDirectory = this.allDirectories
              debugger
            }
          })
      }
    )
  }

  populateDirectories(directoryRef: DirectoryDbRef): Directory {
    let tmpDirectory: Directory = {
      name: directoryRef.name,
      createdDate: directoryRef.createdDate,
      modifiedDate: directoryRef.modifiedDate,
    }
    if (directoryRef.assessmentIds) {
      tmpDirectory.assessments = new Array();
      let i = 0;
      for (i; i < directoryRef.assessmentIds.length; i++) {
        this.indexedDbService.getAssessment(directoryRef.assessmentIds[i]).then(
          assessmentObj => {
            tmpDirectory.assessments.push(assessmentObj);
          }
        );
      }
    }
    if (directoryRef.subDirectoryIds) {
      tmpDirectory.subDirectory = new Array();
      let i = 0;
      for (i; i < directoryRef.subDirectoryIds.length; i++) {
        this.indexedDbService.getDirectory(directoryRef.subDirectoryIds[i]).then(
          directoryRef => {
            let tmpDir = this.populateDirectories(directoryRef);
            tmpDirectory.subDirectory.push(tmpDir);
          }
        )
      }
    } else {
      console.log(tmpDirectory);
      return tmpDirectory;
    }
  }


  changeWorkingDirectory($event) {
    this.showCalculators = false;
    this.workingDirectory = $event;
  }

  viewCalculator(str: string) {
    this.showCalculators = true;
    this.selectedCalculator = str;
  }

  createDirectory() {
    debugger
    let tmpDirectory: DirectoryDbRef = {
      name: this.newDirectory.value.directoryName,
      createdDate: new Date(),
      modifiedDate: new Date(),
      assessmentIds: null,
      parentDirectoryId: null,
      subDirectoryIds: null
    }
    this.indexedDbService.addDirectory(tmpDirectory).then(
      results => {
        this.indexedDbService.getDirectory(results).then(result => {
          this.allDirectories = this.populateDirectories(result);
          this.workingDirectory = this.allDirectories;
        })
      }
    )

  }
}
