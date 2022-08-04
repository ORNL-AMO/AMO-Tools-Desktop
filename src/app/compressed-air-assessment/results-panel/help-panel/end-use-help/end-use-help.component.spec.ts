import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUseHelpComponent } from './end-use-help.component';

describe('EndUseHelpComponent', () => {
  let component: EndUseHelpComponent;
  let fixture: ComponentFixture<EndUseHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndUseHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUseHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
