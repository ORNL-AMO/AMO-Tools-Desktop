import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereHelpComponent } from './atmosphere-help.component';

describe('AtmosphereHelpComponent', () => {
  let component: AtmosphereHelpComponent;
  let fixture: ComponentFixture<AtmosphereHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtmosphereHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
