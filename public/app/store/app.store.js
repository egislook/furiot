
class appStore{
  constructor(firebase, opts){
    riot.observable(this);
    this.baseRef = opts && opts.baseRef || '/';
    this.state = {};
    this.metas = {};
    this.phrases = {};
    this.routes = {};
    this.todos = {};
    this.user = null;
    this.route = null;
    // state data
    this.initLoading = true;
    this.error = null;
    this.modalAction = null;
  }
  
  /* Initers */
  initApp(){
    this.initData();
    this.initUser();
  }
  
  initData(){ 
    firebase.database().ref(this.baseRef).on('value', (snapshot) => {
      let data = snapshot.val();
      this.setState(data);
      data = {
        metas: data.meta || {},
        phrases: data.phrase || {},
        routes: data.route || {},
        todos: data.todo || {}
      };
      
      this.setData(data);
      
  	  this.initLoading 
  	    ? this.trigger('ready', data, this.state)
  	    : this.trigger('data', data, this.state);
  	  this.initLoading = false;
  	  console.dir(data, this.state);
    }, (err) => console.log(err));
  }
  
  initUser(){
    firebase.auth().onAuthStateChanged((user) => {
  	  this.user = user && {
  	    name: user.displayName,
  	    email: user.email,
  	    photo: user.photoURL,
  	    uid: user.uid
  	  }
  	  this.trigger('user', this.user);
  	  console.dir(this.user);
  	}, (err) => console.log(err));
  }
  
  /* Routeing actions */
  setRouteAction(route){
    this.route = route;
    this.trigger('route', route);
  }
  
  /* User actions */
  loginAction(){
    let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }
  
  logoutAction(){
    firebase.auth().signOut();
  }
  
  /* Data actions */
  generateUidAction(path){
    path = typeof path === 'string' ? path : path.join('/');
    return firebase.database().ref(this.baseRef + path).push().key
  }
  addDataAction(data, path, priority){
    path = typeof path === 'string' ? path : path.join('/');
    priority 
      ? firebase.database().ref(this.baseRef + path).setWithPriority(data, priority)
        .catch((err) => this.toggleErrorAction(err))
      : firebase.database().ref(this.baseRef + path).set(data)
        .catch((err) => this.toggleErrorAction(err))
  }
  
  updateDataAction(value, path){
    path = typeof path === 'string' ? path : path.join('/');
    firebase.database().ref(this.baseRef + path).update(value)
      .catch((err) => this.toggleErrorAction(err));
  }
  
  removeDataAction(path){
    path = typeof path === 'string' ? path : path.join('/');
    firebase.database().ref(this.baseRef + path).remove()
      .catch((err) => this.toggleErrorAction(err));
  }
  
  /* Error actions */
  toggleErrorAction(err, size){
    this.error = !this.error 
      ? size
        ? `'${err}' ${this.phrases.incorrectInput} ${size.min} & ${size.max}`
        : err
      : null;
    this.trigger('error', this.error);
  }
  
  /* Modal actions*/
  toggleModalAction(actionOrConfirmation){
    if(typeof actionOrConfirmation === 'function'){
	    //sets confirmation action
	    this.modalAction = actionOrConfirmation;
	  } else {
  	  //confirms or denies the action
  	  actionOrConfirmation && this.modalAction();
  	  this.modalAction = null;
	  }
	  this.trigger('modal', this.modalAction);
  }
  
  /* Store extras */
  setData(data){
    for(let i in data){ this[i] = data[i] };
  }
  
  getData(keys){
    if(typeof keys === 'string'){
      return {[keys]: this[keys]};
    }
    let data = {};
    for(let i in keys){
      data[keys[i]] = this[keys[i]];
    }
    return data;
  }
  
  setState(data){
    for(let i in data){ this.state[i] = data[i] };
  }
  
  getState(keys){
    if(!keys) return this.state;
    if(typeof keys === 'string'){
      return { [keys]: this.state[keys] };
    }
    let state = {};
    for(let i in keys){
      state[keys[i]] = this.state[keys[i]];
    }
    return state;
  }
  
}


/*function appStore(firebase){
  riot.observable(this);
  var store = this;

  store.data = {};
  store.user = {};
  store.loaded = true;
  store.initRouting = true;
  
  
  store.initApp = () => {
    store.initData() && store.initUser();
  }
  
  store.initData = () => 
    firebase.database().ref().on('value', (snapshot) => {
      store.data = snapshot.val();
  	  store.trigger('data', store.data);
  	  console.dir(store.data);
    }, (err) => console.log(err));
    
  store.initUser = () =>
    firebase.auth().onAuthStateChanged((user) => {
  	  store.user = user && {
  	    name: user.displayName,
  	    email: user.email,
  	    photo: user.photoURL,
  	    uid: user.uid
  	  }
  	  store.trigger('user', store.user);
  	  console.dir(store.user);
  	}, (err) => console.log(err));
  
  store.login = () => {
    let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider)
  }
}*/


/*store.feedLoad = function(){
	var url = '/api/feed';
	store.trigger('feedLoadEvent', { state: 'loading' });
  superagent
    .get(url)
    .end(function(err, apiRes){
      apiRes = apiRes.body;
      //console.log('API => '+url, apiRes);
      if(!apiRes.ok){
      	return store.trigger('feedLoadEvent', { state: 'error', err: apiRes.err });
      }
      
      store.trigger('feedLoadEvent', { state: 'success', data: apiRes.data });
    });
}*/