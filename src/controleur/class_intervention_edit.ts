import { LesClients, UnClient } from "../modele/data_client.js";
import { LesContrats, UnContrat } from "../modele/data_contrat.js";
import { LesInterventions, UnIntervention } from "../modele/data_intervention.js";
import { LesPrestations, LesPrestationsByIntervention, TPrestationsByIntervention, UnPrestation, UnPrestationByIntervention } from "../modele/data_prestation.js";

type TStatutValeur = "correct" | "vide" | "inconnu" | "doublon";
type TErreur = {
  statut: TStatutValeur;
  msg: { [key in TStatutValeur]: string };
};
type TInterventionEditForm = {
  div_Titre: HTMLElement;
  div_intervention_detail: HTMLElement;
  edt_intervention_num: HTMLInputElement;
  edt_intervention_date : HTMLInputElement;
  edt_presta_qte : HTMLInputElement;
  lbl_erreur_contrat: HTMLLabelElement;
  edt_intervention_numcontrat: HTMLInputElement;
  lbl_erreur_presta: HTMLLabelElement;
  btn_intervention_ajouter: HTMLInputElement;
  div_intervention_presta_edit: HTMLDivElement;
  div_intervention_rubrique : HTMLDivElement;
  select_presta: HTMLSelectElement;
  lbl_erreur_select: HTMLLabelElement;
  lbl_erreur_qte: HTMLLabelElement;
  btn_presta_valider: HTMLInputElement;
  btn_presta_annuler: HTMLInputElement;
  btn_intervention_retour: HTMLInputElement;
  btn_intervention_valider: HTMLInputElement;
  btn_intervention_annuler: HTMLInputElement;
  lbl_intervention_site : HTMLLabelElement;
  lbl_intervention_client :HTMLLabelElement;
  intervention_motif : HTMLInputElement;
  intervention_obs : HTMLInputElement;
  table_presta : HTMLTableElement;
  lbl_prestation_total : HTMLLabelElement;
  lbl_erreur_motif : HTMLLabelElement;
};

class VueInterventionEdit {
  private _form : TInterventionEditForm;
  private _params : string[];
  private _grille : TPrestationsByIntervention;
  private _erreur : {
    [key:string] : TErreur;
  }

  get form() : TInterventionEditForm { return this._form;}
  get params() : string [] {return this._params;}
  get grille() : TPrestationsByIntervention { return this._grille;}
  get erreur() :{[key:string] : TErreur} { return this._erreur; }

  initMsgErreur(): void {
    this._erreur = {
      edt_intervention_num : { statut : 'vide'
                                , msg:{ correct:""
                                      , vide :"Le numéro d'intervention doit etre renseigné."
                                      , inconnu : "Le numéro ne peut contenir que des chiffres."
                                      , doublon : "Le numéro est déjà attribué." }}
      ,edt_intervention_date : { statut : 'vide'
                                , msg:{ correct: ""
                                      , vide : ""
                                      ,inconnu : "On ne peut pas mettre une date dans le passé"
                                      ,doublon : "Une intervention pour le contrat est déjà planifié à la meme date" }}
      ,prestats : { statut : 'vide'
                                , msg :{ correct: ""
                                        , vide : "l'intervention doit comporter au moins une prestations."
                                        , inconnu : ""
                                        , doublon : ""}}
      ,select_presta : { statut : 'vide'
                                , msg :{ correct: ""
                                        , vide : "Aucune prestation choisie."
                                        , inconnu : ""
                                        , doublon :""}}
      ,edt_presta_qte : { statut : 'vide'
                                , msg :{ correct: ""
                                        , vide : "La quantité doit etre un nombre supérieur à 0."
                                        , inconnu : ""
                                        , doublon :""}}
      ,edt_intervention_numcontrat : { statut : 'vide'
                                              , msg : { correct: ""
                                              , vide : " Le numéro de contrat doit etre renseigné."
                                              , inconnu : "Numéro de contrat inconnu."
                                              , doublon : ""}}
      ,edt_motif : { statut : 'vide'
                            , msg : { correct: ""
                            , vide : "Le motif doit etre renseigné"
                            , inconnu : ""
                            , doublon : ""}}
    }
  }

