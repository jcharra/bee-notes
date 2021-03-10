import { AuthPage } from "./app.po";

describe("new App", () => {
  let page: AuthPage;

  beforeEach(() => {
    page = new AuthPage();
  });

  it("should be blank", () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual("Welcome toBee Flat");
  });
});
