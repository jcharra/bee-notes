import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AccountdeletionPage } from './accountdeletion.page';

describe('AccountdeletionPage', () => {
  let component: AccountdeletionPage;
  let fixture: ComponentFixture<AccountdeletionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountdeletionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountdeletionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
