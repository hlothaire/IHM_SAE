type TStatutValeur = "correct" | "vide" | "inconnu" | "doublon";
type TErreur = {
  status: TStatutValeur;
  msg: { [key in TStatutValeur]: string };
};
type TInterventionEditForm = {
  div_intervention_titre: HTMLElement;
  div_intervention_detail: HTMLElement;
  edt_intervention_num: HTMLInputElement;
  lbl_erreur_contrat: HTMLLabelElement;
  edt_intervention_numcontrat: HTMLInputElement;
  lbl_erreur_presta: HTMLLabelElement;
  btn_intervention_ajouter: HTMLInputElement;
  div_intervention_presta_edit: HTMLDivElement;
  select_presta: HTMLSelectElement;
  lbl_erreur_select: HTMLLabelElement;
  lbl_erreur_qte: HTMLLabelElement;
  btn_presta_valider: HTMLInputElement;
  btn_presta_annuler: HTMLInputElement;
  btn_intervention_retour: HTMLInputElement;
  btn_intervention_valider: HTMLInputElement;
  btn_intervention_annuler: HTMLInputElement;
};
