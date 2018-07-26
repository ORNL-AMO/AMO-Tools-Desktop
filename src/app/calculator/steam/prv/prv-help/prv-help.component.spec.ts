import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrvHelpComponent } from './prv-help.component';

describe('PrvHelpComponent', () => {
  let component: PrvHelpComponent;
  let fixture: ComponentFixture<PrvHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrvHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrvHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
