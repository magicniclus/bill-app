/**
 * @jest-environment jsdom
 */
 import '@testing-library/jest-dom'
 import userEvent from '@testing-library/user-event'
 import { screen, fireEvent, waitFor } from "@testing-library/dom"
 
 import router from "../app/Router.js";
 import BillsUI from "../views/BillsUI.js";
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import mockedStore from "../__mocks__/storeTest"
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
 
 
 /**
  * "Lorsque l'utilisateur accède à une nouvelle page, mettez à jour le corps du document avec le code
  * HTML renvoyé par la fonction ROUTES."
  * 
  * La fonction ROUTES est une fonction qui renvoie HTML. Il prend un nom de chemin comme argument
  * @param pathname - Le chemin d'accès de l'itinéraire vers lequel naviguer.
  */
 const onNavigate = (pathname) => {
   document.body.innerHTML = ROUTES({ pathname });
 }

 /* Il se moque de l'objet localStorage. */
 Object.defineProperty(window, 'localStorage', { value: localStorageMock })

/* Il se moque du localStorage. */
 window.localStorage.setItem('user', JSON.stringify({
   type: 'Employee',
   email: 'test@yes.fr'
 }))

 /* C'est une fonction factice qui sera appelée à la place de la vraie fonction `window.alert`. */
 window.alert = jest.fn()
 
 /*Étant donné que je suis connecté en tant qu'employé */
 describe("Given I am connected as an employee", () => {

  /*Quand je suis sur la page NewBill */
   describe("When I am on NewBill Page", () => {

    /*Devrait afficher la page NewBill */
     it('Should render newBill Page', () => {

       /* Rendu du composant NewBillUI. */
       const html = NewBillUI()

       /* Rendu du composant NewBillUI. */
       document.body.innerHTML = html

       /* Il vérifie si le texte 'Envoyer une note de frais' est présent dans le DOM. */
       expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
     })
 
     /*Le gestionnaire de fichiers de modification doit alerter si le format de fichier n'est pas pris en charge */
     it("Change file handler should alert if file format is not supported", async () => {
       
       /* C'est un faux objet fichier. */
       const files = {
         wrongFile1: 'badFormat.xzn',
         wrongFile2: 'noExtension',
         goodFile: 'goodFormat.png'
       }
 
       /* Rendu du composant NewBillUI. */
       const html = NewBillUI()

       /* Rendu du composant NewBillUI. */
       document.body.innerHTML = html

       /* Il crée une nouvelle instance de la classe NewBill. */
       const newBill = new NewBill({ document, onNavigate, store: mockedStore, localStorage: window.localStorage })

       /* Espionnage de la méthode `handleChangeFile` de l'instance `newBill`. */
       const spyHandleChangeFile = jest.spyOn(newBill, 'handleChangeFile')

       /* Obtenir l'élément de formulaire avec l'attribut `data-testid="file"`. */
       const formNewBill = screen.getByTestId('file')

       /* Il ajoute un écouteur d'événement à l'élément formNewBill. */
       formNewBill.addEventListener('change', newBill.handleChangeFile)
 
       /* C'est une boucle qui itère sur les clés de l'objet `files`. */
       Object.keys(files).forEach(key => {

         /* C'est un opérateur ternaire. C'est un raccourci pour une instruction if/else. */
         const type = files[key].split('.')[1] ? `image/${files[key].split('.')[1]}` : ''

         /* C'est une fonction qui simule l'événement change sur l'élément formNewBill. */
         fireEvent.change(formNewBill, {
           target: {
             files: [new File([files[key]], files[key], { type: type })]
           }
         })
       })

       /* Il vérifie si la méthode `handleChangeFile` a été appelée. */
       expect(spyHandleChangeFile).toHaveBeenCalled()

       /* Il vérifie si la fonction `window.alert` a été appelée avec le message `Veuillez sélectionner
       une image de type .jpg, .jpeg ou .png`. */
       expect(window.alert).toHaveBeenCalledWith('Veuillez séléctionner un image de type .jpg, .jpeg ou .png')

       /* Il vérifie si la fonction `window.alert` a été appelée 4 fois. */
       expect(window.alert).toHaveBeenCalledTimes(4) 
     })
 
     /*Test d'intégration POST */
     describe('POST integration test', () => {

      /*Le gestionnaire de soumission doit renvoyer newBill et accéder à la page Factures */
       it('Submit handler should return newBill & navigate to Bills Page', async () => {

         /* C'est une fausse facture d'objet. */
         const fakeBill = {
           type: 'Transports',
           name: 'Vol Paris/Berlin',
           date: '04-02-2021',
           amount: '1500',
           vat: '300',
           pct: '150',
           commentary: 'vol 1ere classe',
           filename: 'flightBill',
           fileUrl: 'C:\\fakepath\\flightBill.jpg'
         }
 
         /* Il rend le composant NewBillUI. */
         document.body.innerHTML = NewBillUI()

         /* Il crée une nouvelle instance de la classe NewBill. */
         const newBill = new NewBill({ document, onNavigate, store: mockedStore, localStorage: window.localStorage })

         /* Espionnage de la méthode `handleSubmit` de l'instance `newBill`. */
         const spyHandleSubmit = jest.spyOn(newBill, 'handleSubmit')

         /* Il obtient l'élément de formulaire avec l'attribut `data-testid="form-new-bill"`. */
         const form = screen.getByTestId('form-new-bill')

         /* Obtenir l'élément avec l'id `btn-send-bill` à l'intérieur de l'élément de formulaire. */
         const btnSubmitForm = form.querySelector('#btn-send-bill')

         /* Espionnage de la méthode `updateBill` de l'instance `newBill`. */
         const spyUpdateBill = jest.spyOn(newBill, 'updateBill')
 
         /* C'est une fonction qui simule l'événement de changement sur l'élément avec l'attribut
         `data-testid="expense-type"`. */
         fireEvent.change(screen.getByTestId('expense-type'), { target: { value: fakeBill.type } })

         /* Simulation de l'événement de changement sur l'élément avec l'attribut
         `data-testid="expense-name"`. */
         fireEvent.change(screen.getByTestId('expense-name'), { target: { value: fakeBill.name } })

         /* Il simule l'événement de changement sur l'élément avec l'attribut
         `data-testid="datepicker"`. */
         fireEvent.change(screen.getByTestId('datepicker'), { target: { value: fakeBill.date } })

         /* Il simule l'événement de changement sur l'élément avec l'attribut `data-testid="amount"`. */
         fireEvent.change(screen.getByTestId('amount'), { target: { value: fakeBill.amount } })

         /* Il simule l'événement de changement sur l'élément avec l'attribut `data-testid="vat"`. */
         fireEvent.change(screen.getByTestId('vat'), { target: { value: fakeBill.vat } })

         /* Il simule l'événement de changement sur l'élément avec l'attribut `data-testid="pct"`. */
         fireEvent.change(screen.getByTestId('pct'), { target: { value: fakeBill.pct } })

         /* Il simule l'événement de changement sur l'élément avec l'attribut
         `data-testid="commentary"`. */
         fireEvent.change(screen.getByTestId('commentary'), { target: { value: fakeBill.commentary } })
 

         /* C'est une fonction qui simule l'événement submit sur l'élément de formulaire. */
         form.addEventListener('submit', ((event) => newBill.handleSubmit(event)))

         /* Il simule un clic sur l'élément `btnSubmitForm`. */
         userEvent.click(btnSubmitForm)

         /* Il attend que le texte 'Mes notes de frais' soit rendu dans le DOM. */
         await waitFor(() => screen.getByText('Mes notes de frais'))
 

         /* Une fonction qui retourne l'élément avec le texte 'Mes notes de frais'. */
         expect(spyHandleSubmit).toHaveBeenCalled()

         /* Il vérifie si la méthode `updateBill` a été appelée. */
         expect(spyUpdateBill).toHaveBeenCalled()

         /* Vérifier si le texte 'Mes notes de frais' est rendu dans le DOM. */
         expect(screen.getByText('Mes notes de frais')).toBeTruthy()
       })
 
 
       /*Lorsqu'une erreur se produit sur l'API */
       describe("When an error occurs on API", () => {

         /* Fonction appelée avant chaque test. */
         beforeEach(() => {

           /* Espionnage de la méthode `bills` de l'objet mockedStore. */
           jest.spyOn(mockedStore, "bills")

           /* Se moquer de l'objet localStorage. */
           Object.defineProperty(
             window,
             'localStorage',
             { value: localStorageMock }
           )

           /* Se moquer du localStorage. */
           window.localStorage.setItem('user', JSON.stringify({
             type: 'Employee',
             email: "a@a"
           }))

           /* Effacer le corps du document. */
           document.body.innerHTML = ''

           /* Il crée un élément div. */
           const root = document.createElement("div")

           /* Créer un élément div et définir son identifiant sur root. */
           root.setAttribute("id", "root")

           /* Ajout de l'élément `root` au corps du document. */
           document.body.appendChild(root)

           /* Appel de la fonction routeur. */
           router()
         })
 
         /*Récupère les factures d'une API et échoue avec une erreur de message 404 */
         it("fetches bills from an API and fails with 404 message error", async () => {

           /* Se moquer de la méthode `bills` de l'objet `mockedStore`. */
           mockedStore.bills.mockImplementationOnce(() => {
             return {
               list: () => {
                 return Promise.reject(new Error("Erreur 404"))
               }
             }
           })

           /* Rendu du composant BillsUI avec le message d'erreur. */
           document.body.innerHTML = BillsUI({ error: 'Erreur 404'})

           /* Obtenir l'élément avec le texte 'Erreur 404'. */
           const message = screen.getByText(/Erreur 404/)

           /* Il vérifie si le texte 'Erreur 404' est rendu dans le DOM. */
           expect(message).toBeTruthy()
         })
 
         /*Récupère les messages d'une API et échoue avec une erreur de message 500 */
         it("fetches messages from an API and fails with 500 message error", async () => {

           /* Se moquer de la méthode `bills` de l'objet `mockedStore`. */
           mockedStore.bills.mockImplementationOnce(() => {
             return {
               list: () => {
                 return Promise.reject(new Error("Erreur 500"))
               }
             }
           })

           /* Rendu du composant BillsUI avec le message d'erreur. */
           document.body.innerHTML = BillsUI({ error: 'Erreur 500'})

           /* Il obtient l'élément avec le texte 'Erreur 500'. */
           const message = screen.getByText(/Erreur 500/)

           /* Il vérifie si le texte 'Erreur 500' est rendu dans le DOM. */
           expect(message).toBeTruthy()
         })
       })
     })
   })
 })