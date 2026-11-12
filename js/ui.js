export function afficherChaines(chaines, codePays){
    const liste=document.getElementById("channels-list");
    //filtrer chaine click
    const chainesPays=chaines.filter(function(chaine){
        return chaine.countryCode === codePays;
    });
    
    //creer les liste du chaines
    let html = "";
    chainesPays.forEach(function(chaine){
        html+=`
        <div class="flex items-center gap-3 rounded-xl border-white/5 bg-white/[0.03] p-3 cursor-pointer hover:bg-white[.06]">
        <img src="${chaine.logo}" alt="${chaine.name}" class="h-10 w-10 rounded-lg">
        <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-200">${chaine.name}</p>
        <p class="text-[11px] text-slate-500">N° ${chaine.channelNumber} . ${chaine.category}</p>
        </div>
        </div>
        `;
    });

    liste.innerHTML =html;


}