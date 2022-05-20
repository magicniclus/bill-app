
import { ROUTES_PATH } from '../constants/routes.js'
export let PREVIOUS_LOCATION = ''

// we use a class so as to test its methods in e2e tests
export default class Login {
  /**
   * La fonction constructeur est appelée lorsque la classe est instanciée. Il est utilisé pour définir
   * l'état initial de l'objet
   */
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document
    this.localStorage = localStorage
    this.onNavigate = onNavigate
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION
    this.store = store
    this.formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    this.formEmployee.addEventListener("submit", this.handleSubmitEmployee)
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }
  
  // not need to cover this function by tests
  /**
   * 
   *Retrieves the data entered and attributes a jwt token in the local storage if the user is known of the data
   *
   * @param   {Object}  user  [user description]
   *
   * @return  {void}        [return description]
   */
  login = (user) => {
    if (this.store) {
      return this.store
      .login(JSON.stringify({
        email: user.email,
        password: user.password,
      })).then(({jwt}) => {
        localStorage.setItem('jwt', jwt)
      })
    } else {
      return null
    }
  }
  
  /**
   * 
   *Recovery, storage in the user, and redirection to the user page if the data entered is validated, otherwise call the createUser function to create the user
   */
  /* Cette fonction est appelée lorsque l'utilisateur clique sur le bouton d'envoi du formulaire. Il
  récupère les données saisies et attribue un jeton jwt dans le stockage local si l'utilisateur est
  connu des données. */
  handleSubmitEmployee = e => {
    e.preventDefault()
    this.email = e.target.querySelector(`input[data-testid="employee-email-input"]`).value;
    const user = {
      type: "Employee",
      email: this.email,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected"
    }
    this.localStorage.setItem("user", JSON.stringify(user))
    this.login(user)
    .then(() => {
      this.onNavigate(ROUTES_PATH['Bills'])
      this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
      PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
      this.document.body.style.backgroundColor="#fff"
    })
    .catch(
      (err) =>{
        this.createUser(user)
      } 
      )
    }
    
    /* Fonction appelée lorsque l'utilisateur clique sur le bouton d'envoi. Il récupère les données
    saisies et attribue un jeton jwt dans le stockage local si l'utilisateur est connu des données. */
    showValueEmployee = e => {
      e.preventDefault();
      this.emailEmployee = document.querySelector(`input[data-testid="employee-email-input"]`).value
      this.password = document.querySelector(`input[data-testid="employee-password-input"]`).value
    }
    
    /* Cette fonction est appelée lorsque l'utilisateur clique sur le bouton Soumettre. Il récupère les
    données saisies et attribue un jeton jwt dans le stockage local si l'utilisateur est connu des
    données. */
    handleSubmitAdmin = e => {
      e.preventDefault()
      const user = {
        type: "Admin",
        email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
        password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
        status: "connected"
      }
      this.localStorage.setItem("user", JSON.stringify(user))
      this.login(user)
      .then(() => {
        this.onNavigate(ROUTES_PATH['Dashboard'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        document.body.style.backgroundColor="#fff"
      })
      .catch(
        (err) => this.createUser(user)
        )
      }
      
      
      // not need to cover this function by tests
      /**
       * 
       *creation of a user when entering an email address without being registered in the database
       *
       * @param   {[type]}  user  [user description]
       *
       * @return  {[type]}        [return description]
       */
      createUser = (user) => {
        console.log(user.email );
        if (this.store) {
          return this.store
          .users()
          .create({data:JSON.stringify({
            type: user.type,
            name: user.email.split('@')[0],
            email: user.email,
            password: user.password,
          })})
          .then(() => {
            console.log(`User with ${user.email} is created`)
            console.log(user);
            return this.login(user)
          })
        } else {
          return null
        }
      }
    } 