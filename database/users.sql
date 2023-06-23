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
    lien_linkedin VARCHAR (100) DEFAULT NULL,
    lien_github VARCHAR (100) DEFAULT NULL,
    ville VARCHAR (100),
    lastCheckedNotif TIMESTAMP DEFAULT NULL,
    date_inscription TIMESTAMP NOT NULL,
    hashMdp VARCHAR(255),
    typeUser VARCHAR(30) CHECK (typeUser IN ('etudiant', 'gestionnaire', 'administrateur'))
    
);

-- Créer les tables
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

DELETE FROM Utilisateur WHERE email =  'admin@admin.fr';

/** Admin par défaut*/
INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_DATE , 'admin', 'administrateur' );
