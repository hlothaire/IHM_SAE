import {
  UnIntervention,
  LesInterventions,
} from "../modele/data_intervention.js";
import { LesContrats } from "../modele/data_contrat.js";
import { LesClients } from "../modele/data_client.js";
import { LesPrestationsByIntervention } from "../modele/data_prestation.js";

type TInterventionListeForm = {
  divTitre: HTMLElement;
  tableIntervention: HTMLTableElement;
  btnAjouter: HTMLInputElement;
};

class VueInterventionListe {
  private _form: TInterventionListeForm;

  get form(): TInterventionListeForm {
    return this._form;
  }

  init(form: TInterventionListeForm): void {
    this._form = form;

    const lesInterventions = new LesInterventions();
    const lesContrats = new LesContrats();
    const lesClients = new LesClients();
    const lesPrestationsByIntervention = new LesPrestationsByIntervention();
    const data = lesInterventions.all();

    for (let num in data) {
      const uneIntervention: UnIntervention = data[num];
      const tr = this.form.tableIntervention.insertRow();

      let balisea: HTMLAnchorElement;
      balisea = document.createElement("a");
      balisea.classList.add("img_visu");
      balisea.onclick = function (): void {
        vueInterventionListe.detailInterventionClick(uneIntervention.numInterv);
      };
      tr.insertCell().appendChild(balisea);
      tr.insertCell().textContent = uneIntervention.numInterv;
      tr.insertCell().textContent = uneIntervention.dateInterv;
      tr.insertCell().textContent = lesContrats.byNumCont(
        uneIntervention.numCont,
      ).numCont + " - " + lesContrats.byNumCont(uneIntervention.numCont).villeSite;
      tr.insertCell().textContent = lesClients.byNumCli(
        lesContrats.byNumCont(uneIntervention.numCont).numCli,
      ).numCli + " - " + lesClients.byNumCli(lesContrats.byNumCont(uneIntervention.numCont).numCli).nomCli;
      tr.insertCell().textContent = lesPrestationsByIntervention
        .getTotal(lesPrestationsByIntervention.byNumInterv(num))
        .toFixed(2) + " €";

      balisea = document.createElement("a");
      balisea.classList.add("img_modification");
      balisea.onclick = function (): void {
        vueInterventionListe.modifierInterventionClick(uneIntervention.numInterv);
      };
      tr.insertCell().appendChild(balisea);
      balisea = document.createElement("a");
      balisea.classList.add("img_corbeille");
      balisea.onclick = function (): void {
        vueInterventionListe.supprimerInterventionClick(
          uneIntervention.numInterv,
        );
      };
      tr.insertCell().appendChild(balisea);
    }
    this.form.btnAjouter.onclick = function (): void {
      vueInterventionListe.ajouterInterventionClick();
    };
    this.trierTableauParDate();
  }

trierTableauParDate() {
  const table = this.form.tableIntervention;
  let rows: HTMLTableRowElement[] = Array.from(table.querySelectorAll('thead tr'));

  const dataRows = rows.slice(1);

  const sortedRows = dataRows.sort((a, b) => {
    const dateAStr = a.cells[2].textContent.trim(); 
    const dateBStr = b.cells[2].textContent.trim(); 

    return dateBStr.localeCompare(dateAStr);
  });

  const thead = table.querySelector('thead');
  thead.innerHTML = ''; 
  thead.appendChild(rows[0]); 

  sortedRows.forEach(row => {
    const dateCell = row.cells[2]; 
    if (dateCell.textContent.includes('-')) { 
      const [year, month, day] = dateCell.textContent.trim().split('-');
      dateCell.textContent = `${day}/${month}/${year}`;
    }
    thead.appendChild(row);
  });
}

  detailInterventionClick(num: string): void {
    location.href = "intervention_edit.html?affi&" + encodeURIComponent(num);
  }

  modifierInterventionClick(num: string): void {
    location.href = "intervention_edit.html?modif&" + encodeURIComponent(num);
  }

  supprimerInterventionClick(num: string): void {
    location.href = "intervention_edit.html?suppr&" + encodeURIComponent(num);
  }

  ajouterInterventionClick(): void {
    location.href = "intervention_edit.html?ajout";
  }
}

let vueInterventionListe = new VueInterventionListe();
export { vueInterventionListe };
