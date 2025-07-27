import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";
import { AssessmentDbService } from "../../indexedDb/assessment-db.service";
import { ROUTE_TOKENS } from "../../process-cooling/process-cooling.module";
import { Assessment } from "../../shared/models/assessment";
import { Injectable } from "@angular/core";

@Injectable()
export class AssessmentRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private assessmentDbService: AssessmentDbService
  ) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        const assessmentId = Number(route.params['assessmentId']);
        let assessment: Assessment = this.assessmentDbService.findById(assessmentId);
        let redirectUrlTree: UrlTree;
        
        if (!assessment.processCooling.setupDone) {
            redirectUrlTree = this.router.createUrlTree(['/process-cooling', assessmentId, ROUTE_TOKENS.baseline]);
            // this.router.createUrlTree(['/assessment', assessmentId, 'setup']);
        } else {
          redirectUrlTree = this.router.createUrlTree(['/process-cooling', assessmentId, ROUTE_TOKENS.baseline]);
        }
        console.log('AssessmentRedirectGuard redirecting to:', redirectUrlTree.toString());
        return of(redirectUrlTree);
    }
}
