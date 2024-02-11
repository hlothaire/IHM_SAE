import { vueInterventionListe } from "./class_intervention_liste";

vueInterventionListe.init({
  divTitre: document.querySelector("[id=divtitre]"),
  tableIntervention: document.querySelector("[id=table_intervention]"),
  btnAjouter: document.querySelector("[id=btn_intervention_ajouter]"),
});
