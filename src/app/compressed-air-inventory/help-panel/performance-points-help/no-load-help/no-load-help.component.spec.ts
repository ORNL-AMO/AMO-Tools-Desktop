import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoLoadHelpComponent } from './no-load-help.component';

describe('NoLoadHelpComponent', () => {
  let component: NoLoadHelpComponent;
  let fixture: ComponentFixture<NoLoadHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoLoadHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoLoadHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
