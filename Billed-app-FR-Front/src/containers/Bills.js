import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

/* Une classe qui exporte une classe par défaut. */
export default class {
  /**
   * C'est une fonction constructeur qui prend un objet comme argument, puis il définit la valeur de la
   * propriété `document` à la valeur de la propriété `document` de l'objet qui a été transmis, puis il
   * définit la valeur du ` onNavigate` à la valeur de la propriété `onNavigate` de l'objet qui a été
   * transmis, puis il définit la valeur de la propriété `store` à la valeur de la propriété `store` de
   * l'objet qui a été transmis, et puis il définit la valeur de la propriété `localStorage` à la
   * valeur de la propriété `localStorage` de l'objet qui a été transmis, puis il définit la valeur de
   * la propriété `buttonNewBill` à la valeur de la propriété `buttonNewBill` de l'objet qui a été
   * transmis, puis il définit la valeur de la propriété `iconEye` sur la valeur de la propriété
   * `iconEye` de l'objet qui a été transmis
   */
  constructor({ document, onNavigate, store, localStorage }) {

    /* Définir la valeur de la propriété `document` sur la valeur de la propriété `document` de l'objet
    qui a été transmis. */
    this.document = document
    // console.log(this.document);

    /* Définir la valeur de la propriété `onNavigate` sur la valeur de la propriété `onNavigate` de
    l'objet qui a été transmis. */
    this.onNavigate = onNavigate
    // console.log(this.onNavigate);

    /* Définir la valeur de la propriété `store` sur la valeur de la propriété `store` de l'objet qui a
    été passé. */
    this.store = store
    // console.log(this.store);

    /* Sélection du bouton avec l'attribut data-testid de btn-new-bill. */
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)

    /* Ajout d'un écouteur d'événement au bouton avec l'attribut data-testid de btn-new-bill. */
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)

    /* Sélection de tous les éléments avec l'attribut data-testid de icon-eye. */
    // const iconEye = document.getElementById("eye")

    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    
    /* Ajout d'un écouteur d'événement à chaque icône. */
    // iconEye.onClick = ()=>{
    //   console.log('ok');
    // }

    /* Il crée une nouvelle instance de la classe Logout. */
    //TODO comment tester ca
    new Logout({ document, localStorage, onNavigate })
  }

 /* Une fonction qui est appelée lorsque l'utilisateur clique sur l'icône avec l'attribut data-testid
 de icon-eye. */
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    if (typeof $('#modaleFile').modal === 'function') $('#modaleFile').modal('show')
  }

  /* Une fonction appelée lorsque l'utilisateur clique sur le bouton avec l'attribut data-testid de
  btn-new-bill. */
  //TODO Comment tester ca 
  handleClickNewBill = e => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  /* Une fonction qui renvoie une promesse. */
  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      /* Une fonction qui prend un instantané comme argument, puis définit la valeur des `bills`
      propriété à la valeur de la méthode `map` de la propriété `snapshot`, puis elle renvoie la
      valeur de la
      propriété `factures`. */
      .then(snapshot => {
        const bills = snapshot
        .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
        return bills
      })
    }
  }
}