************************   PRÉPARATION DU SERVER  ************************

1) Mettre le fichier .env à jour avec les données suivantes:
    mongoLogin = "<votre Mongo connection string>"

    //Par defaut le server tourne sur le port 3000, vous pouvez choisir un port différent en renseignant:

    PORT = *le numéro de port de votre choix* 
    (verifiez aussi que l'appli front requète vers le même port) 

    TOKEN_KEY 'chaineDeCaractèreAléatoirePourleCryptageDuJetonD'Authentification"

2) Installer les modules node suivants depuis le dossier BACK:

DÉPENDANCES REQUISES :
npm install --save dotenv express mongoose mongoose-unique-validator bcrypt jsonwebtoken validator multer fs

Description des modules à installer :
                dotenv (gestionnaire des variables d'environement)
                express (server node)
                mongoose (connection à MongoDb )
                mongoose-unique-validator (plugin vérifiant l'unicitée d'un utilisateur pour la route POST ../signup)
                bcrypt (hashage password)
                jsonwebtoken (créateur de jetons d'identification)
                validator (regex mail et password)
                multer (gestion des téléchargements de fichiers)
                fs (gestionaire de fichiers)

3) Pour démarrer le server saisissez dans la console soit:

npm run start
    ou
node server
    ou
nodemon (si installé)
************************    INDICATIONS FRONT    ************************
Le mot de passe requis à l'inscription doit comporter au moins 8 caractères dont:
1 majuscule, 1 minuscule et 1 chiffre.
L'Api est codée avec des messages d'erreurs respectueux de la rgpd et cohérants pour les utilisateurs.
Ils sont accessible à la propriété res.error.error sur chaques routes.
Utiliser ces feedback plutôt que la réponse server standard peut être une bonne pratique.  

************************   DÉTAILS DES ROUTES   ************************ 

VERBS:        URI:                 BODY:                            RESPONSES:
POST       auth/signup     {email:string, password}             {message:string}
POST       auth/login      {email:string, password}             {userId:string, token:string}
GET        sauces/                   -                          [toutes les sauces]
GET        sauces/{id}               -                          sauce
POST       sauces/         {sauce:string, image:file}           {message:string}Verb
PUT        sauces/{id}     JSON{sauce:string, image:file}       {message:string}
                                   
DELETE     sauces/{id}               -                          {message:string}
POST       sauces/         {userId:string, like:number}         {message:string}

