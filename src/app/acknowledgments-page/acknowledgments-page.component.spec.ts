import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcknowledgmentsPageComponent } from './acknowledgments-page.component';

describe('AcknowledgmentsPageComponent', () => {
  let component: AcknowledgmentsPageComponent;
  let fixture: ComponentFixture<AcknowledgmentsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcknowledgmentsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcknowledgmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
