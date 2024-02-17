import * as APIsql from "../modele/sqlWeb.js";

APIsql.sqlWeb.init(
  "http://localhost/ihm_sae/vue/",
  "http://localhost/IHM_API/");

class Connexion {
  constructor() {
    this.init();
  }

   init(): void {
    // à adapter avec voter nom de base et vos identifiants de connexion
    APIsql.sqlWeb.bdOpen(
      "localhost",
      "3306",
      "holcvart1u_bdsat",
      "root",
      "",
      "utf8",
    );
  }


 /** init(): void {
    // à adapter avec voter nom de base et vos identifiants de connexion
    APIsql.sqlWeb.bdOpen(
      "devbdd.iutmetz.univ-lorraine.fr",
      "3306",
      "holcvart1u_bdsat",
      "holcvart1u_appli",
      "31605346",
      "utf8",
    );
  }**/
}
let connexion = new Connexion();

export { connexion, APIsql };
