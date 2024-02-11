import {connexion, APIsql} from "../modele/connexion.js"
class UnContrat {
	private _numCont : string; 
	private _numCli : string; 
	private _dateCont : string; 
	private _adrSite : string; 
	private _villeSite : string; 
	private _cpSite : string; 
	private _telSite : string; 

	constructor(num_cont = '', num_cli = '', date_cont = '', adr_site = '', ville_site = '', cp_site = '', tel_site = '') {
		this._numCont = num_cont; 
		this._numCli = num_cli; 
		this._dateCont = date_cont; 
		this._adrSite = adr_site; 
		this._villeSite = ville_site; 
		this._cpSite = cp_site; 
		this._telSite = tel_site; 
	}
	
	get numCont() : string	 	{ return this._numCont; } 
	get numCli() : string 	 	{ return this._numCli; } 
	get dateCont() : string 	{ return this._dateCont; } 
	get adrSite() : string 	 	{ return this._adrSite; } 
	get villeSite() : string  	{ return this._villeSite; } 
	get cpSite() : string 	 	{ return this._cpSite; } 
	get telSite() : string 	 	{ return this._telSite; } 

	set numCont(num_cont) 	 { this._numCont = num_cont; } 
	set numCli(num_cli) 	 { this._numCli = num_cli; } 
	set dateCont(date_cont) 	 { this._dateCont = date_cont; } 
	set adrSite(adr_site) 	 { this._adrSite = adr_site; } 
	set villeSite(ville_site) 	 { this._villeSite = ville_site; } 
	set cpSite(cp_site) 	 { this._cpSite = cp_site; } 
	set telSite(tel_site) 	 { this._telSite = tel_site; } 
	
	toArray():APIsql.TtabAsso {
		const tableau : APIsql.TtabAsso = {'numCont':this._numCont, 'numCli':this._numCli, 'dateCont':this._dateCont, 'adrSite':this._adrSite, 'villeSite':this._villeSite, 'cpSite':this._cpSite, 'telSite':this._telSite };
		return tableau;
	}
}
type TContrats = {[key : string] : UnContrat }; // tableau d’objets UnContrat

class LesContrats { // définition de la classe gérant les données de la table contrat
	constructor () {	// rien
	}
	
	private load(result : APIsql.TdataSet) : TContrats {
	// à partir d’un TdataSet, conversion en tableau d’objets UnContrat
		let contrats : TContrats = {};
		for (let i=0; i<result.length; i++) {
			let item:APIsql.TtabAsso = result[i];
			let contrat = new UnContrat(item['num_cont'], item['num_cli'], item['date_cont'], item['adr_site'], item['ville_site'], item['cp_site'], item['tel_site']);
			contrats[contrat.numCont] = contrat;	// clé d’un élément du tableau : numCont
		}
		return contrats;
	}
	
	private prepare(where:string):string {	// préparation de la requête avec ou sans restriction (WHERE)
		let sql : string;
		sql	= "SELECT	num_cont, num_cli, date_cont, adr_site, ville_site, cp_site, tel_site ";
		sql += " FROM	contrat";
		if (where !== "")
		{
			sql	+= " WHERE " +where;
		}
		return sql;
	}

	all() : TContrats {	// renvoie le tableau d’objets contenant tous les contrats 
		return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""),[]));
	}

	byNumCont ( num_cont : string) : UnContrat	{ // renvoie l’objet correspondant à contrat num_cont
		let contrat = new UnContrat;
		const contrats : TContrats = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_cont = ?"),[num_cont]));
		const lesCles: string[] = Object.keys(contrats);
		// affecte les clés du tableau associatif « contrats » dans le tableau de chaines « lesCles »
		if ( lesCles.length > 0) {
			contrat = contrats[lesCles[0]];	// récupérer le 1er élément du tableau associatif « contrats »
		}
		return contrat;
	}

	toArray(contrats : TContrats) : APIsql.TdataSet {	// renvoie le tableau d’objets sous la forme 
	//	d’un tableau de tableaux associatifs pour un affichage dans un tableau HTML
		const T:APIsql.TdataSet = [];
		for (let id in contrats) {
			T.push(contrats[id].toArray());
		}	 
		return T;			 
	}

	delete(num_cont : string):boolean {	// requête de suppression contrat dans la table
		let sql : string;
		sql	= "DELETE	FROM	contrat	WHERE	num_cont = ?";
		return APIsql.sqlWeb.SQLexec(sql,[num_cont]);		// requête de manipulation : utiliser SQLexec
	}

	insert(contrat : UnContrat):boolean {	// requête d’ajout contrat dans la table
		let sql : string; 					// requête de manipulation : utiliser SQLexec
		sql	= "INSERT	INTO	contrat (num_cont, num_cli, date_cont, adr_site, ville_site, cp_site, tel_site) VALUES (?, ?, ?, ?, ?, ?, ?)";
		return APIsql.sqlWeb.SQLexec(sql,[contrat.numCont, contrat.numCli, contrat.dateCont, contrat.adrSite, contrat.villeSite, contrat.cpSite, contrat.telSite]); 	
		}

	update(contrat : UnContrat):boolean {	// requête de modification contrat dans la table
		let sql : string;
		sql	= "UPDATE contrat SET num_cli = ?, date_cont = ?, adr_site = ?, ville_site = ?, cp_site = ?, tel_site = ? ";
		sql += " WHERE	num_cont	= ?"; 					// requête de manipulation : utiliser SQLexec
		return APIsql.sqlWeb.SQLexec(sql,[contrat.numCli, contrat.dateCont, contrat.adrSite, contrat.villeSite, contrat.cpSite, contrat.telSite, contrat.numCont]); 	
	}
}

export { connexion }
export { UnContrat }
export { TContrats }
export { LesContrats }