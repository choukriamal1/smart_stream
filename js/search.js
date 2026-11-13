// export const recherche = (channels, text)=>{
//     const search = text.toLowerCase().trim();
//     return channels.filter((chaine)=>
//     chaine.name.toLowerCase().includes(search));
// };
// produits.forEach((produit, index)=>{

import { getData } from "../services/api.js";

// })



const search = document.querySelector("#search");


export function searchChannels(){
    let filtered = [];
        // console.log(filtered)


        search.addEventListener("input", async (e)=>{
            const channels = await getData();
            console.log(e.target.value)
        // console.log(e.target.value.toUpperCase())
        filtered = channels.filter(ch =>
            (ch.name+ch.channelNumber).toUpperCase().includes(e.target.value.toUpperCase())
        )
        afficherChaines(filtered)
    })
}

  

  
