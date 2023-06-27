CREATE TABLE Evenement(
    idEvent SERIAL PRIMARY KEY,
    nom VARCHAR (50) NOT NULL,
    date_creation TIMESTAMP NOT NULL,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    date_resultat TIMESTAMP NOT NULL,
    img BYTEA NOT NULL,
    regles TEXT NOT NULL,
    nombre_min_equipe INTEGER (3),
    nombre_max_equipe INTEGER (3),
    type_event VARCHAR(30) CHECK (type_event IN ('battle', 'challenge'))
);


CREATE TABLE Projet(
    idProjet SERIAL PRIMARY KEY,
    nom VARCHAR (30) NOT NULL,
    description_ projet TEXT NOT NULL,
    recompense INTEGER (10),   
    idEvent REFERENCES Evenement(idEvent) ON DELETE CASCADE,
    idEquipeGagnante REFERENCES Equipe(idEquipe)
);

CREATE TABLE Ressource(
    idRessource SERIAL PRIMARY KEY,
    titre VARCHAR(100),
    type_ressource VARCHAR(100) CHECK (statut IN ('drive', 'téléchargment', 'lien', 'video')),
    lien VARCHAR(1000),
    date_apparition TIMESTAMP,
    statut VARCHAR(30) CHECK (statut IN ('public', 'privé')),
    description_ressource TEXT NOT NULL,
    idProjet REFERENCES Projet(idProjet) ON DELETE CASCADE
);

CREATE TABLE Questionnaire(
    idQuestionnaire SERIAL PRIMARY KEY,
    nom VARCHAR(30) NOT NULL,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    sujet TEXT DEFAULT NULL
);


CREATE TABLE Question(
    idQuestion SERIAL PRIMARY KEY,
    question TEXT,
    idQuestionnaire REFERENCES Questionnaire(idQuestionnaire) ON DELETE CASCADE
);

CREATE TABLE Equipe(
    idEquipe SERIAL PRIMARY KEY,
    nom VARCHAR(30) NOT NULL,
    img BYTEA DEFAULT NULL,
    description_equipe TEXT DEFAULT NULL,
    statut_recrutement VARCHAR(30), CHECK (statut_recrutement('ouvert', 'fermé')),
    lien_github TEXT DEFAUL NULL,
    idProjet REFERENCES Projet(idProjet) ON DELETE CASCADE
    idCapitaine REFERENCES Etudiant(idEtudiant)
);
    
CREATE TABLE Reponse(
    idReponse SERIAL PRIMARY KEY,
    reponse TEXT,
    score FLOAT,
    idQuestionnaire REFERENCES Questionnaire(idQuestionnaire)
)