import { Injectable } from '@angular/core';
import { Directory } from './models/directory'
import { Assessment } from "./models/assessment";
import { MockDirectory } from './mocks/mock-directory';
@Injectable()
export class ModelService {

  constructor() { }

  initDirectory() {
    let newDirectory: Directory = {
      name: 'Root',
      assessments: null,
      subDirectory: null
    }
    return newDirectory
  }

  getNewDirectory(name: string){
    let newDirectory: Directory = {
      name: name,
      assessments: null,
      subDirectory: null
    }
    return newDirectory
  }

}
