import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { O2UtilizationRateFormComponent } from './o2-utilization-rate-form.component';
import { O2UtilizationDataPoints, O2UtilizationRateService } from '../o2-utilization-rate.service';

function makeDataPoints(count: number): Array<O2UtilizationDataPoints> {
  return Array.from({ length: count }, (_, index) => ({ time: index * 15, dissolvedOxygen: 5 + index }));
}

describe('O2UtilizationRateFormComponent', () => {
  let component: O2UtilizationRateFormComponent;
  let fixture: ComponentFixture<O2UtilizationRateFormComponent>;
  let o2Service: O2UtilizationRateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [O2UtilizationRateFormComponent],
      imports: [FormsModule],
      providers: [O2UtilizationRateService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    o2Service = TestBed.inject(O2UtilizationRateService);
    fixture = TestBed.createComponent(O2UtilizationRateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.form-group')).slice(1) as HTMLElement[];
  }

  describe('initialization', () => {
    it('assigns the service data points', () => {
      expect(component.inputDataPoints).toBe(o2Service.inputDataPoints.getValue());
    });

    it('updates the data points when the service emits new data', () => {
      const next = makeDataPoints(3);
      o2Service.inputDataPoints.next(next);
      expect(component.inputDataPoints).toBe(next);
    });
  });

  describe('user actions', () => {
    it('save pushes the current data points to the service', () => {
      const nextSpy = spyOn(o2Service.inputDataPoints, 'next').and.callThrough();
      component.inputDataPoints[2].dissolvedOxygen = 4.2;
      component.save();
      expect(nextSpy).toHaveBeenCalledWith(component.inputDataPoints);
      expect(o2Service.inputDataPoints.getValue()[2].dissolvedOxygen).toBe(4.2);
    });

    it('typing in a data point input writes the value and saves', async () => {
      await fixture.whenStable();
      const nextSpy = spyOn(o2Service.inputDataPoints, 'next').and.callThrough();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#dataPoint_1');
      input.value = '3.5';
      input.dispatchEvent(new Event('input'));
      expect(component.inputDataPoints[1].dissolvedOxygen).toBe(3.5);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('renders one row per data point with time label and input', () => {
      const dataPoints = o2Service.inputDataPoints.getValue();
      expect(rows().length).toBe(dataPoints.length);
      dataPoints.forEach((dataPoint, index) => {
        const label = fixture.nativeElement.querySelector(`label[for="dataPoint_${index}"]`);
        expect(label.textContent.trim()).toBe(`${dataPoint.time} seconds`);
        expect(fixture.nativeElement.querySelector(`#dataPoint_${index}`)).not.toBeNull();
      });
    });

    it('binds each input to its data point value', async () => {
      o2Service.inputDataPoints.next(makeDataPoints(2));
      fixture.detectChanges();
      await fixture.whenStable();
      expect((fixture.nativeElement.querySelector('#dataPoint_0') as HTMLInputElement).value).toBe('5');
      expect((fixture.nativeElement.querySelector('#dataPoint_1') as HTMLInputElement).value).toBe('6');
    });

    it('re-renders the rows when the data point count changes', () => {
      o2Service.inputDataPoints.next(makeDataPoints(3));
      fixture.detectChanges();
      expect(rows().length).toBe(3);
      expect(fixture.nativeElement.querySelector('#dataPoint_3')).toBeNull();
    });

    it('renders no data rows when there are no data points', () => {
      o2Service.inputDataPoints.next([]);
      fixture.detectChanges();
      expect(rows().length).toBe(0);
      expect(fixture.nativeElement.querySelector('input')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops following service data after destroy', () => {
      const before = component.inputDataPoints;
      fixture.destroy();
      o2Service.inputDataPoints.next(makeDataPoints(2));
      expect(component.inputDataPoints).toBe(before);
    });
  });
});
