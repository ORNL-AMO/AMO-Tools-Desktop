import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreLeakageFormComponent } from './explore-leakage-form.component';

describe('ExploreLeakageFormComponent', () => {
  let component: ExploreLeakageFormComponent;
  let fixture: ComponentFixture<ExploreLeakageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreLeakageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreLeakageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
