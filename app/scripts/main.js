'use-script'; //pour lui dire de faire bien gaffe à ce que dit le code, pas d'erreur à la con

var userId;
var tbody = document.querySelector('tbody');
var name;
var jobs;
var contact;
var tjm;
var snackbar = document.querySelector('#snackbar-alert');


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
    var img = document.getElementById('user-pic');
    if (user){
      console.log("Connecté");
      img.style.display = "flex";
      if (user.displayName != null){
        img.innerHTML = "<img id='imgLog'src='" + user.photoURL + "'/><p>" + user.displayName + "</p>";
      } else {
        img.innerHTML = "<img id='imgLog'src='https://openclipart.org/download/247319/abstract-user-flat-3.svg'/><p>" + user.email + "</p>";
      }
      userId = user.uid;
      console.log(userId);
      var ref = firebase.database().ref("users");
      ref.on('value', gotData, errData);

    } else {
      console.log("Déconnecté");
      img.style.display = "none";
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
  getJobs();
};



//connexion classique mail + mot de passe

function login(){
  var email = document.getElementById('email_field').value;
  var password = document.getElementById('password_field').value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // An error happened.
    var errorMessage = error.message;
    alert("Error : " + errorMessage);
  });
  document.querySelector('#logDialog').close();
};

//deconnexion
function logout(){
  firebase.auth().signOut().then(function() {
  }).catch(function(error) {
  });
};

//gestion de l'affichage dans le header, selon si on est connecté ou non
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    document.getElementById('login-google').style.display = "none";
    document.getElementById('show-dialog').style.display = "none";
    document.getElementById('logout').style.display = "initial";
  } else {
    // No user is signed in.
    document.getElementById('login-google').style.display = "initial";
    document.getElementById('show-dialog').style.display = "initial";
    document.getElementById('logout').style.display = "none";
  }
});



//recuperation de la liste des offres de jobs

function getJobs(){
  var ref2 = firebase.database().ref("job_offers");
  ref2.on('value', gotJobs, errData);
  console.log("ok");
}
function gotJobs(jobs){
  tbody.innerHTML = "";
  var jobs = jobs.val();
  var keysJobs = Object.keys(jobs);
  console.log(keysJobs);
  for (var i = 0; i<keysJobs.length; i++){

    var key = keysJobs[i];
    var nameJob = jobs[key].name;
    var city = jobs[key].city;
    var start = jobs[key].start;
    var duration = jobs[key].duration;
    var contactJob = jobs[key].contact;

    tbody.innerHTML += "<tr> <td>"+nameJob+"</td><td>"+city+"</td><td>"+start+"</td><td>"+duration+"</td><td>"+contactJob+"</tr>";
  }
}



//recuperation des informations personnelles de l'utilisateur

function gotData(data){
  var datas = data.val();
  var keys = Object.keys(datas);
  console.log(keys);
  for (var i = 0; i<keys.length; i++){
    if (keys[i] == userId){
      var k = keys[i];
      name = datas[k].name;
      document.getElementById('name').innerHTML = "Name : " + name;
      jobs = datas[k].jobs;
      document.getElementById('jobs').innerHTML = "Jobs : " + jobs;
      contact = datas[k].contact;
      document.getElementById('contact').innerHTML = "Contact : " + contact;
      tjm = datas[k].TJM;
      document.getElementById('tjm').innerHTML = "TJM : " + tjm;
      // console.log(name);
    }
  }
};
function errData(err){
  console.log("Error : " + err);
};



// modification des infos personnelles des utilisateurs

function updateUserData(){
  var new_name = document.getElementById('name_change').value;
  if (new_name == ""){
    new_name = name;
  }
  var new_jobs = document.getElementById('jobs_change').value;
  if (new_jobs == ""){
    new_jobs = jobs;
  }
  var new_contact = document.getElementById('contact_change').value;
  if (new_contact == ""){
    new_contact = contact;
  }
  var new_tjm = document.getElementById('tjm_change').value;
  if (new_tjm == ""){
    new_tjm = tjm;
  }
  writeUserData(userId, new_name, new_jobs, new_contact, new_tjm);
}

function writeUserData(userId, name, jobs, contact, tjm) {
  firebase.database().ref('users/' + userId).set({
    name: name,
    jobs: jobs,
    contact: contact,
    TJM: tjm
  });
  var messageUpdate = {
    message: 'Your account informations has been updated',
    timeout: 5000
  };
  snackbar.MaterialSnackbar.showSnackbar(messageUpdate);
}



//ajout d'une offre de job

function addJobOffer(){
  var jobName = document.querySelector('#sample1').value;
  var jobCity = document.getElementById('sample2').value;
  var jobDuration = document.getElementById('number').value;
  var jobStart = document.getElementById('date').value;
  var jobContact = document.getElementById('sample5').value;

  var ref = db.ref("job_offers");

  var offer = {
    name: jobName,
    city: jobCity,
    duration: jobDuration,
    start: jobStart,
    contact: jobContact
  }
  console.log(offer);
  ref.push(offer);
  dialogJob.close();

  var messageJob = {
    message: 'Your job offer has been added',
    timeout: 5000
  };
  snackbar.MaterialSnackbar.showSnackbar(messageJob);
}
