import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerStagingFormComponent } from './chiller-staging-form.component';

describe('ChillerStagingFormComponent', () => {
  let component: ChillerStagingFormComponent;
  let fixture: ComponentFixture<ChillerStagingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerStagingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerStagingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
