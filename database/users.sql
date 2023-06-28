\c postgres;
DROP DATABASE IF EXISTS iapau;
CREATE DATABASE iapau;

-- Se connecter à la base de données
\c iapau;

-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS Reponse CASCADE;
DROP TABLE IF EXISTS Question CASCADE;
DROP TABLE IF EXISTS Questionnaire CASCADE;
DROP TABLE IF EXISTS Ressource CASCADE;
DROP TABLE IF EXISTS Projet CASCADE;
DROP TABLE IF EXISTS Evenement CASCADE;
DROP TABLE IF EXISTS Equipe CASCADE;
DROP TABLE IF EXISTS Gestionnaire_externe CASCADE;
DROP TABLE IF EXISTS Gestionnaire_iapau CASCADE;
DROP TABLE IF EXISTS Admini CASCADE;
DROP TABLE IF EXISTS Etudiant CASCADE;
DROP TABLE IF EXISTS Utilisateur CASCADE;

CREATE TABLE Utilisateur(
    idUser SERIAL PRIMARY KEY,
    nom VARCHAR (30) NOT NULL,
    prenom VARCHAR (30) NOT NULL,
    pseudo VARCHAR (30) UNIQUE NOT NULL,
    email VARCHAR (100) UNIQUE NOT NULL,
    lien_linkedin VARCHAR (100) DEFAULT NULL,
    lien_github VARCHAR (100) DEFAULT NULL,
    ville VARCHAR (100),
    lastCheckedNotif TIMESTAMP DEFAULT NULL,
    date_inscription TIMESTAMP NOT NULL,
    hashMdp VARCHAR(255),
    typeUser VARCHAR(30) CHECK (typeUser IN ('etudiant', 'gestionnaireIA', 'gestionnaireExterne', 'administrateur'))
);

CREATE TABLE Etudiant(
    idEtudiant INT PRIMARY KEY REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    ecole VARCHAR(100),
    niveau_etude VARCHAR(15),
    code_postale_ecole VARCHAR (5)
);

CREATE TABLE Admini(
    idAdmin INT PRIMARY KEY REFERENCES Utilisateur(idUser) ON DELETE CASCADE
);

CREATE TABLE Gestionnaire_iapau(
    id_g_iapau INT PRIMARY KEY REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    role_asso VARCHAR(100) DEFAULT NULL
);

CREATE TABLE Gestionnaire_externe(
    id_g_externe INT PRIMARY KEY REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    entreprise VARCHAR(100),
    metier VARCHAR(100) DEFAULT NULL
);

CREATE TABLE Evenement(
    idEvent SERIAL PRIMARY KEY,
    nom VARCHAR (50) NOT NULL,
    debut_inscription TIMESTAMP NOT NULL,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    date_resultat TIMESTAMP NOT NULL,
    img BYTEA, -- NOT NULL,
    regles TEXT NOT NULL,
    nombre_min_equipe INTEGER,
    nombre_max_equipe INTEGER,
    type_event VARCHAR(30) CHECK (type_event IN ('battle', 'challenge'))
);

CREATE TABLE Projet(
    idProjet SERIAL PRIMARY KEY,
    nom VARCHAR (30) NOT NULL,
    description_projet TEXT NOT NULL,
    recompense INTEGER,   
    imgProjet BYTEA, -- NOT NULL,
    idEvent INT REFERENCES Evenement(idEvent) ON DELETE CASCADE
);

CREATE TABLE Equipe(
    idEquipe SERIAL PRIMARY KEY,
    nom VARCHAR(30) NOT NULL,
    img BYTEA DEFAULT NULL,
    description_equipe TEXT DEFAULT NULL,
    statut_recrutement VARCHAR(30) CHECK (statut_recrutement IN ('ouvert', 'fermé')),
    lien_github TEXT DEFAULT NULL,
    idProjet INT REFERENCES Projet(idProjet) ON DELETE CASCADE,
    idCapitaine INT REFERENCES Etudiant(idEtudiant)
);

ALTER TABLE Projet
ADD COLUMN idEquipeGagnante INT REFERENCES Equipe(idEquipe);

CREATE TABLE Ressource(
    idRessource SERIAL PRIMARY KEY,
    titre VARCHAR(100),
    type_ressource VARCHAR(100) CHECK (type_ressource IN ('drive', 'téléchargement', 'lien', 'video')),
    lien VARCHAR(1000),
    date_apparition TIMESTAMP,
    statut VARCHAR(30) CHECK (statut IN ('public', 'privé')),
    description_ressource TEXT NOT NULL,
    idProjet INT REFERENCES Projet(idProjet) ON DELETE CASCADE
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
    idQuestionnaire INT REFERENCES Questionnaire(idQuestionnaire) ON DELETE CASCADE
);

CREATE TABLE Reponse(
    idReponse SERIAL PRIMARY KEY,
    reponse TEXT,
    score FLOAT,
    idQuestionnaire INT REFERENCES Questionnaire(idQuestionnaire)
);

CREATE TABLE Mot_cle(
    idMot SERIAL PRIMARY KEY,
    mot VARCHAR(100),
    idProjet INT REFERENCES Projet(idProjet)
);

CREATE TABLE Appartenir(
    idUser INT REFERENCES Utilisateur(idUser),
    idEquipe INT REFERENCES Equipe(idEquipe)
);

CREATE TABLE Represente(
    idMot INT REFERENCES Mot_cle(idMot),
    idProjet Int REFERENCES Projet(idProjet)
);

DELETE FROM Utilisateur WHERE email = 'admin@admin.fr';


CREATE OR REPLACE FUNCTION hash_password(text) RETURNS text AS
$$
BEGIN
  RETURN crypt($1, gen_salt('bf'));
END;
$$
LANGUAGE plpgsql;


-- défaut
INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_DATE, 'admin', 'administrateur');

INSERT INTO Evenement (nom, debut_inscription, date_debut, date_fin, date_resultat, regles, nombre_min_equipe, nombre_max_equipe, type_event)
VALUES ('Nom', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Lorem ipsum', 2, 5, 'challenge');
