\c postgres;
DROP DATABASE IF EXISTS iapau;
CREATE DATABASE iapau;

-- Se connecter à la base de données
\c iapau;

-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS Etudiant CASCADE;
DROP TABLE IF EXISTS Admini CASCADE;
DROP TABLE IF EXISTS Gestionnaire_externe CASCADE;
DROP TABLE IF EXISTS Utilisateur CASCADE;
DROP TABLE IF EXISTS Gestionnaire_iapau CASCADE;


CREATE TABLE Utilisateur(
    idUser SERIAL PRIMARY KEY,
    nom VARCHAR (30) NOT NULL,
    prenom VARCHAR (30) NOT NULL,
    pseudo VARCHAR (30) UNIQUE NOT NULL,
    email VARCHAR (100) UNIQUE NOT NULL,
    lien_linkedin VARCHAR (100),
    lien_github VARCHAR (100),
    ville VARCHAR (100),
    lastCheckedNotif TIMESTAMP,
    date_inscription TIMESTAMP NOT NULL,
    hashMdp VARCHAR(255),
    typeUser VARCHAR(30) CHECK (typeUser IN ('etudiant', 'gestionnaire', 'administrateur'))
    
);

-- Créer les tables
CREATE TABLE Etudiant(
    idEtudiant SERIAL PRIMARY KEY,
    ecole VARCHAR(100),
    niveau_etude VARCHAR(15),
    code_postale_ecole VARCHAR (5),
    idUser INT REFERENCES Utilisateur(idUser)
);

CREATE TABLE Admini(
    idAdmin SERIAL PRIMARY KEY,
    idUser INT REFERENCES Utilisateur(idUser)
);

CREATE TABLE Gestionnaire_iapau(
    id SERIAL PRIMARY KEY,
    role_asso VARCHAR(100),
    idUser INT REFERENCES Utilisateur(idUser)
);

CREATE TABLE Gestionnaire_externe(
    id SERIAL PRIMARY KEY,
    entreprise VARCHAR(100),
    metier VARCHAR(100),
    idUser INT REFERENCES Utilisateur(idUser)
);

DELETE FROM Utilisateur WHERE email =  'admin@admin.fr';

/** Admin par défaut*/
INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_DATE , 'admin', 'administrateur' );
