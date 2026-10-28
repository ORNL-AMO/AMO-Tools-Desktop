import { AssessmentItemComponent } from './assessment-item.component';
import { AssessmentService } from '../../../assessment.service';
import { Assessment } from '../../../../shared/models/assessment';

describe('AssessmentItemComponent', () => {
  let component: AssessmentItemComponent;
  let assessmentServiceSpy: jasmine.SpyObj<AssessmentService>;
  const assessment: Assessment = { id: 2, name: 'Pump', type: 'PSAT' };

  beforeEach(() => {
    assessmentServiceSpy = jasmine.createSpyObj('AssessmentService', ['goToAssessment']);
    // goToAssessment only uses AssessmentService. Constructed directly so the dashboard subscriptions in ngOnInit/ngOnDestroy never run.
    const unused = {} as never;
    component = new AssessmentItemComponent(assessmentServiceSpy, unused, unused, unused, unused, unused, unused, unused, unused, unused, unused, unused);
  });

  it('passes the requested main tab through to the assessment service', () => {
    component.goToAssessment(assessment, 'report');
    expect(assessmentServiceSpy.goToAssessment).toHaveBeenCalledWith(assessment, 'report');
  });

  it('leaves the main tab undefined so the service picks the default', () => {
    component.goToAssessment(assessment);
    expect(assessmentServiceSpy.goToAssessment).toHaveBeenCalledWith(assessment, undefined);
  });
});
