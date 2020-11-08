import { browser, by, element } from 'protractor';

export class AuthPage {
  navigateTo() {
    return browser.get('/auth');
  }

  getTitleText() {
    return element(by.deepCss('app-auth ion-title')).getText();
  }
}
