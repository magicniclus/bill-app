import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

/* C'est une classe qui crée une nouvelle facture */
export default class NewBill {
  /**
   * Une fonction constructeur qui accepte un objet avec les propriétés document, onNavigate, store et
   * localStorage. Il définit ensuite les propriétés de l'objet sur les propriétés de la fonction
   * constructeur. Il ajoute ensuite un écouteur d'événement à l'élément formNewBill qui écoute un
   * événement submit et appelle la fonction handleSubmit. Il ajoute ensuite un écouteur d'événement à
   * l'élément file qui écoute un événement change et appelle la fonction handleChangeFile. Il définit
   * ensuite les propriétés fileUrl et fileName sur null et définit la propriété billId sur null. Il
   * crée ensuite un nouvel objet Logout.
   */
  constructor({ document, onNavigate, store, localStorage }) {

    /* Définition de la propriété document de la classe sur le document passé dans le constructeur. */
    this.document = document

    /* Une fonction passée en paramètre au constructeur. */
    this.onNavigate = onNavigate

    /* Définition de la propriété store de la classe sur le magasin passé dans le constructeur. */
    this.store = store

    /* Sélection de l'élément de formulaire avec l'attribut data-testid de form-new-bill. */
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)

    /* Ajout d'un écouteur d'événement à l'élément formNewBill qui écoute un événement submit et
    appelle la fonction handleSubmit. */
    formNewBill.addEventListener("submit", this.handleSubmit)

    /* Sélection de l'élément d'entrée avec l'attribut data-testid du fichier. */
    const file = this.document.querySelector(`input[data-testid="file"]`)

    /* Il ajoute un écouteur d'événement à l'élément d'entrée de fichier. */
    file.addEventListener("change", this.handleChangeFile)

    /* Définition de la propriété fileUrl de la classe sur null. */
    this.fileUrl = null

    /* Définition de la propriété fileName de la classe sur null. */
    this.fileName = null

    /* Définition de la propriété billId de la classe sur null. */
    this.billId = null

    /* Il crée un nouvel objet Logout. */
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault()
    /* Un tableau d'extensions de fichiers autorisées. */
    const extensionsAllowed = ["jpg", "jpeg", "png"]; 

    /* Sélection de l'élément d'entrée de fichier et obtention du premier fichier du tableau files. */
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]

    /* Sélection de l'élément d'entrée de fichier et obtention du premier fichier du tableau de
    fichiers. */
    let filePath = null

    /* Variable utilisée pour stocker le nom du fichier. */
    let fileName = null

    // localStorage.clear()
    /* Il divise le nom du fichier par le point et renvoie le dernier élément du tableau. */
    const extensionsCheck = file.name.split(".").pop();

    /* Vérifier si l'extension de fichier est autorisée. S'il est autorisé, il définit les variables
    filePath et fileName. S'il n'est pas autorisé, il désactive le bouton et alerte l'utilisateur. */
    if(extensionsAllowed.includes(extensionsCheck)){

      /* Il divise le chemin du fichier par la barre oblique inverse et renvoie le dernier élément du
      tableau. */
      filePath = e.target.value.split(/\\/g)

      /* Obtenir le nom du fichier à partir du chemin du fichier. */
      fileName = filePath[filePath.length-1]

      /* Il active le bouton. */
      this.document.getElementById("btn-send-bill").disabled = false;

    }else{
      /* Il désactive le bouton. */
      this.document.getElementById("btn-send-bill").disabled = true;
      /* Un message d'alerte à l'utilisateur pour sélectionner une image de type .jpg, .jpeg ou .png. */
      alert ('Veuillez séléctionner un image de type .jpg, .jpeg ou .png');
      /* Utilisé pour quitter la fonction. */
      return;
    }

    /* Il crée un nouvel objet FormData. */
    const formData = new FormData()

    /* Obtenir l'e-mail du localStorage. */
    const email = JSON.parse(localStorage.getItem("user")).email

    /* Ajout du fichier à l'objet formData. */
    formData.append('file', file)

    /* Ajout de l'e-mail à l'objet formData. */
    formData.append('email', email)

    /* Création d'une nouvelle facture. */
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      /* Une promesse. */
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
  
  /* Une fonction qui est appelée lorsque le formulaire est soumis. Il empêche l'action par défaut du
  formulaire. Il obtient l'e-mail du localStorage. Il crée un objet avec les données du formulaire.
  Il appelle la fonction updateBill avec l'objet en paramètre. Il appelle la fonction onNavigate
  avec la route Bills en paramètre. */
  handleSubmit = e => {
    e.preventDefault()
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    /* Il obtient l'e-mail du localStorage. */
    const email = JSON.parse(localStorage.getItem("user")).email
    /* Création d'un objet avec les données du formulaire. */
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    /* Mise à jour de la facture avec les nouvelles données. */
    this.updateBill(bill)
    /* Appel de la fonction onNavigate avec la route Bills en paramètre. */
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  /* Mise à jour de la facture avec les nouvelles données. */
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}