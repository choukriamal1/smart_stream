import {getData} from "../services/api.js";
getData ();
// import { getChannelsJSON } from "../services/api.js";
// import {recherche} from "./search.js";

// const channels =await getChannelsJSON();
// console.table(channels);
// let channelActuel = channels;

// const searchInput = document.getElementById("search");
// searchInput.addEventListener("input", ()=>{
//     channelActuel= recherche(channels, searchInput.value);
// });


import {afficherChaines} from "./ui.js";
let tabchaines=[];
async function init() {
    try {
        tabchaines = await getData (); //attend réponse puis on met le résultat dans tabl
    }
    catch(erreur){
        console.error("Erreur de chargement :" , erreur);
        //programme ne s’arrête pas il affiche l’erreur dans la console
    }
}


//btn

const boutons = document.querySelectorAll(".btn-pays");
//ecoute

boutons.forEach(function(boutton){
    boutton.addEventListener("click",function (){
        const code=boutton.dataset.country; //MA
        afficherChaines(tabchaines, code);
    });
});
init();
