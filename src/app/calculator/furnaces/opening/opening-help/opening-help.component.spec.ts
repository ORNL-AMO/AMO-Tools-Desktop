import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningHelpComponent } from './opening-help.component';

describe('OpeningHelpComponent', () => {
  let component: OpeningHelpComponent;
  let fixture: ComponentFixture<OpeningHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpeningHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
