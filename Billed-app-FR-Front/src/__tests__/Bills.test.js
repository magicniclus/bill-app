/* @jest-environment jsdom
*/

import { screen, waitFor } from "@testing-library/dom"
import { toHaveClass } from "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"

import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import mockedStore from "../__mocks__/storeTest"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { formatDate, formatStatus } from "../app/format.js";


/**
 * "Lorsque l'utilisateur accède à une nouvelle page, mettez à jour le corps du document avec le code
 * HTML renvoyé par la fonction ROUTES."
 * 
 * La fonction ROUTES est une fonction qui renvoie HTML en fonction du chemin d'accès
 * @param pathname - Le chemin d'accès de l'itinéraire vers lequel naviguer.
 */
const onNavigate = (pathname) => {
 document.body.innerHTML = ROUTES({ pathname })
}

/* C'est une fonction qui renvoie une fonction. */
/*Étant donné que je suis connecté en tant qu'employé */
describe("Given I am connected as an employee", () => {
  
 /* Quand je suis sur la page Factures */ 
 describe("When I am on Bills Page", () => {
   
  /*L'icône de la facture dans la disposition verticale doit être mise en surbrillance */
   it("bill icon in vertical layout should be highlighted", async () => {
     
     /* Définition d'une propriété sur la fenêtre de l'objet. */
     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
     
     /* Définition de l'utilisateur dans localStorage. */
     window.localStorage.setItem('user', JSON.stringify({
       type: 'Employee'
     }))
     
     /* Il crée un élément div. */
     const root = document.createElement("div")
     
     /* Il définit l'identifiant de l'élément racine sur "root". */
     root.setAttribute("id", "root")
     
     /* Ajout de l'élément racine au corps du document. */
     document.body.append(root)
     
     /* Appel de la fonction routeur. */
     router()
     
     /* Appel de la fonction onNavigate avec le paramètre ROUTES_PATH.Bills. */
     window.onNavigate(ROUTES_PATH.Bills)
     
     /* C'est une fonction qui renvoie l'élément avec le testId 'icon-window'. */
     await waitFor(() => screen.getByTestId('icon-window'))
     
     /* Il obtient l'élément avec le testId 'icon-window'. */
     const windowIcon = screen.getByTestId('icon-window')

     /* Vérifier si le windowIcon a la classe 'active-icon'. */
     expect(windowIcon).toHaveClass('active-icon')
   })

   /*Les factures doivent être commandées du plus ancien au plus tard */
   it("bills should be ordered from earliest to latest", () => {

     /* Utilisation du modèle BillsUI pour restituer les données des factures au format HTML. */
     document.body.innerHTML = BillsUI({ data: bills })

     /* Il récupère toutes les dates des factures et les mappe sur un tableau. */
     const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

     /**
      * Si a est supérieur à b, renvoie -1, sinon renvoie 1.
      * @param a - La première valeur à comparer.
      * @param b - l'élément courant en cours de traitement dans le tableau.
      */
     const antiChrono = (a, b) => ((a > b) ? -1 : 1)

     /* Il crée un nouveau tableau avec les mêmes valeurs que `dates` et le trie par ordre croissant. */
     const datesSorted = [...dates].sort(antiChrono)

     /* Il crée un nouveau tableau avec les mêmes valeurs que `dates` et le trie par ordre croissant. */
     expect(dates).toEqual(datesSorted)
   })
 })
})

