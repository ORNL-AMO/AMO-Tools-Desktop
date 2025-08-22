import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullLoadHelpComponent } from './full-load-help.component';

describe('FullLoadHelpComponent', () => {
  let component: FullLoadHelpComponent;
  let fixture: ComponentFixture<FullLoadHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullLoadHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullLoadHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
