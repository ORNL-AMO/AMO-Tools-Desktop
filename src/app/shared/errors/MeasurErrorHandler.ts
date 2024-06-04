import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { MeasurAppError, MeasurError } from "./errors";
import { AppErrorService } from "./app-error.service";

@Injectable()
export class MeasurErrorHandler implements ErrorHandler {
    constructor(
      private zone: NgZone,
      private appErrorService: AppErrorService
    ) {}
  
    handleError(error: any) {
      const measurFormattedError = this.getFormattedError(error);
      // Only notify on app breaking errors
      if (measurFormattedError) {
        this.zone.run(() =>
          this.appErrorService.measurFormattedError.next(measurFormattedError)
        );
      }
    }

    getFormattedError(error: any): MeasurFormattedError {
      let formattedError: MeasurFormattedError;
      error = error.rejection? error.rejection : error;
      if (error instanceof MeasurAppError) {
        formattedError = {
          message: error.message,
          data: []
        };
        formattedError.data.push(error.stack);
        console.trace();
      } else if (error instanceof HttpErrorResponse) {
        console.error('HttpErrorResponse', error);
      } else {
        console.error('UnknownError', error);
      }
      return formattedError;
    }
  
}

export interface MeasurFormattedError {
  message: string,
  data: string[]
}
