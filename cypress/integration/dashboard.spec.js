describe("Visit dashboard", () => {
  it("Finds no colonies in empty account and sees a hint to add some", () => {
    cy.login(Cypress.env("login_email_empty_account"), Cypress.env("login_password_empty_account"));
    cy.contains("Hier summt ja noch gar nichts");
  });

  it.only("Create a new group, add location, change name, delete again", () => {
    cy.login(Cypress.env("login_email_standard_account"), Cypress.env("login_password_standard_account"));
    cy.get("ion-fab-button[data-test-id='add-colony-group']", { timeout: 10000 }).click();
    cy.get("ion-alert").contains("Neuen Standort anlegen");
    cy.get("ion-alert input").type("Bergspitze");
    cy.get("ion-alert button").last().click();
    cy.get("ion-fab-button[data-test-id='add-colony-group']").last().click();
    cy.contains("Hier summt ja noch gar nichts");
  });
});
