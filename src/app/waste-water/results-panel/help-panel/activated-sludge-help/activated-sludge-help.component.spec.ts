import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedSludgeHelpComponent } from './activated-sludge-help.component';

describe('ActivatedSludgeHelpComponent', () => {
  let component: ActivatedSludgeHelpComponent;
  let fixture: ComponentFixture<ActivatedSludgeHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivatedSludgeHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivatedSludgeHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
