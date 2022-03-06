Cypress.Commands.add("login", (email, password) => {
  cy.visit("http://localhost:4200/auth");
  cy.clearCookies();
  cy.contains("Willkommen bei Bee Notes");

  cy.get('ion-input[data-test-id="email"] > input').type(email);
  cy.get('ion-input[data-test-id="password"] > input').type(password);
  cy.get('ion-button[data-test-id="submit"]').click();

  cy.contains("Standorte");
});
