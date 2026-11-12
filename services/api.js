// export  function getChannelsJSON () {
//     return fetch("https://iptv-org.github.io/api/streams.json")
//     .then (response => {
//         return response.json();
//     })
//     .then (data =>{
//         return data
//     })
//     .catch(error =>{
//         console.log("Error", error)
//     });
// }

const dataApi ="https://6af43b2c55a1de7dcf03be12.mockapi.io/api/v1/iptv"
    export async function getData (){
        try{
            const res= await fetch(dataApi)
            if(!res.ok){
                throw new Error(`HTTP Error : ${res.status}`)
            }
            const data= await res.json()
            console.log(data)
            return data
        }
        catch (error){
            console.error ("Filled to fetch channels : ", error)
        }
    }