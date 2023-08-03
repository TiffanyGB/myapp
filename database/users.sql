\c postgres;
-- DROP DATABASE IF EXISTS iapau;
-- CREATE DATABASE iapau;

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
DROP TABLE IF EXISTS Administrateur CASCADE;
DROP TABLE IF EXISTS Etudiant CASCADE;
DROP TABLE IF EXISTS Utilisateur CASCADE;
DROP TABLE IF EXISTS Mot_cle CASCADE;
DROP TABLE IF EXISTS Appartenir CASCADE;
DROP TABLE IF EXISTS Represente CASCADE;
DROP TABLE IF EXISTS Regle CASCADE;
DROP TABLE IF EXISTS Classement CASCADE;
DROP TABLE IF EXISTS Resultat CASCADE;
DROP TABLE IF EXISTS Interested CASCADE;
DROP TABLE IF EXISTS Gerer_externe CASCADE;
DROP TABLE IF EXISTS Gerer_ia_pau CASCADE;
DROP TABLE IF EXISTS DemandeEquipe CASCADE;
DROP TABLE IF EXISTS Preferences CASCADE;
DROP TABLE IF EXISTS MessageEquipe CASCADE;
DROP TABLE IF EXISTS MessageGestionnaireAdmin CASCADE;
DROP TABLE IF EXISTS jwt;
DROP TABLE IF EXISTS Annotation;

CREATE TABLE jwt(
    token TEXT NOT NULL PRIMARY KEY,
    cleScrete TEXT NOT NULL
);


CREATE TABLE Utilisateur(
    idUser SERIAL PRIMARY KEY,
    nom VARCHAR (50) NOT NULL,
    prenom VARCHAR (30) NOT NULL,
    pseudo VARCHAR (30) UNIQUE NOT NULL,
    email VARCHAR (100) UNIQUE NOT NULL,
    lien_linkedin VARCHAR (300) DEFAULT NULL,
    lien_github VARCHAR (300) DEFAULT NULL,
    ville VARCHAR (100),
    lastCheckedNotif TIMESTAMP DEFAULT NULL,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniereModif TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    description_event TEXT,
    img VARCHAR(100),
    nombre_min_equipe INTEGER,
    nombre_max_equipe INTEGER,
    message_fin TEXT DEFAULT NULL,
    derniereModif TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_event VARCHAR(30) CHECK (type_event IN ('battle', 'challenge'))
);

CREATE TABLE Projet(
    idProjet SERIAL PRIMARY KEY,
    nom VARCHAR (30) NOT NULL,
    description_projet TEXT NOT NULL,
    recompense INTEGER NOT NULL,   
    imgProjet VARCHAR(100),
    sujet VARCHAR(500) NOT NULL,
    derniereModif TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idEvent INT REFERENCES Evenement(idEvent) ON DELETE SET NULL
);

CREATE TABLE Equipe(
    idEquipe SERIAL PRIMARY KEY,
    nom VARCHAR(30) NOT NULL,
    img VARCHAR(100) DEFAULT NULL,
    description_equipe TEXT DEFAULT NULL,
    statut_recrutement VARCHAR(30) CHECK (statut_recrutement IN ('ouvert', 'fermé')),
    lien_github TEXT DEFAULT NULL,
    lienDiscussion TEXT DEFAULT NULL,
    preferenceQuestionnaire BOOLEAN DEFAULT false,
    idProjet INT REFERENCES Projet(idProjet) ON DELETE CASCADE,
    idCapitaine INT REFERENCES Etudiant(idEtudiant) ON DELETE CASCADE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finaliste INT REFERENCES Evenement(idEvent) ON DELETE CASCADE
);


CREATE TABLE Regle(
    idRegles SERIAL PRIMARY KEY,
    titre VARCHAR(50) NOT NULL,
    contenu TEXT NOT NULL,
    idEvent INT REFERENCES Evenement(idEvent) ON DELETE CASCADE
);

ALTER TABLE Projet
ADD COLUMN idEquipeGagnante INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE;

CREATE TABLE Ressource(
    idRessource SERIAL PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    type_ressource VARCHAR(100) CHECK (type_ressource IN ('drive', 'téléchargement', 'lien', 'video')),
    lien VARCHAR(1000), 
    date_apparition TIMESTAMP NOT NULL,
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
    idQuestionnaire INT REFERENCES Questionnaire(idQuestionnaire) ON DELETE CASCADE
);

CREATE TABLE Mot_cle(
    idMot SERIAL PRIMARY KEY,
    mot VARCHAR(100),
    idProjet INT REFERENCES Projet(idProjet) ON DELETE CASCADE
);

CREATE TABLE Appartenir(
    idUser INT REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    idEquipe INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    PRIMARY KEY (idUser, idEquipe)
);

CREATE TABLE Represente(
    idMot INT REFERENCES Mot_cle(idMot) ON DELETE CASCADE,
    idProjet Int REFERENCES Projet(idProjet) ON DELETE CASCADE,
    PRIMARY KEY (idMot, idProjet)
);

