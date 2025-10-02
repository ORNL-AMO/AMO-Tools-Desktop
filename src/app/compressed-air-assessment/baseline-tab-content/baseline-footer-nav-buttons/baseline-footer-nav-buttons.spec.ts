import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaselineFooterNavButtons } from './baseline-footer-nav-buttons';

describe('BaselineFooterNavButtons', () => {
  let component: BaselineFooterNavButtons;
  let fixture: ComponentFixture<BaselineFooterNavButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaselineFooterNavButtons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaselineFooterNavButtons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
