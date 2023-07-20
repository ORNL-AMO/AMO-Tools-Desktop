import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationStatusComponent } from './integration-status.component';

describe('IntegrationStatusComponent', () => {
  let component: IntegrationStatusComponent;
  let fixture: ComponentFixture<IntegrationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntegrationStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntegrationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