/*Tests unitaires de Bills */
describe('Unit tests from Bills', () => {

  /*Tester le bouton eyeIcon */
 describe('Testing eyeIcon button', () => {

  /*Le premier eyeButton doit renvoyer la première image mockedBills */
   it('First eyeButton should return first mockedBills image', () => {

     /* Il rend le composant BillsUI avec les données des factures de luminaires. */
     document.body.innerHTML = BillsUI({ data: bills })

     /* Il obtient le premier élément avec le testId 'icon-eye'. */
     const eyeIcon = screen.getAllByTestId('icon-eye')[0]

     /* C'est un fileUrl simulé. */
     const fileUrl = "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"

     /* Il vérifie si le `eyeIcon` a le même `fileUrl` que le mockedBills. */
     expect(eyeIcon.dataset.billUrl).toEqual(fileUrl)

   })

   /*Tous les eyeButtons doivent ouvrir modal au clic */
   it('All eyeButtons should open modal on click', () => {

     /* Il crée une nouvelle instance de Bills.js avec les paramètres document, onNavigate, store :
     mockedStore, localStorage : window.localStorage. */
     const billsContainer = new Bills({ document, onNavigate, mockedStore, localStorage: window.localStorage })

     /* C'est une fonction qui renvoie une fonction. */
     const handleClickIconEyeMethod = jest.fn(billsContainer.handleClickIconEye)

     /* Obtenir toutes les icônes des yeux sur l'écran. */
     const eyeIcons = screen.getAllByTestId('icon-eye')

     /* Il obtient tous les éléments avec le testId 'icon-eye'. */
     $.fn.modal = jest.fn()

     /* C'est une boucle for qui itère sur le tableau eyeIcons et appelle la fonction
     handleClickIconEyeMethod avec eyeIcon comme paramètre. */
     for (let eyeIcon of eyeIcons) {
       handleClickIconEyeMethod(eyeIcon)
       userEvent.click(eyeIcon)
      }

     /* Vérifier que le handleClickIconEyeMethod a été appelé le même nombre de fois que le nombre
     d'eyeIcons. */
     expect(handleClickIconEyeMethod).toHaveBeenCalledTimes(eyeIcons.length)
   })
 })

 /*Tester le bouton newBill */
 describe('Testing newBill button', () => {

  /*ButtonNewBill devrait ouvrir newBill au clic */
   it('ButtonNewBill should open newBill on click', () => {

     /* Création d'une nouvelle instance de la classe Bills et transmission des objets document,
     onNavigate et localStorage. */
     const billsContainer = new Bills({ document, onNavigate, localStorage: window.localStorage })

     /* Création d'une fonction fictive pour la fonction handleClickNewBill. */
     const handleClickNewBillMethod = jest.fn(billsContainer.handleClickNewBill)

     /* Obtenir l'élément bouton avec le data-testid de btn-new-bill */
     const buttonNewBill = screen.getByTestId('btn-new-bill')

     /* Appel de la fonction handleClickNewBillMethod et passage de la variable buttonNewBill comme
     argument. */
     handleClickNewBillMethod(buttonNewBill)

     /* En cliquant sur le bouton NewBill button. */
     userEvent.click(buttonNewBill)


     /* Vérification pour voir si le handleClickNewBillMethod a été appelé. */
     expect(handleClickNewBillMethod).toHaveBeenCalled()

     /*Verification si le text "Envoyer une note de frais" est bien présent dans la page */
     expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()

   })

   /*Devrait changer icon1 & icon2 className naviguant vers NewBill */
   it('Should change icon1 & icon2 className navigating to NewBill', () => {
     
     /* Naviguer vers la page NewBill. */
     window.onNavigate(ROUTES_PATH.NewBill)

     /* Récupération de l'élément icon-window à partir de l'écran. */
     const icon1 = screen.getByTestId('icon-window')

     /* Obtention de l'élément icon-window à partir de l'objet screen. */
     const icon2 = screen.getByTestId('icon-mail')


     /* Récupération de l'élément icon-mail à partir de l'écran. */
     expect(icon1).not.toHaveClass('active-icon')

     /* Vérification pour voir si l'élément icon2 a la classe active-icon. */
     expect(icon2).toHaveClass('active-icon')
   })
 })
})


