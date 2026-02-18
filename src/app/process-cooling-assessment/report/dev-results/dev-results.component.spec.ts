import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevResultsComponent } from './dev-results.component';

describe('DevResultsComponent', () => {
  let component: DevResultsComponent;
  let fixture: ComponentFixture<DevResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
