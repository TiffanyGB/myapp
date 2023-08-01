const annotationModel = require('../models/annotationEquipeModel');


/*Vérifier profil et exitence équipe*/
function ecrireAnnotation(req, res){

    if(req.method === 'OPTIONS'){

    }else if(req.method === 'POST'){
        const idEquipe = res.locals.idEquipe;
        const auteur = req.id;

        const contenu = req.body.contenu;

        try{
            annotationModel.creerAnnotation([idEquipe, auteur, contenu]);
            res.status(200).json({message: 'Annotation créée.'});
        }catch{
            res.status(400).json({error: 'Echec lors de la création de l\'annotation.'});
        }
    }
}

/**Pas bon, pas sûre d'avoir besoin*/
function modifierAnnotation(req, res){
    if(req.method === 'OPTIONS'){

    }else if(req.method === 'PATCH'){
        const idEquipe = res.locals.idEquipe;
        const auteur = req.id;

        const contenu = req.body.contenu;

        try{
            annotationModel.modifierAnnotation([idEquipe, auteur, contenu]);
            res.status(200).json({message: 'Annotation créée.'});
        }catch{
            res.status(400).json({error: 'Echec lors de la création de l\'annotation.'});
        }
    }
}

async function getAnnotationEquipe(req, res){
    if(req.method === 'OPTIONS'){

    }else if(req.method === 'GET'){
        const idEquipe = res.locals.idEquipe;

        try{
            const annotation = await annotationModel.getAnnotationEquipes(idEquipe);
            for(i = 0; i < annotation.length; i++){
                delete annotation[i].idannotation;
            }
            res.status(200).json(annotation);
        }catch{
            res.status(400).json({error: 'Echec lors de la création de l\'annotation.'});
        }
    }
}

function getAnnotationEquipeProjet(req, res){

}

module.exports = {
    ecrireAnnotation,
    modifierAnnotation,
    getAnnotationEquipe,
    getAnnotationEquipeProjet
}