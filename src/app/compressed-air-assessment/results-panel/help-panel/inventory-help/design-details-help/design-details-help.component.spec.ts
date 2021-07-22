import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignDetailsHelpComponent } from './design-details-help.component';

describe('DesignDetailsHelpComponent', () => {
  let component: DesignDetailsHelpComponent;
  let fixture: ComponentFixture<DesignDetailsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesignDetailsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignDetailsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