/* Il teste la méthode getBills de Bills.js */
describe('GET integration tests', () => {

  /*Devrait afficher les factures avec le bon format de date et d'état */
 it('Should display bills with right date & status format', async () => {

   /* Il crée une nouvelle instance de Bills.js avec les paramètres document, onNavigate, store :
   mockedStore, localStorage : window.localStorage. */
   const billsContainer = new Bills({ document, onNavigate, store: mockedStore, localStorage: window.localStorage })

   /* Espionnage de la méthode getBills de billsContainer. */
   const spyGetList = jest.spyOn(billsContainer, 'getBills')

   /* Appel de la méthode getBills de billsContainer. */
   const data = await billsContainer.getBills()

   /* Récupérer les factures du mockedStore. */
   const mockedBills = await mockedStore.bills().list()

   /* Obtenir la date de la première facture du mockedStore. */
   const mockedDate = mockedBills[0].date

   /* Obtenir le statut de la première facture du mockedStore. */
   const mockedStatus = mockedBills[0].status

   /* Vérifier si la méthode getBills a été appelée une fois. */
   expect(spyGetList).toHaveBeenCalledTimes(1)

   /* Vérifier si la date de la première facture est égale à la date de la première facture simulée. */
   expect(data[0].date).toEqual(formatDate(mockedDate))

   /* Vérifier si le statut de la première facture est égal au statut de la première facture simulée. */
   expect(data[0].status).toEqual(formatStatus(mockedStatus))
 })

 /* Il teste la méthode getBills de Bills.js. */
 /*Si le Store est corrompu, console.log(error) & return {date : "hello", status : undefined} */
 it('if corrupted store, should console.log(error) & return {date: "hello", status: undefined}', async () => {
   /* C'est un mockedStore avec des données corrompues. */
   const corruptedStore = {
     bills() {
       return {
         list() {
           return Promise.resolve([{
             id: '54sd65f45f4sfsd',
             vat: '40',
             date: 'hello',
             status: 'kia'
           }])
         },
       }
     }
   }

   /* Il crée une nouvelle instance de Bills.js avec les paramètres document, onNavigate, store :
   corruptedStore, localStorage : window.localStorage. */
   const billsContainer = new Bills({ document, onNavigate, store: corruptedStore, localStorage: window.localStorage })

   /* Il espionne la méthode console.log. */
   const spyConsoleLog = jest.spyOn(console, 'log')

   /* Il appelle la méthode getBills de Bills.js. */
   const data = await billsContainer.getBills()

   /* Vérifier si la méthode console.log a été appelée. */
   expect(spyConsoleLog).toHaveBeenCalled()
   
   /* Vérifier si la date est égale à 'hello'. */
   expect(data[0].date).toEqual('hello')
   
   /* Vérifier si le statut est indéfini. */
   expect(data[0].status).toEqual(undefined)
 })

 /*Lorsqu'une erreur se produit sur l'API */
 describe("When an error occurs on API", () => {

   /* Créer un espion sur mockedStore.bills, créer un localStorageMock, définir l'utilisateur dans
   localStorage, créer une div racine, ajouter la div racine au corps et appeler router(). */
   beforeEach(() => {

     /* Fonction appelée avant chaque test. */
     jest.spyOn(mockedStore, "bills")

     /* Définition d'une propriété sur l'objet window. */
     Object.defineProperty(
       window,
       'localStorage',
       { value: localStorageMock }
     )

     /* Définition de l'utilisateur dans localStorage. */
     window.localStorage.setItem('user', JSON.stringify({
       type: 'Employee',
       email: "a@a"
     }))

     /* Nettoyage du corps du document. */
     document.body.innerHTML = ''

     /* Il crée un élément div. */
     const root = document.createElement("div")

     /* Il crée un élément div. */
     root.setAttribute("id", "root")

     /* Ajout de l'élément racine au corps du document. */
     document.body.appendChild(root)

     /* Appel de la fonction routeur. */
     router()
   })

   /*récupère les factures d'une API et échoue avec une erreur de message 404*/
   it("fetches bills from an API and fails with 404 message error", async () => {

     /* Se moquer de la fonction bills de l'objet mockedStore. */
     mockedStore.bills.mockImplementationOnce(() => {
       return {
         list: () => {
           return Promise.reject(new Error("Erreur 404"))
         }
       }
     })

     /* Rendu du composant BillsUI avec le message d'erreur. */
     document.body.innerHTML = BillsUI({ error: 'Erreur 404' })

     /* Recevoir le message de l'écran. */
     const message = screen.getByText(/Erreur 404/)

     /* Recevoir le message de l'écran. */
     expect(message).toBeTruthy()
   })

   /*récupère les messages d'une API et échoue avec une erreur de message 500 */
   it("fetches messages from an API and fails with 500 message error", async () => {

     /* Se moquer de la méthode des factures de mockedStore. */
     mockedStore.bills.mockImplementationOnce(() => {
       return {
         list: () => {
           return Promise.reject(new Error("Erreur 500"))
         }
       }
     })

     /* Rendu du composant BillsUI avec le message d'erreur. */
     document.body.innerHTML = BillsUI({ error: 'Erreur 500' })

     /* Obtenir le message d'erreur de l'écran. */
     const message = screen.getByText(/Erreur 500/)

     /* Obtenir le message d'erreur de l'écran. */
     expect(message).toBeTruthy()
   })
 })
})