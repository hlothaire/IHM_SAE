import {connexion, APIsql} from "../modele/connexion.js"
class UnClient {
	private _numCli : string; 
	private _civCli : string; 
	private _nomCli : string; 
	private _prenomCli : string; 
	private _telCli : string; 
	private _melCli : string; 

	constructor(num_cli = '', civ_cli = '', nom_cli = '', prenom_cli = '', tel_cli = '', mel_cli = '') {
		this._numCli = num_cli; 
		this._civCli = civ_cli; 
		this._nomCli = nom_cli; 
		this._prenomCli = prenom_cli; 
		this._telCli = tel_cli; 
		this._melCli = mel_cli; 
	}
	
	get numCli() : string	 { return this._numCli; } 
	get civCli() : string 	 { return this._civCli; } 
	get nomCli() : string  	 { return this._nomCli; } 
	get prenomCli() : string 	 { return this._prenomCli; } 
	get telCli() : string 	 { return this._telCli; } 
	get melCli() : string	 { return this._melCli; } 

	set numCli(num_cli) 	 { this._numCli = num_cli; } 
	set civCli(civ_cli) 	 { this._civCli = civ_cli; } 
	set nomCli(nom_cli) 	 { this._nomCli = nom_cli; } 
	set prenomCli(prenom_cli) 	 { this._prenomCli = prenom_cli; } 
	set telCli(tel_cli) 	 { this._telCli = tel_cli; } 
	set melCli(mel_cli) 	 { this._melCli = mel_cli; } 
		
	
	toArray():APIsql.TtabAsso {
		let tableau : APIsql.TtabAsso = {'numCli':this._numCli, 'civCli':this._civCli, 'nomCli':this._nomCli, 'prenomCli':this._prenomCli, 'telCli':this._telCli, 'melCli':this._melCli};
		return tableau;
	}
}
type TClients = {[key : string] : UnClient }; // tableau d’objets UnClient

class LesClients { // définition de la classe gérant les données de la table client
	constructor () {	// rien
	}
	
	private load(result : APIsql.TdataSet) : TClients {
	// à partir d’un TdataSet, conversion en tableau d’objets UnClient
		let clients : TClients = {};
		for (let i=0; i<result.length; i++) {
			let item:APIsql.TtabAsso = result[i];
			let client = new UnClient(item['num_cli'], item['civ_cli'], item['nom_cli'], item['prenom_cli'], item['tel_cli'], item['mel_cli']);
			clients[client.numCli] = client;	// clé d’un élément du tableau : numCli
		}
		return clients;
	}
	
	private prepare(where:string):string {	// préparation de la requête avec ou sans restriction (WHERE)
		let sql : string;
		sql	= "SELECT	num_cli, civ_cli, nom_cli, prenom_cli, tel_cli, mel_cli ";
		sql += " FROM	client";
		if (where !== "")
		{
			sql	+= " WHERE " +where;
		}
		return sql;
	}

	all() : TClients {	// renvoie le tableau d’objets contenant tous les clients 
		return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""),[]));
	}

	byNumCli ( num_cli : string) : UnClient	{ // renvoie l’objet correspondant à client num_cli
		let client = new UnClient;
		const clients : TClients = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_cli = ?"),[num_cli]));
		const lesCles: string[] = Object.keys(clients);
		// affecte les clés du tableau associatif « clients » dans le tableau de chaines « lesCles »
		if ( lesCles.length > 0) {
			client = clients[lesCles[0]];	// récupérer le 1er élément du tableau associatif « clients »
		}
		return client;
	}

	toArray(clients : TClients) : APIsql.TdataSet {	// renvoie le tableau d’objets sous la forme 
	//	d’un tableau de tableaux associatifs pour un affichage dans un tableau HTML
		const T:APIsql.TdataSet = [];
		for (let id in clients) {
			T.push(clients[id].toArray());
		}	 
		return T;			 
	}

	delete(num_cli : string):boolean {	// requête de suppression client dans la table
		let sql : string;
		sql	= "DELETE	FROM	client	WHERE	num_cli = ?";
		return APIsql.sqlWeb.SQLexec(sql,[num_cli]);		// requête de manipulation : utiliser SQLexec
	}

	insert(client : UnClient):boolean {	// requête d’ajout client dans la table
		let sql : string; 					// requête de manipulation : utiliser SQLexec
		sql	= "INSERT	INTO	client (num_cli, civ_cli, nom_cli, prenom_cli, tel_cli, mel_cli) VALUES (?, ?, ?, ?, ?, ?)";
		return APIsql.sqlWeb.SQLexec(sql,[client.numCli, client.civCli, client.nomCli, client.prenomCli, client.telCli, client.melCli]); 	
		}

	update(client : UnClient):boolean {	// requête de modification client dans la table
		let sql : string;
		sql	= "UPDATE client SET civ_cli = ?, nom_cli = ?, prenom_cli = ?, tel_cli = ?, mel_cli = ? ";
		sql += " WHERE	num_cli	= ?"; 					// requête de manipulation : utiliser SQLexec
		return APIsql.sqlWeb.SQLexec(sql,[client.civCli, client.nomCli, client.prenomCli, client.telCli, client.melCli, client.numCli]); 	
	}
}

export { connexion }
export { UnClient }
export { TClients }
export { LesClients }