'use-script'; //pour lui dire de faire bien gaffe à ce que dit le code, pas d'erreur à la con

class ESDJob {
  constructor() {
    this._checkSetup();

    this.googleBtn = document.querySelector('#login-google');
    this.snack = document.querySelector('#snackbar-alert');
    console.log('test');
    this._initFirebase();
    this._setupEvents();
  }

  _initFirebase(){
    this.auth = firebase.auth(); //authentification, sais si connecté ou pas
    this.db = firebase.firestore(); //dans quelle base de donnée on va
    //firestore en beta, risque de bug sinon, donc ->
    const settings = {timestampsInSnapshots: true};
    this.db.settings(settings);

    this.storage = firebase.storage();
    //Initialize Firebase auth and listen to auth state changes
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this)); //si il y a un changement d'authentification
    var data = {
      message: 'Server connected',
      timeout: 5000
    };
    this.snack.MaterialSnackbar.showSnackbar(data);
  }

  _setupEvents(){
    this.googleBtn.addEventListener('click', this.signInWithGoogle.bind(this));
  }
  signInWithGoogle(){
    console.log('test2');
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
  }

  onAuthStateChanged(user){
    console.log('user:', JSON.stringify(user)); //pour éviter de se retrouver avec [objet Objet]
    if (user){
      console.log("Connecté");
    } else {
      console.log("Déconnecté");
    }
  }

  _checkSetup(){
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options){
      window.alert('You have not configured and imported the Firebase SDK' +
        'Make sure you go through the codelan setup instructions and make' +
        'sure you are running the codelab using `firebase serve`');
    }
  }
}

window.onload = function(){ //se lance quand tout les éléments du html sont chargé (tous est la)
  window.ESDJob = new ESDJob();
};
