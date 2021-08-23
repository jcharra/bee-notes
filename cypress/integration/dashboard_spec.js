describe("Visit dashboard", () => {
  it("Verifies there are no colonies!", () => {
    cy.visit("http://localhost:8100/auth");
    cy.clearCookies();
    cy.contains("Willkommen bei Bee Notes");

    cy.get('ion-input[data-test-id="email"] > input').type(
      Cypress.env("login_email")
    );

    cy.get('ion-input[data-test-id="password"] > input').type(
      Cypress.env("login_password")
    );

    cy.get('ion-button[data-test-id="submit"]').click();

    cy.contains("Standorte");

    cy.contains("Hier summt ja noch gar nichts", { timeout: 10000 });
  });
});
