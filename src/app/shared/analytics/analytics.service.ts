import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class AnalyticsService {

  private clientId: string;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    })
  };

  constructor(private httpClient: HttpClient) {}

  postEventToMeasurementProtocol(eventName: AnalyticsEventString, eventParams: EventParameters) {
    this.setEventParams(eventName, eventParams);
    let callDebuggingEndpoint = environment.production ? false : true;
    let postBody = {
      isDebugging: callDebuggingEndpoint,
      analyticsPayload: {
        client_id: this.clientId,
        non_personalized_ads: true,
        events: [{
          name: eventName,
          params: eventParams
        }]
      }
    }

    let url: string = environment.measurUtilitiesApi + 'gamp';
    this.httpClient.post<any>(url, postBody, this.httpOptions)
      .pipe(catchError(error => [])).subscribe({
        next: (resp) => {
          // only GA debugging endpoint returns a response
          console.log(resp);
        },
        error: (error: AnalyticsHttpError) => {
          // for now all errors fail silently
        }
      });
  }

  setClientId(uuid: string) {
    this.clientId = uuid;
  }

  setEventParams(eventName: AnalyticsEventString, eventParams: EventParameters) {
    if (eventName === 'page_view' && !eventParams.page_path.includes('inventory')) {
      let pathWithoutId: string = eventParams.page_path.replace(/[0-9]/g, '');
      pathWithoutId = pathWithoutId.replace(/\/$/, "");
      eventParams.page_path = pathWithoutId;
    }
    // Never send real paths while in dev
    if (!environment.production) { 
      eventParams.page_path = '/testing'
    }
    return eventParams;
  }

  // handleError(error: HttpErrorResponse, callOrigin: string) {
  //   let customError: AnalyticsHttpError = new AnalyticsHttpError('An error occured. Please try again');
  //   if (error.error instanceof ErrorEvent) {
  //     customError.message = 'server error';
  //   } else if (error.error instanceof ProgressEvent && error.status === 0) {
  //     customError.message = 'A network error occured. Please check your internet connection.';
  //   } 
  //   return throwError(() => customError);
  // }


}

export class AnalyticsHttpError extends Error {}

export interface AnalyticsPayload {
  client_id: string,
  user_id?: string,
  non_personalized_ads: boolean,
  events: Array<{name: string, params: object}>
}

export interface EventParameters {
  page_path?: string,
  session_id?: string,
  engagement_time_msec?: string,
}

export type AnalyticsEventString = 'page_view';