# PRÉPARATION DU SERVER #
#1) Mettre le fichier .env à jour avec les données suivantes:
-
    mongoLogin = "<votre Mongo connection string>"
    ADMINISTRATORS = ["email_des_moderateurs"]

    //Par defaut le server tourne sur le port 3000, vous pouvez choisir un port différent en renseignant:
    PORT = *le numéro de port de votre choix* 
    (verifiez aussi que l'appli front requète vers le même port) 

    TOKEN_KEY 'chaineDeCaractèreAléatoirePourleCryptageDuJetonD'Authentification"

#2) Installer les modules node suivants depuis le dossier BACK:
-
###DÉPENDANCES REQUISES :
npm install --save (installera les modules suivants: dotenv express mongoose mongoose-unique-validator bcrypt jsonwebtoken validator multer fs)

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

#3) Pour démarrer le server saisissez dans la console soit:
-
npm run start
    ou
node server
    ou
nodemon (si installé)
#INDICATIONS FRONT
Le mot de passe requis à l'inscription doit comporter au moins 9 caractères dont:
1 majuscule, 1 minuscule et 1 chiffre.
L'Api est codée avec des messages d'erreurs respectueux de la rgpd et cohérants pour les utilisateurs.
Ils sont accessible à la propriété res.error.error sur chaques routes.
Utiliser ces feedback plutôt que la réponse server standard est une bonne pratique.  

#DÉTAILS DES ROUTES 
-
VERBS:        URI:                           req:                                                              RESPONSES:
POST       auth/signin            Body{email:string, password}                                       cookie httpOnly:token(userId), {userprofile}
POST       auth/login             Body{email:string, password}                                       cookie httpOnly:token(userId), {userprofile}
POST       auth/logout            cookie httpOnly:token(userId)                                      clearCookie httpOnly:token(userId)
GET        auth/profile/all       cookie httpOnly:token(userId)                                      [users, ]
PUT        auth/update            cookie httpOnly:token(userId),Body{userprofileUpdated}             {userprofile}

GET        posts/                 cookie httpOnly:token(userId)                                      [tous les posts]
GET        posts/{id}             cookie httpOnly:token(userId)                                      {post}
POST       posts/                 cookie httpOnly:token(userId) Body{post}                           {message:string}
PUT        posts/{id}/update      cookie httpOnly:token(userId) Body{post}                           {message:string}
                                   
DELETE     posts/{id}/delete      cookie httpOnly:token(userId)                                      {message:string}
POST       posts/{id}/like        cookie httpOnly:token(userId) Body{likeIt:boolean}                 {message:string}

