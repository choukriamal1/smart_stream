export function afficherChaines(chaines, codePays){
    const liste=document.getElementById("channels-list");
    //filtrer chaine click
    let chainesPays=chaines;
    if (codePays){
        chainesPays = chaines.filter(function(chaine){
        return chaine.countryCode === codePays;
    });
}
    //creer les liste du chaines
    let html = "";
    chainesPays.forEach(function(chaine){
        html+=`
        <div data-id="${chaine.id}" class="channel flex items-center gap-3 rounded-xl border-white/5 bg-white/[0.03] p-3 cursor-pointer hover:bg-white[.06]">
        <img src="${chaine.logo}" alt="${chaine.name}" class="h-10 w-10 rounded-lg">
        <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-200">${chaine.name}</p>
        <p class="text-[11px] text-slate-500">N° ${chaine.channelNumber} . ${chaine.category}</p>
        </div>
        </div>
        `;
    });

    liste.innerHTML =html;

    const previewImage=document.getElementById("preview-image");
    const channelProgram=document.getElementById("channel-program");
    const channelTime=document.getElementById("channel-time");
    const channelProgress=document.getElementById("channel-progress");
    const channelCategory=document.getElementById("channel-category");
    const channelLive=document.getElementById("channel-live");
    const channelCountry=document.getElementById("channel-country");
    const channelName=document.getElementById("channel-name");
    const chaineNumber=document.getElementById("channel-number");
    const channelStream=document.getElementById("vedio");


    function showChannelInfo(chaine){
        // document.addEventListener("click", (e)=>{
        //     if(e.target.closest(".channel")){
        //         const id=e.target.closest(".channel").dataset.id;
        //         const filtered= data.find(chaine=> chaine.id == id);
                // previewImage.src = chaine.previewImage;
                // previewImage.alt = chaine.name;
                channelStream.src = chaine.streamUrl;

                channelName.textContent =chaine.name;
                channelCountry.textContent = chaine.countryCode;
                chaineNumber.textContent = chaine.channelNumber;
                channelCategory.textContent = chaine.category;

                channelProgram.textContent = chaine.epg.currentProgram;
                channelTime.textContent = chaine.epg.startTime + " -> " +chaine.epg.endTime; 
                channelProgress.textContent = chaine.epg.progressPercentage + "%";
            }
                
                if (chainesPays.length > 0) {
                    showChannelInfo(chainesPays[0]);
                }

                const boutons = liste.querySelectorAll(".channel");

                boutons.forEach(function (bouton, index) {
                    bouton.addEventListener("click", function () {
                        showChannelInfo(chainesPays[index]);
                        console.log(index, chainesPays[index].name);
        });
    });
}
