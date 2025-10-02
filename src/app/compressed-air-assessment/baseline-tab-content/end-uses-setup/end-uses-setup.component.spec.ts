import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUsesSetupComponent } from './end-uses-setup.component';

describe('EndUsesSetupComponent', () => {
  let component: EndUsesSetupComponent;
  let fixture: ComponentFixture<EndUsesSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EndUsesSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndUsesSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
