import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { MeasurFormattedError } from './MeasurErrorHandler';
import { HttpErrorResponse } from '@angular/common/http';
import { MeasurHttpError, MeasurAppError } from './errors';

@Injectable()
export class AppErrorService {
  measurFormattedError: BehaviorSubject<MeasurFormattedError>;

  constructor() {
    this.measurFormattedError = new BehaviorSubject<MeasurFormattedError>(undefined);
  }

  // * callback for rxjs catchError
  handleHttpError(error: HttpErrorResponse, callOrigin: string) {
    let customError: MeasurHttpError = new MeasurHttpError('An error occured. Please try again');
    if (error.error instanceof ErrorEvent) {
      customError.message = 'An error occured trying to retrieve data from the server. Please try again.';
    } else if (error.error instanceof ProgressEvent && error.status === 0) {
      customError.message = 'A network error occured. Please check your internet connection.';
    }
    return throwError(() => customError);
  }

  handleObservableAppError(message: string, e: unknown) {
    message = message ? message : 'MEASUR app error'
    return throwError(() => new MeasurAppError(message, this.getUnknownError(e)));
  }

  handleAppError(message: string, e: unknown) {
    message = message ? message : 'MEASUR app error'
    throw new MeasurAppError(message, this.getUnknownError(e));
  }

  getUnknownError(error: unknown) {
    if (error instanceof Error) {
      return error;
    }
    return undefined;
  }

}