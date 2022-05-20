import { ROUTES_PATH } from '../constants/routes.js'

/* C'est une classe qui gère l'événement de clic sur le bouton de déconnexion */
export default class Logout {
  
  /**
   * Une fonction constructeur qui accepte un objet avec les propriétés document, onNavigate et
   * localStorage. Il définit ensuite les propriétés de l'objet sur les propriétés de la fonction
   * constructeur.
   */
  constructor({ document, onNavigate, localStorage }) {

    /* Définition de la valeur de la propriété document de la classe sur la valeur du paramètre
    document. */
    this.document = document

    /* Définition de la valeur de la propriété onNavigate de la classe à la valeur du paramètre
    onNavigate. */
    this.onNavigate = onNavigate

   /* Définition de la valeur de la propriété localStorage de la classe sur la valeur du paramètre
   localStorage. */
    this.localStorage = localStorage

    /* Ajout d'un écouteur d'événement à l'élément avec l'id `layout-disconnect` et appel de la
    fonction `handleClick` lorsque l'élément est cliqué. */
    $('#layout-disconnect').click(this.handleClick)
  }
  
  /* Fonction appelée lorsque l'utilisateur clique sur le bouton de déconnexion. Il efface le stockage
  local et accède à la page de connexion. */
  handleClick = (e) => {
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 