CREATE TABLE Interested(
    idUser INT REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    idEvent INT REFERENCES Evenement(idEvent) ON DELETE CASCADE,
    PRIMARY KEY(idUser, idEvent)
);

CREATE TABLE Classement(
    idClassement SERIAL PRIMARY KEY,
    premier INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    deuxieme INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    troisieme INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE
);

CREATE TABLE Resultat(
    idEvent INT REFERENCES Evenement(idEvent) ON DELETE CASCADE,
    classement INT REFERENCES Classement(idClassement) ON DELETE CASCADE,
    PRIMARY KEY(idEvent, classement)
);

CREATE TABLE Gerer_ia_pau(
    id_g_iapau INT REFERENCES Gestionnaire_iapau(id_g_iapau) ON DELETE CASCADE,
    idProjet INT REFERENCES Projet(idProjet) ON DELETE CASCADE,
    PRIMARY KEY(id_g_iapau, idProjet)
);

CREATE TABLE Gerer_externe(
    id_g_externe INT REFERENCES Gestionnaire_externe(id_g_externe) ON DELETE CASCADE,
    idProjet INT REFERENCES Projet(idProjet) ON DELETE CASCADE,
    PRIMARY KEY(id_g_externe, idProjet)
);

CREATE TABLE DemandeEquipe(
    idUser INT REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    idEquipe INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    messageDemande TEXT DEFAULT NULL,
    PRIMARY KEY(idUser, idEquipe)

);

CREATE TABLE Preferences(
    idUser INT PRIMARY KEY REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    github BOOLEAN DEFAULT true,
    linkedin BOOLEAN DEFAULT true,
    ville BOOLEAN DEFAULT true,
    ecole BOOLEAN DEFAULT true,
    niveau_etude BOOLEAN DEFAULT true,
    metier BOOLEAN DEFAULT true
);

CREATE TABLE MessageGestionnaireAdmin(
    idMessage SERIAL PRIMARY KEY,
    idEquipe INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    idExpediteur INT REFERENCES Utilisateur(idUser),
    contenu TEXT NOT NULL,
    estLu BOOLEAN DEFAULT FALSE,
    typeMessage VARCHAR(30) CHECK (typeMessage IN ('team', 'projet', 'event')) DEFAULT 'team',
    date_envoie TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MessageEquipe(
    idMessage SERIAL PRIMARY KEY,
    idEquipe INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    idExpediteur INT REFERENCES Etudiant(idEtudiant),
    contenu TEXT NOT NULL,
    estLu BOOLEAN DEFAULT FALSE,
    typeMessage VARCHAR(30) DEFAULT 'team' CHECK (typeMessage = 'team'),
    date_envoie TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Annotation(
    idAnnotation SERIAL PRIMARY KEY,
    idEquipe INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE NOT NULL,
    auteur INT REFERENCES Utilisateur(idUser) NOT NULL,
    contenu TEXT NOT NULL,
    date_annotation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO Evenement (nom, debut_inscription, date_debut, date_fin, description_event, nombre_min_equipe, nombre_max_equipe, type_event, img)
VALUES ('Événement 1', '2023-07-15', '2023-08-01', '2023-08-31', 'Ceci est la description de l''événement 1', 2, 5, 'battle', '');

INSERT INTO Evenement (nom, debut_inscription, date_debut, date_fin, description_event, nombre_min_equipe, nombre_max_equipe, message_fin, type_event, img)
VALUES ('Événement 2', '2023-09-01', '2023-09-15', '2023-09-30', 'Ceci est la description de l''événement 2', 1, 3, 'Message de fin de l''événement 2', 'challenge', 'img2.jpg');

INSERT INTO Projet (nom, description_projet, recompense, sujet, idEvent, imgProjet)
VALUES ('Projet 1', 'Ceci est la description du projet 1', 500, 'Sujet du projet 1', 1, '');

INSERT INTO Projet (nom, description_projet, recompense,  sujet, idEvent, imgProjet)
VALUES ('Projet 2', 'Ceci est la description du projet 2', 1000,  'Sujet du projet 2', 2, '');

INSERT INTO Ressource (titre, type_ressource, lien, date_apparition, statut, description_ressource, idProjet)
VALUES ('Ressource 1', 'drive', 'https://drive.google.com/file1', '2023-01-01', 'public', 'Description de la ressource 1', 1);

INSERT INTO Ressource (titre, type_ressource, lien, date_apparition, statut, description_ressource, idProjet)
VALUES ('Ressource 2', 'lien', 'https://example.com/resource2', '2023-02-01', 'privé', 'Description de la ressource 2', 2);


INSERT INTO Regle (titre, contenu, idEvent)
VALUES ('Règle 1', 'Contenu de la règle 1', 1);

INSERT INTO Regle (titre, contenu, idEvent)
VALUES ('Règle 2', 'Contenu de la règle 2', 2);


INSERT INTO Mot_cle (mot, idProjet)
VALUES ('Mot-clé 1', 1);

INSERT INTO Mot_cle (mot, idProjet)
VALUES ('Mot-clé 2', 2);
