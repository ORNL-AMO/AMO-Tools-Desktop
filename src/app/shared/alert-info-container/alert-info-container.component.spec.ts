import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertInfoContainerComponent } from './alert-info-container.component';

describe('AlertInfoContainerComponent', () => {
  let component: AlertInfoContainerComponent;
  let fixture: ComponentFixture<AlertInfoContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertInfoContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertInfoContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
