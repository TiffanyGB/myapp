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
DROP TABLE IF EXISTS Mot_cle CASCADE;
DROP TABLE IF EXISTS Appartenir CASCADE;
DROP TABLE IF EXISTS Represente CASCADE;
DROP TABLE IF EXISTS Regle CASCADE;
DROP TABLE IF EXISTS Classement CASCADE;
DROP TABLE IF EXISTS Resultat CASCADE;
DROP TABLE IF EXISTS Interested CASCADE;



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
    img BYTEA, -- NOT NULL,
    nombre_min_equipe INTEGER,
    nombre_max_equipe INTEGER,
    message_fin TEXT DEFAULT NULL,
    type_event VARCHAR(30) CHECK (type_event IN ('battle', 'challenge'))
);

CREATE TABLE Projet(
    idProjet SERIAL PRIMARY KEY,
    nom VARCHAR (30) NOT NULL,
    description_projet TEXT NOT NULL,
    recompense INTEGER,   
    imgProjet BYTEA, -- NOT NULL,
    sujet VARCHAR(100),
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
    idCapitaine INT REFERENCES Etudiant(idEtudiant) ON DELETE CASCADE   ,
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
    idQuestionnaire INT REFERENCES Questionnaire(idQuestionnaire) ON DELETE CASCADE
);

CREATE TABLE Mot_cle(
    idMot SERIAL PRIMARY KEY,
    mot VARCHAR(100),
    idProjet INT REFERENCES Projet(idProjet) ON DELETE CASCADE
);

CREATE TABLE Appartenir(
    idUser INT REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    idEquipe INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE
);

CREATE TABLE Represente(
    idMot INT REFERENCES Mot_cle(idMot) ON DELETE CASCADE,
    idProjet Int REFERENCES Projet(idProjet) ON DELETE CASCADE
);

CREATE TABLE Interested(
    idUser INT REFERENCES Utilisateur(idUser) ON DELETE CASCADE,
    idEvent INT REFERENCES Evenement(idEvent) ON DELETE CASCADE
);

CREATE TABLE Classement(
    idClassement SERIAL PRIMARY KEY,
    premier INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    deuxieme INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE,
    troisieme INT REFERENCES Equipe(idEquipe) ON DELETE CASCADE
);

CREATE TABLE Resultat(
    idEvent INT REFERENCES Evenement(idEvent) ON DELETE CASCADE,
    classement INT REFERENCES Classement(idClassement) ON DELETE CASCADE
);


DELETE FROM Utilisateur WHERE email = 'admin@admin.fr';


INSERT INTO Evenement (nom, debut_inscription, date_debut, date_fin, nombre_min_equipe, nombre_max_equipe, type_event)
VALUES ('Nom', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 5, 'challenge'),
       ('Event2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '2028-07-30 12:18:47.564106', 3, 8, 'battle');


INSERT INTO Projet (nom, description_projet, recompense, imgProjet, sujet,idEvent)
VALUES 
    ('p1', 'Description du projet P1', 10000, 'valeur_du_bytea', 'Sujet 1' ,1),
    ('p2', 'Description du projet p2', 20000, E'\\x0123456789ABCDEF','Sujet principal' ,1);

INSERT INTO Ressource (titre, type_ressource, lien, date_apparition, statut, description_ressource, idProjet)
VALUES
    ('Ressource 1', 'lien', 'https://example.com/ressource1', '2023-06-28 12:00:00', 'public', 'Description de la ressource 1', 1),
    ('Ressource 2', 'drive', 'https://example.com/ressource2', '2023-06-28 13:00:00', 'privé', 'Description de la ressource 2', 2),
    ('Ressource 3', 'téléchargement', 'https://example.com/ressource2', '2023-06-28 13:00:00', 'privé', 'Description de la ressource ', 2);


INSERT INTO Regle (titre, contenu, idEvent)
VALUES
    ('Titre règle 1', 'Contenu règle 1', 1),
    ('Titre règle 2', 'Contenu règle 2', 1);

INSERT INTO Mot_cle (mot, idProjet) VALUES
  ('Environnement', 1),
  ('Code', 1),
  ('ODD', 2),
  ('Education', 2);

-- INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
-- VALUES
--   ('Nom2', 'Prénom2', 'Pseudo2', 'email2@example.com', CURRENT_TIMESTAMP, 'hash2', 'etudiant'),
--   ('Nom3', 'Prénom3', 'Pseudo3', 'email3@example.com', CURRENT_TIMESTAMP, 'hash3', 'etudiant'),
--   ('Nom4', 'Prénom4', 'Pseudo4', 'email4@example.com', CURRENT_TIMESTAMP, 'hash4', 'etudiant'),
--   ('Nom5', 'Prénom5', 'Pseudo5', 'email5@example.com', CURRENT_TIMESTAMP, 'hash5', 'etudiant'),
--   ('Nom6', 'Prénom6', 'Pseudo6', 'email6@example.com', CURRENT_TIMESTAMP, 'hash6', 'etudiant'),
--   ('Nom7', 'Prénom7', 'Pseudo7', 'email7@example.com', CURRENT_TIMESTAMP, 'hash7', 'etudiant'),
--   ('Nom8', 'Prénom8', 'Pseudo8', 'email8@example.com', CURRENT_TIMESTAMP, 'hash8', 'etudiant'),
--   ('Nom9', 'Prénom9', 'Pseudo9', 'email9@example.com', CURRENT_TIMESTAMP, 'hash9', 'etudiant'),
--   ('Nom10', 'Prénom10', 'Pseudo10', 'email10@example.com', CURRENT_TIMESTAMP, 'hash10', 'etudiant');

-- INSERT INTO Etudiant (idEtudiant, ecole, niveau_etude, code_postale_ecole)
-- VALUES
--   (2, 'École 2', 'Niveau 2', '23456'),
--   (3, 'École 3', 'Niveau 3', '34567'),
--   (4, 'École 4', 'Niveau 4', '45678'),
--   (5, 'École 5', 'Niveau 5', '56789'),
--   (6, 'École 6', 'Niveau 6', '67890'),
--   (7, 'École 7', 'Niveau 7', '78901'),
--   (8, 'École 8', 'Niveau 8', '89012'),
--   (9, 'École 9', 'Niveau 9', '90123'),
--   (10, 'École 10', 'Niveau 10', '01234');