  init(form : TInterventionEditForm) : void {
    this._form = form;
    this._params = location.search.substring(1).split('&');
    this.form.div_intervention_presta_edit.hidden = true;
    this.initMsgErreur();
    let titre : string;
    switch (this.params[0]){
      case 'suppr' : titre = "Supression d'une intervention"; break;
      case 'ajout' : titre = "Nouvelle intervention"; break;
      case 'modif' : titre = "Modification d'une intervention"; break;
      default : titre = "Detail d'une intervention"; break;
    }
    this.form.div_Titre.textContent = titre;
    const lesInterventions = new LesInterventions;
    const affi = this.params[0] === 'affi';
    if (this.params[0] !== 'ajout'){
      const intervention = lesInterventions.byNumInterv(this._params[1]);
      this.form.edt_intervention_num.value = intervention.numInterv;
      this.form.edt_intervention_date.value = intervention.dateInterv;
      this.form.edt_intervention_numcontrat.value = intervention.numCont;
      this.form.intervention_motif.value = intervention.objetInterv; 
      this.form.intervention_obs.value = intervention.obsInterv;
      this.form.edt_intervention_num.readOnly = true;
      this.form.edt_intervention_date.readOnly = affi;
      this.form.edt_intervention_numcontrat.readOnly = affi;
      this.form.intervention_obs.readOnly = affi;
      this.form.intervention_motif.readOnly = affi;
      this.erreur.edt_intervention_num.statut = "correct";
      this.detailContrat(intervention.numCont.toString());
    } else {
      this.form.edt_intervention_num.value = lesInterventions.getNouveauNumero();
      this.form.edt_intervention_num.readOnly = true;
      const newDate = new Date();
      const lendemain = new Date(new Date());
      lendemain.setDate(newDate.getDate() + 1);
      const annee = lendemain.getFullYear();
      const mois = (lendemain.getMonth() + 1).toString().padStart(2, '0');
      const jour = lendemain.getDate().toString().padStart(2, '0'); 
      const dateLendemain = `${annee}-${mois}-${jour}`;
      this.form.edt_intervention_date.value = dateLendemain;
    }
    this.affiPrestation();
    if (this.params[0] === 'suppr'){
      setTimeout(() => { this.supprimer(this.params[1])},1000);
    }
    this.form.btn_intervention_retour.hidden = !affi;
    this.form.btn_intervention_valider.hidden = affi;
    this.form.btn_intervention_annuler.hidden = affi;
    this.form.btn_presta_valider.hidden = affi;
    this.form.btn_intervention_ajouter.hidden = affi;


    this.form.edt_intervention_numcontrat.onchange = function() : void {
      vueInterventionEdit.detailContrat(vueInterventionEdit.form.edt_intervention_numcontrat.value);}
    this.form.btn_intervention_retour.onclick = function() : void { vueInterventionEdit.retourClick(); }
    this.form.btn_intervention_annuler.onclick = function() : void { vueInterventionEdit.retourClick();}
    this.form.btn_intervention_valider.onclick = function() : void { vueInterventionEdit.validerClick();}
    this.form.btn_intervention_ajouter.onclick = function() : void { vueInterventionEdit.ajouterPrestationClick();}
    this.form.btn_presta_valider.onclick = function() : void { vueInterventionEdit.validerPrestaClick();}
    this.form.btn_presta_annuler.onclick = function() : void { vueInterventionEdit.annulerPrestaClick();}
  }

