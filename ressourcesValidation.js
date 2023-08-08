const validateRessources = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 100 caractères.'),

    body('type')
        .notEmpty().withMessage('Le type ne doit pas être vide.')
        .matches(/^(video|lien|drive|téléchargment)$/).withMessage('Le type doit avoir "video", "lien", "drive" ou "téléchargement".')
        .isLength({ min: 2, max: 18 }),

    body('lien')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .isURL()
        .isLength({ min: 3, max: 1000 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 1000 caractères.'),

    body('description')
        .notEmpty().withMessage('La description est obligatoire.')
        .isLength({ min: 10, max: 10000 }).withMessage('La description doit avoir une longueur comprise entre 10 et 10000 caractères.'),

    body('consultation')
        .notEmpty().withMessage('La consultation ne doit pas être vide.')
        .matches(/^(privé|public)$/).withMessage('Le type doit avoir "privé", "public".')
        .isLength({ min: 2, max: 6 }),

    body('publication')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.'),

    /**Appel du validateur */
    validationDonnees.validateUserData,
];