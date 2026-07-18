import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signupcomponent } from './signupcomponent';

describe('Signupcomponent', () => {
  let component: Signupcomponent;
  let fixture: ComponentFixture<Signupcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signupcomponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Signupcomponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