  private convertDateFormat(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  detailContrat(valeur : string) : void {
    const err = this.erreur.edt_intervention_numcontrat;
    const lesContrats = new LesContrats;
    const lesClients = new LesClients;
    const site = this.form.lbl_intervention_site;
    const client = this.form.lbl_intervention_client; 
    site.textContent = "";
    client.textContent = "";
    err.statut = "correct";
    const chaine : string  = valeur.trim();
    if(chaine.length > 0){
      const contrat : UnContrat = lesContrats.byNumCont(chaine);
      if (contrat.numCont !== "") {
        site.textContent = "site protégé" + "\r\n" + "contrat crée : " + this.convertDateFormat(contrat.dateCont) 
          + "\r\n" + contrat.adrSite + "\r\n" + contrat.cpSite + " " + contrat.villeSite;
      } else {
        err.statut = 'inconnu';
        site.textContent = err.msg.inconnu;
      }
    }
    else err.statut = 'vide';
    if(chaine.length > 0){
      const numClient = lesContrats.byNumCont(chaine).numCli;
      const clientContrat : UnClient = lesClients.byNumCli(numClient);
      if (clientContrat.numCli !== ""){
        client.textContent = "client" + "\r\n" + clientContrat.civCli + " " + clientContrat.nomCli + " "
        + clientContrat.prenomCli + "\r\n" + clientContrat.melCli + "\r\n" + clientContrat.telCli;
      } else {
        err.statut = 'inconnu';
        client.textContent = err.msg.inconnu;
      }
    }
    else err.statut = 'vide';
  }

  affiPrestation() : void {
    const lesPrestationsByIntervention = new LesPrestationsByIntervention();
    this._grille = lesPrestationsByIntervention.byNumInterv(this.params[1]);
    this.affiGrille();
  }

 private multiplyStrings(qteStr: string, montantStr: string): number {
  // Convertir les chaînes de caractères en nombres à virgule flottante
  const qte = parseFloat(qteStr);
  const montant = parseFloat(montantStr);

  // Vérifier que les conversions sont valides
  if (isNaN(qte) || isNaN(montant)) {
    throw new Error("L'une des chaînes ne peut pas être convertie en nombre.");
  }

  // Retourner le résultat de la multiplication
  return qte * montant;
}

  affiGrille() : void {
    while (this.form.table_presta.rows.length > 1) { this.form.table_presta.rows[1].remove(); }
    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;
    for(let id in this._grille){
      const unPrestationByIntervention : UnPrestationByIntervention = this.grille[id];
      const tr = this.form.table_presta.insertRow();
      tr.insertCell().textContent = unPrestationByIntervention.codePrest;
      tr.insertCell().textContent = unPrestationByIntervention.libPrest;
      tr.insertCell().textContent = unPrestationByIntervention.tarifHt;
      tr.insertCell().textContent = unPrestationByIntervention.qtePrest;
      const montant = this.multiplyStrings(unPrestationByIntervention.qtePrest,unPrestationByIntervention.tarifHt);
      tr.insertCell().textContent = montant.toFixed(2).toString();

      const affi = this.params[0] === 'affi';
      if(!affi) {
        let balisea : HTMLAnchorElement;
        balisea = document.createElement("a");
        balisea.classList.add('img_modification');
        balisea.onclick = function() : void { vueInterventionEdit.modifierPrestationClick(id);}
        tr.insertCell().appendChild(balisea);

        balisea = document.createElement("a");
        balisea.classList.add('img_corbeille');
        balisea.onclick = function() : void {vueInterventionEdit.supprimerPrestationClick(id);}
        tr.insertCell().appendChild(balisea);
      }
      totalHT += montant;
    }
    totalTVA = totalHT * 0.1;
    totalTTC = totalHT + totalTVA;
    this.form.lbl_prestation_total.textContent = "HT : " + totalHT.toFixed(2) + " TVA : " + totalTVA.toFixed(2) + " TTC : " + totalTTC.toFixed(2); 
  }

  retourClick():void {
    location.href = "sat.html";
  }

  supprimer(numInter : string) : void {
    if(confirm("Confirmez vous la suppresion de l'intervention " + numInter)){
      let lesPrestationsByIntervention : LesPrestationsByIntervention = new LesPrestationsByIntervention();
      lesPrestationsByIntervention.delete(numInter);

      const lesInterventions = new LesInterventions();
      lesInterventions.delete(numInter);
    }
    this.retourClick();
  }

  verifNumContrat(valeur : string) : void {
    const lesContrats = new LesContrats();
    const err = this.erreur.edt_intervention_numcontrat;
    err.statut = "correct";
    const chaine : string = valeur.trim();
    if(chaine.length > 0) {
      if(!chaine.match(/^([0-9]+)&/)){
        this.erreur.edt_intervention_numcontrat.statut = "doublon";
      }
      else if ((this.params[0] === 'ajout') && (lesContrats.byNumCont(valeur).numCont != valeur)) {
                this.erreur.edtCodeDept.statut = 'inconnu';
      }

    }  
    else err.statut = "vide";
  }

  private comparerDates(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  if (date1 < date2) {
    return -1;
  } else if (date1 > date2) {
    return 1; 
  } else {
  return 0;
    }
  }


  verifDate(valeur : string) : void {
    const err = this._erreur.edt_intervention_date;
    err.statut = "correct";
    const chaine : string = valeur.trim();
    if(chaine.length > 0){
      const dateDuJour: Date = new Date();
      const annee: string = dateDuJour.getFullYear().toString();
      const mois: string = (dateDuJour.getMonth() + 1).toString().padStart(2, '0');
      const jour: string = dateDuJour.getDate().toString().padStart(2, '0');
      const dateFormatee = `${annee}-${mois}-${jour}`;
      if(this.comparerDates(chaine,dateFormatee)== -1){
        this.erreur.edt_intervention_date.statut = "inconnu";
      }
    }
    else err.statut = "vide";
  }
  
  verifMotif(valeur: string): void {
        const err = this.erreur.edt_motif
        err.statut = "correct";
        const chaine: string = valeur.trim();
        if (chaine.length === 0) err.statut = 'vide';
    }

  traiteErreur(uneErreur: TErreur, zone : HTMLElement) : boolean {
    let correct = true;
    zone.textContent = "";
    if(uneErreur.statut !== "correct"){
      if(uneErreur.msg[uneErreur.statut] !== ""){
        zone.textContent = uneErreur.msg[uneErreur.statut];
        correct = false;
      }
    }
    return correct;
  }
  
  validerClick() : void {
    let correct = true;
    this.verifNumContrat(this.form.edt_intervention_numcontrat.value);
    this.verifDate(this.form.edt_intervention_date.value);
    this.verifMotif(this.form.intervention_motif.value);
    if(JSON.stringify(this.grille) === '{}') { this._erreur.select_presta.statut = "vide"}
    else this.erreur.select_presta.statut = "correct";
    correct = this.traiteErreur(this.erreur.edt_intervention_numcontrat, this.form.lbl_erreur_contrat) && correct;
    console.log("numcontrat",correct);
    correct = this.traiteErreur(this.erreur.edt_motif, this.form.lbl_erreur_motif) && correct;
    console.log("motif",correct);
    correct = this.traiteErreur(this.erreur.select_presta,this.form.lbl_erreur_select) && correct;
    console.log("presta",correct);

    const lesInterventions = new LesInterventions();
    const unIntervention = new UnIntervention();
    console.log(correct);
    if(correct){
      unIntervention.numInterv = this.form.edt_intervention_num.value;
      unIntervention.objetInterv = this.form.intervention_motif.value;
      unIntervention.dateInterv = this.form.edt_intervention_date.value;
      unIntervention.numCont = this.form.edt_intervention_numcontrat.value;
      unIntervention.obsInterv = this.form.intervention_obs.value;

      if(this.params[0] === "ajout"){
        lesInterventions.insert(unIntervention);
      } else {
        lesInterventions.update(unIntervention);
      }
      const lesPrestationsByIntervention : LesPrestationsByIntervention = new LesPrestationsByIntervention();
      lesPrestationsByIntervention.delete(unIntervention.numInterv);
      lesPrestationsByIntervention.insert(unIntervention.numInterv,this.grille);
      this.retourClick();
    }
  }

  modifierPrestationClick(id :string) : void {
    this.afficherPrestationEdit();
    const lesPrestations = new LesPrestations();
    const unPrestation : UnPrestation = lesPrestations.byCodePrest(id);
    this.form.select_presta.length = 0;
    this.form.select_presta.options.add(new Option(unPrestation.libPrest, id));
    this.form.select_presta.selectedIndex = 0;
    this.form.edt_presta_qte.value = this.grille[id].qtePrest;
  }

  afficherPrestationEdit() : void {
    this.form.div_intervention_presta_edit.hidden = false;
    this.form.div_intervention_detail.style.pointerEvents = 'non';
    this.form.div_intervention_presta_edit.style.pointerEvents = 'auto';
    this.form.btn_intervention_ajouter.hidden = true;
    this.form.btn_presta_valider.hidden = false;
    this.form.btn_presta_annuler.hidden = false;
  }

  cacherPrestationEdit() : void {
    this.form.div_intervention_presta_edit.hidden = true;
    this.form.div_intervention_detail.style.pointerEvents = 'auto';
    this.form.btn_intervention_ajouter.hidden = false;
    this.form.btn_presta_annuler.hidden = true;
    this.form.btn_presta_valider.hidden = true;
  }

  ajouterPrestationClick() : void {
    this.afficherPrestationEdit();
    this.form.select_presta.length = 0;
    const lesPrestations = new LesPrestations();
    const data = lesPrestations.all();
    const idPrestas = [];
    for (let i in this.grille) {
      idPrestas.push(this.grille[i].codePrest);
    }
    for (let i in data) {
      const id = data[i].codePrest;
      if(idPrestas.indexOf(id) === -1){
        this.form.select_presta.options.add(new Option(data[i].libPrest,id));
      }
    }
  }


  supprimerPrestationClick(id : string) : void {
    if(confirm("Confirmez-vous le retrait de l'équipement de l'intervention")){
      delete(this.grille[id]);
      this.affiGrille();
    }
  }

  annulerPrestaClick() : void {
    this.cacherPrestationEdit();
  }
  
  verifListePresta() : void {
    const err = this._erreur.select_presta;
    err.statut = "correct";
    const cible = this.form.select_presta;
    if(cible.value === ""){
      err.statut = 'vide';
    }
  }

  verifQte() : void {
    const err = this._erreur.edt_presta_qte;
    err.statut = "correct";
    const valeur : string = this.form.edt_presta_qte.value;
    if(!((Number.isInteger(Number(valeur))) && (Number(valeur)>0))){
      err.statut = "vide";
    }
  }

  validerPrestaClick() : void {
    let correct = true;
    this.verifListePresta();
    this.verifQte();
    correct = this.traiteErreur(this.erreur.select_presta, this.form.lbl_erreur_select) && correct;
    correct = this.traiteErreur(this.erreur.edt_presta_qte, this.form.lbl_erreur_qte) && correct;
    
    if (correct) {
      const lesPrestations = new LesPrestations();
      const unPrestation : UnPrestation = lesPrestations.byCodePrest(this.form.select_presta.value);
      const unPrestationByIntervention : UnPrestationByIntervention = new UnPrestationByIntervention(unPrestation.codePrest,unPrestation.libPrest, unPrestation.tarifHt, this.form.edt_presta_qte.value);
      this.grille[unPrestation.codePrest] = unPrestationByIntervention;
      this.affiGrille();
      this.annulerPrestaClick();
    }
  }

}

let vueInterventionEdit = new VueInterventionEdit();
export {vueInterventionEdit};
